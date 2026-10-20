import { Link } from 'react-router-dom';
import { routeSeoList, homeSeo } from '../lib/seoConfig';
import { faqs } from '../lib/faqData';
import PageSeo from './PageSeo';
import JsonLd from './JsonLd';
import ToolInfoSection from './ToolInfoSection';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const Home = () => (
  <div className="w-full">
    <PageSeo {...homeSeo} />
    <JsonLd id="faq-jsonld" data={faqJsonLd} />
    <header className="mb-8 md:mb-12 max-w-3xl">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-3">
        Free &amp; Client-Side
      </h2>
      <h1 className="text-3xl sm:text-4xl font-light text-slate-100 light:text-slate-900 mb-4">
        All the converters you need, in one fast, clean toolkit.
      </h1>
      <p className="text-slate-400 light:text-slate-600">
        Every tool below runs entirely in your browser — your input never leaves your device.
        Pick a converter to get started.
      </p>
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {routeSeoList.map((r) => (
        <Link
          key={r.path}
          to={r.path}
          className="group block rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] light:bg-white light:border-slate-200 light:hover:border-cyan-400"
        >
          <h3 className="text-lg font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors light:text-slate-900">
            {r.navLabel}
          </h3>
          <p className="mt-1 text-sm text-slate-400 light:text-slate-600">{r.tagline}</p>
        </Link>
      ))}
    </div>

    <ToolInfoSection>
      <h2>A Free Online Converter for Every Everyday Task</h2>
      <p>
        Need to convert something quickly? ConvertGrove is a fast, distraction-free toolkit that
        handles the small conversions people run into every day, from unit conversion and Base64
        encoding to timestamp math and color codes. Instead of hunting across five different
        single-purpose sites, you get one consistent, clean interface — dark by default, light if
        you prefer it. Every tool below updates as you type, so you convert once and read the
        result immediately, with nothing interrupting the actual conversion and no server
        round-trip slowing it down.
      </p>

      <h2>A Unit Converter That Covers the Whole Toolbox</h2>
      <p>
        The Smart Unit Converter covers fourteen categories — length, weight, area, temperature,
        speed, volume, pressure, energy, digital storage, angle, time, density, power, and torque
        — switchable with one click instead of hunting down a separate calculator for each. It's
        built for the moment you're mid-task and just need an answer: converting a recipe from
        grams to cups, checking whether a shipment is under a weight limit in kilograms or
        pounds, sizing a room in square feet versus square meters, or converting a torque spec for
        a wrench that's marked in different units than the manual. Every category uses the
        internationally defined exact constant for that unit pair rather than a rounded
        approximation, so results stay accurate even after converting a value more than once in a
        row.
      </p>

      <h2>Base64 Encoder and Decoder</h2>
      <p>
        The Base64 Encoder/Decoder handles both text and files: drag a file in, paste text, or
        type directly, and it encodes or decodes instantly. It's the tool you reach for when
        debugging an API payload, embedding a small image as a data URI, or decoding a token —
        there's no upload step, because the encoding happens entirely in your browser.
      </p>

      <h2>Binary, Octal, Decimal &amp; Hex Converter</h2>
      <p>
        The Base Converter handles the other kind of "base" conversion — numbers, not text. Type
        a value in binary, octal, decimal, or hexadecimal and see it converted into the other
        three instantly, with BigInt precision so arbitrarily large integers stay exact instead of
        silently losing digits. It's a quick way to check a hex color value, a bitmask, or a
        memory address without opening a calculator app.
      </p>

      <h2>Epoch Time Converter and Timezone Tool</h2>
      <p>
        The Timezone &amp; Epoch Converter does two things: convert a date and time from one
        timezone to another — say 3 PM in Mumbai to what that is in Chicago — and convert between
        a Unix timestamp and a local date and time in either direction. Both handle daylight
        saving time correctly, including flagging clock times that don't exist because of a
        spring-forward gap. A live world clock and your pinned zones sit below the converter for a
        glance at several timezones at once, useful if you work with logs, cron schedules, or
        APIs that return raw epoch values instead of formatted dates.
      </p>

      <h2>Color Harmonizer</h2>
      <p>
        The Color Harmonizer converts colors between HEX, RGB, HSL, and CMYK with a live swatch
        so you can see the result as you adjust it. It's aimed at designers and developers who
        need to move a color between a design tool, CSS, and a print spec without doing the math
        by hand.
      </p>

      <h2>Built for Speed</h2>
      <p>
        Every converter on ConvertGrove runs client-side: your text, files, and numbers are
        processed in your browser and never uploaded anywhere, and each tool is lazy-loaded so
        you only download the code for the page you're on. That's what makes
        convert-as-you-type possible everywhere on the site, from the unit converter to the color
        harmonizer. Bookmark the tool you use most, or start from the list above and pick
        whichever converter matches what you need to get done right now.
      </p>
    </ToolInfoSection>

    <section className="mt-12 pt-8 border-t border-slate-800 light:border-slate-200 max-w-3xl">
      <h2 className="text-xl font-semibold text-slate-100 light:text-slate-900 mb-4">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((item) => (
          <details
            key={item.q}
            className="group rounded-lg border border-slate-800 bg-slate-900/60 p-4 light:bg-white light:border-slate-200"
          >
            <summary className="cursor-pointer font-medium text-slate-200 light:text-slate-800 marker:text-cyan-400">
              {item.q}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-400 light:text-slate-600">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  </div>
);

export default Home;
