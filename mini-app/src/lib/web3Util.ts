
import { CID } from 'multiformats/cid'
import { Config, simulateContract, SimulateContractParameters } from '@wagmi/core'

export type GenericError = {
  message: string;
  code?: string | number;
  cause?: unknown;
  stack?: string;
};

export const simulateClaimContract = async (config: Config, req: SimulateContractParameters) => {
   try {
      console.log(req)
      const { request } = await simulateContract(config, req)
      return request

   } catch (error: any) {
      throw new Error(`simulation failed with error ${error}`)
   }
}

/**
 * Convert CIDv0 to bytes32 using multiformats library
 * @param {string} cidv0 - The CIDv0 string (starts with "Qm")
 * @returns {string} - Hex string representation of bytes32
 */
export function cidToBytes32(cidv0: string) {
   try {
      // Parse the CID
      const cid = CID.parse(cidv0)

      // Ensure it's CIDv0
      if (cid.version !== 0) {
         throw new Error('Not a CIDv0')
      }

      // Get the multihash bytes
      const multihashBytes = cid.multihash.bytes

      // Remove the multihash prefix (first 2 bytes: 0x12 0x20)
      // 0x12 = sha2-256, 0x20 = 32 bytes length
      const hashBytes = multihashBytes.slice(2)

      // Convert to hex string with 0x prefix
      return '0x' + Buffer.from(hashBytes).toString('hex')
   } catch (error) {
      throw new Error(`Invalid CIDv0: ${error}`)
   }
}

/**
 * Convert bytes32 back to CIDv0
 * @param {string} bytes32 - Hex string (with or without 0x prefix)
 * @returns {string} - CIDv0 string
 */
export function bytes32ToCid(bytes32: string) {
   try {
      // Remove 0x prefix if present
      const cleanHex = bytes32.startsWith('0x') ? bytes32.slice(2) : bytes32

      // Ensure it's 64 hex chars (32 bytes)
      if (cleanHex.length !== 64) {
         throw new Error('Invalid bytes32 length')
      }

      // Add multihash prefix: 0x12 (sha2-256) + 0x20 (32 bytes)
      const multihashHex = '1220' + cleanHex
      const multihashBytes = Buffer.from(multihashHex, 'hex')

      // Create CIDv0
      const cid = CID.createV0(multihashBytes as any)

      return cid.toString()
   } catch (error) {
      throw new Error(`Invalid bytes32: ${error}`)
   }
}