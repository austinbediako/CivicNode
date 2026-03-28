/// CivicNode Governance Module (Sui Move)
///
/// Implements community creation, member management, proposal lifecycle,
/// voting, and treasury management using Sui's object-centric model.
/// All core structs are shared objects so any authorized party can interact.
#[allow(unused_const)]
module civicnode::governance {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};

    // -------------------------------------------------------
    // Error codes
    // -------------------------------------------------------
    const E_NOT_ADMIN: u64 = 1000;
    const E_NOT_MEMBER: u64 = 1001;
    const E_ALREADY_MEMBER: u64 = 1002;
    const E_ALREADY_VOTED: u64 = 1003;
    const E_PROPOSAL_NOT_LIVE: u64 = 1004;
    const E_PROPOSAL_NOT_PASSED: u64 = 1005;
    const E_VOTING_NOT_ENDED: u64 = 1006;
    const E_QUORUM_NOT_MET: u64 = 1007;
    const E_INVALID_QUORUM: u64 = 1008;
    const E_INSUFFICIENT_TREASURY: u64 = 1009;
    const E_ZERO_AMOUNT: u64 = 1010;

    // -------------------------------------------------------
    // Proposal status constants
    // -------------------------------------------------------
    const STATUS_DRAFT: u8 = 0;
    const STATUS_LIVE: u8 = 1;
    const STATUS_PASSED: u8 = 2;
    const STATUS_FAILED: u8 = 3;
    const STATUS_EXECUTED: u8 = 4;

    // Vote choice constants
    const VOTE_YES: u8 = 0;
    const VOTE_NO: u8 = 1;
    const VOTE_ABSTAIN: u8 = 2;

    // -------------------------------------------------------
    // Structs
    // -------------------------------------------------------

    /// AdminCap grants administrative powers over a specific community.
    public struct AdminCap has key, store {
        id: UID,
        community_id: ID,
    }

    /// Shared object representing a community with its treasury.
    public struct Community has key {
        id: UID,
        admin: address,
        quorum_threshold: u64,
        member_count: u64,
        members: Table<address, bool>,
        treasury: Balance<SUI>,
    }

    /// Shared object representing a governance proposal.
    public struct Proposal has key {
        id: UID,
        community_id: ID,
        budget_requested: u64,
        recipient: address,
        deadline_ms: u64,
        status: u8,
        yes_votes: u64,
        no_votes: u64,
        abstain_votes: u64,
        voters: Table<address, bool>,
    }

    // -------------------------------------------------------
    // Events
    // -------------------------------------------------------

    public struct CommunityCreated has copy, drop {
        community_id: ID,
        admin: address,
        quorum_threshold: u64,
    }

    public struct MemberRegistered has copy, drop {
        community_id: ID,
        member: address,
    }

    public struct ProposalCreated has copy, drop {
        proposal_id: ID,
        community_id: ID,
        budget_requested: u64,
        recipient: address,
        deadline_ms: u64,
    }

    public struct VoteCast has copy, drop {
        proposal_id: ID,
        voter: address,
        choice: u8,
    }

    public struct ProposalExecuted has copy, drop {
        proposal_id: ID,
        recipient: address,
        amount: u64,
    }

    public struct TreasuryDeposit has copy, drop {
        community_id: ID,
        depositor: address,
        amount: u64,
    }

    // -------------------------------------------------------
    // Community management
    // -------------------------------------------------------

    /// Create a new community. The caller becomes the admin and first member.
    /// Returns an AdminCap to the creator.
    public fun create_community(
        quorum_threshold: u64,
        ctx: &mut TxContext,
    ) {
        assert!(quorum_threshold > 0 && quorum_threshold <= 100, E_INVALID_QUORUM);

        let admin_addr = ctx.sender();
        let mut members = table::new<address, bool>(ctx);
        table::add(&mut members, admin_addr, true);

        let community = Community {
            id: object::new(ctx),
            admin: admin_addr,
            quorum_threshold,
            member_count: 1,
            members,
            treasury: balance::zero<SUI>(),
        };

        let community_id = object::id(&community);

        let admin_cap = AdminCap {
            id: object::new(ctx),
            community_id,
        };

        event::emit(CommunityCreated {
            community_id,
            admin: admin_addr,
            quorum_threshold,
        });

        transfer::transfer(admin_cap, admin_addr);
        transfer::share_object(community);
    }

    /// Register a new member in the community. Only admin can call.
    public fun register_member(
        admin_cap: &AdminCap,
        community: &mut Community,
        member: address,
    ) {
        assert!(admin_cap.community_id == object::id(community), E_NOT_ADMIN);
        assert!(!table::contains(&community.members, member), E_ALREADY_MEMBER);

        table::add(&mut community.members, member, true);
        community.member_count = community.member_count + 1;

        event::emit(MemberRegistered {
            community_id: object::id(community),
            member,
        });
    }

    // -------------------------------------------------------
    // Treasury
    // -------------------------------------------------------

    /// Deposit SUI into the community treasury.
    public fun deposit_to_treasury(
        community: &mut Community,
        coin: Coin<SUI>,
        ctx: &TxContext,
    ) {
        let amount = coin::value(&coin);
        assert!(amount > 0, E_ZERO_AMOUNT);

        let depositor = ctx.sender();
        balance::join(&mut community.treasury, coin::into_balance(coin));

        event::emit(TreasuryDeposit {
            community_id: object::id(community),
            depositor,
            amount,
        });
    }

    // -------------------------------------------------------
    // Proposals
    // -------------------------------------------------------

    /// Create a proposal. Only members can create proposals.
    /// `deadline_ms` is an absolute timestamp in milliseconds.
    public fun create_proposal(
        community: &mut Community,
        budget_requested: u64,
        recipient: address,
        deadline_ms: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = ctx.sender();
        assert!(table::contains(&community.members, sender), E_NOT_MEMBER);
        assert!(deadline_ms > clock::timestamp_ms(clock), E_VOTING_NOT_ENDED);

        let proposal = Proposal {
            id: object::new(ctx),
            community_id: object::id(community),
            budget_requested,
            recipient,
            deadline_ms,
            status: STATUS_LIVE,
            yes_votes: 0,
            no_votes: 0,
            abstain_votes: 0,
            voters: table::new<address, bool>(ctx),
        };

        event::emit(ProposalCreated {
            proposal_id: object::id(&proposal),
            community_id: object::id(community),
            budget_requested,
            recipient,
            deadline_ms,
        });

        transfer::share_object(proposal);
    }

    // -------------------------------------------------------
    // Voting
    // -------------------------------------------------------

    /// Cast a vote on a live proposal. `choice`: 0=YES, 1=NO, 2=ABSTAIN.
    public fun vote_on_proposal(
        community: &Community,
        proposal: &mut Proposal,
        choice: u8,
        clock: &Clock,
        ctx: &TxContext,
    ) {
        let voter = ctx.sender();

        assert!(table::contains(&community.members, voter), E_NOT_MEMBER);
        assert!(proposal.status == STATUS_LIVE, E_PROPOSAL_NOT_LIVE);
        assert!(clock::timestamp_ms(clock) <= proposal.deadline_ms, E_PROPOSAL_NOT_LIVE);
        assert!(!table::contains(&proposal.voters, voter), E_ALREADY_VOTED);

        table::add(&mut proposal.voters, voter, true);

        if (choice == VOTE_YES) {
            proposal.yes_votes = proposal.yes_votes + 1;
        } else if (choice == VOTE_NO) {
            proposal.no_votes = proposal.no_votes + 1;
        } else {
            proposal.abstain_votes = proposal.abstain_votes + 1;
        };

        event::emit(VoteCast {
            proposal_id: object::id(proposal),
            voter,
            choice,
        });
    }

    // -------------------------------------------------------
    // Execution
    // -------------------------------------------------------

    /// Execute a passed proposal. Transfers funds from the community treasury
    /// to the proposal recipient. Can only be called after the deadline and
    /// when quorum is met with more yes than no votes.
    public fun execute_proposal(
        admin_cap: &AdminCap,
        community: &mut Community,
        proposal: &mut Proposal,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(admin_cap.community_id == object::id(community), E_NOT_ADMIN);
        assert!(proposal.community_id == object::id(community), E_NOT_ADMIN);
        assert!(proposal.status == STATUS_LIVE, E_PROPOSAL_NOT_LIVE);
        assert!(clock::timestamp_ms(clock) > proposal.deadline_ms, E_VOTING_NOT_ENDED);

        let total_votes = proposal.yes_votes + proposal.no_votes + proposal.abstain_votes;
        let quorum_votes_needed = (community.member_count * community.quorum_threshold) / 100;

        if (total_votes < quorum_votes_needed || proposal.no_votes >= proposal.yes_votes) {
            proposal.status = STATUS_FAILED;
            return
        };

        // Quorum met and more yes than no
        assert!(balance::value(&community.treasury) >= proposal.budget_requested, E_INSUFFICIENT_TREASURY);

        let payment = coin::take(&mut community.treasury, proposal.budget_requested, ctx);
        transfer::public_transfer(payment, proposal.recipient);

        proposal.status = STATUS_EXECUTED;

        event::emit(ProposalExecuted {
            proposal_id: object::id(proposal),
            recipient: proposal.recipient,
            amount: proposal.budget_requested,
        });
    }

    // -------------------------------------------------------
    // View helpers (for tests and off-chain queries)
    // -------------------------------------------------------

    public fun is_member(community: &Community, addr: address): bool {
        table::contains(&community.members, addr)
    }

    public fun get_member_count(community: &Community): u64 {
        community.member_count
    }

    public fun get_quorum_threshold(community: &Community): u64 {
        community.quorum_threshold
    }

    public fun get_proposal_status(proposal: &Proposal): u8 {
        proposal.status
    }

    public fun get_yes_votes(proposal: &Proposal): u64 {
        proposal.yes_votes
    }

    public fun get_no_votes(proposal: &Proposal): u64 {
        proposal.no_votes
    }

    public fun get_treasury_balance(community: &Community): u64 {
        balance::value(&community.treasury)
    }

    public fun get_proposal_community_id(proposal: &Proposal): ID {
        proposal.community_id
    }

    // -------------------------------------------------------
    // Test-only helpers
    // -------------------------------------------------------

    #[test_only]
    public fun init_for_testing(_ctx: &mut TxContext) {
        // No-op in Sui — no global storage to initialize.
        // Kept for API compatibility with tests.
    }
}
