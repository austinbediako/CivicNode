"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  Copy,
  Check,
  Search,
} from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { truncateAddress, cn } from "@/lib/utils";

interface MemberEntry {
  address: string;
  addedAt: string;
}

// TODO(civicnode): Replace with real API calls to GET/POST/DELETE community members
const mockMembers: MemberEntry[] = [
  { address: "0xabc123def456789012345678901234567890abcd1234567890abcdef12345678", addedAt: "2026-01-15T10:00:00Z" },
  { address: "0xdef456789012345678901234567890abcdef1234567890abcdef1234567890ab", addedAt: "2026-02-20T14:30:00Z" },
  { address: "0x789012345678901234567890abcdef1234567890abcdef1234567890abcdef12", addedAt: "2026-03-01T09:15:00Z" },
];

export default function MembersPage() {
  const [members, setMembers] = useState<MemberEntry[]>(mockMembers);
  const [newAddress, setNewAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const filteredMembers = members.filter((m) =>
    m.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = () => {
    if (!newAddress.trim() || !newAddress.startsWith("0x")) return;

    // TODO(civicnode): Call API to add member
    setMembers([
      ...members,
      { address: newAddress.trim(), addedAt: new Date().toISOString() },
    ]);
    setNewAddress("");
  };

  const handleRemoveMember = (address: string) => {
    // TODO(civicnode): Call API to remove member
    setMembers(members.filter((m) => m.address !== address));
  };

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Member Management</h1>
          <p className="text-dark-400 mt-1">
            Add or remove wallet addresses from the community.
          </p>
        </div>

        {/* Add Member Form */}
        <div className="card">
          <h2 className="text-base font-semibold text-dark-100 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary-400" />
            Add Member
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="0x... wallet address"
              className="input-field flex-1 font-mono text-sm"
            />
            <button
              onClick={handleAddMember}
              disabled={!newAddress.trim() || !newAddress.startsWith("0x")}
              className="btn-primary flex-shrink-0"
            >
              Add
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-dark-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-dark-400" />
              Members ({members.length})
            </h2>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by address..."
              className="input-field pl-10 text-sm"
            />
          </div>

          {/* Member List */}
          <div className="divide-y divide-dark-800">
            {filteredMembers.length === 0 ? (
              <div className="py-8 text-center text-dark-500">
                {searchQuery ? "No members match your search." : "No members yet."}
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.address}
                  className="flex items-center justify-between py-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-dark-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-mono text-dark-200 truncate">
                        {truncateAddress(member.address, 8)}
                      </p>
                      <p className="text-xs text-dark-500">
                        Added {new Date(member.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(member.address)}
                      className="p-1.5 text-dark-400 hover:text-dark-200 transition-colors"
                      aria-label="Copy address"
                    >
                      {copiedAddress === member.address ? (
                        <Check className="w-4 h-4 text-primary-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member.address)}
                      className="p-1.5 text-dark-400 hover:text-accent-400 transition-colors"
                      aria-label="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
