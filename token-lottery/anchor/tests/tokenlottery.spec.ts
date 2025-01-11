import * as anchor from '@coral-xyz/anchor'
import * as sb from "@switchboard-xyz/on-demand";
import { Program } from '@coral-xyz/anchor'
import { Connection, PublicKey, ComputeBudgetProgram } from '@solana/web3.js'
import { Tokenlottery } from '../target/types/tokenlottery'
import IDL from '../target/idl/tokenlottery.json';
import SwitchboardIDL from '../switchboard.json';
import { TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';



const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

describe('tokenlottery', () => {
  let provider: anchor.AnchorProvider;
  let connection: Connection;
  let program: Program<Tokenlottery>;
  let wallet: anchor.Wallet;
  let switchboardProgram: anchor.Program<anchor.Idl>;
  const rngKp = anchor.web3.Keypair.generate();


  beforeAll(async () => {

    // set provider
    provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    connection = provider.connection;

    program = new Program<Tokenlottery>(IDL as Tokenlottery, provider);
    wallet = provider.wallet as anchor.Wallet;
    console.debug(`Payer Public Key: ${wallet.publicKey.toBase58()}`);


    switchboardProgram = new anchor.Program(SwitchboardIDL as anchor.Idl, provider);
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
        new anchor.BN(slot + 10),  // end Time
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
    expect(tokenLotteryAcc.endTime.toNumber()).toBe(slot + 10);
    expect(tokenLotteryAcc.ticketPrice.toNumber()).toBe(1000);
    expect(tokenLotteryAcc.authority).toEqual(wallet.publicKey);
    expect(tokenLotteryAcc.bump).toBe(tokenAccountBump);
    expect(tokenLotteryAcc.winnerChosen).toBe(false);

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

  it('Test: commit & reveal winner', async () => {

    /* ---------------setting up SwitchBoard Queue--------------- */
    const queue = new anchor.web3.PublicKey("A43DyUGA7s8eXPxqEjJY6EBu1KKbNgfxF8h17VAHn13w");

    const queueAccount = new sb.Queue(switchboardProgram, queue);
    console.log("Queue account", queue.toString());

    // try to load queue data
    try {
      await queueAccount.loadData();
    } catch (err) {
      console.log("Queue account not found");
      process.exit(1);
    }


    /* ------------------Create a Randomness Account------------------ */
    const [randomness, ix] = await sb.Randomness.create(switchboardProgram, rngKp, queue);
    console.log("Created randomness account. ", randomness.pubkey.toBase58());
    console.log("rkp account", rngKp.publicKey.toBase58());

    // setup transaction: for create Randomness Account
    const createRandomnessTx = await sb.asV0Tx({
      connection: connection,
      ixs: [ix],
      payer: wallet.publicKey,
      signers: [wallet.payer, rngKp],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3
    });
    // send transaction
    const createRandomnessSig = await connection.sendTransaction(createRandomnessTx);
    const blockhashContext = await connection.getLatestBlockhashAndContext();
    await connection.confirmTransaction({
      signature: createRandomnessSig,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight
    });
    console.log(
      "Transaction Signature for randomness account creation: ",
      createRandomnessSig
    );

    /* ------------------Commit Random value------------------ */
    const sbCommitIx = await randomness.commitIx(queue);
    const commitIx = await program
      .methods.commitAWinner()
      .accounts({
        randomnessAccountData: randomness.pubkey
      })
      .instruction();

    const commitTx = await sb.asV0Tx({
      connection: switchboardProgram.provider.connection,
      ixs: [sbCommitIx, commitIx],
      payer: wallet.publicKey,
      signers: [wallet.payer],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3
    });

    const commitSignature = await connection.sendTransaction(commitTx);
    await connection.confirmTransaction({
      signature: commitSignature,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight
    });
    console.log(
      "Transaction Signature for commit: ",
      commitSignature
    );


    /* -------------------------Reveal the random Value------------------------- */
    const sbRevealIx = await randomness.revealIx();
    const revealIx = await program.methods.chooseAWinner()
      .accounts({
        randomnessAccountData: randomness.pubkey
      })
      .instruction();

    const revealTx = await sb.asV0Tx({
      connection: switchboardProgram.provider.connection,
      ixs: [sbRevealIx, revealIx],
      payer: wallet.publicKey,
      signers: [wallet.payer],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3
    });

    const revealSignature = await connection.sendTransaction(revealTx);
    await connection.confirmTransaction({
      signature: revealSignature,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight
    });
    console.log(
      "Transaction signature revealTx: ",
      revealSignature
    );


    // Create a PDA (Program Derived Address) for the token lottery account
    const [tokenLotteryAccountPDA, tokenAccountBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_lottery")],
      program.programId
    );
    // Fetch account data
    const tokenLotteryAcc = await program.account.tokenLotteryAccount.fetch(
      tokenLotteryAccountPDA
    );

    expect(tokenLotteryAcc.bump).toBe(tokenAccountBump);
    expect(tokenLotteryAcc.winnerChosen).toBe(true);
    expect(Number(tokenLotteryAcc.winner)).toBeGreaterThan(0);
    expect(tokenLotteryAcc.winnerClaimed).toBe(false);
  });

  it("Is claiming a prize", async () => {
    const claimIx = await program.methods.claimPrize()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
    
      const claimBlockhashContext = await connection.getLatestBlockhash();
      
      const claimTx = new anchor.web3.Transaction({
        blockhash: claimBlockhashContext.blockhash,
        lastValidBlockHeight: claimBlockhashContext.lastValidBlockHeight,
        feePayer: wallet.publicKey,
      }).add(claimIx);

      const claimSignature = await anchor.web3.sendAndConfirmTransaction(connection, claimTx, [wallet.payer], { skipPreflight: true });
      console.log("Claim token signature: ", claimSignature);
  });
})
 