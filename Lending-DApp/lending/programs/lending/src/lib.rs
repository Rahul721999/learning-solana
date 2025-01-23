mod constants;
mod instructions;
mod state;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("GHeNTmRLi6cM8mxrgz5jhys5kwnVPJEUNp19ykyWofqP");

#[program]
pub mod lending {
    use super::*;

    // initialize bank account
    pub fn initialize_bank(
        ctx: Context<InitBank>,
        liquidation_threshold: u64,
        max_ltv: u64,
    ) -> Result<()> {
        process_initialize_bank(ctx, liquidation_threshold, max_ltv)
    }

    // initialize_user account

    // deposite token

    // withdraw token

    // borrow Loan

    // repay Loan

    // liquidate
}
