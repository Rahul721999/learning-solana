use anchor_lang::prelude::*;

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
pub struct CreateVestingAccount{

}
#[derive(Accounts)]
pub struct CreateEmployeeAccount{

}
#[derive(Accounts)]
pub struct ClaimTokens{

}


#[account]
pub struct EmployeeAccount{

}
#[account]
pub struct VestingAccount{
    
}