"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The label change is the feedback — no toast. Reverts after 2.5s, or sooner if
 * the pointer leaves.
 */
export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard permission denied — the address is selectable on screen anyway.
      setCopied(false);
    }
  }

  return (
    <button type="button" className="btn" onClick={copy} onMouseLeave={() => setCopied(false)}>
      {copied ? "Copied ✓" : label}
    </button>
  );
}
