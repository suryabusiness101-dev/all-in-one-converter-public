import { Link } from 'react-router-dom';
import ToolInfoSection from './ToolInfoSection';

const Base64ToFileInfo = () => (
  <ToolInfoSection>
    <h2>When you actually need this</h2>
    <p>
      This is the reverse of the usual Base64 workflow: you don't have a file to encode, you have a
      Base64 <em>string</em> — from an API response that returns a generated PDF or image inline
      instead of a URL, a database BLOB column exported as text, a <strong>data:</strong> URI copied
      out of a browser's dev tools or an email's raw HTML source — and you need the actual file back.
      Pasting that string into a plain-text Base64 decoder gives you garbled characters, because
      it's trying to read binary bytes as if they were UTF-8 text. This tool skips that step
      entirely and decodes straight to bytes, then a download.
    </p>
    <h2>How it works</h2>
    <p>
      The decode itself is one browser built-in, <strong>atob</strong>, which turns Base64 back into
      a raw byte string; a <strong>Uint8Array</strong> then holds those bytes as actual binary data
      rather than characters. From there a <strong>Blob</strong> wraps the bytes with a MIME type,
      and a temporary object URL lets an invisible link element trigger the browser's normal
      download flow. None of this touches a server — the bytes exist only in this tab, which matters
      if what you're decoding is something you'd rather not upload anywhere, like a document with
      personal information in it.
    </p>
    <h2>A worked example</h2>
    <p>
      The Base64 string <strong>R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==</strong> decodes to
      exactly <strong>34 bytes</strong>. The first six of them are{' '}
      <strong>47 49 46 38 39 61</strong> in hex — the ASCII characters "GIF89a", the signature that
      opens every GIF file. Paste that string above, and this tool reads those same six bytes,
      recognizes the GIF signature, and suggests <strong>decoded.gif</strong> as the filename
      automatically. Download it and you have a real, valid one-pixel transparent GIF — the classic
      "tracking pixel" image format, small enough to use as a worked example end to end.
    </p>
    <h2>Getting the filename and type right</h2>
    <p>
      Base64 itself carries no filename and, on its own, no type — it's just digits of data. If your
      input is a full <strong>data:image/png;base64,...</strong> URI, the MIME type travels with it
      and this tool reads it directly. If you only have the bare Base64 payload, it instead looks at
      the first few decoded bytes for a known file signature — PNG, JPEG, GIF, PDF, and ZIP (which
      also covers ZIP-based formats like .docx and .xlsx) are recognized this way — and names the
      download accordingly. <strong>photo.png</strong> and <strong>invoice.pdf</strong> aren't
      guesses about your intent so much as reads of the file's own header bytes; when nothing
      matches, it falls back to a generic <strong>.bin</strong> extension rather than pretending to
      know. You can always overwrite the suggested name before downloading — the actual byte content
      doesn't depend on what you call the file, but the OS uses the extension to decide which app
      opens it, so getting it right (or fixing a wrong guess) is what makes the download openable.
    </p>
    <h2>If the download won't open</h2>
    <p>
      A file that downloads but won't open is almost always a bytes problem, not a naming one — the
      decoder already told you if the Base64 itself was invalid. The usual causes are an incomplete
      copy-paste (missing characters from either end of a long string truncates the file), the
      URL-safe Base64 variant (<strong>-</strong> and <strong>_</strong> instead of{' '}
      <strong>+</strong> and <strong>/</strong>, common in JWTs and URL parameters) pasted into a
      decoder expecting standard Base64, or a stray newline inserted by whatever you copied the text
      from. Full details on those variants and how to spot them are on the{' '}
      <Link to="/base64-encoder-decoder">main Base64 encoder/decoder page</Link>.
    </p>
    <h2>When not to use it</h2>
    <p>
      For very large files — tens of megabytes and up — copying and pasting a Base64 blob through a
      textarea is slow and easy to truncate by accident; a direct file transfer is more reliable
      when one is available. And if you're starting from an actual file on disk rather than a string
      someone handed you, you want the opposite direction: the File to Base64 panel on the main
      Base64 tool page encodes a file you pick, rather than decoding a string you already have.
    </p>
  </ToolInfoSection>
);

export default Base64ToFileInfo;
