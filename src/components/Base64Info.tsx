import { Link } from 'react-router-dom';
import ToolInfoSection from './ToolInfoSection';

const Base64Info = () => (
  <ToolInfoSection>
    <h2>What is Base64 encoding?</h2>
    <p>
      Base64 is a way of representing binary data using only 64 printable ASCII characters
      (<strong>A–Z</strong>, <strong>a–z</strong>, <strong>0–9</strong>, <strong>+</strong>, and{' '}
      <strong>/</strong>, with <strong>=</strong> used for padding). It's not encryption — anyone
      can decode it — it's simply a safe way to move binary or non-text data through systems that
      only reliably handle plain text.
    </p>
    <h2>A worked example</h2>
    <p>
      Encoding works on bytes, not characters, six bits at a time. Take the three-letter word{' '}
      <strong>Cat</strong>: as bytes it's <strong>01000011 01100001 01110100</strong> (C, a, t).
      Regroup those 24 bits into four 6-bit chunks — <strong>010000 110110 000101 110100</strong> —
      and each chunk becomes an index (0–63) into the Base64 alphabet: 16, 54, 5, 52, which map to
      the characters <strong>Q</strong>, <strong>2</strong>, <strong>F</strong>, <strong>0</strong>
      . So "Cat" becomes <strong>Q2F0</strong>. Three input bytes divide evenly into four 6-bit
      groups, which is why 3-byte-aligned input needs no padding.
    </p>
    <p>
      Now take <strong>Hi</strong> — only 2 bytes (16 bits). 16 doesn't divide evenly into 6, so
      the encoder pads with zero bits to reach 18, encodes three 6-bit groups
      (<strong>S</strong>, <strong>G</strong>, <strong>k</strong>), and appends a literal{' '}
      <strong>=</strong> character to mark that the last group was padded rather than real data.
      The result is <strong>SGk=</strong>. A single leftover byte needs two <strong>=</strong>{' '}
      signs; two leftover bytes need one. This is also why decoding a string with the wrong number
      of <strong>=</strong> characters, or one missing entirely, fails — the decoder can't tell
      real data from padding anymore.
    </p>
    <h2>Common uses</h2>
    <ul>
      <li>Embedding small images directly in CSS or HTML as data URIs</li>
      <li>Encoding binary attachments for email (MIME) or JSON payloads</li>
      <li>HTTP Basic Authentication headers</li>
      <li>The header and payload segments of a JWT (JSON Web Token)</li>
    </ul>
    <h2>Mistakes people make</h2>
    <ul>
      <li>
        <strong>Treating it as security.</strong> Base64 is an encoding, not a cipher — there's no
        key. Anyone can paste the output back in and read it instantly. Don't put secrets, tokens,
        or passwords through it expecting protection; use real encryption for that.
      </li>
      <li>
        <strong>Assuming character count and Base64 length track 1:1.</strong> A word full of
        accented or non-Latin characters (é, ñ, 中) encodes to more bytes per character in UTF-8
        first, then those bytes get Base64'd — so the output can be noticeably longer than
        4/3 × character count, not just 4/3 × byte count of plain ASCII text.
      </li>
      <li>
        <strong>Mixing up standard and URL-safe Base64.</strong> Some systems (JWTs, URL query
        parameters) use a variant that replaces <strong>+</strong> and <strong>/</strong> with{' '}
        <strong>-</strong> and <strong>_</strong> and often drops the <strong>=</strong> padding
        entirely, so it's safe inside a URL. Pasting URL-safe output into a standard decoder (or
        vice versa) will fail or silently produce garbage — this tool expects standard Base64.
      </li>
      <li>
        <strong>Stray whitespace or line breaks.</strong> Some tools (older email clients, some
        CLI utilities) wrap encoded output at 76 characters with line breaks. Most modern decoders
        strip whitespace automatically, but if you're troubleshooting a decode failure, check for
        an invisible newline or trailing space copied along with the text.
      </li>
    </ul>
    <h2>Why decoding can fail</h2>
    <p>
      This tool decodes Base64 back into <strong>UTF-8 text</strong> strictly — if the decoded
      bytes don't form valid UTF-8 (for example, you pasted the Base64 of a JPEG or a ZIP file
      into the text box, not actual text), you'll see an "Invalid Base64 input" error instead of a
      garbled mess. That's intentional: silently rendering invalid text as replacement characters
      would hide the fact that you decoded the wrong kind of data. If the string you're holding is
      a binary file, not text, use the <strong>Base64 to File</strong> panel below instead — it
      decodes to raw bytes and gives you a download, rather than trying to read them as a string.
    </p>
    <h2>How the file panels differ from the text fields</h2>
    <p>
      <strong>File to Base64</strong> reads a file you pick as a <strong>data URL</strong> (via the
      browser's <strong>FileReader</strong> API), then strips everything before the comma — the{' '}
      <strong>data:image/png;base64,</strong> prefix describing the file's MIME type — leaving just
      the raw Base64 payload. <strong>Base64 to File</strong> runs that in reverse: it decodes the
      payload back into raw bytes with <strong>atob</strong> and a <strong>Uint8Array</strong>,
      detects the file type from either a <strong>data:</strong> prefix or the file's own leading
      bytes, and hands you a download — never attempting to interpret the bytes as characters at
      any point. Both are a different code path from the text fields above, on purpose: those
      round-trip through UTF-8 text and reject anything that isn't valid text, while the file panels
      work on raw bytes the whole way through. Landed here specifically to turn a Base64 string into
      a downloadable file? The <Link to="/base64-to-file">dedicated Base64 to File page</Link> has
      the same panel with a deeper walkthrough of filename and MIME-type detection.
    </p>
    <h2>Good to know</h2>
    <p>
      Every 3 bytes of input become 4 characters of Base64 output, so encoded text is roughly{' '}
      <strong>33% larger</strong> than the original. Decoding reverses this exactly — no data is
      lost in either direction. That overhead is also why Base64 is a poor choice for anything
      size-sensitive: embedding a large image as a data URI instead of linking to it as a separate
      file makes the page itself a third bigger, and unlike a linked file it can't be cached
      independently by the browser.
    </p>
    <h2>When not to use it</h2>
    <p>
      Skip Base64 if you actually need compression — it does the opposite, inflating size by about
      a third. Skip it for anything that needs to stay secret. And skip embedding large files as
      data URIs in CSS/HTML if the file is reused across pages; a normal linked file that the
      browser can cache separately will almost always perform better than a data URI baked
      directly into the markup.
    </p>
  </ToolInfoSection>
);

export default Base64Info;
