import { Wallet } from "lucide-react";
import { formatSUI, formatGHS } from "@/lib/utils";

interface TreasuryBalanceProps {
  balanceSUI: number;
  balanceGHS: number;
}

export function TreasuryBalance({
  balanceSUI,
  balanceGHS,
}: TreasuryBalanceProps) {
  return (
    <div className="card bg-gradient-to-br from-primary-950/50 to-dark-800 border-primary-800/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-primary-700/20 rounded-xl flex items-center justify-center">
          <Wallet className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <p className="text-sm text-dark-400">Community Treasury</p>
          <p className="text-xs text-dark-500">Available Balance</p>
        </div>
      </div>
      <div>
        <p className="text-3xl sm:text-4xl font-bold text-dark-50 mb-1">
          {formatSUI(balanceSUI)}
        </p>
        <p className="text-lg text-dark-400">
          {formatGHS(balanceSUI)}
        </p>
      </div>
    </div>
  );
}
