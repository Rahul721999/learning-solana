use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode{
    #[msg("Claiming is not available yet.")]
    ClaimNotAvailableYet,
    #[msg("There's nothing to claim.")]
    NothingToClaim,
    #[msg("Invalid vesting period")]
    InvalidVestingPeriod,
    #[msg("Calculation Overflow")]
    CalcultionOverflow
}