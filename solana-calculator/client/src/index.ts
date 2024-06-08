import { config } from "dotenv";
config();
import * as fs from "fs";
import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    sendAndConfirmTransaction,
    SystemProgram,
    TransactionInstruction,
    SendTransactionError,
} from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID!);
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL!;
const CONNECTION = new Connection(SOLANA_RPC_URL, "confirmed");
const FUND_PAYER = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync("./fund_payer.json", "utf8")))
);

(async () => {
    console.log(`ProgramID: ${PROGRAM_ID}`);// smart-contract ID..
    console.log(`Fund Payer: ${FUND_PAYER.publicKey}`);// PublicKey of the wallet paying for the transaction..


    /* -----------------------------------creating data account----------------------------------- */
    const calculatorAccount = Keypair.generate();

    // allocate space for the account
    const createCalculatorTx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: FUND_PAYER.publicKey,
            newAccountPubkey: calculatorAccount.publicKey,
            lamports: await CONNECTION.getMinimumBalanceForRentExemption(4 + 4), // size of the greeting acc and borsh overhead
            space: 4, // size of the greeting account
            programId: PROGRAM_ID,
        })
    );

    const createAccountSignature = await sendAndConfirmTransaction(
        CONNECTION,
        createCalculatorTx,
        [FUND_PAYER, calculatorAccount]
    );
    console.log("Created GreetingAccount with signature:", createAccountSignature);



    


    /* ------------------------------Instructions------------------------------ */
    const addSignature = await sendAndConfirmTransaction
})();
