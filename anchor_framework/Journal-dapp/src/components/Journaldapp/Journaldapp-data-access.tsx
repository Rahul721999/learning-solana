'use client'

import {getJournaldappProgram, getJournaldappProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useJournaldappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getJournaldappProgramId(cluster.network as Cluster), [cluster])
  const program = getJournaldappProgram(provider)

  const accounts = useQuery({
    queryKey: ['Journaldapp', 'all', { cluster }],
    queryFn: () => program.account.Journaldapp.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['Journaldapp', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ Journaldapp: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
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
    initialize,
  }
}

export function useJournaldappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useJournaldappProgram()

  const accountQuery = useQuery({
    queryKey: ['Journaldapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.Journaldapp.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['Journaldapp', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ Journaldapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['Journaldapp', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ Journaldapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['Journaldapp', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ Journaldapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['Journaldapp', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ Journaldapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
