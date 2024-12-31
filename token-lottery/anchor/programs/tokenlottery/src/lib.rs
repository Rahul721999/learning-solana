#![allow(unexpected_cfgs, unused_imports)]
mod instructions;
use instructions::*;

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

declare_id!("5m1SMwjzymVG7MSX4DEvu9v354StReHGvxJL6oPDWsXo");


#[constant]
pub const NAME: &str = "Token Lottery Ticket #";
#[constant]
pub const SYMBOL: &str = "TLT";
#[constant]
pub const URI: &str = "https://www.shutterstock.com/search/vintage-concert-ticket?image_type=vector";

const ANCHOR_DISCRIMINATOR: usize = 8;

#[program]
pub mod tokenlottery {
    use super::*;

    // Invoked by the lottery creator to initialize the lottery (startTime, endTime etc.).
    pub fn initialize_lottery_config(
        ctx: Context<InitializeLotteryConfig>,
        start_time: u64,
        end_time: u64,
        ticket_price: u64,
        prize_amount: u64,
    ) -> Result<()> {
        instructions::initialize_config(ctx, start_time, end_time, ticket_price, prize_amount)
    }

    // Responsible for initializing the mint collection, metadata, master edition and associated token account.
    pub fn initialize_lottery(ctx: Context<InitializeLottery>) -> Result<()> {
        instructions::initialize_lottery(ctx)
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