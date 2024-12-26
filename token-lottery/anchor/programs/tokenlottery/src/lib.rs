#![allow(unexpected_cfgs, unused_imports)]
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface}
};
use switchboard_on_demand::accounts::RandomnessAccountData;
use anchor_spl::metadata::{
    Metadata,
    MetadataAccount,
    CreateMetadataAccountsV3,
    CreateMasterEditionV3,
    SignMetadata,
    SetAndVerifySizedCollectionItem,
    create_master_edition_v3,
    create_metadata_accounts_v3,
    sign_metadata,
    set_and_verify_sized_collection_item,
    mpl_token_metadata::types::{
            CollectionDetails,
            Creator, 
            DataV2,
        },
};

declare_id!("8BwyWuqMWnNay4a2d2FKX93vKA9YZjK4ddHDcYZRACAn");

const ANCHOR_DISCRIMINATOR: usize = 8;

#[program]
pub mod tokenlottery {
    use super::*;

    /// Invoked by the lottery creator to initialize the lottery (startTime, endTime etc.).
    pub fn initialize_config(
        ctx: Context<InitializeLotteryConfig>,
        start_time: u64,
        end_time: u64,
        ticket_price: u64,
        prize_amount: u64,
    ) -> Result<()> {
        *ctx.accounts.token_lottery_account = TokenLotteryAccount {
            bump: ctx.accounts.token_lottery_account.bump,
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
    pub fn initialize_lottery(_ctx: Context<InitializeLottery>) -> Result<()> {
        /*
            1. Create collections that is owned by the program
                a. create mint.
                b. create collection account.
                c. create metadata account.
                d. verify the collection
         */
        Ok(())
    }
    // pub fn buy_ticket(_ctx: Context<InitializeTokenlottery>) -> Result<()> {
    //     Ok(())
    // }
    // pub fn commit_a_winner(_ctx: Context<InitializeTokenlottery>) -> Result<()> {
    //     Ok(())
    // }
    // pub fn choose_a_winner(_ctx: Context<InitializeTokenlottery>) -> Result<()> {
    //     Ok(())
    // }
    // pub fn claim_prize(_ctx: Context<InitializeTokenlottery>) -> Result<()> {
    //     Ok(())
    // }
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


/* ----------------------------Initialize Lottery ---------------------------- */
#[derive(Accounts)]
pub struct InitializeLottery<'info>{
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init, 
        payer = payer, 
        mint::decimals = 0,
        mint::authority = payer,
        mint::freeze_authority = payer,
        seeds = [b"collection_mint".as_ref()],
        bump,
    )]
    pub collection_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = payer,
        token::mint = collection_mint,
        token::authority = collection_token_account,
        seeds = [b"collection_associated_token".as_ref()],
        bump
    )]
    pub collection_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            b"metadata", 
            token_metadata_program.key().as_ref(), 
            collection_mint.key().as_ref()
        ],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    /// CHECK: This account is checked by the metadata smart contract
    pub metadata: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [
            b"metadata", 
            token_metadata_program.key().as_ref(), 
            collection_mint.key().as_ref(),
            b"edition",
        ],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    /// CHECK: This account is checked by the metadata smart contract
    pub master_editions: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token: Program<'info, AssociatedToken>,
}