import { config } from "dotenv";
config();
import {
    PublicKey,
    Connection,
    LAMPORTS_PER_SOL,
    Keypair,
    Signer,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { airdrop_sol } from "../airdrop";

/// project to airdrop some solana on given wallet address

const createMint = async (mintWallet: Signer) => {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");
    const createToken = await Token.createMint(
        connection,
        mintWallet,
        mintWallet.publicKey,
        null,
        8,
        TOKEN_PROGRAM_ID
    );
    return createToken.publicKey;
};

const transferTokens = async (tokenAddress: PublicKey, mintWallet: Keypair, receiver: PublicKey) =>{
    const connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");
    const creatorToken = new Token(connection, tokenAddress, TOKEN_PROGRAM_ID, mintWallet);
    
    const mintTokenAccount = await creatorToken.getOrCreateAssociatedAccountInfo(mintWallet.publicKey);
    await creatorToken.mintTo(mintTokenAccount.address, mintWallet.publicKey, [], 100000000);
    const receiverTokenAccount = await creatorToken.getOrCreateAssociatedAccountInfo(receiver);
    console.log(`receiverTokenAcc address: ${receiverTokenAccount.address}`);
}

async () => {
    // create a mintWallet(that holds the authority of the token)
    const mintWallet = await Keypair.generate();

    // airdrop some token init(fee will charge during minting)
    await airdrop_sol(mintWallet.publicKey, 2);

    const creatorTokenAddress = createMint(mintWallet);
    // distribute the token
};
