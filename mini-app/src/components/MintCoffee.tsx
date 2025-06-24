'use client';

import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/card";
import { Minus, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { User } from "@neynar/nodejs-sdk/build/api";
import { useSession } from "next-auth/react";

import {
   useConfig,
   useWriteContract,
   useAccount
} from "wagmi"

import { parseUnits, parseAbi } from "viem";
import { cidToBytes32, simulateClaimContract } from "~/lib/web3Util";
import { toast, Toaster } from "sonner";


const claimAbi = parseAbi([
   "function claim(address _tipRecipient, address _receiver, uint256 _tokenId, uint256 _quantity, address _currency, uint256 _pricePerToken, bytes32 _tipMetadataUri, (bytes32[] proof, uint256 quantityLimitPerWallet, uint256 pricePerToken, address currency) _allowlistProof, bytes _data) payable"
]);

const erc20Abi = parseAbi([
   "function approve(address spender, uint256 amount) external returns (bool)"
]);

export default function MintCoffee(
   { creator, handleSignIn, signingIn, signInFailure }: { creator: User | undefined, handleSignIn: () => Promise<boolean>, signingIn: boolean, signInFailure: string | undefined }
) {
   const { status } = useSession()
   const { address } = useAccount()

   const [quantity, setQuantity] = useState(1);
   const [message, setMessage] = useState("");
   const [tipMetadataUri, setTipMetadataUri] = useState("")
   const contractLogo = "https://nft.unchainedelephants.com/wp-content/uploads/2025/04/Your-paragraph-text-5-scaled.png"; // Replace with actual logo URL
   const contractAddress = "0x4CA55360d24cC11cA4364544AAc947868F6F9280"
   const currency = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base
   const pricePerToken = parseUnits("5", 6); // 5 USDC (6 decimals)
   const allowlistProof = { proof: ["0x0000000000000000000000000000000000000000000000000000000000000000"], quantityLimitPerWallet: 100, pricePerToken, currency };
   const callData = "0x";

   const [loading, setLoading] = useState(false)
   const totalAmount = pricePerToken * BigInt(quantity + 1); // pricePerToken is already a BigInt

   const config = useConfig()
   const { data: contractResult, writeContract, isSuccess, status: callStatus, error } = useWriteContract();
   const { writeContract: writeApprove, isSuccess: approveSuccess, status: approveStatus, error: approveError } = useWriteContract();

   useEffect(() => {
      if (approveSuccess) console.log("approve successfull")

      switch (approveStatus) {
         case 'idle':
            console.log("awaiting execution")
            break;
         case 'pending':
            console.log("executing")
            break;
         case 'error':
            console.log("failed with error " + approveError)
            setLoading(false)
            toast.error(error?.message ?? "Approve contract to spend. Try Again", {
               position: "bottom-left",
               dismissible: true,
               closeButton: true,
               richColors: true
            })
            break;
         case 'success':
            console.log("spend approved")
            simulateClaimContract(config, {
               address: contractAddress,
               abi: claimAbi,
               functionName: "claim",
               args: [
                  creator?.verified_addresses?.primary.eth_address, // _tipRecipient
                  address, // _receiver
                  0,
                  quantity,
                  currency,
                  pricePerToken,
                  tipMetadataUri,
                  allowlistProof,
                  callData
               ],
            }).then(request => {
               console.log(request)
               writeContract(request)
            }).catch(err => {
               console.log("failed error ", err);
               toast.error(error?.message ?? "Transaction failed to execute. Try Again", {
                  position: "bottom-left",
                  dismissible: true,
                  closeButton: true,
                  richColors: true,
               })
               setLoading(false)
            })
            break;
         default:
            break;
      }
   }, [approveSuccess, approveStatus])
   // Call this before calling claim
   const handleApprove = () => {
      writeApprove({
         address: currency,
         abi: erc20Abi,
         functionName: "approve",
         args: [contractAddress, totalAmount],
      });
   };

   useEffect(() => {
      if (isSuccess) console.log("claim successful with hash ", contractResult)

      switch (callStatus) {
         case 'idle':
            console.log("awaiting execution")
            break;
         case 'pending':
            console.log("executing")
            break;
         case 'error':
            console.log("failed with error " + error)
            toast.error(error?.message ?? "Transaction failed to execute. Try Again", {
               position: "bottom-left",
               dismissible: true,
               closeButton: true,
               richColors: true
            })
            setLoading(false)
            break;
         case 'success':
            console.log("executed successfully with result ", contractResult)
            toast.success("Transaction Successful with hash " + contractResult, {
               position: "bottom-left",
               dismissible: true,
               closeButton: true,
               richColors: true
            })
            setLoading(false)
            break;
         default:
            break;
      }
   }, [isSuccess, callStatus])

   const decreaseQuantity = () => {
      setQuantity((prev) => Math.max(1, prev - 1));
   };

   const increaseQuantity = () => {
      setQuantity((prev) => prev + 1); // Assuming a max of 10 NFTs can be minted at once
   };

   const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value);
      if (!Number.isNaN(value)) {
         setQuantity(Math.min(Math.max(1, value)));
      }
   };

   useEffect(() => {
      if (signingIn) {
         console.log("Signing in...");
      }
      if (signInFailure) {
         console.log("SignIn Failed:", signInFailure);
      }
   }, [signInFailure]);

   const handleSupport = async () => {
      if (status !== "authenticated") {
         const isSignedIn = await handleSignIn();
         if (!isSignedIn) return; //TO-DO: Handle sign-in failure gracefully by adding toasts
      }
      if (!creator) {
         console.error("Creator not found");
         // TO-DO: Handle the case where the creator is not found, e.g., show an error message
         toast.info("Select a creator to proceed", {
            position: "top-center",
            richColors: true,
            className: "bg-white"
         })
         return;
      }
      console.log("Supporting creator:", creator.username, "Quantity:", quantity);
      setLoading(true)
      try {
         const metadata = {
            creator: creator?.verified_addresses?.primary.eth_address,
            fan: address,
            message,
            quantity,
            tokenId: 0,
            timestamp: Date.now(),
         };

         // Upload JSON to Pinata
         const result = await fetch('/api/upload', {
            method: 'POST',
            body: JSON.stringify(metadata)
         });
         const data = await result.json()
         console.log(data)
         const metadataUri = cidToBytes32(data?.IpfsHash ?? "")
         console.log(metadataUri)
         setTipMetadataUri(metadataUri)

         handleApprove()
      } catch (err) {
         console.error("Pinata upload failed:", err);
         // Optionally show error to user
         setLoading(false)
         return;
      }
   }

   return (
      <Card className="mx-5 my-10">
         <Toaster />
         <CardContent className="">
            <h3 className="text-2xl font-bold dark:text-white">
               {`Mint ${creator?.display_name || "??"} a Coffee`}
            </h3>
            <div className="w-full flex justify-between items-center rounded-lg mb-4 gap-2">
               <div className="flex items-center relative">
                  <span className="w-20 inline-block">
                     <img src={contractLogo} alt="" className="w-full h-full object-cover" />
                  </span>
                  <span className="absolute end-0 top-[-15px] text-sm font-semibold ">
                     {/* <span className="bg-gray-300 rounded-lg p-1 text-xs">$5 each</span> */}
                     <br />x {quantity}
                  </span>
               </div>
               <textarea
                  placeholder="Say something nice ..." value={message} onChange={e => setMessage(e.target.value)}
                  className="w-[250px] h-24 mt-2 p-1 border border-gray-300 rounded-lg focus:outline-none focus:border-black placeholder:text-sm"
               ></textarea>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
               No such thing as over caffination here!
            </p>
            <div className="flex items-center justify-center mb-4 gap-4">
               <div className="flex items-center">
                  <Button
                     onClick={decreaseQuantity}
                     disabled={quantity <= 1}
                     aria-label="Decrease quantity"
                     className="rounded-r-none bg-black"
                  >
                     <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                     type="number"
                     value={quantity}
                     onChange={handleQuantityChange}
                     className="text-center rounded-none border-x-0"
                     min="1"
                     max="10"
                  />
                  <Button
                     onClick={increaseQuantity}
                     aria-label="Increase quantity"
                     className="rounded-l-none bg-black"
                  >
                     <Plus className="h-4 w-4 " />
                  </Button>
               </div>
               <div className="text-base pr-1 mt-5 font-semibold dark:text-white">
                  Total: {5 * quantity} {"USDC"}
               </div>
            </div>
            <Button disabled={loading} onClick={handleSupport} className="flex justify-center">
               {
                  !loading ? <span>Support</span> :
                     <span className="w-9 h-9 flex items-center justify-center">
                        <svg className="animate-spin text-gray-400" width="28" height="28" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
                        </svg>
                     </span>
               }
            </Button>

            {status === "unauthenticated" && (
               <p className="text-center text-red-500 mt-2 w-full">
                  {
                     !signingIn
                        ? <span>Please sign in to support {creator?.username || "this creator"}.</span>
                        : <span className="flex justify-center items-center">
                           <span className="w-9 h-9 flex items-center justify-center">
                              <svg className="animate-spin text-gray-400" width="28" height="28" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
                              </svg>
                           </span> Signing In ...
                        </span>
                  }
               </p>
            )}
            {/* <div className="flex items-center space-x-2 mb-4">
                  <Switch
                     id="custom-address"
                     checked={useCustomAddress}
                     onCheckedChange={setUseCustomAddress}
                  />
                  <Label
                     htmlFor="custom-address"
                     className={`${useCustomAddress ? "" : "text-gray-400"
                        } cursor-pointer`}
                  >
                     Mint to a custom address
                  </Label>
               </div>
               {useCustomAddress && (
                  <div className="mb-4">
                     <Input
                        id="address-input"
                        type="text"
                        placeholder="Enter recipient address"
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        className="w-full"
                     />
                  </div>
               )} */}
         </CardContent>
         {/* <CardFooter>
               {account ? (
                  <ClaimButton
                     theme={"light"}
                     contractAddress={props.contract.address}
                     chain={props.contract.chain}
                     client={props.contract.client}
                     claimParams={
                        props.isERC1155
                           ? {
                              type: "ERC1155",
                              tokenId: props.tokenId,
                              quantity: BigInt(quantity),
                              to: customAddress,
                              from: account.address,
                           }
                           : props.isERC721
                              ? {
                                 type: "ERC721",
                                 quantity: BigInt(quantity),
                                 to: customAddress,
                                 from: account.address,
                              }
                              : {
                                 type: "ERC20",
                                 quantity: String(quantity),
                                 to: customAddress,
                                 from: account.address,
                              }
                     }
                     style={{
                        backgroundColor: "black",
                        color: "white",
                        width: "100%",
                     }}
                     disabled={isMinting}
                     onTransactionSent={() => toast.info("Minting NFT")}
                     onTransactionConfirmed={() =>
                        toast.success("Minted successfully")
                     }
                     onError={(err) => toast.error(err.message)}
                  >
                     Mint {quantity} NFT{quantity > 1 ? "s" : ""}
                  </ClaimButton>
               ) : (
                  <ConnectButton
                     client={client}
                     connectButton={{ style: { width: "100%" } }}
                  />
               )}
            </CardFooter> */}
      </Card>
   )
}
