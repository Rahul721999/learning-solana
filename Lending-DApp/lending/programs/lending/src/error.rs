use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient fund")]
    InsufficientFund,
    #[msg("Insufficient Shares")]
    InsufficientShares,
    #[msg("Arithmetic Error")]
    ArithmeticError,
    #[msg("Over borrowable limit")]
    OverBorrowableLimit,
    #[msg("Over Repay is not allowed")]
    OverRepay
}
