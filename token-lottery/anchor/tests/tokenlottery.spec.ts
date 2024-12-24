import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Tokenlottery } from '../target/types/tokenlottery'
import { startAnchor, ProgramTestContext } from 'solana-bankrun';
import { BankrunProvider } from 'anchor-bankrun';
import IDL from '../target/idl/tokenlottery.json';

const PROGRAM_ID = new PublicKey(IDL.address)


describe('tokenlottery', () => {
  let context: ProgramTestContext;
  let provider: BankrunProvider;
  let program: Program<Tokenlottery>;
  let payer: Keypair;
  let tokenLotteryAccount: Keypair;


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

    tokenLotteryAccount = Keypair.generate();
  });

  it('Initialize Tokenlottery', async () => {
    const tx = await program.methods
      .initializeConfig(
        new anchor.BN(1735143320),  // start Time
        new anchor.BN(1835143320),  // end Time
        new anchor.BN(1000),        // Ticket Price
        new anchor.BN(10000),       // Jackpot
      )
      .accounts({
        payer: payer.publicKey
      })
      .rpc({ commitment: "confirmed" })

    console.log("Create Token Lottery Transaction  Signature: ", tx);
  })
})
