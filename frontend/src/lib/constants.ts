export const BLOCK_EXPLORER_BASE_URL = "https://etherscan.io";
export const CONTRACT_MODULE_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export const POLL_INTERVAL_VOTES = 5000;
export const POLL_INTERVAL_TREASURY = 10000;
export const REVALIDATE_PROPOSALS = 30000;

export const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
export const SUPPORTED_FILE_TYPES = [".txt", ".zip"];

export const PROPOSALS_PER_PAGE = 20;
export const TRANSACTIONS_PER_PAGE = 20;

export const TOAST_DISMISS_MS = 4000;
