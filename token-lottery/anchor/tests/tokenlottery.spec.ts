import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Tokenlottery } from '../target/types/tokenlottery'
import { startAnchor, ProgramTestContext } from 'solana-bankrun';
import { BankrunProvider } from 'anchor-bankrun';
import IDL from '../target/idl/tokenlottery.json';
import { TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';



const PROGRAM_ID = new PublicKey(IDL.address)


describe('tokenlottery', () => {
  let context: ProgramTestContext;
  let provider: BankrunProvider;
  let program: Program<Tokenlottery>;
  let payer: Keypair;
  beforeAll(async () => {

    // set context for anchor-bankrun
    context = await startAnchor(
      "",
      [{ name: "tokenlottery", programId: PROGRAM_ID }],
      []
    );

    // set provider
    provider = new BankrunProvider(context);
    anchor.setProvider(provider);

    program = new Program<Tokenlottery>(IDL as Tokenlottery, provider);

    payer = provider.wallet.payer;

  });

  it('Test: Initialize Token Lottery Config', async () => {

    await program.methods
      .initializeLotteryConfig(
        new anchor.BN(1735143320),  // start Time
        new anchor.BN(1835143320),  // end Time
        new anchor.BN(1000),        // Ticket Price
        new anchor.BN(10000),       // Jackpot
      )
      .accounts({
        payer: payer.publicKey
      })
      .rpc({ commitment: "confirmed" });

    // Create a PDA (Program Derived Address) for the token lottery account
    const [tokenLotteryAccountPDA, tokenAccountbump] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_lottery")],
      program.programId
    );
    // Fetch account data
    const tokenLotteryAcc = await program.account.tokenLotteryAccount.fetch(
      tokenLotteryAccountPDA
    );

    // Assertions
    expect(tokenLotteryAcc.startTime.toNumber()).toBe(1735143320);
    expect(tokenLotteryAcc.endTime.toNumber()).toBe(1835143320);
    expect(tokenLotteryAcc.ticketPrice.toNumber()).toBe(1000);
    expect(tokenLotteryAcc.prizeAmount.toNumber()).toBe(10000);
    expect(tokenLotteryAcc.authority).toEqual(payer.publicKey);
    expect(tokenLotteryAcc.bump).toBe(tokenAccountbump);
  })

  it('Test: Initialize token lottery', async () => {
    await program.methods
      .initializeLottery()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
        payer: payer.publicKey,
      })
      .rpc({ commitment: "confirmed" });
  });

})
