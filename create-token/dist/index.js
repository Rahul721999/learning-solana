"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const airdrop_1 = require("./airdrop");
// this fn is responsible for create Mint address: that will store the metadata of the token(supply, minting authority)
const createMint = (mintWallet) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL, "confirmed");
    const createToken = yield spl_token_1.Token.createMint(connection, mintWallet, mintWallet.publicKey, null, 8, spl_token_1.TOKEN_PROGRAM_ID);
    return createToken.publicKey;
});
const transferTokens = (tokenAddress, mintWallet, receiver) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL, "confirmed");
    // just creating a local variable
    const creatorToken = new spl_token_1.Token(connection, tokenAddress, spl_token_1.TOKEN_PROGRAM_ID, mintWallet);
    const mintTokenAccount = yield creatorToken.getOrCreateAssociatedAccountInfo(mintWallet.publicKey);
    // actually minting new tokens and sending it to the mintTokenAcc
    yield creatorToken.mintTo(mintTokenAccount.address, mintWallet.publicKey, [], 100000000);
    const receiverTokenAccount = yield creatorToken.getOrCreateAssociatedAccountInfo(receiver);
    console.log(`receiverTokenAcc address: ${receiverTokenAccount.address}`);
    const transaction = new web3_js_1.Transaction().add(spl_token_1.Token.createTransferInstruction(spl_token_1.TOKEN_PROGRAM_ID, mintTokenAccount.address, receiverTokenAccount.address, mintWallet.publicKey, [], 100000000));
    yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [mintWallet], {
        commitment: "confirmed",
    });
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    // create a mintWallet(that holds the authority of the token)
    const mintWallet = web3_js_1.Keypair.generate();
    console.log("airdropping");
    // airdrop some token init(fee will charge during minting)
    yield (0, airdrop_1.airdrop_sol)(mintWallet.publicKey, 2);
    console.log(`mintWallet address: ${mintWallet.publicKey}`);
    const creatorTokenAddress = yield createMint(mintWallet);
    // distribute the token
    yield transferTokens(creatorTokenAddress, // the token address
    mintWallet, // the address that holds the authority to mint token
    new web3_js_1.PublicKey(process.env.RECEIVER_ADDRESS) // the acc where the tokens we are trying to send
    );
    console.log(`Creator-token Address: ${creatorTokenAddress}`);
}))();
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
