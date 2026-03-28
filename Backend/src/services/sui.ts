import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getEnv } from '../config/env.js';

let suiClient: SuiJsonRpcClient | undefined;

/**
 * Initialize and return the Sui client singleton.
 */
export function initSuiClient(): SuiJsonRpcClient {
  if (suiClient) {
    return suiClient;
  }

  const { SUI_RPC_URL } = getEnv();
  const network = SUI_RPC_URL.includes('mainnet') ? 'mainnet' as const : 'testnet' as const;

  suiClient = new SuiJsonRpcClient({
    url: SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
    network,
  });

  console.log(`[sui] Client initialized at ${SUI_RPC_URL}`);
  return suiClient;
}

/**
 * Get the executor Keypair from the configured private key.
 */
function getExecutorKeypair(): Ed25519Keypair {
  const { SUI_EXECUTOR_PRIVATE_KEY } = getEnv();
  // Provide either a raw hex/base64 private key depending on format
  // If Bech32 representation (suiprivkey1...) is used, use fromSecretKey()
  try {
      return Ed25519Keypair.fromSecretKey(SUI_EXECUTOR_PRIVATE_KEY);
  } catch (e) {
      console.warn("Could not parse bech32 key, attempting hex parse", e);
      const secretKey = new Uint8Array(Buffer.from(SUI_EXECUTOR_PRIVATE_KEY, 'hex'));
      return Ed25519Keypair.fromSecretKey(secretKey);
  }
}

/**
 * Execute a passed proposal on-chain using the executor's private key.
 * This interacts with the Sui shared treasury object to transfer funds.
 */
export async function executeProposal(proposalId: string): Promise<string> {
  const client = initSuiClient();
  const executor = getExecutorKeypair();
  const { SUI_PACKAGE_ID } = getEnv();

  try {
    const tx = new Transaction();
    
    // We assume the execute_proposal takes the proposal object or ID
    // Note: Actual Move call signature will depend on the final Sui smart contract.
    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::governance::execute_proposal`,
      arguments: [
        tx.object(proposalId), 
      ],
    });

    const response = await client.signAndExecuteTransaction({
      signer: executor,
      transaction: tx,
      options: {
        showEffects: true,
      },
    });

    console.log(`[sui] Proposal ${proposalId} executed. Digest: ${response.digest}`);
    return response.digest;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to execute proposal ${proposalId} on-chain: ${message}`);
  }
}

/**
 * Query the on-chain treasury balance for a community.
 * Given a community shared object ID, fetches its balance.
 */
export async function getTreasuryBalance(communityObjectId: string): Promise<number> {
  const client = initSuiClient();

  try {
    // If communityObjectId isn't set, return 0
    if (!communityObjectId || communityObjectId === '0x0') return 0;

    const object = await client.getObject({
      id: communityObjectId,
      options: {
        showContent: true,
      },
    });

    const content = object.data?.content;
    if (content?.dataType === 'moveObject') {
      const data = content.fields as Record<string, any>;
      // Look for the treasury field, which holds Balance<SUI> usually represented as value
      const balance = data['treasury']?.fields?.value || data['balance'] || "0";
      return parseInt(balance, 10);
    }
    return 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[sui] Failed to get treasury balance for ${communityObjectId}: ${message}`);
    return 0;
  }
}
