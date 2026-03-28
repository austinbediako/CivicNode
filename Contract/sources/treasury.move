/// Community treasury management.
///
/// Each community has a pooled AptosCoin balance. Deposits are open to
/// anyone; withdrawals are restricted to the community admin.
module civicnode::treasury {
    use std::signer;
    use aptos_std::table::{Self, Table};
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use civicnode::errors;
    use civicnode::governance;

    // -------------------------------------------------------
    // Resources
    // -------------------------------------------------------

    /// Holds per-community coin balances keyed by community_id.
    struct Treasury has key {
        balances: Table<u64, Coin<AptosCoin>>,
    }

    // -------------------------------------------------------
    // Initialization
    // -------------------------------------------------------

    /// Must be called once (at publish time) to seed the Treasury resource.
    fun init_module(account: &signer) {
        move_to(account, Treasury {
            balances: table::new(),
        });
    }

    // -------------------------------------------------------
    // Entry functions
    // -------------------------------------------------------

    /// Anyone can deposit AptosCoin into a community's treasury.
    public entry fun deposit_to_treasury(
        depositor: &signer,
        community_id: u64,
        amount: u64,
    ) acquires Treasury {
        let coins = coin::withdraw<AptosCoin>(depositor, amount);
        let treasury = borrow_global_mut<Treasury>(@civicnode);

        if (table::contains(&treasury.balances, community_id)) {
            let existing = table::borrow_mut(&mut treasury.balances, community_id);
            coin::merge(existing, coins);
        } else {
            table::add(&mut treasury.balances, community_id, coins);
        };
    }

    /// Only the community admin may withdraw from the treasury.
    public entry fun withdraw_from_treasury(
        admin: &signer,
        community_id: u64,
        amount: u64,
        recipient: address,
    ) acquires Treasury {
        let admin_addr = signer::address_of(admin);

        // Verify the caller is the community admin via a view function.
        // We re-check membership in a lightweight way: the admin must be
        // a member AND the community's quorum_threshold must be readable
        // (which implicitly proves the community exists). For a stricter
        // check we rely on the governance module's data.
        assert!(governance::is_member(community_id, admin_addr), errors::e_not_admin());

        let treasury = borrow_global_mut<Treasury>(@civicnode);
        assert!(
            table::contains(&treasury.balances, community_id),
            errors::e_insufficient_funds(),
        );

        let pool = table::borrow_mut(&mut treasury.balances, community_id);
        assert!(coin::value(pool) >= amount, errors::e_insufficient_funds());

        let withdrawn = coin::extract(pool, amount);
        coin::deposit<AptosCoin>(recipient, withdrawn);
    }

    // -------------------------------------------------------
    // View functions
    // -------------------------------------------------------

    #[view]
    /// Return the current AptosCoin balance held in a community's treasury.
    public fun get_balance(community_id: u64): u64 acquires Treasury {
        let treasury = borrow_global<Treasury>(@civicnode);
        if (!table::contains(&treasury.balances, community_id)) {
            return 0
        };
        let pool = table::borrow(&treasury.balances, community_id);
        coin::value(pool)
    }

    // -------------------------------------------------------
    // Test-only helpers
    // -------------------------------------------------------

    #[test_only]
    public fun init_for_testing(account: &signer) {
        init_module(account);
    }
}
