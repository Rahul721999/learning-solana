import { config } from "dotenv";
config();
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export const solBalance = async (publickey: PublicKey) => {
  try {
    const conn = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");

    const accountInfo = await conn.getAccountInfo(publickey);
    // If the account info exists, calculate the balance in SOL and return it
    if (accountInfo !== null) {
      return accountInfo.lamports / LAMPORTS_PER_SOL;
    } else {
      throw new Error("Account not found");
    }
  } catch (error) {
    // Handle errors
    console.error("Error fetching Solana account balance:", error);
    throw error;
  }
};

(async () => {
  try {
    const balance = await solBalance(new PublicKey(process.env.WALLET_SECRET_KEY!));
    console.log(balance);
  } catch (error) {
    console.log('Error: ',error);
  }
})();
