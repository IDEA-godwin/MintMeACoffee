import React from "react";
import { FaTimes, FaSignOutAlt, FaPlus, FaHistory, FaCog } from "react-icons/fa";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  // onSignOut?: () => void; // Uncomment and use if you want to handle sign out
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  return (
    <>
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-40 flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ willChange: "transform" }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <span className="font-bold text-lg">Menu</span>
          <button
            className="text-gray-500 hover:text-gray-800"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <FaTimes size={22} />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-2 px-4 py-6">
          <button className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-100 text-left">
            <FaPlus /> <span>Create Page</span>
          </button>
          <button className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-100 text-left">
            <FaHistory /> <span>Tipping History</span>
          </button>
          <button className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-100 text-left">
            <FaCog /> <span>Settings</span>
          </button>
        </nav>
        <div className="mt-auto px-4 py-6 border-t">
          <button
            className="flex items-center gap-3 px-2 py-2 rounded hover:bg-red-100 text-red-600 w-full"
            // onClick={onSignOut}
          >
            <FaSignOutAlt /> <span>Sign Out</span>
          </button>
        </div>
      </div>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
};