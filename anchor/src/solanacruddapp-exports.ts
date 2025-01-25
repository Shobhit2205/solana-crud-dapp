// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SolanacruddappIDL from '../target/idl/solanacruddapp.json'
import type { Solanacruddapp } from '../target/types/solanacruddapp'

// Re-export the generated IDL and type
export { Solanacruddapp, SolanacruddappIDL }

// The programId is imported from the program IDL.
export const SOLANACRUDDAPP_PROGRAM_ID = new PublicKey(SolanacruddappIDL.address)

// This is a helper function to get the Solanacruddapp Anchor program.
export function getSolanacruddappProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...SolanacruddappIDL, address: address ? address.toBase58() : SolanacruddappIDL.address } as Solanacruddapp, provider)
}

// This is a helper function to get the program ID for the Solanacruddapp program depending on the cluster.
export function getSolanacruddappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Solanacruddapp program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return SOLANACRUDDAPP_PROGRAM_ID
  }
}
