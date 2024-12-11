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
exports.solBalance = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
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
exports.solBalance = solBalance;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const balance = yield (0, exports.solBalance)(new web3_js_1.PublicKey(process.env.WALLET_SECRET_KEY));
        console.log(balance);
    }
    catch (error) {
        console.log('Error: ', error);
    }
}))();
