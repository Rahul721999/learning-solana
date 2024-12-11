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
exports.transferSol = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// import { solBalance } from "../sol-balance";
const web3_js_1 = require("@solana/web3.js");
const solBalance = (publickey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conn = new web3_js_1.Connection(process.env.SOLANA_RPC_URL, "confirmed");
        const accountInfo = yield conn.getAccountInfo(publickey);
        // If the account info exists, calculate the balance in SOL and return it
        if (accountInfo !== null) {
            return accountInfo.lamports / web3_js_1.LAMPORTS_PER_SOL;
        }
        else {
            throw new Error("Account not found");
        }
    }
    catch (error) {
        // Handle errors
        console.error("Error fetching Solana account balance:", error);
        throw error;
    }
});
/// this fn is responsible for transferring SOL from one wallet to another.
const transferSol = (from, to, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL, "confirmed");
    const transaction = new web3_js_1.Transaction();
    // instruction
    const instruction = web3_js_1.SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: web3_js_1.LAMPORTS_PER_SOL * amount,
    });
    transaction.add(instruction);
    // finalize the transaction
    yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [from]);
    console.log("Transaction Complete");
});
exports.transferSol = transferSol;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const fromPubKey = new web3_js_1.PublicKey("Exbk3iBjek2fgEWKsEtjSgWSizNGZqpN859iYG1FLrph");
    const toPubKey = new web3_js_1.PublicKey("FQ8QD5R9DHtQVvbK485gPHYVWsX4yD7o6gR7zTRb3aep");
    const amount = parseFloat(process.env.SOL_AMOUNT_TO_SEND);
    const initialSenderBalance = yield solBalance(fromPubKey);
    const initialReceiverBalance = yield solBalance(toPubKey);
    console.log(`Initial balance of the Sender: ${initialSenderBalance}`);
    console.log(`Initial balance of the Receiver: ${initialReceiverBalance}`);
    console.log(`${fromPubKey} sending SOL-amount to: ${toPubKey}`);
    const secret = Uint8Array.from([
        159, 64, 27, 18, 154, 136, 217, 33, 31, 140, 68, 152, 97, 157, 208, 92,
        235, 241, 197, 162, 234, 196, 26, 179, 204, 162, 231, 14, 152, 40, 116,
        68, 207, 102, 40, 92, 27, 92, 162, 102, 47, 197, 83, 147, 165, 148, 152,
        35, 154, 252, 234, 228, 53, 161, 249, 67, 47, 98, 147, 98, 202, 199,
        106, 202,
    ]);
    const keypair = web3_js_1.Keypair.fromSecretKey(secret);
    yield (0, exports.transferSol)(keypair, toPubKey, amount);
    try {
    }
    catch (error) {
        console.log(`Error: ${error}`);
        throw error;
    }
    // check balance after transferring SOL
    try {
        console.log(`After transaction, Balance of the Sender: ${yield solBalance(fromPubKey)}`);
        console.log(`After transaction, Balance of the Receiver: ${yield solBalance(toPubKey)}`);
    }
    catch (error) {
        console.log(`Error: ${error}`);
        throw error;
    }
}))();
function validateBase58(arg0) {
    throw new Error("Function not implemented.");
}
