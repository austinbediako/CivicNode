/// Central error codes for the CivicNode governance platform.
/// Each module imports these constants so abort codes are consistent
/// across the entire package and easy to match on the client side.
module civicnode::errors {

    /// Caller is not the community admin for the requested operation.
    public fun e_not_admin(): u64 { 1001 }

    /// Caller is not a registered member of the relevant community.
    public fun e_not_member(): u64 { 1002 }

    /// Voter has already cast a vote on this proposal.
    public fun e_already_voted(): u64 { 1003 }

    /// The proposal's voting deadline has passed.
    public fun e_proposal_closed(): u64 { 1004 }

    /// The total votes did not meet the community's quorum threshold.
    public fun e_quorum_not_met(): u64 { 1005 }

    /// Treasury does not hold enough funds for the requested withdrawal.
    public fun e_insufficient_funds(): u64 { 1006 }

    /// No proposal exists with the given ID.
    public fun e_proposal_not_found(): u64 { 1007 }

    /// No community exists with the given ID.
    public fun e_community_not_found(): u64 { 1008 }

    /// Vote choice must be 0 (yes), 1 (no), or 2 (abstain).
    public fun e_invalid_vote_choice(): u64 { 1009 }

    /// Proposal is not in "live" status.
    public fun e_proposal_not_live(): u64 { 1010 }

    /// Proposal has already been executed or finalized.
    public fun e_already_executed(): u64 { 1011 }
}
