import { config } from "dotenv";
config();
import {
    PublicKey,
    Connection,
    Keypair,
    Signer,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { airdrop_sol } from "./airdrop";

// this fn is responsible for create Mint address: that will store the metadata of the token(supply, minting authority)
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

const transferTokens = async (
    tokenAddress: PublicKey,
    mintWallet: Keypair,
    receiver: PublicKey
) => {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");

    // just creating a local variable
    const creatorToken = new Token(
        connection,
        tokenAddress,
        TOKEN_PROGRAM_ID,
        mintWallet
    );

    const mintTokenAccount =
        await creatorToken.getOrCreateAssociatedAccountInfo(
            mintWallet.publicKey
        );

    // actually minting new tokens and sending it to the mintTokenAcc
    await creatorToken.mintTo(
        mintTokenAccount.address,
        mintWallet.publicKey,
        [],
        100000000
    );
    const receiverTokenAccount =
        await creatorToken.getOrCreateAssociatedAccountInfo(receiver);
    console.log(`receiverTokenAcc address: ${receiverTokenAccount.address}`);

    const transaction = new Transaction().add(
        Token.createTransferInstruction(
            TOKEN_PROGRAM_ID,
            mintTokenAccount.address,
            receiverTokenAccount.address,
            mintWallet.publicKey,
            [],
            100000000
        )
    );
    await sendAndConfirmTransaction(connection, transaction, [mintWallet], {
        commitment: "confirmed",
    });
};

(async () => {
    // create a mintWallet(that holds the authority of the token)
    const mintWallet = Keypair.generate();

    console.log("airdropping");
    // airdrop some token init(fee will charge during minting)
    await airdrop_sol(mintWallet.publicKey, 2);
    console.log(`mintWallet address: ${mintWallet.publicKey}`);

    const creatorTokenAddress = await createMint(mintWallet);

    // distribute the token
    await transferTokens(
        creatorTokenAddress, // the token address
        mintWallet, // the address that holds the authority to mint token
        new PublicKey(process.env.RECEIVER_ADDRESS!) // the acc where the tokens we are trying to send
    );
    console.log(`Creator-token Address: ${creatorTokenAddress}`);
})();

/* 
    steps1: 
        1. create Mint Address (This is your token Address, which also holds all
            the info like: token supply, minting authority, users, token counts etc.
        )
        2. When creating Mint Address: have to specify decimals and the minting authority

    step2: 
        1. Create Token Account (which will hold the newly created token).
        2. This associates the Token account with your wallet

    step3: 
        1. Mint tokens to your token account, using minting authority(to create a specific number of token)
    step4:
        1. Distribute the tokens.

*/
