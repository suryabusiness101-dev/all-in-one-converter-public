import React, { useState } from 'react';
import {
  decodeBase64ToBytes,
  detectFileTypeFromBytes,
  extractDataUriMimeType,
  formatBytes,
  mimeTypeToExtension,
} from '../lib/base64';

const Base64FileDecoder: React.FC = () => {
  const [base64, setBase64] = useState('');
  const [error, setError] = useState(false);
  const [bytes, setBytes] = useState<Uint8Array<ArrayBuffer> | null>(null);
  const [mimeType, setMimeType] = useState('application/octet-stream');
  const [fileName, setFileName] = useState('');
  const [fileNameTouched, setFileNameTouched] = useState(false);

  const handleBase64Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBase64(value);

    if (value.trim() === '') {
      setBytes(null);
      setError(false);
      setMimeType('application/octet-stream');
      setFileNameTouched(false);
      setFileName('');
      return;
    }

    try {
      const decoded = decodeBase64ToBytes(value);
      setBytes(decoded);
      setError(false);

      const dataUriMime = extractDataUriMimeType(value);
      const detected = dataUriMime
        ? { mimeType: dataUriMime, extension: mimeTypeToExtension(dataUriMime) ?? 'bin' }
        : (detectFileTypeFromBytes(decoded) ?? { mimeType: 'application/octet-stream', extension: 'bin' });

      setMimeType(detected.mimeType);
      if (!fileNameTouched) setFileName(`decoded.${detected.extension}`);
    } catch {
      setBytes(null);
      setError(true);
    }
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileNameTouched(true);
    setFileName(e.target.value);
  };

  const handleDownload = () => {
    if (!bytes) return;
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.trim() || 'decoded.bin';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-800 rounded-lg shadow-lg light:bg-white light:border light:border-slate-200">
      <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 text-center">Base64 to File</h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="b64-file-input"
            className="block text-slate-300 text-sm font-semibold uppercase tracking-wide mb-1.5 light:text-slate-600"
          >
            Base64 String
          </label>
          <textarea
            id="b64-file-input"
            value={base64}
            onChange={handleBase64Change}
            rows={5}
            placeholder="Paste a Base64 string, or a full data:*;base64,... URI..."
            className={`w-full p-3 rounded-md bg-slate-700 text-slate-100 border focus:outline-none focus:ring-2 font-mono text-xs resize-none light:bg-slate-50 light:text-slate-900 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-cyan-500 light:border-slate-300'
            }`}
          />
          {error && <p className="text-red-400 text-xs mt-1">Invalid Base64 input.</p>}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[10rem]">
            <label
              htmlFor="b64-file-name"
              className="block text-slate-300 text-sm font-semibold uppercase tracking-wide mb-1.5 light:text-slate-600"
            >
              File name
            </label>
            <input
              id="b64-file-name"
              type="text"
              value={fileName}
              onChange={handleFileNameChange}
              placeholder="decoded.png"
              className="w-full p-2.5 rounded-md bg-slate-700 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm light:bg-slate-50 light:text-slate-900 light:border-slate-300"
            />
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!bytes}
            className="px-4 py-2.5 rounded-md font-medium text-sm bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-300"
          >
            Download file
          </button>
        </div>

        {bytes && (
          <p className="text-sm text-slate-400 light:text-slate-500">
            Decoded {formatBytes(bytes.length)}, detected as <span className="font-mono">{mimeType}</span>. Rename
            the file above before downloading if the guess is wrong.
          </p>
        )}
      </div>
    </div>
  );
};

export default Base64FileDecoder;
