import React, { useState } from 'react';

interface CopyToClipboardButtonProps {
  textToCopy: string;
  className?: string;
}

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({ textToCopy, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!textToCopy}
      className={`relative inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
        copied
          ? 'bg-emerald-600 text-white scale-105'
          : 'bg-cyan-600 text-white hover:bg-cyan-500'
      } ${className}`}
    >
      <svg
        className={`h-4 w-4 shrink-0 transition-all duration-300 ${copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0 w-0'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};

export default CopyToClipboardButton;
