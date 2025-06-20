"use client";

import dynamic from "next/dynamic";
import { signIn, getCsrfToken, useSession } from "next-auth/react";
import sdk, {
  SignIn as SignInCore,
} from "@farcaster/frame-sdk";
import React, { useState, useEffect, useRef, useCallback } from "react";

import { FaBars } from "react-icons/fa";
import { Sidebar } from "~/components/Sidebar";
import { Gluten } from "next/font/google";
import { Input } from "~/components/ui/input";
import { User } from "@neynar/nodejs-sdk/build/api";
const display = Gluten({ subsets: ["latin"], variable: "--font-display" });

// note: dynamic import is required for components that use the Frame SDK
const MintCoffee = dynamic(() => import("~/components/MintCoffee"), {
  ssr: false,
});


export default function App() {

  const contractLogo = "https://nft.unchainedelephants.com/wp-content/uploads/2025/04/Your-paragraph-text-5-scaled.png";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [signingIn, setSigningIn] = useState(false);
  // const [signingOut, setSigningOut] = useState(false);
  const [signInResult, setSignInResult] = useState<SignInCore.SignInResult>();
  const [signInFailure, setSignInFailure] = useState<string>();
  const { data: session, status } = useSession();

  const [authUser, setAuthUser] = useState<User | undefined>(undefined);

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  useEffect(() => {
    if (status !== "authenticated" && !signingIn) {
      handleSignIn()
        .then((result) => {
          if (result) {
            console.log("Sign-in successful, result:", signInResult);
          } else {
            console.log("Sign-in failed");
          }
        })
        .catch((error) => {
          console.error("Error during sign-in:", error);
        });
    }

    if (!signingIn && status === "authenticated") {
      console.log("User is authenticated:", session);
      fetch("/api/search?usernameOrFID=" + encodeURIComponent(session.user.fid))
        .then(res => res.json())
        .then(result => {
          console.log("Fetched user:", result);
          setAuthUser(result.user);
        });
    }
  }, [signingIn, status])

  const handleSignIn = useCallback(async (): Promise<boolean> => {
    try {
      setSigningIn(true);
      setSignInFailure(undefined);
      const nonce = await getNonce();
      const result = await sdk.actions.signIn({ nonce });
      setSignInResult(result);
      console.log("SignIn Result:", signInResult);

      await signIn("credentials", {
        message: result.message,
        signature: result.signature,
        redirect: false,
      });
      return true;
    } catch (e) {
      if (e instanceof SignInCore.RejectedByUser) {
        setSignInFailure("Rejected by user");
        return false;
      }
      setSignInFailure("Unknown error");
      return false;
    } finally {
      setSigningIn(false);
    }
  }, [getNonce]);

  // const handleSignOut = useCallback(async () => {
  //   try {
  //     setSigningOut(true);
  //     await signOut({ redirect: false });
  //     setSignInResult(undefined);
  //   } finally {
  //     setSigningOut(false);
  //   }
  // }, []);

  // Search state
  const [usernameOrFID, setUsernameOrFID] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  const [creator, setCreator] = useState<User | undefined>(undefined);

  // Debounced search
  useEffect(() => {
    if (!usernameOrFID) {
      return;
    }
    const timeout = setTimeout(() => {
      getCreator();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [usernameOrFID]);

  const getCreator = () => {
    setIsInvalid(false);
    setLoading(true);
    setShowDropdown(true);
    fetch(`/api/search?usernameOrFID=${encodeURIComponent(usernameOrFID)}&limit=10`)
      .then(res => res.json())
      .then(result => {
        console.log("Fetched more results:", user);
        if (result?.code === "NotFound") {
          setIsInvalid(true);
          return;
        }
        setUser(result.user);
        console.log("Fetched user:", user);
        setIsInvalid(false)
      })
      .catch(() => { console.log("Error fetching user:", usernameOrFID); setIsInvalid(true) })
      .finally(() => setLoading(false));
  };

  return (
    <main className={`${display.className} relative`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="sticky p-2 bg-white w-full flex items-center gap-x-1 rounded-b-sm shadow-md z-20">
        {/* Breadcrumb (sidebar toggle) icon */}
        <button
          className="mr-4 mt-3 text-gray-700 hover:text-gray-900 focus:outline-none"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <FaBars size={24} />
        </button>
        <span className="relative w-10 h-10 rounded-full overflow-hidden">
          <img src={contractLogo} alt="" className="w-full h-full object-cover" />
        </span>
        <h3 className="mt-3">Mint me a coffee</h3>
        <div className="ml-auto flex items-center">
          {signingIn ? (
            <span className="w-9 h-9 flex items-center justify-center">
              <svg className="animate-spin text-gray-400" width="28" height="28" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
              </svg>
            </span>
          ) : authUser && authUser.pfp_url ? (
            <img
              src={authUser.pfp_url}
              alt="avatar"
              className="w-9 h-9 rounded-full object-cover border ml-2"
            />
          ) : null}
        </div>
      </header>
      <div className="bg-white text-center p-3 mt-4">
        Support your favorite creator with a ☕ and<br /> get rewards with unique coffee-mug NFTs
      </div>
      <div className="mb-3 p-3 relative">
        <Input
          placeholder="Enter fid or fname or basename"
          className="pl-10 rounded-xl"
          value={usernameOrFID}
          onChange={e => setUsernameOrFID(e.target.value)}
          // onBlur={() => setTimeout(() => setShowDropdown(false), 300)}
          onFocus={() => { if (usernameOrFID) { console.log(usernameOrFID); getCreator() } }}
          autoComplete="off"
        />
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 30 30">
            <path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"></path>
          </svg>
        </span>
        {showDropdown && (
          <ul
            ref={dropdownRef}
            className="absolute z-10 left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg max-h-60 overflow-auto text-left"
            tabIndex={-1}
          >
            {user && user.fid &&
              <li
                className="px-4 py-4 text-black flex items-center gap-2 hover:bg-gray-300 cursor-pointer"
                onClick={() => { setCreator(user); setShowDropdown(false) }}
              >
                {user.pfp_url && <img src={user.pfp_url} alt={user.display_name} className="w-8 h-8 rounded-full mr-2" />}
                {user.display_name ? <span>{user.display_name}</span> : <span className="text-gray-400">Unknown User</span>}
              </li>
            }
            {loading && (
              <li className="px-4 py-2 text-center text-gray-400">
                <svg className="inline animate-spin mr-2" width="16" height="16" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
                </svg>
                Loading...
              </li>
            )}
            {isInvalid && (
              <li className="px-4 py-2 text-center text-red-400">Invalid username or FID or basename</li>
            )}
          </ul>
        )}
      </div>
      <MintCoffee creator={creator} handleSignIn={handleSignIn} signingIn={signingIn} signInFailure={signInFailure} />
      <div className="text-center text-gray-500 mt-3">
        powered by <span className="underline">mintmeacoffee.com</span><br /><br />
      </div>
    </main>
  );
}
