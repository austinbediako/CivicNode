import {
  Aptos,
  AptosConfig,
  Network,
  Account,
  Ed25519PrivateKey,
  InputGenerateTransactionPayloadData,
} from '@aptos-labs/ts-sdk';
import { getEnv } from '../config/env.js';

let aptosClient: Aptos | undefined;

/**
 * Initialize and return the Aptos client singleton.
 */
export function initAptosClient(): Aptos {
  if (aptosClient) {
    return aptosClient;
  }

  const { APTOS_NODE_URL } = getEnv();

  // Determine network from the node URL
  let network = Network.CUSTOM;
  if (APTOS_NODE_URL.includes('testnet')) {
    network = Network.TESTNET;
  } else if (APTOS_NODE_URL.includes('mainnet')) {
    network = Network.MAINNET;
  } else if (APTOS_NODE_URL.includes('devnet')) {
    network = Network.DEVNET;
  }

  const config = new AptosConfig({
    network,
    fullnode: APTOS_NODE_URL,
  });

  aptosClient = new Aptos(config);
  console.log(`[aptos] Client initialized for ${network} at ${APTOS_NODE_URL}`);
  return aptosClient;
}

/**
 * Get the executor account from the configured private key.
 */
function getExecutorAccount(): Account {
  const { APTOS_EXECUTOR_PRIVATE_KEY } = getEnv();
  const privateKey = new Ed25519PrivateKey(APTOS_EXECUTOR_PRIVATE_KEY);
  return Account.fromPrivateKey({ privateKey });
}

/**
 * Build an unsigned vote transaction for a voter.
 * The frontend signs this with the voter's wallet.
 */
export async function submitVoteTransaction(
  voterAddress: string,
  proposalId: string,
  choice: string
): Promise<InputGenerateTransactionPayloadData> {
  const { APTOS_MODULE_ADDRESS } = getEnv();

  // Return the transaction payload for the frontend to sign
  const payload: InputGenerateTransactionPayloadData = {
    function: `${APTOS_MODULE_ADDRESS}::governance::cast_vote`,
    functionArguments: [proposalId, choice],
  };

  return payload;
}

/**
 * Execute a passed proposal on-chain using the executor's private key.
 * This transfers funds from the community treasury to the proposal recipient.
 */
export async function executeProposal(proposalId: string): Promise<string> {
  const client = initAptosClient();
  const executor = getExecutorAccount();
  const { APTOS_MODULE_ADDRESS } = getEnv();

  try {
    const transaction = await client.transaction.build.simple({
      sender: executor.accountAddress,
      data: {
        function: `${APTOS_MODULE_ADDRESS}::governance::execute_proposal`,
        functionArguments: [proposalId],
      },
    });

    const committedTxn = await client.signAndSubmitTransaction({
      signer: executor,
      transaction,
    });

    const executedTxn = await client.waitForTransaction({
      transactionHash: committedTxn.hash,
    });

    console.log(`[aptos] Proposal ${proposalId} executed. TX: ${executedTxn.hash}`);
    return executedTxn.hash;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to execute proposal ${proposalId} on-chain: ${message}`);
  }
}

/**
 * Query the on-chain treasury balance for a community.
 */
export async function getTreasuryBalance(communityId: string): Promise<number> {
  const client = initAptosClient();
  const { APTOS_MODULE_ADDRESS } = getEnv();

  try {
    const resources = await client.getAccountResources({
      accountAddress: APTOS_MODULE_ADDRESS,
    });

    // Look for the treasury resource matching this community
    const treasuryResource = resources.find(
      (r) => r.type === `${APTOS_MODULE_ADDRESS}::governance::Treasury`
    );

    if (!treasuryResource) {
      // No treasury deployed yet — return 0
      return 0;
    }

    // TODO(civicnode): Parse the actual community-specific balance from the resource data
    // For now, return the top-level balance field if it exists
    const data = treasuryResource.data as Record<string, unknown>;
    const balance = data['balance'];
    return typeof balance === 'string' ? parseInt(balance, 10) : 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[aptos] Failed to get treasury balance for ${communityId}: ${message}`);
    return 0;
  }
}

/**
 * Read a proposal's on-chain state.
 */
export async function getProposalOnChain(
  proposalId: string
): Promise<Record<string, unknown> | null> {
  const client = initAptosClient();
  const { APTOS_MODULE_ADDRESS } = getEnv();

  try {
    const resources = await client.getAccountResources({
      accountAddress: APTOS_MODULE_ADDRESS,
    });

    const proposalResource = resources.find(
      (r) => r.type === `${APTOS_MODULE_ADDRESS}::governance::Proposal`
    );

    if (!proposalResource) {
      return null;
    }

    // TODO(civicnode): Filter by proposalId within the resource's proposal table
    return proposalResource.data as Record<string, unknown>;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[aptos] Failed to read proposal ${proposalId} on-chain: ${message}`);
    return null;
  }
}
