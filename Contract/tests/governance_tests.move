/// Integration tests for the CivicNode governance module.
///
/// Each test bootstraps its own isolated environment (timestamp, accounts,
/// registries) so tests are independent and deterministic.
#[test_only]
module civicnode::governance_tests {
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use civicnode::governance;

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------

    /// Stand up the Aptos framework prerequisites that governance relies on
    /// (timestamp oracle + AptosCoin mint capability for funding test accounts).
    fun setup_test_env(framework: &signer) {
        // Initialize the on-chain clock at time = 1 so now_seconds() works.
        timestamp::set_time_has_started_for_testing(framework);
    }

    /// Initialise an AptosCoin mint/burn capability and fund `addr`.
    fun fund_account(framework: &signer, target: &signer, amount: u64) {
        let target_addr = signer::address_of(target);
        if (!account::exists_at(target_addr)) {
            account::create_account_for_test(target_addr);
        };
        // Initialize AptosCoin if it hasn't been done yet.
        // The first call creates the mint/burn caps; subsequent calls
        // in the same test transaction are idempotent because we check
        // coin::is_coin_initialized.
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(framework);
            // Mint and deposit.
            let coins = coin::mint<AptosCoin>(amount, &mint_cap);
            coin::register<AptosCoin>(target);
            coin::deposit(target_addr, coins);
            coin::destroy_burn_cap(burn_cap);
            coin::destroy_mint_cap(mint_cap);
        } else {
            // AptosCoin already exists; just register + airdrop via test helper.
            if (!coin::is_account_registered<AptosCoin>(target_addr)) {
                coin::register<AptosCoin>(target);
            };
        };
    }

    // -------------------------------------------------------
    // 1. Create community
    // -------------------------------------------------------

    #[test(admin = @civicnode)]
    /// Creating a community should make the admin a member and store the quorum.
    fun test_create_community(admin: &signer) {
        // Bootstrap framework clock.
        let framework = account::create_account_for_test(@0x1);
        setup_test_env(&framework);

        governance::init_for_testing(admin);
        governance::create_community(admin, 51);

        let admin_addr = signer::address_of(admin);
        // The admin must be in the member list.
        assert!(governance::is_member(0, admin_addr), 100);
        // The quorum threshold must be what we set.
        assert!(governance::get_quorum_threshold(0) == 51, 101);
    }

    // -------------------------------------------------------
    // 2. Register member
    // -------------------------------------------------------

    #[test(admin = @civicnode, member = @0x123)]
    /// Adding a member should increase the community's member_count.
    fun test_register_member(admin: &signer, member: &signer) {
        let framework = account::create_account_for_test(@0x1);
        setup_test_env(&framework);

        governance::init_for_testing(admin);
        governance::create_community(admin, 51);

        // member_count starts at 1 (admin).
        assert!(governance::get_member_count(0) == 1, 200);

        let member_addr = signer::address_of(member);
        governance::register_member(admin, 0, member_addr);

        assert!(governance::get_member_count(0) == 2, 201);
        assert!(governance::is_member(0, member_addr), 202);
    }

    // -------------------------------------------------------
    // 3. Create proposal
    // -------------------------------------------------------

    #[test(admin = @civicnode)]
    /// A proposal should be created with status = live (1) and correct fields.
    fun test_create_proposal(admin: &signer) {
        let framework = account::create_account_for_test(@0x1);
        setup_test_env(&framework);

        governance::init_for_testing(admin);
        governance::create_community(admin, 51);

        // Duration = 3600 seconds (1 hour).
        governance::create_proposal(admin, 0, 1000, @0xBEEF, 3600);

        // Proposal 0 should be live.
        assert!(governance::get_proposal_status(0) == 1, 300);
    }

    // -------------------------------------------------------
    // 4. Vote on proposal
    // -------------------------------------------------------

    #[test(admin = @civicnode, voter = @0x123)]
    /// A member should be able to cast a YES vote and the tally should reflect it.
    fun test_vote_on_proposal(admin: &signer, voter: &signer) {
        let framework = account::create_account_for_test(@0x1);
        setup_test_env(&framework);

        governance::init_for_testing(admin);
        governance::create_community(admin, 51);

        let voter_addr = signer::address_of(voter);
        governance::register_member(admin, 0, voter_addr);

        // Proposal with a 1-hour window.
        governance::create_proposal(admin, 0, 1000, @0xBEEF, 3600);

        // Voter casts YES (choice = 0).
        governance::vote_on_proposal(voter, 0, 0);

        assert!(governance::get_yes_votes(0) == 1, 400);
    }

    // -------------------------------------------------------
    // 5. Double-vote prevention
    // -------------------------------------------------------

    #[test(admin = @civicnode, voter = @0x123)]
    #[expected_failure(abort_code = 1003)]
    /// Attempting to vote twice on the same proposal must abort with E_ALREADY_VOTED.
    fun test_double_vote_prevention(admin: &signer, voter: &signer) {
        let framework = account::create_account_for_test(@0x1);
        setup_test_env(&framework);

        governance::init_for_testing(admin);
        governance::create_community(admin, 51);

        let voter_addr = signer::address_of(voter);
        governance::register_member(admin, 0, voter_addr);
        governance::create_proposal(admin, 0, 1000, @0xBEEF, 3600);

        // First vote succeeds.
        governance::vote_on_proposal(voter, 0, 0);
        // Second vote must abort.
        governance::vote_on_proposal(voter, 0, 1);
    }

    // -------------------------------------------------------
    // 6. Execute proposal
    // -------------------------------------------------------

    #[test(admin = @civicnode, voter1 = @0x123, voter2 = @0x456)]
    /// With 2 members in a 51%-quorum community, both voting yes should
    /// allow execution and set status = 4 (executed).
    fun test_execute_proposal(admin: &signer, voter1: &signer, voter2: &signer) {
        let framework = account::create_account_for_test(@0x1);
        setup_test_env(&framework);

        // Initialise AptosCoin so we can fund the admin (who will pay the proposal).
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(&framework);

        governance::init_for_testing(admin);

        // Fund the admin account so execute_proposal can transfer coins.
        let admin_addr = signer::address_of(admin);
        coin::register<AptosCoin>(admin);
        let coins = coin::mint<AptosCoin>(10000, &mint_cap);
        coin::deposit(admin_addr, coins);

        // Also set up the recipient so they can receive coins.
        let recipient_addr = @0xBEEF;
        let recipient_signer = account::create_account_for_test(recipient_addr);
        coin::register<AptosCoin>(&recipient_signer);

        governance::create_community(admin, 51);

        let voter1_addr = signer::address_of(voter1);
        let voter2_addr = signer::address_of(voter2);
        governance::register_member(admin, 0, voter1_addr);
        governance::register_member(admin, 0, voter2_addr);

        // member_count is now 3 (admin + voter1 + voter2).
        // quorum = 3 * 51 / 100 = 1 (integer division), so 2 votes suffice.

        // Create proposal with a very short deadline (1 second).
        governance::create_proposal(admin, 0, 1000, recipient_addr, 1);

        // Both members vote YES while still within the deadline.
        governance::vote_on_proposal(voter1, 0, 0);
        governance::vote_on_proposal(voter2, 0, 0);

        // Fast-forward time past the deadline so execution is allowed.
        timestamp::fast_forward_seconds(2);

        // Admin executes — coins flow from admin to recipient.
        governance::execute_proposal(admin, 0);

        assert!(governance::get_proposal_status(0) == 4, 600);

        // Clean up capabilities.
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}
