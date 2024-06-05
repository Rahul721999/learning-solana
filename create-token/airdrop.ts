import { config } from "dotenv";
config();
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

export const airdrop_sol = async (publicKey: PublicKey, amount: number) => {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");

    console.log(`airdropping solana to: ${publicKey}`);
    // airdrop signature
    let airdropSignature = await connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
};
