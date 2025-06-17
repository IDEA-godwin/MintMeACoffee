import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
   const { searchParams } = req.nextUrl;
   const usernameOrFID = searchParams.get("usernameOrFID") || "";

   // const res = await searchUsername(q, cursor ?? undefined);
   try {
      let uri = `by_username/?username=${encodeURIComponent(usernameOrFID)}`;
      if (typeof Number.parseInt(usernameOrFID) === "number" && !Number.isNaN(Number.parseInt(usernameOrFID))) {
         uri = `bulk/?fids=${encodeURIComponent(usernameOrFID)}`;
      }
      const res = await fetch(
         `https://api.neynar.com/v2/farcaster/user/${uri}`,
         {
            headers: {
               "Content-Type": "application/json",
               "x-api-key": process.env.NEYNAR_API_KEY || "",
            },
         }
      );
      let data = await res.json();
      if (uri.startsWith("bulk/")) {
         data = { user: data.users[0] || null };
      }

      console.log("User search response:", data);
      return new Response(JSON.stringify(data), {
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