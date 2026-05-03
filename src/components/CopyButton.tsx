import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: "sm" | "md";
}

export function CopyButton({ text, label = "복사", size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeClass = size === "sm"
    ? "px-2.5 py-1 text-xs gap-1"
    : "px-4 py-1.5 text-sm gap-1.5";

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center ${sizeClass} rounded-md font-medium transition-all duration-150 ${
        copied
          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
          : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 hover:border-slate-400"
      }`}
    >
      {copied ? (
        <>
          <Check size={12} />
          복사됨
        </>
      ) : (
        <>
          <Copy size={12} />
          {label}
        </>
      )}
    </button>
  );
}
