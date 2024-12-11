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
exports.CONNECTION = exports.PROGRAM_ID = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("./utils");
const schema_1 = require("./schema");
exports.PROGRAM_ID = new web3_js_1.PublicKey((0, utils_1.getEnvVar)("PROGRAM_ID"));
const SOLANA_RPC_URL = (0, utils_1.getEnvVar)("SOLANA_RPC_URL");
exports.CONNECTION = new web3_js_1.Connection(SOLANA_RPC_URL, "confirmed");
const FUND_PAYER = (0, utils_1.readKeypairFromFile)("./fund_payer.json");
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`ProgramID: ${exports.PROGRAM_ID}`); // smart-contract ID..
    console.log(`Fund Payer: ${FUND_PAYER.publicKey}`); // PublicKey of the wallet paying for the transaction..
    /* -----------------------------------creating data account----------------------------------- */
    const calculatorAccount = web3_js_1.Keypair.generate();
    // allocate space for the account
    const createCalculatorTx = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
        fromPubkey: FUND_PAYER.publicKey,
        newAccountPubkey: calculatorAccount.publicKey,
        lamports: yield exports.CONNECTION.getMinimumBalanceForRentExemption(4 + 4), // size of the greeting acc and borsh overhead
        space: 4, // size of the greeting account
        programId: exports.PROGRAM_ID,
    }));
    const createAccountSignature = yield (0, web3_js_1.sendAndConfirmTransaction)(exports.CONNECTION, createCalculatorTx, [FUND_PAYER, calculatorAccount]);
    console.log("Created GreetingAccount with signature:", createAccountSignature);
    /* ------------------------------ Add Instructions------------------------------ */
    const addSignature = yield (0, utils_1.sendTransaction)(schema_1.CalculatorInstruction.Add, 10, FUND_PAYER, calculatorAccount.publicKey);
    console.log("Added data with signature: ", addSignature);
    /* ------------------------------ Subtrct Instructions------------------------------ */
    const subtractSignature = yield (0, utils_1.sendTransaction)(schema_1.CalculatorInstruction.Subtract, 5, FUND_PAYER, calculatorAccount.publicKey);
    console.log("Subtracted data with signature: ", subtractSignature);
    // Fetch account data
    const accountInfo = yield exports.CONNECTION.getAccountInfo(calculatorAccount.publicKey);
    if (accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.data) {
        const calculatorData = (0, schema_1.deserializeData)(schema_1.GreetingAccountSchema, schema_1.GreetingAccount, accountInfo.data);
        console.log("Calculator account counter: ", calculatorData.counter);
    }
    else {
        console.error("Failed to retrieve account data.");
    }
}))();
