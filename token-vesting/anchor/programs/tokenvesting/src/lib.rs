use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

const ANCHOR_DISCRIMINATOR: usize = 8;
declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod tokenvesting {

    use super::*;

    pub fn create_employee_vesting(_context: Context<CreateVestingAccount>) -> Result<()> {
        unimplemented!()
    }

    pub fn create_employee_account(_context: Context<CreateEmployeeAccount>) -> Result<()> {
        unimplemented!()
    }

    pub fn claim_tokens(_context: Context<ClaimTokens>) -> Result<()> {
        unimplemented!()
    }
}

#[derive(Accounts)]
#[instruction(company_name: String)]
pub struct CreateVestingAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mint::token_program = token_program)]
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + VestingAccount::INIT_SPACE,
        seeds = [company_name.as_ref()],
        bump
    )]
    pub vesting_account: Account<'info, VestingAccount>,

    #[account(
        init,
        payer = signer,
        token::mint = mint,
        token::authority = treasury_token_account,
        seeds =  [b"vesting_treasury", company_name.as_bytes()],
        bump
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct VestingAccount {}



#[derive(Accounts)]
pub struct CreateEmployeeAccount {}
#[derive(Accounts)]
pub struct ClaimTokens {}

#[account]
#[derive(InitSpace, Debug)]
pub struct EmployeeAccount {}
