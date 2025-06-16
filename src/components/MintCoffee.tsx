'use client';

import { useEffect, useState } from "react";
import Pattern from "./Pattern";
import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/card";
import { Minus, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { User } from "@neynar/nodejs-sdk/build/api";
import { useSession } from "next-auth/react";


export default function MintCoffee(
   { creator, handleSignIn, signingIn, signInFailure }: { creator: User | undefined, handleSignIn: () => Promise<boolean>, signingIn: boolean, signInFailure: string | undefined }
) {

  const { data: session, status } = useSession();

   const [quantity, setQuantity] = useState(1);
   const contractLogo = "https://nft.unchainedelephants.com/wp-content/uploads/2025/04/Your-paragraph-text-5-scaled.png"; // Replace with actual logo URL

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
         await handleSignIn();
         return;
      }
      console.log(session);
   }

   return (
      <Pattern>
         <Card className="w-full max-w-md">
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
                     placeholder="Say something nice ..." 
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
                        className="w-10 sm:w-24 text-center rounded-none border-x-0 sm:pl-6"
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
               <Button onClick={handleSupport}>Support</Button>

               {status === "unauthenticated" && (
                  <p className="text-red-500 mt-2">
                     Please sign in to support {creator?.display_name || "this creator"}.
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
      </Pattern>
   )
}