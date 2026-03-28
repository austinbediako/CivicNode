import { getToken, clearToken } from "./auth";
import { API_BASE_URL } from "./constants";
import type {
  AuthVerifyResponse,
  Proposal,
  ProposalDraft,
  ProposalStatus,
  Vote,
  VoteChoice,
  VoteTally,
  TreasuryData,
  User,
  PaginatedResponse,
  ChatLog,
} from "@/types";

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function fetchClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...rest,
    });
  } catch {
    throw new ApiError(
      "Network error. Please check your connection and try again.",
      0
    );
  }

  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    throw new ApiError("Session expired. Please connect your wallet again.", 401);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Something went wrong. Please try again.",
    }));
    throw new ApiError(
      error.message ?? `Request failed (${response.status})`,
      response.status
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// --- Auth ---

export function verifyWallet(
  address: string,
  signature: string,
  message: string
): Promise<AuthVerifyResponse> {
  return fetchClient<AuthVerifyResponse>("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ walletAddress: address, signature, message }),
    skipAuth: true,
  });
}

// --- Proposals ---

export function getProposals(
  filters?: { status?: ProposalStatus; page?: number; limit?: number }
): Promise<PaginatedResponse<Proposal>> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));
  const query = params.toString();
  return fetchClient<PaginatedResponse<Proposal>>(
    `/proposals${query ? `?${query}` : ""}`
  );
}

export function getProposal(id: string): Promise<Proposal> {
  return fetchClient<Proposal>(`/proposals/${id}`);
}

export function uploadLog(file: File | string): Promise<{ logId: string }> {
  if (typeof file === "string") {
    return fetchClient<{ logId: string }>("/chat-logs", {
      method: "POST",
      body: JSON.stringify({ text: file }),
    });
  }

  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return fetch(`${API_BASE_URL}/chat-logs/upload`, {
    method: "POST",
    headers,
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Upload failed" }));
      throw new ApiError(err.message, res.status);
    }
    return res.json() as Promise<{ logId: string }>;
  });
}

export function publishProposal(id: string): Promise<Proposal> {
  return fetchClient<Proposal>(`/proposals/${id}/publish`, {
    method: "POST",
  });
}

export function updateProposal(
  id: string,
  data: Partial<ProposalDraft> & { recipient?: string; deadline?: string }
): Promise<Proposal> {
  return fetchClient<Proposal>(`/proposals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// --- Votes ---

export function getVoteTally(proposalId: string): Promise<VoteTally> {
  return fetchClient<VoteTally>(`/proposals/${proposalId}/tally`);
}

export function submitVoteRecord(
  proposalId: string,
  choice: VoteChoice,
  txHash: string
): Promise<void> {
  return fetchClient<void>(`/proposals/${proposalId}/votes`, {
    method: "POST",
    body: JSON.stringify({ choice, txHash }),
  });
}

// --- Treasury ---

export function getTreasury(communityId: string): Promise<TreasuryData> {
  return fetchClient<TreasuryData>(`/communities/${communityId}/treasury`);
}

// --- Members ---

export function getMembers(communityId: string): Promise<User[]> {
  return fetchClient<User[]>(`/communities/${communityId}/members`);
}

export function addMember(
  communityId: string,
  walletAddress: string
): Promise<User> {
  return fetchClient<User>(`/communities/${communityId}/members`, {
    method: "POST",
    body: JSON.stringify({ walletAddress }),
  });
}

export function removeMember(
  communityId: string,
  walletAddress: string
): Promise<void> {
  return fetchClient<void>(
    `/communities/${communityId}/members/${walletAddress}`,
    { method: "DELETE" }
  );
}

// --- Synthesis (SSE stream) ---

export async function synthesizeProposal(
  chatLogId: string,
  communityId: string
): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/proposals/synthesize`, {
    method: "POST",
    headers,
    body: JSON.stringify({ chatLogId, communityId }),
  });

  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/";
    throw new ApiError("Unauthorized", 401);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Synthesis request failed",
    }));
    throw new ApiError(error.message, response.status);
  }

  return response;
}
