import { NextRequest } from "next/server";
import { pinata } from "~/lib/pinata";

export async function POST(req: NextRequest) {
   const body = await req.json();

   try {
      const res = await pinata.pinJSONToIPFS(body)
      return new Response(JSON.stringify(res), {
         status: 200,
         headers: {
            "Content-Type": "application/json",
         },
      });
   } catch (error) {
      console.error("Error fetching user search:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch user search" }), {
         status: 500,
         headers: {
            "Content-Type": "application/json",
         },
      });
   }

}