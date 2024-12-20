'use client'

import { getTokenvestingProgram, getTokenvestingProgramId, Tokenvesting } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import BN from "bn.js";
interface CreateVestingArgs {
  companyName: string,
  mint: string
}

interface CreateEmployeeVestingArgs {
  start_time: number,
  end_time: number,
  cliff_period: number,
  total_token_amount: number,
  beneficiary: string,
}

interface ClaimTokenArgs {
  companyName: string,
}


export function useTokenvestingProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getTokenvestingProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getTokenvestingProgram(provider, programId), [provider, programId])
  const [treasuryAccount, setTreasury] = useState<PublicKey | null>(null);


  const accounts = useQuery({
    queryKey: ['tokenvesting', 'all', { cluster }],
    queryFn: () => program.account.vestingAccount.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  /* -----------------------Create new Company vesting account----------------------- */
  const createVestingAccount = useMutation<string, Error, CreateVestingArgs>({
    mutationKey: ['vestingAccount', 'create', { cluster }],
    mutationFn: ({ companyName, mint }) =>
      program.methods
        .createVestingAccount(companyName)
        .accounts({
          tokenMint: new PublicKey(mint),
          tokenProgram: TOKEN_PROGRAM_ID
        }).rpc(),
    onSuccess: async (signature, { companyName }) => {
      transactionToast(signature);

      // Fetch the treasury token account address after creation
      await setTreasuryAccount(companyName);
      console.log("Treasury Token Account:", treasuryAccount);

      return accounts.refetch()
    },
    onError: async (error) => {
      console.error("Claim Tokens Error:", error);
      // Fetch and log transaction simulation details
      if ("logs" in error) {
        console.error("Transaction Logs:", error.logs);
      }
      toast.error("Failed to create new vesting account.");
    },
  });

  /* ------------------Helper Function to derive the treasury account address------------------ */
  const setTreasuryAccount = async (companyName: string) => {
    if (!program) throw new Error('Program not initialized');
    // PDA for treasury token account (holds the vesting tokens for the company)
    const [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("vesting_treasury"), Buffer.from(companyName)], // Seed: "vesting_treasury" + company name
      program.programId
    );
    setTreasury(treasuryTokenAccount);
  };

  const getTreasuryAddr = (): PublicKey | null => {
    if (!treasuryAccount) {
      console.log("Treasury account is not set");
      return null;
    } else {
      return treasuryAccount;
    }
  };

  /* -------------------------------Claim tokens------------------------------- */
  const claimTokens = useMutation<string, Error, ClaimTokenArgs>({
    mutationKey: ['vestingAccount', 'create', { cluster }],
    mutationFn: ({ companyName }) =>
      program.methods
        .claimTokens(
          companyName
        )
        .accounts({
          tokenProgram: TOKEN_PROGRAM_ID
        }).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: async (error) => {
      console.error("Claim Tokens Error:", error);
      // Fetch and log transaction simulation details
      if ("logs" in error) {
        console.error("Transaction Logs:", error.logs);
      }
      toast.error("Failed to claim tokens.");
    },

  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createVestingAccount,
    getTreasuryAddr,
    claimTokens
  }
}

export function userVestingProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useTokenvestingProgram()

  const accountQuery = useQuery({
    queryKey: ['tokenvesting', 'fetch', { cluster, account }],
    queryFn: () => program.account.vestingAccount.fetch(account),
  })

  /*----------------------Create Employee Vesting Account, that stores vesting metadata---------------------- */
  const createEmployeeVestingAccount = useMutation<string, Error, CreateEmployeeVestingArgs>({
    mutationKey: ['vesting', 'close', { cluster }],
    mutationFn: ({ start_time, end_time, cliff_period, total_token_amount, beneficiary }) =>
      program.methods
        .createEmployeeVesting(
          new BN(start_time),
          new BN(end_time),
          new BN(cliff_period),
          new BN(total_token_amount)
        )
        .accounts({
          beneficiary: new PublicKey(beneficiary),
          vestingAccount: account
        }).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to create Vesting account'),
  })

  return {
    accountQuery,
    createEmployeeVestingAccount,
  }
}


