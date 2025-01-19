use anchor_lang::prelude::*;

declare_id!("GHeNTmRLi6cM8mxrgz5jhys5kwnVPJEUNp19ykyWofqP");

#[program]
pub mod lending {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
