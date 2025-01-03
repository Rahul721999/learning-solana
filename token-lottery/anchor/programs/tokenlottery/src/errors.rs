use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode{
    #[msg("Lottery is not open")]
    LotteryNotOpen,
    
}