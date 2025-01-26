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

interface CreateEntryState {
  title: string;
  message: string;
  owner: PublicKey;
}

export function useSolanacruddappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSolanacruddappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getSolanacruddappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['solanacruddapp', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createEntry = useMutation<string, Error, CreateEntryState> ({
    mutationKey: ['journalEntry', 'create', { cluster }],
    mutationFn: async({title, message, owner}) => {
      return program.methods.createJournalEntry(title, message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error in creating entry ${error.message}`);
    }
  })



  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry
  }
}

export function useSolanacruddappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useSolanacruddappProgram()

  const accountQuery = useQuery({
    queryKey: ['solanacruddapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  })

  
  const updateEntry = useMutation<string, Error, CreateEntryState> ({
    mutationKey: ['journalEntry', 'update', { cluster }],
    mutationFn: async({title, message}) => {
      return program.methods.updateJournalEntry(title, message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error in updating entry ${error.message}`);
    }
  })

  const deleteEntry = useMutation({
    mutationKey: ['journalEntry', 'delete', { cluster }],
    mutationFn: async(title: string) => {
      return program.methods.deleteJournalEntry(title).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error in updating entry ${error.message}`);
    }
  })

  return {
    accountQuery,
    updateEntry,
    deleteEntry
  }
}
