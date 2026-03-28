// ============================================================
// @civicnode/shared-types — Shared TypeScript interfaces & enums
// Used by both frontend and Backend packages.
// ============================================================

// --- Enums ---

export enum ProposalStatus {
  DRAFT = 'draft',
  LIVE = 'live',
  PASSED = 'passed',
  FAILED = 'failed',
  EXECUTED = 'executed',
  EXECUTION_FAILED = 'execution_failed',
}

export enum VoteChoice {
  YES = 'yes',
  NO = 'no',
  ABSTAIN = 'abstain',
}

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

// --- Core Interfaces ---

export interface User {
  id: string;
  walletAddress: string;
  role: UserRole;
  communityId: string;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  adminWallet: string;
  quorumThreshold: number;
  memberCount: number;
  memberWallets: string[];
  createdAt: string;
}

export interface ChatLog {
  id: string;
  communityId: string;
  uploadedBy: string;
  sanitizedText: string;
  uploadedAt: string;
}

export interface Proposal {
  id: string;
  communityId: string;
  title: string;
  summary: string;
  budgetRequested: number;
  currency: string;
  actionItems: string[];
  rationale: string;
  dissent: string;
  recipient: string;
  deadline: string;
  status: ProposalStatus;
  chatLogId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  txHash?: string;
}

export interface Vote {
  id: string;
  proposalId: string;
  voterWallet: string;
  choice: VoteChoice;
  txHash: string;
  votedAt: string;
}

export interface Transaction {
  id: string;
  communityId: string;
  proposalId: string;
  amount: number;
  recipient: string;
  txHash: string;
  confirmedAt: string;
}

// --- API Request/Response Types ---

export interface AuthVerifyRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface AuthVerifyResponse {
  token: string;
  user: User;
}

export interface SynthesisRequest {
  chatLogId: string;
  communityId: string;
}

export interface ProposalDraft {
  title: string;
  summary: string;
  budgetRequested: number;
  currency: string;
  actionItems: string[];
  rationale: string;
  dissent: string;
}

export interface TreasuryInfo {
  communityId: string;
  balanceAPT: number;
  balanceGHS: number;
  transactions: Transaction[];
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// --- JWT Payload ---

export interface JwtPayload {
  walletAddress: string;
  role: UserRole;
  communityId: string;
  iat: number;
  exp: number;
}
