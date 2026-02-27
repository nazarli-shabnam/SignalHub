"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";

type Props = {
  meetupId: string;
  title: string;
};

export function DeleteMeetupButton({ meetupId, title }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confirming) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setConfirming(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [confirming]);

  function handleInitiate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(true);
  }

  async function handleConfirm(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/meetups/${meetupId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div
        ref={wrapperRef}
        className="flex items-center gap-1.5"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <span className="text-xs text-zinc-400 mr-1">Delete?</span>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={deleting}
          className="px-2 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
        >
          {deleting ? "…" : "Yes"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInitiate}
      className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
      aria-label={`Delete ${title}`}
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
