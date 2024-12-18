'use client'

import { getTokenvestingProgram, getTokenvestingProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import BN from "bn.js";
import { publicKey } from '@coral-xyz/anchor/dist/cjs/utils'

interface CreateVestingArgs {
  companyName: string,
  mint: string,
}

interface CreateEmployeeVestingArgs {
  start_time: number,
  end_time: number,
  cliff_period: number,
  total_token_amount: number,
  beneficiary: string,
}


export function useTokenvestingProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getTokenvestingProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getTokenvestingProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['tokenvesting', 'all', { cluster }],
    queryFn: () => program.account.vestingAccount.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createVestingAccount = useMutation<string, Error, CreateVestingArgs>({
    mutationKey: ['vestingAccount', 'create', { cluster }],
    mutationFn: ({ companyName, mint }) =>
      program.methods
        .createVestingAccount(companyName)
        .accounts({
          tokenMint: new PublicKey(mint),
          tokenProgram: TOKEN_PROGRAM_ID
        }).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to create Vesting account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize: createVestingAccount,
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


  const createEmployeeVestingAccount = useMutation<string, Error, CreateEmployeeVestingArgs>({
    mutationKey: ['vestingAccount', 'create', { cluster }],
    mutationFn: ({ start_time, end_time, cliff_period, total_token_amount,beneficiary }) =>
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
  }
}
