import { NextRequest } from "next/server";
import { searchUsername } from "~/lib/neynar";

export async function GET(req: NextRequest) {
   const { searchParams } = req.nextUrl;
   const q = searchParams.get("q") || "";
   const cursor = searchParams.get("cursor");

   const res = await searchUsername(q, cursor ?? undefined);
   return new Response(JSON.stringify(res), {
      status: 200,
      headers: {
         "Content-Type": "application/json",
      },
   });
}