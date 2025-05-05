import Image from "next/image";
import { NftMint } from "@/components/nft-mint";
import { defaultTokenId, contract } from "@/lib/constants";
// lib imports for fetching NFT details
import { getERC20Info } from "@/lib/erc20";
import { getERC721Info } from "@/lib/erc721";
import { getERC1155Info } from "@/lib/erc1155";
// thirdweb imports
import { isERC1155 } from "thirdweb/extensions/erc1155";
import { isERC721 } from "thirdweb/extensions/erc721";
import Link from "next/link";
import CircleSpinner from "@/components/CircleSpinner";
import Pattern from "@/components/Pattern";
import { copyright, description, details, title } from "../../texts";

async function getERCType() {
  const [isErc721, isErc1155] = await Promise.all([
    isERC721({ contract }).catch(() => false),
    isERC1155({ contract }).catch(() => false),
  ]);

  return isErc1155 ? "ERC1155" : isErc721 ? "ERC721" : "ERC20";
}

export default async function Home() {
  try {
    const ercType = await getERCType();
    if (!ercType) throw new Error("Failed to determine ERC type.");

    // fetch contract information depending on the ERC type
    let info;
    switch (ercType) {
      case "ERC20":
        info = await getERC20Info(contract);
        break;
      case "ERC721":
        info = await getERC721Info(contract);
        break;
      case "ERC1155":
        info = await getERC1155Info(contract);
        break;
      default:
        throw new Error("Unknown ERC type.");
    }

    if (!info) throw new Error("Failed to fetch NFT details.");

    return (
      <main className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="flex flex-col-reverse lg:grid lg:grid-cols-2">
          {/* Left Content */}
          <div className="w-full flex flex-col items-start justify-center gap-8 h-full p-6 lg:pl-20 2xl:pl-40">
            <CircleSpinner />
            <h1 className="hero-title max-w-[480px]">{title}</h1>
            <p className="text-lg text-muted-foreground max-w-md">
              {description}
            </p>
          </div>

          {/* Right Content - NFT Minting */}
          <div className="w-full relative">
            <Pattern>
              <NftMint
                contract={contract}
                displayName={info.displayName || ""}
                contractImage={info.contractImage || ""}
                description={info.description || ""}
                currencySymbol={info.currencySymbol || ""}
                pricePerToken={info.pricePerToken || 0}
                isERC1155={ercType === "ERC1155"}
                isERC721={ercType === "ERC721"}
                tokenId={defaultTokenId}
              />
            </Pattern>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 border-y">
          <div className="p-12 text-center border-b md:border-b-0 md:border-r">
            <h2 className="text-4xl font-bold flex items-center gap-x-1 justify-center">
              {" "}
              <img src="/base-testnet.png" className="w-6 h-6" alt="" /> Base
            </h2>
            <p className="text-muted-foreground mt-2">Chain</p>
          </div>
          <div className="p-12 text-center border-b md:border-b-0 md:border-r">
            <h2 className="text-4xl font-bold">5 USD"</h2>
            <p className="text-muted-foreground mt-2">Price Per "Coffee</p>
          </div>
          <div className="p-12 text-center">
            <h2 className="text-4xl font-bold">Coffees</h2>
            <p className="text-muted-foreground mt-2">MintMe As Many As You Want</p>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 2xl:gap-16 px-6 md:px-24 py-16 bg-black text-white">
          {Object.entries(details).map(([title, { icon, description }]) => (
            <div className="space-y-4">
              <div className="text-7xl"> {icon} </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-sm">{description}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-24 py-6 border-t flex flex-col sm:flex-row gap-2 justify-between items-center">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            {copyright}
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </Link>
          </div>
        </footer>
      </main>
    );
  } catch (error) {
    console.error("Error in Home component:", error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Failed to load NFT</h1>
          <p className="text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred."}
          </p>
        </div>
      </div>
    );
  }
}
