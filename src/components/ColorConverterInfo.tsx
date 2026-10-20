import ToolInfoSection from './ToolInfoSection';

const ColorConverterInfo = () => (
  <ToolInfoSection>
    <h2>HEX, RGB, HSL, and CMYK explained</h2>
    <ul>
      <li>
        <strong>HEX</strong> (e.g. <strong>#38bdf8</strong>) packs red, green, and blue into a
        6-digit base-16 code — the most common format in CSS and design tools.
      </li>
      <li>
        <strong>RGB</strong> expresses the same red/green/blue values as three numbers from 0–255
        — easier to reason about and animate programmatically than hex.
      </li>
      <li>
        <strong>HSL</strong> (Hue, Saturation, Lightness) describes color the way people
        intuitively think about it — useful for building color palettes or shade variations.
      </li>
      <li>
        <strong>CMYK</strong> (Cyan, Magenta, Yellow, Key/black) is a subtractive model used for
        print — screens emit light (RGB), printers lay down ink (CMYK), so print materials should
        be designed in CMYK to avoid color shifts.
      </li>
    </ul>
    <h2>A worked example</h2>
    <p>
      Take the CSS named color <strong>tomato</strong>, RGB (255, 99, 71). As hex, each channel
      converts to two base-16 digits: 255 → <strong>FF</strong>, 99 → <strong>63</strong>, 71 →{' '}
      <strong>47</strong>, giving <strong>#FF6347</strong>. For HSL: lightness is the midpoint of
      the highest and lowest channel — (255 + 71) / 2 / 255 ≈ <strong>64%</strong>. Saturation
      compares the spread between channels to that midpoint and works out to{' '}
      <strong>100%</strong> here, since red is fully saturated. Hue is derived from which channel
      is highest and by how much, landing at <strong>9°</strong> — just past pure red (0°) toward
      orange. So the same color is <strong>hsl(9, 100%, 64%)</strong>. Converting to CMYK: since
      red is already maxed out, cyan and key (black) both come out at{' '}
      <strong>0%</strong>; magenta and yellow absorb the gap between the other two channels and
      red, landing around <strong>61% magenta, 72% yellow</strong>.
    </p>
    <p>
      A second example, closer to home: this site's own accent color is{' '}
      <strong>#0891B2</strong> — RGB (8, 145, 178). Run it through the same math and you get{' '}
      <strong>hsl(192, 91%, 36%)</strong>: a deeply saturated, moderately dark blue-cyan, which is
      exactly why it reads as a strong accent against a near-black background rather than washing
      out. In CMYK it's roughly <strong>96% cyan, 19% magenta, 0% yellow, 30% key</strong> — heavy
      on cyan ink, as the name on the hex code already gives away.
    </p>
    <h2>When to use which</h2>
    <p>
      Use <strong>HEX</strong> or <strong>RGB</strong> for anything on a screen (websites, apps,
      UI design), <strong>HSL</strong> when you need to programmatically generate related shades,
      and <strong>CMYK</strong> only when preparing artwork for physical printing.
    </p>
    <h2>Mistakes people make</h2>
    <ul>
      <li>
        <strong>Trusting on-screen CMYK as final print color.</strong> RGB→CMYK conversion is
        mathematically well-defined, but it's a simplified model that doesn't know anything about
        the specific inks, paper stock, or printer your job will actually run on. Professional
        print output relies on an ICC color profile supplied by the print shop, not a generic
        formula — treat this tool's CMYK numbers as a reasonable starting estimate for design
        work, not a substitute for asking your printer what profile to use.
      </li>
      <li>
        <strong>Confusing lightness with perceived brightness.</strong> HSL lightness is a
        mathematical midpoint of the RGB channels, not how bright a color actually looks to the
        eye. A fully saturated yellow and a fully saturated blue can share the same 50% lightness
        value in HSL while looking dramatically different in perceived brightness — don't assume
        equal lightness means equal visual weight.
      </li>
      <li>
        <strong>Forgetting shorthand hex exists.</strong> A 3-digit hex code like{' '}
        <strong>#0f0</strong> is shorthand for <strong>#00ff00</strong> — each digit is doubled,
        not padded with a zero. This converter accepts both forms.
      </li>
      <li>
        <strong>Expecting alpha/transparency support.</strong> This converter works with fully
        opaque colors only — it doesn't handle an alpha channel (as in 8-digit hex{' '}
        <strong>#RRGGBBAA</strong>, or <strong>rgba()</strong>/<strong>hsla()</strong>). If your
        source color has a transparency component, convert the opaque part here and apply the
        alpha value separately in your CSS.
      </li>
    </ul>
    <h2>Why CMYK is only ever an approximation here</h2>
    <p>
      RGB is additive (screens start from black and add light) and CMYK is subtractive (paper
      starts white and ink is subtracted from it), so there's no single universal formula that
      converts perfectly between them — the "right" conversion depends on the specific inks and
      paper involved. This tool uses the standard naive conversion (deriving K from the darkest
      channel, then C/M/Y from what's left), which is accurate enough for previewing how a color
      leans in print, but a real print run color-matched against a screen design should go through
      your printer's actual ICC profile, not a generic RGB→CMYK formula. It's also why CMYK is the
      one format here that doesn't round-trip cleanly: converting HEX → RGB → HSL → HEX returns
      exactly where you started, since those three are equivalent descriptions of the same
      additive color, but HEX → CMYK → HEX can land a shade off, especially for very dark or
      desaturated colors, because the CMYK step isn't a lossless reformatting of the same numbers.
    </p>
    <h2>When not to use it</h2>
    <p>
      Skip this tool for anything requiring perceptually uniform color spaces (like LAB or
      OKLCH) used in advanced design-system tooling — HSL is intuitive but not perceptually
      uniform, meaning equal steps in hue or lightness don't always look like equal visual steps.
    </p>
  </ToolInfoSection>
);

export default ColorConverterInfo;
