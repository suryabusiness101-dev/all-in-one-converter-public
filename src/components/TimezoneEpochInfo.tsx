import ToolInfoSection from './ToolInfoSection';

const TimezoneEpochInfo = () => (
  <ToolInfoSection>
    <h2>What is Unix epoch time?</h2>
    <p>
      Unix epoch time (also called "Unix time" or a "timestamp") is the number of seconds that
      have elapsed since <strong>January 1, 1970, 00:00:00 UTC</strong> — the "epoch." It's a
      single, timezone-independent number, which is why databases, APIs, and server logs almost
      universally store timestamps this way instead of a formatted date string.
    </p>
    <h2>Worked examples</h2>
    <p>
      Epoch <strong>0</strong> is 1970-01-01T00:00:00 UTC, by definition. Epoch{' '}
      <strong>1,000,000,000</strong> — one billion seconds later — lands on{' '}
      <strong>2001-09-09T01:46:40 UTC</strong>, a moment some engineers marked at the time as the
      "billennium." Both are useful sanity checks: if you convert a timestamp and land somewhere
      wildly outside the range you expected, the input was probably in the wrong unit or the wrong
      timezone was assumed.
    </p>
    <p>
      For zone-to-zone conversion: <strong>15:00 in New York during daylight saving
      time</strong> is UTC−4, so that's <strong>19:00 UTC</strong>. Kolkata is UTC+5:30 year-round
      (India doesn't observe DST), so add 5 hours 30 minutes: <strong>00:30 the next
      day</strong> in Kolkata. Two things trip people up in that single conversion: the offset
      isn't a whole number of hours, and the date itself rolls over — 3 PM in New York is already
      past midnight the following day in India. A converter that only shows the time and not the
      date will silently give you the wrong day.
    </p>
    <h2>Seconds vs. milliseconds — the 1000× mistake</h2>
    <p>
      Unix epoch time is defined in <strong>seconds</strong>, but JavaScript's{' '}
      <strong>Date.now()</strong> and many web APIs return epoch{' '}
      <strong>milliseconds</strong> instead. The fields on this page expect seconds. As a rule of
      thumb, current epoch seconds is a 10-digit number; current epoch milliseconds is 13 digits.
      Pasting a 13-digit millisecond value into a seconds field doesn't error — it just computes a
      date roughly 1,000× further in the future, landing thousands of years out. If a "seconds"
      timestamp you're converting resolves to a date decades or centuries away from what you
      expected, check whether the source actually gave you milliseconds.
    </p>
    <h2>Common mistakes</h2>
    <ul>
      <li>
        <strong>Treating an abbreviation as unambiguous.</strong> <strong>IST</strong> alone could
        mean India, Ireland, or Israel Standard Time; <strong>CST</strong> could mean US Central,
        China, or Cuba. This tool's zone search shows the country alongside every match so you can
        tell them apart — always confirm the country, not just the three letters.
      </li>
      <li>
        <strong>Assuming a US zone has one fixed UTC offset.</strong> "Eastern Time" is UTC−5 in
        winter (EST) and UTC−4 in summer (EDT) — a full hour of difference depending on the date.
        Hardcoding "Eastern = UTC−5" is a common source of off-by-one-hour bugs for roughly eight
        months of the year.
      </li>
      <li>
        <strong>Forgetting the date can shift.</strong> As shown in the New York → Kolkata example
        above, a large positive offset can push the result into the next calendar day, and a large
        negative one can push it into the previous day. Always check the date, not just the clock
        time.
      </li>
    </ul>
    <h2>DST correctness and the March-forward gap</h2>
    <p>
      Twice a year, clocks in DST-observing regions either skip an hour forward or fold an hour
      back. Converting a wall-clock time to an absolute instant correctly requires a two-pass
      resolution: compute the zone's offset for the requested date, apply it, then recompute the
      offset at the resulting instant and adjust if it changed — a naive single-pass calculation
      can be an hour wrong right around a transition. On <strong>March 8, 2026</strong>, clocks in
      most of the US spring forward at 2:00 AM directly to 3:00 AM, so the wall-clock time{' '}
      <strong>2:30 AM</strong> that day simply doesn't exist in that zone. This tool detects that
      case and shows a warning instead of silently returning a wrong or misleading answer.
    </p>
    <h2>Why not just use a date string?</h2>
    <p>
      A raw number is unambiguous and easy to compare, sort, or do arithmetic on — no parsing,
      no locale formatting issues, and no ambiguity about which timezone was intended. It only
      becomes a human-readable date at the moment it's displayed, which is exactly what this
      converter does in both directions.
    </p>
    <h2>When not to use it</h2>
    <p>
      This tool converts a single point in time correctly for today's timezone rules — it isn't a
      substitute for a calendar/scheduling tool when you need a <strong>recurring</strong> meeting
      to land at the same local time every week. A weekly call scheduled from a US zone to an
      Indian one will appear to shift by an hour, twice a year, whenever only one of the two
      countries changes its clocks — each occurrence needs to be checked individually, which is
      what dedicated calendar software (not a one-off converter) is built to handle. It also isn't
      built for historical dates before a region's currently-known timezone rules took effect;
      political changes to a country's offset or DST policy are only as accurate as the underlying
      browser's timezone database.
    </p>
    <h2>World clock</h2>
    <p>
      The pinned-zones list below the converter keeps a running clock for the zones you use most,
      saved to this device, useful for a quick glance without re-running a conversion.
    </p>
  </ToolInfoSection>
);

export default TimezoneEpochInfo;
