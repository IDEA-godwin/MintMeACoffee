
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import { sha256 } from 'multiformats/hashes/sha2'
import * as digest from 'multiformats/hashes/digest'
import { Config, readContract, simulateContract, SimulateContractParameters } from '@wagmi/core'

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

export const getHistory = async (config: Config, functionName: string, abi: any, user: `0x${string}`, index: any) => {
   console.log(functionName, user, index)
   const result = await readContract(config, {
      functionName,
      abi,
      args: [user, index],
      address: "0x4CA55360d24cC11cA4364544AAc947868F6F9280"
   })
   return result
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
      const hex = bytes32.slice(2);
      const bytes = Uint8Array.from(Buffer.from(hex, 'hex'));

      // Construct a digest manually (since it's already a SHA-256 digest)
      const hashDigest = digest.create(sha256.code, bytes);

      // CIDv0 is CID with version 0, DAG-PB codec (0x70)
      const cid = CID.createV0(hashDigest);

      return cid.toString(base58btc);
   } catch (error) {
      throw new Error(`Invalid bytes32: ${error}`)
   }
}