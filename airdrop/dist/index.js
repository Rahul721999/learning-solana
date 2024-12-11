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
exports.airdrop_sol = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const web3_js_1 = require("@solana/web3.js");
/// project to airdrop some solana on given wallet address
const airdrop_sol = (publicKey, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL, "confirmed");
    console.log(`airdropping solana to: ${publicKey}`);
    // airdrop signature    
    let airdropSignature = yield connection.requestAirdrop(publicKey, amount * web3_js_1.LAMPORTS_PER_SOL);
    yield connection.confirmTransaction(airdropSignature);
});
exports.airdrop_sol = airdrop_sol;
// wallet address, where airdroping solana.
(0, exports.airdrop_sol)(new web3_js_1.PublicKey(process.env.WALLET_SECRET_KEY), 2);
