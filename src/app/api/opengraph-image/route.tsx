import { ImageResponse } from "next/og";
// import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {

  const imgSrc = "https://nft.unchainedelephants.com/wp-content/uploads/2025/04/Your-paragraph-text-5-scaled.png"

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-center items-center relative bg-purple-600">
          <div tw="flex w-96 h-96 rounded-full overflow-hidden mb-8 border-8 border-white">
            <img src={imgSrc} alt="Profile" tw="w-full h-full object-cover" />
          </div>
        <h1 tw="text-8xl text-white">Mint your fav a coffee!</h1>
        <p tw="text-5xl mt-4 text-white opacity-80">Powered by Neynar 🪐</p>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}