export {
  ProposalStatus,
  VoteChoice,
  UserRole,
  type User,
  type Community,
  type ChatLog,
  type Proposal,
  type Vote,
  type Transaction,
  type AuthVerifyRequest,
  type AuthVerifyResponse,
  type SynthesisRequest,
  type ProposalDraft,
  type TreasuryInfo,
  type ApiError as ApiErrorType,
  type PaginatedResponse,
  type JwtPayload,
} from "@civicnode/shared-types";

export interface VoteTally {
  yes: number;
  no: number;
  abstain: number;
  total: number;
  quorumReached: boolean;
}

export interface TreasuryData {
  communityId: string;
  balanceAPT: number;
  balanceGHS: number;
  transactions: import("@civicnode/shared-types").Transaction[];
  totalDisbursed: number;
  totalFunded: number;
  pendingExecution: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export type AptosTransaction = {
  payload: {
    type: string;
    function: string;
    type_arguments: string[];
    arguments: string[];
  };
};
