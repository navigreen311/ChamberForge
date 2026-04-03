"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import GlobalSearch from "@/components/modules/GlobalSearch";

export default function SearchBar() {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  // Also listen for Cmd+K at this level to toggle open
  if (typeof window !== "undefined") {
    /* handled inside GlobalSearch */
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 transition hover:border-gray-300 hover:bg-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="ml-4 hidden rounded border border-gray-300 px-1.5 py-0.5 text-[10px] sm:inline dark:border-gray-600">
          ⌘K
        </kbd>
      </button>

      <GlobalSearch open={open} onClose={handleClose} />
    </>
  );
}
