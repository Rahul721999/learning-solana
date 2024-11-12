'use client'

import { getJournaldappProgram, getJournaldappProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from  '../ui/ui-layout'

interface EntryArgs {
  owner: PublicKey,
  title: string,
  message: string,
};


export function useJournaldappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getJournaldappProgramId(cluster.network as Cluster), [cluster])
  const program = getJournaldappProgram(provider)
  const accounts = useQuery({
    queryKey: ['journaldapp', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createEntry = useMutation<string, Error, EntryArgs>({
    mutationKey: ['journaldapp', 'create', { cluster }],
    mutationFn: async ({ title, message }) => {
      // const [journalEntryAddress] = await PublicKey.findProgramAddress(
      //   [Buffer.from(title), owner.toBuffer()],
      //   programId,
      // );

      return program.methods.createEntry(title, message).rpc();
    },
    onSuccess: signature => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry,
  }
}

export function useJournaldappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { programId, program, accounts } = useJournaldappProgram()

  const accountQuery = useQuery({
    queryKey: ['journaldapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  })

  const updateEntry = useMutation<string, Error, EntryArgs>({
    mutationKey: ['journaldapp', 'update', { cluster }],
    mutationFn: async ({ title, message }) => {
      return program.methods.updateEntry(title, message).rpc();
    },
    onSuccess: signature => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  const deleteEntry = useMutation({
    mutationKey: ['journaldapp', 'delete', { cluster }],
    mutationFn: async (title: string) => {
      return program.methods.deleteEntry(title).rpc();
    },
    onSuccess: signature => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })


  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  }
}

