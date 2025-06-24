"use client";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useConfig } from "wagmi";
import { parseAbi } from "viem";
import { bytes32ToCid, getHistory } from "~/lib/web3Util";

// ABI for the two functions
const tippingAbi = parseAbi([
  "function receiverHistoryMetadata(address, uint256) view returns (bytes32)",
  "function supporterHistoryMetadata(address, uint256) view returns (bytes32)"
]);

async function fetchIpfsJson(cid: string) {
  const url = `https://ipfs.io/ipfs/${cid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch IPFS metadata");
  return res.json();
}

export default function TippingHistory() {
  const { address: user } = useAccount();
  const [receiving, setReceiving] = useState<any[]>([]);
  const [supporting, setSupporting] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const config = useConfig()

  console.log(user)

  const fetchHistory = useCallback(
    async (functionName: string, setter: (v: any[]) => void) => {
      let x = 0n;
      let isValidIndex = true;
      const data: any[] = [];
      while (isValidIndex) {
        try {
          const result = await getHistory(config, functionName, tippingAbi, user, x);
          data.push(result);
          isValidIndex = !!result;
          x += 1n;
        } catch(error) {
          console.error("failed with error " + error)
          break
        }
      }
      console.log(data)
      await loadHistory(data as string[], setter);
    },
    [config, user]
  );

  async function loadHistory(bytesArr: string[] | undefined, setter: (v: any[]) => void) {
    if (!bytesArr) return;
    setLoading(true);
    setError(undefined);
    try {
      const items = await Promise.all(
        bytesArr.map(async (b32) => {
          const cid = bytes32ToCid(b32);
          try {
            const meta = await fetchIpfsJson(cid);
            return { cid, ...meta };
          } catch {
            return { cid, error: "Failed to fetch metadata" };
          }
        })
      );
      console.log(items)
      setter(items);
    } catch (e: any) {
      console.log(e.message || "Failed to load history")
      setError(e.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory("receiverHistoryMetadata", setReceiving).then()
    fetchHistory("supporterHistoryMetadata", setSupporting).then()
  }, [fetchHistory]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tipping History</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Received Support</h3>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Fan</th>
                <th className="p-2">message</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center p-4">Loading...</td></tr>
              ) : receiving.length === 0 ? (
                <tr><td colSpan={4} className="text-center p-4">No tips received</td></tr>
              ) : (
                receiving.map((item, i) => (
                  <tr key={item.cid || i}>
                    <td className="p-2">{item.fan || "-"}</td>
                    <td className="p-2">{item.message || "-"}</td>
                    <td className="p-2">{item.quantity || "-"}</td>
                    <td className="p-2">{item.timestamp ? new Date(item.timestamp).toLocaleString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Support Given</h3>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Creator</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Reward</th>
                <th className="p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center p-4">Loading...</td></tr>
              ) : supporting.length === 0 ? (
                <tr><td colSpan={4} className="text-center p-4">No tips supported</td></tr>
              ) : (
                supporting.map((item, i) => (
                  <tr key={item.cid || i}>
                    <td className="p-2">{item.creator || "-"}</td>
                    <td className="p-2">{item.quantity || "-"}</td>
                    <td className="p-2">{item.tokenId || "-"}</td>
                    <td className="p-2">{item.timestamp ? new Date(item.timestamp).toLocaleString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}