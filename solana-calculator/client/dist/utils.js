"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.readKeypairFromFile = exports.getEnvVar = exports.sendTransaction = exports.createTransactionInstruction = exports.deserializeInstruction = exports.serializeInstruction = void 0;
const web3_js_1 = require("@solana/web3.js");
const fs = __importStar(require("fs"));
const schema_1 = require("./schema");
const borsh_1 = require("borsh");
const _1 = require(".");
function serializeInstruction(instruction) {
    return (0, borsh_1.serialize)(schema_1.CalculatorInstructionSchema, instruction);
}
exports.serializeInstruction = serializeInstruction;
function deserializeInstruction(schema, classType, buffer) {
    return (0, borsh_1.deserialize)(schema, classType, buffer);
}
exports.deserializeInstruction = deserializeInstruction;
function createTransactionInstruction(instructionType, data, programId, accountPublicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const instructionData = new schema_1.InstructionData({
            instruction: instructionType,
            data,
        });
        const serializeData = serializeInstruction(instructionData);
        const instruction = new web3_js_1.TransactionInstruction({
            keys: [{ pubkey: accountPublicKey, isSigner: false, isWritable: true }],
            programId: programId,
            data: Buffer.from(serializeData),
        });
        const transaction = new web3_js_1.Transaction().add(instruction);
        return transaction;
    });
}
exports.createTransactionInstruction = createTransactionInstruction;
function sendTransaction(instructionType, data, payer, accountPublicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield createTransactionInstruction(instructionType, data, _1.PROGRAM_ID, accountPublicKey);
        const latestBlockHash = yield _1.CONNECTION.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockHash.blockhash;
        transaction.feePayer = payer.publicKey;
        // signing the transaction
        transaction.sign(payer);
        // serialize and send the transaction
        const rawTransaction = transaction.serialize();
        const signature = yield _1.CONNECTION.sendRawTransaction(rawTransaction);
        yield _1.CONNECTION.confirmTransaction({
            signature,
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        }, "confirmed");
        return signature;
    });
}
exports.sendTransaction = sendTransaction;
/* ----------------------------------Helper functions----------------------------------*/
function getEnvVar(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not set`);
    }
    return value;
}
exports.getEnvVar = getEnvVar;
function readKeypairFromFile(filePath) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const secretKey = JSON.parse(fileContent);
    if (!Array.isArray(secretKey)) {
        throw new Error(`Invalid key format in ${filePath}`);
    }
    return web3_js_1.Keypair.fromSecretKey(new Uint8Array(secretKey));
}
exports.readKeypairFromFile = readKeypairFromFile;
