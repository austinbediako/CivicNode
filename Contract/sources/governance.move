/// Core governance logic for CivicNode.
///
/// Communities are created by an admin who controls membership.
/// Proposals request budget from the community treasury and are decided
/// by on-chain votes subject to a configurable quorum threshold.
module civicnode::governance {
    use std::signer;
    use std::vector;
    use aptos_std::table::{Self, Table};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use civicnode::errors;

    // -------------------------------------------------------
    // Resources
    // -------------------------------------------------------

    /// Global registry of all communities, stored at the module address.
    struct CommunityRegistry has key {
        communities: Table<u64, Community>,
        next_community_id: u64,
    }

    /// On-chain representation of a single community.
    struct Community has store, copy, drop {
        id: u64,
        admin: address,
        /// Percentage of members that must vote for quorum (e.g. 51 = 51%).
        quorum_threshold: u64,
        member_count: u64,
    }

    /// Maps community_id -> list of member addresses.
    struct MemberRegistry has key {
        members: Table<u64, vector<address>>,
    }

    /// Global registry of all proposals.
    struct ProposalRegistry has key {
        proposals: Table<u64, Proposal>,
        next_proposal_id: u64,
    }

    /// On-chain representation of a governance proposal.
    struct Proposal has store, copy, drop {
        id: u64,
        community_id: u64,
        budget_requested: u64,
        recipient: address,
        /// Unix timestamp after which voting closes.
        deadline: u64,
        yes_votes: u64,
        no_votes: u64,
        abstain_votes: u64,
        /// 0=draft, 1=live, 2=passed, 3=failed, 4=executed, 5=execution_failed
        status: u8,
    }

    /// Tracks which addresses have already voted on each proposal
    /// to prevent double-voting.
    struct VoteRecord has key {
        records: Table<u64, Table<address, bool>>,
    }

    // -------------------------------------------------------
    // Events
    // -------------------------------------------------------

    #[event]
    struct VoteCast has drop, store {
        proposal_id: u64,
        voter: address,
        choice: u8,
        timestamp: u64,
    }

    #[event]
    struct ProposalExecuted has drop, store {
        proposal_id: u64,
        recipient: address,
        amount: u64,
        timestamp: u64,
    }

    #[event]
    struct ProposalCreated has drop, store {
        proposal_id: u64,
        community_id: u64,
        budget_requested: u64,
    }

    // -------------------------------------------------------
    // Initialization (called once on module publish)
    // -------------------------------------------------------

    /// Seeds every top-level resource so later functions can borrow them.
    fun init_module(account: &signer) {
        move_to(account, CommunityRegistry {
            communities: table::new(),
            next_community_id: 0,
        });
        move_to(account, MemberRegistry {
            members: table::new(),
        });
        move_to(account, ProposalRegistry {
            proposals: table::new(),
            next_proposal_id: 0,
        });
        move_to(account, VoteRecord {
            records: table::new(),
        });
    }

    // -------------------------------------------------------
    // Entry functions
    // -------------------------------------------------------

    /// Create a new community. The caller becomes admin and the first member.
    public entry fun create_community(
        admin: &signer,
        quorum_threshold: u64,
    ) acquires CommunityRegistry, MemberRegistry {
        let admin_addr = signer::address_of(admin);
        let registry = borrow_global_mut<CommunityRegistry>(@civicnode);
        let id = registry.next_community_id;

        let community = Community {
            id,
            admin: admin_addr,
            quorum_threshold,
            member_count: 1, // admin counts as the first member
        };
        table::add(&mut registry.communities, id, community);
        registry.next_community_id = id + 1;

        // Register the admin as the first member of this community.
        let member_reg = borrow_global_mut<MemberRegistry>(@civicnode);
        let members = vector::empty<address>();
        vector::push_back(&mut members, admin_addr);
        table::add(&mut member_reg.members, id, members);
    }

    /// Add a new member to a community. Only the community admin may call this.
    public entry fun register_member(
        admin: &signer,
        community_id: u64,
        member: address,
    ) acquires CommunityRegistry, MemberRegistry {
        let admin_addr = signer::address_of(admin);
        let registry = borrow_global_mut<CommunityRegistry>(@civicnode);

        assert!(
            table::contains(&registry.communities, community_id),
            errors::e_community_not_found(),
        );

        let community = table::borrow_mut(&mut registry.communities, community_id);
        // Only the community admin can add members.
        assert!(community.admin == admin_addr, errors::e_not_admin());

        community.member_count = community.member_count + 1;

        let member_reg = borrow_global_mut<MemberRegistry>(@civicnode);
        let members = table::borrow_mut(&mut member_reg.members, community_id);
        vector::push_back(members, member);
    }

    /// Create a proposal within a community. Only the admin may do this.
    /// `duration_seconds` is added to the current on-chain timestamp to
    /// derive the voting deadline.
    public entry fun create_proposal(
        admin: &signer,
        community_id: u64,
        budget_requested: u64,
        recipient: address,
        duration_seconds: u64,
    ) acquires CommunityRegistry, ProposalRegistry {
        let admin_addr = signer::address_of(admin);
        let c_registry = borrow_global<CommunityRegistry>(@civicnode);

        assert!(
            table::contains(&c_registry.communities, community_id),
            errors::e_community_not_found(),
        );

        let community = table::borrow(&c_registry.communities, community_id);
        assert!(community.admin == admin_addr, errors::e_not_admin());

        let now = timestamp::now_seconds();
        let p_registry = borrow_global_mut<ProposalRegistry>(@civicnode);
        let proposal_id = p_registry.next_proposal_id;

        let proposal = Proposal {
            id: proposal_id,
            community_id,
            budget_requested,
            recipient,
            deadline: now + duration_seconds,
            yes_votes: 0,
            no_votes: 0,
            abstain_votes: 0,
            status: 1, // live
        };

        table::add(&mut p_registry.proposals, proposal_id, proposal);
        p_registry.next_proposal_id = proposal_id + 1;

        event::emit(ProposalCreated {
            proposal_id,
            community_id,
            budget_requested,
        });
    }

    /// Cast a vote on a live proposal. Choice encoding: 0 = yes, 1 = no, 2 = abstain.
    public entry fun vote_on_proposal(
        voter: &signer,
        proposal_id: u64,
        choice: u8,
    ) acquires ProposalRegistry, MemberRegistry, VoteRecord {
        let voter_addr = signer::address_of(voter);

        // --- validation ---
        assert!(choice <= 2, errors::e_invalid_vote_choice());

        let p_registry = borrow_global_mut<ProposalRegistry>(@civicnode);
        assert!(
            table::contains(&p_registry.proposals, proposal_id),
            errors::e_proposal_not_found(),
        );

        let proposal = table::borrow_mut(&mut p_registry.proposals, proposal_id);
        assert!(proposal.status == 1, errors::e_proposal_not_live());

        let now = timestamp::now_seconds();
        assert!(now <= proposal.deadline, errors::e_proposal_closed());

        // Verify the voter belongs to the proposal's community.
        let member_reg = borrow_global<MemberRegistry>(@civicnode);
        let members = table::borrow(&member_reg.members, proposal.community_id);
        assert!(vector::contains(members, &voter_addr), errors::e_not_member());

        // Prevent double-voting.
        let vote_rec = borrow_global_mut<VoteRecord>(@civicnode);
        if (!table::contains(&vote_rec.records, proposal_id)) {
            table::add(&mut vote_rec.records, proposal_id, table::new<address, bool>());
        };
        let voters = table::borrow_mut(&mut vote_rec.records, proposal_id);
        assert!(!table::contains(voters, voter_addr), errors::e_already_voted());
        table::add(voters, voter_addr, true);

        // Tally the vote.
        if (choice == 0) {
            proposal.yes_votes = proposal.yes_votes + 1;
        } else if (choice == 1) {
            proposal.no_votes = proposal.no_votes + 1;
        } else {
            proposal.abstain_votes = proposal.abstain_votes + 1;
        };

        event::emit(VoteCast {
            proposal_id,
            voter: voter_addr,
            choice,
            timestamp: now,
        });
    }

    /// Finalize a proposal after its deadline. If quorum is met and
    /// yes > no, the requested budget is transferred from the executor
    /// to the recipient and status becomes "executed". Otherwise
    /// status becomes "failed".
    public entry fun execute_proposal(
        executor: &signer,
        proposal_id: u64,
    ) acquires ProposalRegistry, CommunityRegistry {
        let p_registry = borrow_global_mut<ProposalRegistry>(@civicnode);
        assert!(
            table::contains(&p_registry.proposals, proposal_id),
            errors::e_proposal_not_found(),
        );

        let proposal = table::borrow_mut(&mut p_registry.proposals, proposal_id);
        assert!(proposal.status == 1, errors::e_proposal_not_live());

        // Must wait until after deadline to execute.
        let now = timestamp::now_seconds();
        assert!(now > proposal.deadline, errors::e_proposal_closed());

        // Guard against re-execution (belt-and-suspenders with status check above).
        assert!(
            proposal.status != 4 && proposal.status != 5,
            errors::e_already_executed(),
        );

        // Check quorum: total votes must be >= member_count * quorum_threshold / 100
        let c_registry = borrow_global<CommunityRegistry>(@civicnode);
        let community = table::borrow(&c_registry.communities, proposal.community_id);
        let total_votes = proposal.yes_votes + proposal.no_votes + proposal.abstain_votes;
        let required = community.member_count * community.quorum_threshold / 100;
        assert!(total_votes >= required, errors::e_quorum_not_met());

        if (proposal.yes_votes > proposal.no_votes) {
            // Transfer coins from the executor to the recipient.
            let coins = coin::withdraw<AptosCoin>(executor, proposal.budget_requested);
            coin::deposit<AptosCoin>(proposal.recipient, coins);
            proposal.status = 4; // executed

            event::emit(ProposalExecuted {
                proposal_id,
                recipient: proposal.recipient,
                amount: proposal.budget_requested,
                timestamp: now,
            });
        } else {
            proposal.status = 3; // failed
        };
    }

    // -------------------------------------------------------
    // View / helper functions used by tests
    // -------------------------------------------------------

    #[view]
    /// Return the current member count of a community.
    public fun get_member_count(community_id: u64): u64 acquires CommunityRegistry {
        let registry = borrow_global<CommunityRegistry>(@civicnode);
        let community = table::borrow(&registry.communities, community_id);
        community.member_count
    }

    #[view]
    /// Return the status byte for a proposal.
    public fun get_proposal_status(proposal_id: u64): u8 acquires ProposalRegistry {
        let registry = borrow_global<ProposalRegistry>(@civicnode);
        let proposal = table::borrow(&registry.proposals, proposal_id);
        proposal.status
    }

    #[view]
    /// Return the yes-vote count for a proposal.
    public fun get_yes_votes(proposal_id: u64): u64 acquires ProposalRegistry {
        let registry = borrow_global<ProposalRegistry>(@civicnode);
        let proposal = table::borrow(&registry.proposals, proposal_id);
        proposal.yes_votes
    }

    #[view]
    /// Return the quorum threshold for a community.
    public fun get_quorum_threshold(community_id: u64): u64 acquires CommunityRegistry {
        let registry = borrow_global<CommunityRegistry>(@civicnode);
        let community = table::borrow(&registry.communities, community_id);
        community.quorum_threshold
    }

    #[view]
    /// Check whether an address is a member of a community.
    public fun is_member(community_id: u64, addr: address): bool acquires MemberRegistry {
        let member_reg = borrow_global<MemberRegistry>(@civicnode);
        if (!table::contains(&member_reg.members, community_id)) {
            return false
        };
        let members = table::borrow(&member_reg.members, community_id);
        vector::contains(members, &addr)
    }

    // -------------------------------------------------------
    // Test-only helpers
    // -------------------------------------------------------

    #[test_only]
    /// Expose init_module so tests can bootstrap registries.
    public fun init_for_testing(account: &signer) {
        init_module(account);
    }
}
