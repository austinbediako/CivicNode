/// Integration tests for the CivicNode governance module (Sui Move).
///
/// Each test uses test_scenario to create an isolated environment with
/// independent object state and clock.
#[test_only]
module civicnode::governance_tests {
    use sui::test_scenario::{Self as ts};
    use sui::clock::{Self};
    use sui::coin::{Self};
    use sui::sui::SUI;
    use civicnode::governance::{Self, Community, Proposal, AdminCap};

    const ADMIN: address = @0xAD;
    const VOTER1: address = @0x123;
    const VOTER2: address = @0x456;
    const RECIPIENT: address = @0xBEEF;

    // -------------------------------------------------------
    // 1. Create community
    // -------------------------------------------------------

    #[test]
    /// Creating a community should make the admin a member and store the quorum.
    fun test_create_community() {
        let mut scenario = ts::begin(ADMIN);

        // Create a clock for the test
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Admin creates a community with 51% quorum
        governance::create_community(51, ts::ctx(&mut scenario));

        // Advance to next tx to inspect shared objects
        ts::next_tx(&mut scenario, ADMIN);

        let community = ts::take_shared<Community>(&scenario);
        assert!(governance::is_member(&community, ADMIN), 100);
        assert!(governance::get_quorum_threshold(&community) == 51, 101);
        assert!(governance::get_member_count(&community) == 1, 102);

        ts::return_shared(community);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // -------------------------------------------------------
    // 2. Register member
    // -------------------------------------------------------

    #[test]
    /// Adding a member should increase the community's member_count.
    fun test_register_member() {
        let mut scenario = ts::begin(ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        governance::create_community(51, ts::ctx(&mut scenario));
        ts::next_tx(&mut scenario, ADMIN);

        let mut community = ts::take_shared<Community>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

        assert!(governance::get_member_count(&community) == 1, 200);

        governance::register_member(&admin_cap, &mut community, VOTER1);

        assert!(governance::get_member_count(&community) == 2, 201);
        assert!(governance::is_member(&community, VOTER1), 202);

        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(community);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // -------------------------------------------------------
    // 3. Create proposal
    // -------------------------------------------------------

    #[test]
    /// A proposal should be created with status = live (1) and correct fields.
    fun test_create_proposal() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000); // current time = 1s

        governance::create_community(51, ts::ctx(&mut scenario));
        ts::next_tx(&mut scenario, ADMIN);

        let mut community = ts::take_shared<Community>(&scenario);

        // Deadline = 3601000ms (well after current time of 1000ms)
        governance::create_proposal(
            &mut community,
            1000,
            RECIPIENT,
            3601000,
            &clock,
            ts::ctx(&mut scenario),
        );

        ts::return_shared(community);
        ts::next_tx(&mut scenario, ADMIN);

        let proposal = ts::take_shared<Proposal>(&scenario);
        assert!(governance::get_proposal_status(&proposal) == 1, 300);

        ts::return_shared(proposal);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // -------------------------------------------------------
    // 4. Vote on proposal
    // -------------------------------------------------------

    #[test]
    /// A member should be able to cast a YES vote and the tally should reflect it.
    fun test_vote_on_proposal() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000);

        governance::create_community(51, ts::ctx(&mut scenario));
        ts::next_tx(&mut scenario, ADMIN);

        let mut community = ts::take_shared<Community>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

        governance::register_member(&admin_cap, &mut community, VOTER1);

        governance::create_proposal(
            &mut community,
            1000,
            RECIPIENT,
            3601000,
            &clock,
            ts::ctx(&mut scenario),
        );

        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(community);
        ts::next_tx(&mut scenario, VOTER1);

        let community = ts::take_shared<Community>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);

        // Voter casts YES (choice = 0)
        governance::vote_on_proposal(&community, &mut proposal, 0, &clock, ts::ctx(&mut scenario));

        assert!(governance::get_yes_votes(&proposal) == 1, 400);

        ts::return_shared(community);
        ts::return_shared(proposal);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // -------------------------------------------------------
    // 5. Double-vote prevention
    // -------------------------------------------------------

    #[test]
    #[expected_failure(abort_code = 1003, location = civicnode::governance)]
    /// Attempting to vote twice on the same proposal must abort with E_ALREADY_VOTED.
    fun test_double_vote_prevention() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000);

        governance::create_community(51, ts::ctx(&mut scenario));
        ts::next_tx(&mut scenario, ADMIN);

        let mut community = ts::take_shared<Community>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

        governance::register_member(&admin_cap, &mut community, VOTER1);
        governance::create_proposal(
            &mut community,
            1000,
            RECIPIENT,
            3601000,
            &clock,
            ts::ctx(&mut scenario),
        );

        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(community);
        ts::next_tx(&mut scenario, VOTER1);

        let community = ts::take_shared<Community>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);

        // First vote succeeds
        governance::vote_on_proposal(&community, &mut proposal, 0, &clock, ts::ctx(&mut scenario));

        // Second vote must abort with E_ALREADY_VOTED (1003)
        governance::vote_on_proposal(&community, &mut proposal, 1, &clock, ts::ctx(&mut scenario));

        ts::return_shared(community);
        ts::return_shared(proposal);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // -------------------------------------------------------
    // 6. Execute proposal (treasury transfer)
    // -------------------------------------------------------

    #[test]
    /// With 3 members in a 51%-quorum community, 2 voting yes should
    /// allow execution and set status = 4 (executed).
    fun test_execute_proposal() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000);

        governance::create_community(51, ts::ctx(&mut scenario));
        ts::next_tx(&mut scenario, ADMIN);

        let mut community = ts::take_shared<Community>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

        governance::register_member(&admin_cap, &mut community, VOTER1);
        governance::register_member(&admin_cap, &mut community, VOTER2);

        // Fund the treasury with 10000 MIST
        let treasury_coin = coin::mint_for_testing<SUI>(10000, ts::ctx(&mut scenario));
        governance::deposit_to_treasury(&mut community, treasury_coin, ts::ctx(&mut scenario));

        assert!(governance::get_treasury_balance(&community) == 10000, 500);

        // Create proposal with deadline at 2000ms (short)
        governance::create_proposal(
            &mut community,
            1000,
            RECIPIENT,
            2000,
            &clock,
            ts::ctx(&mut scenario),
        );

        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(community);

        // Voter1 votes YES
        ts::next_tx(&mut scenario, VOTER1);
        {
            let community = ts::take_shared<Community>(&scenario);
            let mut proposal = ts::take_shared<Proposal>(&scenario);
            governance::vote_on_proposal(&community, &mut proposal, 0, &clock, ts::ctx(&mut scenario));
            ts::return_shared(community);
            ts::return_shared(proposal);
        };

        // Voter2 votes YES
        ts::next_tx(&mut scenario, VOTER2);
        {
            let community = ts::take_shared<Community>(&scenario);
            let mut proposal = ts::take_shared<Proposal>(&scenario);
            governance::vote_on_proposal(&community, &mut proposal, 0, &clock, ts::ctx(&mut scenario));
            ts::return_shared(community);
            ts::return_shared(proposal);
        };

        // Fast-forward clock past deadline
        clock::set_for_testing(&mut clock, 3000);

        // Admin executes the proposal
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut community = ts::take_shared<Community>(&scenario);
            let mut proposal = ts::take_shared<Proposal>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            governance::execute_proposal(
                &admin_cap,
                &mut community,
                &mut proposal,
                &clock,
                ts::ctx(&mut scenario),
            );

            assert!(governance::get_proposal_status(&proposal) == 4, 600);
            // Treasury should have 10000 - 1000 = 9000 remaining
            assert!(governance::get_treasury_balance(&community) == 9000, 601);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(community);
            ts::return_shared(proposal);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}
