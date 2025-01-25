use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient fund")]
    InsufficientFund,
    #[msg("Insufficient Shares")]
    InsufficientShares,
    #[msg("Arithmetic Error")]
    ArithmeticError,
}
