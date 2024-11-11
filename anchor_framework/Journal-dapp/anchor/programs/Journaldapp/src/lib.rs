#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;

declare_id!("HpHawHV3Y4EpxakG3LsVP5Wfewcc9VBDWQxwzSXV9ZBy");

#[program]
pub mod journal {
    use super::*;

    pub fn create_entry(ctx: Context<CreateEntry>, title: String, message: String) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;

        msg!("Initialized Journal");
        Ok(())
    }

    pub fn update_entry(
        ctx: Context<UpdateEntry>,
        _title: String,
        new_message: String,
    ) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = new_message;

        msg!("Message updated");
        Ok(())
    }

    pub fn delete_entry(_ctx: Context<DeleteEntry>, _title: String) -> Result<()> {
        msg!("Message updated");
        Ok(())
    }
}

// This is the Data that will be stored on the chain
#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey, // owner of the journal
    #[max_len(20)]
    pub title: String, // title of the journal
    #[max_len(200)]
    pub message: String, // description of the journal
    pub entry_id: u64, //
}

// Initialize Struct
#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateEntry<'info> {
    #[account(
    init,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    payer = owner,
    space = 8 + JournalEntryState::INIT_SPACE,
  )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Update Struct
#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateEntry<'info> {
    #[account(
    mut,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    realloc = 8 + JournalEntryState::INIT_SPACE,
    realloc::payer = owner,
    realloc::zero = true,
  )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Delete Struct
#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
    #[account(
    mut,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    close = owner,
  )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}
