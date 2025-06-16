"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { APP_NAME } from "~/lib/constants";

import { Gluten } from "next/font/google";
import { Input } from "~/components/ui/input";
import { SearchedUser } from "@neynar/nodejs-sdk/build/api";
const display = Gluten({ subsets: ["latin"], variable: "--font-display" });

// note: dynamic import is required for components that use the Frame SDK
const MintCoffee = dynamic(() => import("~/components/MintCoffee"), {
  ssr: false,
});


export default function App() {

  const contractLogo = "https://nft.unchainedelephants.com/wp-content/uploads/2025/04/Your-paragraph-text-5-scaled.png";

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<SearchedUser>>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query) {
      setResults([]);
      setCursor(undefined);
      setHasMore(true);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`)
        .then(res => res.json())
        .then(data => {
          setResults(data.items || []);
          setCursor(data.nextCursor); // expects API to return nextCursor or undefined
          setHasMore(!!data.nextCursor);
          setShowDropdown(true);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!dropdownRef.current || loading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current;
    if (scrollHeight - scrollTop - clientHeight < 40) {
      setLoading(true);
      fetch(`https://example.com/api/search?q=${encodeURIComponent(query)}&cursor=${encodeURIComponent(cursor ?? "")}`)
        .then(res => res.json())
        .then( ({ result }) => {
          setResults(prev => [...prev, ...(result.users || [])]);
          setCursor(result.nextCursor);
          setHasMore(!!result.nextCursor);
        })
        .finally(() => setLoading(false));
    }
  }, [query, cursor, loading, hasMore]);

  useEffect(() => {
    const ref = dropdownRef.current;
    if (ref && showDropdown) {
      ref.addEventListener("scroll", handleScroll);
      return () => ref.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, showDropdown]);

  return (
    <main className={`${display.className}`}>
      <header className="sticky p-2 bg-white w-full flex justify-center items-center gap-x-1 rounded-b-sm shadow-md">
        <span className="relative w-10 h-10 rounded-full overflow-hidden">
          <img src={contractLogo} alt="" className="w-full h-full object-cover" />
        </span>
        <h3 className="mt-3">Mint me a coffee</h3>
      </header>
      <div className="bg-white text-center p-3 mt-4">
        GM @lemon-king, welcome to <span className="underline">mintmeacoffee.com</span><br /><br />
        Support your favorite creator with a ☕ and<br /> get rewards with unique coffee-mug NFTs
      </div>
      <div className="mb-3 p-3 relative">
        <Input
          placeholder="Search fname or basename"
          className="pl-10 rounded-xl"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          autoComplete="off"
        />
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 30 30">
            <path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"></path>
          </svg>
        </span>
        {showDropdown && results.length > 0 && (
          <ul
            ref={dropdownRef}
            className="absolute z-10 left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg max-h-60 overflow-auto text-left"
            tabIndex={-1}
          >
            {results.map((item, idx) => (
              <li
                key={item.fid || idx}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => {
                  setQuery(item.display_name || "");
                  setShowDropdown(false);
                }}
              >
                {item.display_name || JSON.stringify(item)}
              </li>
            ))}
            {loading && (
              <li className="px-4 py-2 text-center text-gray-400">
                <svg className="inline animate-spin mr-2" width="16" height="16" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"/>
                </svg>
                Loading...
              </li>
            )}
            {!hasMore && (
              <li className="px-4 py-2 text-center text-gray-400">No more results</li>
            )}
          </ul>
        )}
      </div>
      <MintCoffee />
    </main>
  );
}
