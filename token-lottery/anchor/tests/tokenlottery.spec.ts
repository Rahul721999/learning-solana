import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { Tokenlottery } from '../target/types/tokenlottery'
import IDL from '../target/idl/tokenlottery.json';
import { TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';



const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

describe('tokenlottery', () => {
  let provider: anchor.AnchorProvider;
  let program: Program<Tokenlottery>;
  let payer: anchor.Wallet;
  beforeAll(async () => {
    console.log('Initializing provider and program...');

    // set provider
    provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    program = new Program<Tokenlottery>(IDL as Tokenlottery, provider);
    payer = provider.wallet as anchor.Wallet;
    console.log(`Payer Public Key: ${payer.publicKey.toBase58()}`);
  });

  it('Test: Initialize Token Lottery Config', async () => {
    console.log('\nStarting Test: Initialize Token Lottery Config');
    try {
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
      console.log('initializeLotteryConfig transaction confirmed.');
    } catch (error) {
      console.error('Error initializing token lottery config:', error);
      throw error;
    }

    // Create a PDA (Program Derived Address) for the token lottery account
    console.log('Fetching Token Lottery Account...');
    const [tokenLotteryAccountPDA, tokenAccountBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_lottery")],
      program.programId
    );
    console.log(`Token Lottery PDA: ${tokenLotteryAccountPDA.toBase58()}, Bump: ${tokenAccountBump}`);


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
    expect(tokenLotteryAcc.bump).toBe(tokenAccountBump);

    console.log('Token Lottery Config successfully initialized and verified.');
  })

  it('Test: Initialize token lottery', async () => {
    console.log('\nStarting Test: Initialize Token Lottery');
    const mint = PublicKey.findProgramAddressSync(
      [Buffer.from('collection_mint')],
      program.programId,
    )[0];

    const metadata = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID,
    )[0];

    const masterEdition = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from('edition')],
      TOKEN_METADATA_PROGRAM_ID,
    )[0];

    console.log(`  Derived Addresses:`);
    console.log(`  Mint: ${mint.toBase58()}`);
    console.log(`  Metadata: ${metadata.toBase58()}`);
    console.log(`  Master Edition: ${masterEdition.toBase58()}`);


    try {
      await program.methods
        .initializeLottery()
        .accounts({
          tokenProgram: TOKEN_PROGRAM_ID,
          payer: payer.publicKey,
          metadata: metadata,
          masterEditions: masterEdition,
        })
        .rpc({ commitment: "confirmed" });

        console.log('initializeLottery transaction confirmed.');
    }catch (error) {
      console.error('Error initializing token lottery:', error);
      throw error;
    }
    console.log('Token Lottery successfully initialized.');
  });
})
