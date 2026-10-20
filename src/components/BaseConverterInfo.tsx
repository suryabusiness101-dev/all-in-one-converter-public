import { Link } from 'react-router-dom';
import ToolInfoSection from './ToolInfoSection';

const BaseConverterInfo = () => (
  <ToolInfoSection>
    <h2>Number bases explained</h2>
    <p>
      A number base (or "radix") is how many unique digits a number system uses before it carries
      over to the next place value. <strong>Binary</strong> (base 2) uses only 0 and 1;{' '}
      <strong>octal</strong> (base 8) uses 0–7; <strong>decimal</strong> (base 10, what humans use
      day-to-day) uses 0–9; and <strong>hexadecimal</strong> (base 16) uses 0–9 plus A–F, where
      A=10 through F=15.
    </p>
    <h2>A worked example</h2>
    <p>
      Take the decimal number <strong>255</strong>. In binary it's{' '}
      <strong>11111111</strong> — eight 1-bits, which is also why 255 is the largest value a
      single unsigned byte can hold. In hex it's <strong>FF</strong> (15 × 16 + 15 = 255), and in
      octal it's <strong>377</strong> (3 × 64 + 7 × 8 + 7 = 255). This is the same value in every
      row of this converter at once — only the representation changes, not the quantity.
    </p>
    <p>
      To convert decimal to binary by hand, repeatedly divide by 2 and read the remainders
      bottom-to-top: 43 ÷ 2 = 21 r <strong>1</strong>, 21 ÷ 2 = 10 r <strong>1</strong>, 10 ÷ 2 = 5
      r <strong>0</strong>, 5 ÷ 2 = 2 r <strong>1</strong>, 2 ÷ 2 = 1 r <strong>0</strong>, 1 ÷ 2 =
      0 r <strong>1</strong>. Read the remainders bottom to top: <strong>101011</strong>. Hex
      works the same way but dividing by 16, which is also why hex is popular for anything
      byte-oriented — each hex digit maps cleanly onto exactly 4 bits, so a full byte is always
      exactly 2 hex digits (0x00–0xFF), with no rounding or partial digits involved.
    </p>
    <h2>Where this comes up</h2>
    <ul>
      <li>Hex is used for memory addresses, color codes, and byte-level debugging</li>
      <li>Binary is the native representation computers use for everything internally</li>
      <li>Octal shows up in Unix file permission notation (e.g. <strong>chmod 755</strong>)</li>
    </ul>
    <p>
      Reading a hex value as a set of individual bits — a permission bitmask, a combined flag value,
      a subnet mask, an aligned memory address — is its own skill beyond straight base conversion;
      see the <Link to="/hex-to-binary-bitmask">bitmask and memory-address guide</Link> for worked
      examples of each.
    </p>
    <h2>Mistakes people make</h2>
    <ul>
      <li>
        <strong>Pasting a prefixed value into another tool without stripping it.</strong> This
        converter accepts plain digits per field — it doesn't expect you to type{' '}
        <strong>0x</strong> or <strong>0b</strong> yourself. But other tools (most programming
        languages) require that prefix, so copying a raw hex digit string like{' '}
        <strong>1A3</strong> into code as a literal will be read as decimal 1,300 unless you add{' '}
        <strong>0x</strong> back — a classic source of silent bugs.
      </li>
      <li>
        <strong>Confusing the letter O and digit 0, or l and 1, in hex.</strong> Hex only ever
        uses digits 0–9 and letters A–F — there's no letter O or G in a valid hex string, so a
        stray O usually means someone fat-fingered a zero.
      </li>
      <li>
        <strong>Leading zeros implying octal in some languages.</strong> In JavaScript's older
        non-strict mode and in Python 2, a literal like <strong>055</strong> in source code was
        silently interpreted as octal (= 45 in decimal), not decimal 55 — a well-known footgun.
        Modern JavaScript requires an explicit <strong>0o</strong> prefix for octal literals to
        avoid exactly this ambiguity, which is worth knowing if you're moving a value from this
        converter into code.
      </li>
      <li>
        <strong>Expecting fixed width.</strong> This converter shows the shortest representation
        with no leading zeros, so decimal 5 shows as binary <strong>101</strong>, not{' '}
        <strong>00000101</strong>. If you need a specific bit width (e.g. an 8-bit byte or 32-bit
        word for a bitmask), you'll need to pad it yourself — the mathematical value doesn't
        change, but leading zeros matter when a fixed-width field or register is involved.
      </li>
    </ul>
    <h2>Why the result stays exact</h2>
    <p>
      This converter uses JavaScript's <strong>BigInt</strong> under the hood instead of the
      regular <strong>Number</strong> type. Regular JavaScript numbers are IEEE-754 doubles, which
      can only represent integers exactly up to 2⁵³ − 1 (9,007,199,254,740,991,{' '}
      <strong>Number.MAX_SAFE_INTEGER</strong>). Beyond that, adjacent integers start rounding to
      the same floating-point value — for example, 2⁵³ and 2⁵³ + 1 are indistinguishable as
      regular JS numbers. A 64-bit hex value like <strong>0xFFFFFFFFFFFFFFFF</strong> is nowhere
      near representable as a standard number without losing precision. BigInt has no such ceiling
      — it grows to however many digits the value actually needs — so this converter stays exact
      for values of any size, not just ones that happen to fit in 53 bits.
    </p>
    <h2>When not to use it</h2>
    <p>
      This converter treats every value as a non-negative (unsigned) integer — it has no concept
      of sign. Computers don't store a minus sign next to a number; negative integers are
      represented with <strong>two's complement</strong>, where the same bit pattern means
      different things depending on whether it's read as signed or unsigned (an 8-bit byte of all
      1s, <strong>11111111</strong>, is <strong>255</strong> unsigned but <strong>−1</strong>{' '}
      signed). This converter won't reproduce that — a value here that doesn't match what a
      debugger or a language's signed integer type shows for what looks like the same number is
      exactly this gap. It also isn't the right tool for decoding IEEE-754 floating-point bit
      patterns, where the same 32 or 64 bits represent a completely different kind of value than a
      plain integer. For those, you need a tool built for that specific encoding, not a base
      converter.
    </p>
  </ToolInfoSection>
);

export default BaseConverterInfo;
