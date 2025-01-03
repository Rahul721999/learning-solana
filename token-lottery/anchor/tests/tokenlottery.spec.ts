import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Connection, PublicKey, ComputeBudgetProgram } from '@solana/web3.js'
import { Tokenlottery } from '../target/types/tokenlottery'
import IDL from '../target/idl/tokenlottery.json';
import { TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';



const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

describe('tokenlottery', () => {
  let provider: anchor.AnchorProvider;
  let connection: Connection;
  let program: Program<Tokenlottery>;
  let wallet: anchor.Wallet;
  beforeAll(async () => {

    // set provider
    provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    connection = provider.connection;

    program = new Program<Tokenlottery>(IDL as Tokenlottery, provider);
    wallet = provider.wallet as anchor.Wallet;
    console.debug(`Payer Public Key: ${wallet.publicKey.toBase58()}`);

  });

  // buy ticket helper fn
  const buyTicket = async () => {
    const computeIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 300000,
    })

    const priorityIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1,
    })

    const buyTicketIx = await program.methods
      .buyTicket()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .instruction();

    const tx = new anchor.web3.Transaction({
      feePayer: wallet.payer.publicKey,
    }).add(buyTicketIx)
      .add(computeIx)
      .add(priorityIx);

    const txSignature = await anchor.web3.sendAndConfirmTransaction(connection, tx, [wallet.payer], { skipPreflight: true });
    console.info(`Buy-ticket Transaction Signature: ${txSignature}`);
  }


  it('Test: Initialize Token Lottery Config', async () => {
    let slot = await connection.getSlot();

    const txSignature = await program.methods
      .initializeLotteryConfig(
        new anchor.BN(0),  // start Time
        new anchor.BN(slot + 10000),  // end Time
        new anchor.BN(1000)        // Ticket Price
      )
      .accounts({
        payer: wallet.publicKey
      })
      .rpc({ commitment: "confirmed" });
    console.info(`Initialize-Lottery-config Transaction Signature: ${txSignature}`);

    // Create a PDA (Program Derived Address) for the token lottery account
    const [tokenLotteryAccountPDA, tokenAccountBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_lottery")],
      program.programId
    );
    // Fetch account data
    const tokenLotteryAcc = await program.account.tokenLotteryAccount.fetch(
      tokenLotteryAccountPDA
    );

    // Assertions
    expect(tokenLotteryAcc.startTime.toNumber()).toBe(0);
    expect(tokenLotteryAcc.endTime.toNumber()).toBe(slot + 10000);
    expect(tokenLotteryAcc.ticketPrice.toNumber()).toBe(1000);
    expect(tokenLotteryAcc.authority).toEqual(wallet.publicKey);
    expect(tokenLotteryAcc.bump).toBe(tokenAccountBump);

    console.debug('Token Lottery Config successfully initialized and verified.');
  })

  it('Test: Initialize token lottery', async () => {
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

    const txSignature = await program.methods
      .initializeLottery()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
        payer: wallet.publicKey,
        metadata: metadata,
        masterEditions: masterEdition,
      })
      .rpc({ commitment: "confirmed" });
    console.info(`Initialize-Lottery Transaction Signature: ${txSignature}`);

    console.log('Token Lottery successfully initialized.');
  });

  it('Test: Buy Ticket', async () => {
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
  });
})
