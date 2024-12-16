import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Tokenvesting } from '../target/types/tokenvesting'
import {
    startAnchor,
    ProgramTestContext,
    BanksClient
} from "solana-bankrun";

import IDL from "../target/idl/tokenvesting.json"
import { SYSTEM_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/native/system';
import { BankrunProvider } from 'anchor-bankrun';
import { createMint, mintTo } from 'spl-token-bankrun';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';



const PROGRAM_ID = new PublicKey(IDL.address);

describe('Vesting Smart Contract Tests', () => {
    console.log("Running test: Vesting Smart Contract");

    const company_name = "Solana-Blockchain pvt. ltd."
    let beneficiary: Keypair;
    let context: ProgramTestContext;
    let provider: BankrunProvider;
    let program: Program<Tokenvesting>;
    let program2: Program<Tokenvesting>;
    let banksClient: BanksClient;
    let employer: Keypair;
    let mint: PublicKey;
    let beneficiaryProvider: BankrunProvider;
    let vestingAccountKey: PublicKey;
    let treasuryTokenAccount: PublicKey;
    let employeeAccount: PublicKey;

    // Setting up accounts and environment for tests
    beforeAll(async () => {
        // Create a new keypair for the beneficiary (employee receiving tokens)
        beneficiary = new anchor.web3.Keypair();

        // Initialize Anchor environment with necessary programs and accounts
        context = await startAnchor(
            "", // Path to Anchor workspace
            [{ name: "tokenvesting", programId: PROGRAM_ID }], // Program details
            [
                {
                    address: beneficiary.publicKey, // Add beneficiary to the initial context
                    info: {
                        lamports: 1_000_000_000, // Allocate some SOL to the beneficiary
                        executable: false,
                        owner: SYSTEM_PROGRAM_ID, // Owner is system program
                        data: Buffer.alloc(0) // Empty account data
                    },
                },
            ]
        );

        // Set up provider and program objects
        provider = new BankrunProvider(context);
        anchor.setProvider(provider);
        program = new Program<Tokenvesting>(IDL as Tokenvesting, provider);

        banksClient = context.banksClient;

        // Employer is set as the wallet payer
        employer = provider.wallet.payer;

        // Create a new token mint (used for vesting tokens)
        //@ts-ignore
        mint = await createMint(banksClient, employer, employer.publicKey, null, 2);

        // Create a provider for the beneficiary to simulate their actions
        beneficiaryProvider = new BankrunProvider(context);
        beneficiaryProvider.wallet = new NodeWallet(beneficiary);
        program2 = new Program<Tokenvesting>(IDL as Tokenvesting, beneficiaryProvider);

        /* -------------- Derive Program-Derived Addresses (PDAs) -------------- */

        // PDA for vesting account (holds metadata for a company's vesting schedule)
        [vestingAccountKey] = PublicKey.findProgramAddressSync(
            [Buffer.from(company_name)], // Seed: company name
            program.programId
        );

        // PDA for treasury token account (holds the vesting tokens for the company)
        [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("vesting_treasury"), Buffer.from(company_name)], // Seed: "vesting_treasury" + company name
            program.programId
        );

        // PDA for employee account (tracks vesting details for a specific employee)
        [employeeAccount] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("employee_vesting"), // Seed prefix
                beneficiary.publicKey.toBuffer(), // Beneficiary's public key
                vestingAccountKey.toBuffer(), // Vesting account's public key
            ],
            program.programId
        );
    });


    it("TEST: Create a vesting account", async () => {
        // Send a transaction to create a vesting account
        const tx = await program.methods
            .createVestingAccount(company_name) // Call the method with company name as input
            .accounts({
                signer: employer.publicKey, // Employer signs the transaction
                tokenProgram: TOKEN_PROGRAM_ID, // SPL Token program for token interactions
                tokenMint: mint, // Token mint used for vesting tokens
            })
            .rpc({ commitment: "confirmed" }); // Wait for transaction confirmation
    
        // Fetch the data of the newly created vesting account
        const vestingAccountData = await program.account.vestingAccount.fetch(
            vestingAccountKey, // PDA of the vesting account
            "confirmed" // Fetch with confirmed commitment
        );
    
        // Log the fetched vesting account data for debugging or verification
        console.log(
            "Vesting Account Data: ",
            JSON.stringify(vestingAccountData, null, 2)
        );
    
        // Log the transaction signature for reference
        console.log("Create Vesting Account Transaction Signature: ", tx);
    });
    
}) 