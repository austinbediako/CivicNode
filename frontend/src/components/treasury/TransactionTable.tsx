"use client";

import { useState } from "react";
import { ExternalLink, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import type { Transaction } from "@/types";
import { formatDate, formatSUI, truncateAddress, cn } from "@/lib/utils";

interface TransactionTableProps {
  transactions: Transaction[];
  pageSize?: number;
}

type SortField = "confirmedAt" | "amount";
type SortDirection = "asc" | "desc";

export function TransactionTable({
  transactions,
  pageSize = 10,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("confirmedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const sorted = [...transactions].sort((a, b) => {
    let comparison = 0;
    if (sortField === "confirmedAt") {
      comparison =
        new Date(a.confirmedAt).getTime() - new Date(b.confirmedAt).getTime();
    } else if (sortField === "amount") {
      comparison = a.amount - b.amount;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = sorted.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-700">
              <th className="text-left py-3 px-4 text-dark-400 font-medium">
                <button
                  onClick={() => handleSort("confirmedAt")}
                  className="flex items-center gap-1 hover:text-dark-200 transition-colors"
                >
                  Date
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-dark-400 font-medium">
                <button
                  onClick={() => handleSort("amount")}
                  className="flex items-center gap-1 hover:text-dark-200 transition-colors"
                >
                  Amount
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-dark-400 font-medium">
                Recipient
              </th>
              <th className="text-left py-3 px-4 text-dark-400 font-medium">
                Tx Hash
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-8 text-dark-500"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              paginated.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors"
                >
                  <td className="py-3 px-4 text-dark-300">
                    {formatDate(tx.confirmedAt)}
                  </td>
                  <td className="py-3 px-4 text-dark-100 font-medium">
                    {formatSUI(tx.amount)}
                  </td>
                  <td className="py-3 px-4 font-mono text-dark-300">
                    {truncateAddress(tx.recipient)}
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={`https://suiscan.xyz/testnet/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors font-mono"
                    >
                      {truncateAddress(tx.txHash, 6)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-dark-500">
            Showing {startIndex + 1}-
            {Math.min(startIndex + pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-dark-400 hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-dark-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 text-dark-400 hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
