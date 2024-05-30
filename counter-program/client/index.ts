import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    sendAndConfirmTransaction,
    SystemProgram,
    TransactionInstruction
} from '@solana/web3.js';
import  * as fs from 'fs';
import * as path from 'path';

(async () =>{
    const connection = new Connection('http://localhost:8899/', 'confirmed');
    const payer = Keypair.generate();
    const programId = new PublicKey("BhzgjW2zDfTkfAaePtkJP55QAy7aRupUWMT7juDJAo2T")


    // airdrop SOL to payer
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 1e9);
    await connection.confirmTransaction(airdropSignature);

    // generate a keypair for counter account
    const counterAccount = Keypair.generate();

    // Allocate space for the account
    const createAccountIx = SystemProgram.createAccount({
        fromPubkey : payer.publicKey,
        newAccountPubkey: counterAccount.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(8),
        space: 8,
        programId,
    });

    // increment counter instruction
    const incrementCounterIx = new TransactionInstruction({
        keys: [{pubkey: counterAccount.publicKey, isSigner: false, isWritable: true}],
        programId,
        data: Buffer.alloc(0),
    });

    // create and send transaction
    const transaction = new Transaction().add(createAccountIx, incrementCounterIx);
    await sendAndConfirmTransaction(connection, transaction, [payer, counterAccount]);

    console.log('Counter incremented');
})();