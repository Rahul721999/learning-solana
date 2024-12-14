use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

const ANCHOR_DISCRIMINATOR: usize = 8;
declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod tokenvesting {

    use super::*;

    pub fn create_employee_vesting(
        ctx: Context<CreateVestingAccount>,
        company_name: String,
    ) -> Result<()> {
        *ctx.accounts.vesting_account = VestingAccount {
            owner: ctx.accounts.signer.key(),
            company_name,
            token_mint: ctx.accounts.token_mint.key(),
            treasury_token_account: ctx.accounts.treasury_token_account.key(),
            treasury_bump: ctx.bumps.treasury_token_account,
            bump: ctx.bumps.vesting_account,
        };
        Ok(())
    }

    pub fn create_employee_account(
        ctx: Context<CreateEmployeeAccount>,
        start_time: i64,
        end_time: i64,
        cliff_period: i64,
        total_token_amount: i64
    ) -> Result<()> {
        *ctx.accounts.employee_account = EmployeeAccount{ 
            beneficiary: ctx.accounts.beneficiary.key(), 
            start_time,
            end_time, 
            cliff_period,
            vesting_acc: ctx.accounts.vesting_account.key(), 
            total_token_amount, 
            total_token_withdrawm: 0, 
            bump: ctx.bumps.employee_account
        };

        Ok(())
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

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + VestingAccount::INIT_SPACE,
        seeds = [company_name.as_ref()],
        bump
    )]
    pub vesting_account: Account<'info, VestingAccount>, // Holds the company metadata

    #[account(
        init,
        payer = signer,
        token::mint = token_mint,
        token::authority = treasury_token_account,
        seeds =  [b"vesting_treasury", company_name.as_bytes()],
        bump
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>, // Holds the actual token
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

// Vesting Account: Storest the metadata of the company configued vesting Schedule
#[account]
#[derive(InitSpace, Debug)]
pub struct VestingAccount {
    #[max_len(50)]
    pub company_name: String,
    pub owner: Pubkey,
    pub token_mint: Pubkey,             // token mint address
    pub treasury_token_account: Pubkey, // account that holds the actual token
    pub treasury_bump: u8,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct CreateEmployeeAccount<'info> {
    #[account(mut)]
    pub owner: Signer<'info>, // Employee will be the signer here
    pub beneficiary: SystemAccount<'info>,

    #[account(has_one = owner)]
    pub vesting_account: Account<'info, VestingAccount>,

    #[account(
        init,
        payer = owner,
        space = 8 + EmployeeAccount::INIT_SPACE,
        seeds = [b"employee_vesting", beneficiary.key().as_ref(), vesting_account.key().as_ref()],
        bump
    )]
    pub employee_account: Account<'info, EmployeeAccount>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct EmployeeAccount {
    pub beneficiary: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub cliff_period: i64,
    pub vesting_acc: Pubkey,
    pub total_token_amount: i64,
    pub total_token_withdrawm: i64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct ClaimTokens {}
