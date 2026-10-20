import React, { useRef, useState } from 'react';
import CopyToClipboardButton from './CopyToClipboardButton';
import Base64FileDecoder from './Base64FileDecoder';
import { decodeBase64ToUtf8, encodeUtf8ToBase64, formatBytes } from '../lib/base64';

const Base64Converter: React.FC = () => {
  const [text, setText] = useState('');
  const [base64, setBase64] = useState('');
  const [base64Error, setBase64Error] = useState(false);

  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileBase64, setFileBase64] = useState('');
  const [filePreview, setFilePreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    setBase64Error(false);
    setBase64(value === '' ? '' : encodeUtf8ToBase64(value));
  };

  const handleBase64Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBase64(value);
    if (value === '') {
      setText('');
      setBase64Error(false);
      return;
    }
    try {
      setText(decodeBase64ToUtf8(value));
      setBase64Error(false);
    } catch {
      setBase64Error(true);
    }
  };

  const readFile = (file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const commaIndex = dataUrl.indexOf(',');
      setFileBase64(dataUrl.slice(commaIndex + 1));
      setFilePreview(file.type.startsWith('image/') ? dataUrl : '');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const file = e.clipboardData.files?.[0];
    if (file) readFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
      <div className="p-4 sm:p-6 bg-slate-800 rounded-lg shadow-lg light:bg-white light:border light:border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 text-center">Text Base64 Encoder / Decoder</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="b64-text" className="text-slate-300 text-sm font-semibold uppercase tracking-wide light:text-slate-600">
                Plain Text
              </label>
              <CopyToClipboardButton textToCopy={text} />
            </div>
            <textarea
              id="b64-text"
              value={text}
              onChange={handleTextChange}
              rows={4}
              placeholder="Type or paste plain text..."
              className="w-full p-3 rounded-md bg-slate-700 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm resize-none light:bg-slate-50 light:text-slate-900 light:border-slate-300"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="b64-encoded" className="text-slate-300 text-sm font-semibold uppercase tracking-wide light:text-slate-600">
                Base64
              </label>
              <CopyToClipboardButton textToCopy={base64} />
            </div>
            <textarea
              id="b64-encoded"
              value={base64}
              onChange={handleBase64Change}
              rows={4}
              placeholder="Type or paste Base64..."
              className={`w-full p-3 rounded-md bg-slate-700 text-slate-100 border focus:outline-none focus:ring-2 font-mono text-sm resize-none light:bg-slate-50 light:text-slate-900 ${
                base64Error ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-cyan-500 light:border-slate-300'
              }`}
            />
            {base64Error && <p className="text-red-400 text-xs mt-1">Invalid Base64 input.</p>}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-slate-800 rounded-lg shadow-lg light:bg-white light:border light:border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 text-center">File to Base64</h2>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 sm:p-8 cursor-pointer transition-colors duration-300 focus:outline-none ${
            dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-600 hover:border-slate-500 light:border-slate-300 light:hover:border-slate-400'
          }`}
        >
          <p className="text-slate-300 text-center light:text-slate-600">Drag & drop a file, click to browse, or paste from clipboard</p>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInputChange} />
        </div>

        {fileName && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-400 light:text-slate-500">
              <span>
                {fileName} &middot; {formatBytes(fileSize)}
              </span>
              <CopyToClipboardButton textToCopy={fileBase64} />
            </div>
            {filePreview && (
              <img src={filePreview} alt={fileName} className="max-h-48 rounded-md border border-slate-700 mx-auto light:border-slate-200" />
            )}
            <textarea
              readOnly
              value={fileBase64}
              rows={4}
              className="w-full p-3 rounded-md bg-slate-700 text-slate-100 border border-slate-600 font-mono text-xs resize-none light:bg-slate-50 light:text-slate-900 light:border-slate-300"
            />
          </div>
        )}
      </div>

      <Base64FileDecoder />
    </div>
  );
};

export default Base64Converter;
