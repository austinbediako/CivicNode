"use client";

import { Download } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { TreasuryBalance } from "@/components/treasury/TreasuryBalance";
import { TransactionTable } from "@/components/treasury/TransactionTable";
import { useTreasury } from "@/hooks/useTreasury";
import { useAuth } from "@/hooks/useAuth";
import type { Transaction } from "@/types";

// TODO(civicnode): Remove mock data when API is connected
const mockTransactions: Transaction[] = [
  {
    id: "tx1",
    communityId: "comm1",
    proposalId: "prop1",
    amount: 50,
    recipient: "0xabc123def456789012345678901234567890abcd1234567890abcdef12345678",
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    confirmedAt: "2026-03-20T14:30:00Z",
  },
  {
    id: "tx2",
    communityId: "comm1",
    proposalId: "prop2",
    amount: 120,
    recipient: "0xdef456789012345678901234567890abcdef1234567890abcdef1234567890ab",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    confirmedAt: "2026-03-15T10:15:00Z",
  },
  {
    id: "tx3",
    communityId: "comm1",
    proposalId: "prop3",
    amount: 25.5,
    recipient: "0x789012345678901234567890abcdef1234567890abcdef1234567890abcdef12",
    txHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    confirmedAt: "2026-03-10T08:00:00Z",
  },
];

function exportToCSV(transactions: Transaction[]) {
  const headers = ["Date", "Amount (APT)", "Recipient", "Tx Hash"];
  const rows = transactions.map((tx) => [
    new Date(tx.confirmedAt).toISOString(),
    tx.amount.toString(),
    tx.recipient,
    tx.txHash,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `civicnode-treasury-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TreasuryPage() {
  const { user } = useAuth();
  const treasuryData = useTreasury(user?.communityId ?? null);

  const transactions = treasuryData.transactions.length > 0 ? treasuryData.transactions : mockTransactions;
  const balanceAPT = treasuryData.balanceAPT || 1250.75;
  const balanceGHS = treasuryData.balanceGHS || 106313.75;
  const isLoading = treasuryData.isLoading;

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark-50">Treasury</h1>
            <p className="text-dark-400 mt-1">
              Community treasury balance and transaction history.
            </p>
          </div>
          <button
            onClick={() => exportToCSV(transactions)}
            className="btn-outline flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Balance Card */}
        <TreasuryBalance balanceAPT={balanceAPT} balanceGHS={balanceGHS} />

        {/* Transaction History */}
        <div className="card">
          <h2 className="text-lg font-semibold text-dark-100 mb-4">
            Transaction History
          </h2>
          <TransactionTable transactions={transactions} />
        </div>
      </div>
    </PageWrapper>
  );
}
