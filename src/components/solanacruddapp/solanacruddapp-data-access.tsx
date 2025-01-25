'use client'

import { getSolanacruddappProgram, getSolanacruddappProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useSolanacruddappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSolanacruddappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getSolanacruddappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['solanacruddapp', 'all', { cluster }],
    queryFn: () => program.account.solanacruddapp.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['solanacruddapp', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ solanacruddapp: keypair.publicKey }).signers([keypair]).rpc(),
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

export function useSolanacruddappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useSolanacruddappProgram()

  const accountQuery = useQuery({
    queryKey: ['solanacruddapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.solanacruddapp.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['solanacruddapp', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ solanacruddapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['solanacruddapp', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ solanacruddapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['solanacruddapp', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ solanacruddapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['solanacruddapp', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ solanacruddapp: account }).rpc(),
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
