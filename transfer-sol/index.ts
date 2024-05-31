import { config } from "dotenv";
config();
import { solBalance } from "../sol-balance";
import {
    PublicKey,
    Connection,
    LAMPORTS_PER_SOL,
    Keypair,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
} from "@solana/web3.js";

/// this fn is responsible for transferring SOL from one wallet to another.
export const transferSol = async (
    from: Keypair,
    to: PublicKey,
    amount: number
) => {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");
    const transaction = new Transaction();

    // instruction
    const instruction = SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: LAMPORTS_PER_SOL * amount,
    });

    transaction.add(instruction);
    // finalize the transaction
    await sendAndConfirmTransaction(connection, transaction, [from]);
    console.log("Transaction Complete");
};

(async () => {
    const fromPubKey = new PublicKey(
        "Exbk3iBjek2fgEWKsEtjSgWSizNGZqpN859iYG1FLrph"
    );
    const toPubKey = new PublicKey(
        "FQ8QD5R9DHtQVvbK485gPHYVWsX4yD7o6gR7zTRb3aep"
    );
    const amount = parseFloat(process.env.SOL_AMOUNT_TO_SEND!);

    const initialSenderBalance = await solBalance(fromPubKey);
    const initialReceiverBalance = await solBalance(toPubKey);

    console.log(`Initial balance of the Sender: ${initialSenderBalance}`);
    console.log(`Initial balance of the Receiver: ${initialReceiverBalance}`);

    console.log(`${fromPubKey} sending SOL-amount to: ${toPubKey}`);

    const secret_str = process.env.SENDER_PRIVATE_KEY;
    if (secret_str != null) {
        const secret = Uint8Array.from(JSON.parse(secret_str));
        const keypair = Keypair.fromSecretKey(secret);
        await transferSol(keypair, toPubKey, amount);
    }else{
      console.log("SENDER_PRIVATE_KEY is not set in environment variables");
    }
    try {
    } catch (error) {
        console.log(`Error: ${error}`);
        throw error;
    }

    // check balance after transferring SOL
    try {
        console.log(
            `After transaction, Balance of the Sender: ${await solBalance(
                fromPubKey
            )}`
        );
        console.log(
            `After transaction, Balance of the Receiver: ${await solBalance(
                toPubKey
            )}`
        );
    } catch (error) {
        console.log(`Error: ${error}`);
        throw error;
    }
})();
function validateBase58(arg0: string) {
    throw new Error("Function not implemented.");
}
