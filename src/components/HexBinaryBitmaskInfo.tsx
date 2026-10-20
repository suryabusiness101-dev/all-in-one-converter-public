import { Link } from 'react-router-dom';
import ToolInfoSection from './ToolInfoSection';

const HexBinaryBitmaskInfo = () => (
  <ToolInfoSection>
    <h2>Why hex and binary matter together here</h2>
    <p>
      A single hex digit is exactly 4 bits — no rounding, no partial digit — so hex is really just a
      compact way of writing binary down without a wall of 1s and 0s. That's why permission flags,
      network masks, and memory addresses are almost always shown in hex: the value you're reading
      is really a pattern of individual bits, and hex is the shorthand, not a different kind of
      number. Converting between the two on the{' '}
      <Link to="/base-converter">main base converter</Link> is how you get from the shorthand back
      to the bits you actually need to read.
    </p>
    <h2>Reading a combined flag value</h2>
    <p>
      Unix's <strong>open()</strong> file flags are a real example: <strong>O_WRONLY</strong> is
      octal <strong>1</strong>, <strong>O_CREAT</strong> is octal <strong>100</strong> (decimal 64),
      and <strong>O_TRUNC</strong> is octal <strong>1000</strong> (decimal 512) — each one a single
      bit, chosen so they never overlap. Combine all three (write-only, create if missing, truncate
      if it exists) and you get octal <strong>1101</strong>, decimal <strong>577</strong>, hex{' '}
      <strong>0x241</strong>, binary <strong>1001000001</strong>. Enter <strong>241</strong> in the
      hex field and the binary field shows exactly which bits are set — the 1s at positions 0, 6,
      and 9 correspond to those three flags, and everything in between is 0 because nothing else was
      combined in. That's the whole technique: convert the combined value to binary, then match each
      1-bit back to the flag it represents.
    </p>
    <h2>Reading a subnet mask</h2>
    <p>
      A subnet mask like <strong>255.255.255.0</strong> is four separate 8-bit values, but stacked
      together as one 32-bit number it's <strong>0xFFFFFF00</strong> — binary{' '}
      <strong>11111111 11111111 11111111 00000000</strong>. Count the leading 1-bits and you get the
      CIDR prefix length people write as <strong>/24</strong>: 24 consecutive 1s marking the network
      portion of an address, followed by 8 zero-bits for the host portion. Typing{' '}
      <strong>FFFFFF00</strong> into the hex field and reading off the binary is a faster way to
      confirm a CIDR prefix than counting through four decimal octets by hand.
    </p>
    <h2>Memory addresses and alignment</h2>
    <p>
      Hex's clean 4-bit-per-digit grouping also makes alignment visible at a glance. The address{' '}
      <strong>0x1000</strong> is <strong>4096</strong> in decimal — binary{' '}
      <strong>1</strong> followed by twelve 0s — and those three trailing zero hex digits are exactly
      why it's a common page-aligned address: a value is aligned to 4096 bytes precisely when its
      lowest three hex digits are all zero. Debuggers and allocators print addresses in hex
      specifically so alignment like this reads directly off the digits, without anyone having to
      convert to binary and count zero-bits by hand first.
    </p>
    <h2>When not to use it</h2>
    <p>
      This converter shows the arithmetic value of a number, not how it's laid out in memory. A
      4-byte hex value like <strong>0x12345678</strong> is stored, on a little-endian system (x86
      and ARM in their default mode), as the bytes <strong>78 56 34 12</strong> — reversed at the
      byte level, though the bits inside each byte stay in order. If you're reading a hex dump or a
      packet capture and need to know which byte came first on the wire or in RAM, that's a fact
      about the format you're reading, not something the arithmetic conversion here will tell you.
      It also doesn't perform bitwise operations — no live AND, OR, or XOR between two values — it
      only converts a single number between bases; combining flags like the open() example above is
      still addition (or OR, equivalently, since the bits don't overlap) you do yourself before
      typing the result in.
    </p>
  </ToolInfoSection>
);

export default HexBinaryBitmaskInfo;
