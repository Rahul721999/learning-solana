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
const sol_balance_1 = require("../sol-balance");
const web3_js_1 = require("@solana/web3.js");
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
    const initialSenderBalance = yield (0, sol_balance_1.solBalance)(fromPubKey);
    const initialReceiverBalance = yield (0, sol_balance_1.solBalance)(toPubKey);
    console.log(`Initial balance of the Sender: ${initialSenderBalance}`);
    console.log(`Initial balance of the Receiver: ${initialReceiverBalance}`);
    console.log(`${fromPubKey} sending SOL-amount to: ${toPubKey}`);
    const secret_str = process.env.SENDER_PRIVATE_KEY;
    if (secret_str != null) {
        const secret = Uint8Array.from(JSON.parse(secret_str));
        const keypair = web3_js_1.Keypair.fromSecretKey(secret);
        yield (0, exports.transferSol)(keypair, toPubKey, amount);
    }
    else {
        console.log("SENDER_PRIVATE_KEY is not set in environment variables");
    }
    try {
    }
    catch (error) {
        console.log(`Error: ${error}`);
        throw error;
    }
    // check balance after transferring SOL
    try {
        console.log(`After transaction, Balance of the Sender: ${yield (0, sol_balance_1.solBalance)(fromPubKey)}`);
        console.log(`After transaction, Balance of the Receiver: ${yield (0, sol_balance_1.solBalance)(toPubKey)}`);
    }
    catch (error) {
        console.log(`Error: ${error}`);
        throw error;
    }
}))();
function validateBase58(arg0) {
    throw new Error("Function not implemented.");
}
