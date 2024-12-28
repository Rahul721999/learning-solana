use crate::*;
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::metadata::{
    create_master_edition_v3, create_metadata_accounts_v3,
    mpl_token_metadata::types::{CollectionDetails, Creator, DataV2},
    set_and_verify_sized_collection_item, sign_metadata, CreateMasterEditionV3,
    CreateMetadataAccountsV3, Metadata, MetadataAccount, SetAndVerifySizedCollectionItem,
    SignMetadata,
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface},
};
use switchboard_on_demand::accounts::RandomnessAccountData;

// Invoked by the lottery creator to initialize the lottery (startTime, endTime etc.).
pub fn initialize_config(
    ctx: Context<InitializeLotteryConfig>,
    start_time: u64,
    end_time: u64,
    ticket_price: u64,
    prize_amount: u64,
) -> Result<()> {
    *ctx.accounts.token_lottery_account = TokenLotteryAccount {
        bump: ctx.bumps.token_lottery_account,
        winner: Pubkey::default(),
        winner_claimed: false,
        start_time,
        end_time,
        prize_amount,
        ticket_price,
        ticket_count: 0,
        winner_commitment: 0,
        winner_committed: false,
        winner_chosen: false,
        authority: *ctx.accounts.payer.key,
        randomness_account: Pubkey::default(),
    };
    Ok(())
}

/* ----------------------------Initialize Lottery Config---------------------------- */
#[derive(Accounts)]
#[instruction(start_time: u64, end_time: u64, prize_amount: u64, ticket_price: u64)]
pub struct InitializeLotteryConfig<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        space = ANCHOR_DISCRIMINATOR + TokenLotteryAccount::INIT_SPACE,
        payer = payer,
        seeds = [b"token_lottery".as_ref()],
        bump
    )]
    pub token_lottery_account: Account<'info, TokenLotteryAccount>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct TokenLotteryAccount {
    pub bump: u8,
    pub winner: Pubkey,
    pub winner_claimed: bool,
    pub start_time: u64,
    pub end_time: u64,
    pub prize_amount: u64,
    pub ticket_price: u64,
    pub ticket_count: u64,
    pub winner_commitment: u64,
    pub winner_committed: bool,
    pub winner_chosen: bool,
    pub authority: Pubkey,
    pub randomness_account: Pubkey,
}
