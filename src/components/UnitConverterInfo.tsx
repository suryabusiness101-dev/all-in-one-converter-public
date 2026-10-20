import ToolInfoSection from './ToolInfoSection';

const UnitConverterInfo = () => (
  <ToolInfoSection>
    <h2>Common conversions at a glance</h2>
    <ul>
      <li><strong>1 mile</strong> = 1.609344 kilometers</li>
      <li><strong>1 inch</strong> = 2.54 centimeters</li>
      <li><strong>1 kilogram</strong> = 2.20462 pounds</li>
      <li><strong>0°C</strong> = 32°F = 273.15 K</li>
      <li><strong>1 acre</strong> = 4,046.86 square meters</li>
      <li><strong>1 US gallon</strong> = 3.785411784 liters</li>
      <li><strong>1 atmosphere</strong> = 101,325 pascals = 14.696 PSI</li>
      <li><strong>1 horsepower</strong> = 745.7 watts</li>
      <li><strong>1 pound-foot</strong> = 1.3558 newton-meters</li>
      <li><strong>1 gram/cm³</strong> = 1,000 kilograms/m³</li>
    </ul>
    <h2>Worked examples</h2>
    <p>
      <strong>Temperature:</strong> 100°F to Celsius is (100 − 32) × 5⁄9 ={' '}
      <strong>37.78°C</strong> — a comfortable warm bath, not boiling water (which is 212°F /
      100°C). <strong>Length:</strong> 5 miles is 5 × 1.609344 ={' '}
      <strong>8.04672 km</strong>. <strong>Volume:</strong> 2 US gallons is 2 × 3.785411784 ={' '}
      <strong>7.570823568 liters</strong> — carried out to nine decimal places because the
      constant itself is defined to that precision, not because the answer needs to be read that
      precisely.
    </p>
    <h2>Why the numbers are exact</h2>
    <p>
      Every conversion here uses the internationally defined exact constant for that unit pair
      (for example, the inch is legally defined as exactly 0.0254 meters, and the pound as exactly
      0.45359237 kilograms), not a rounded approximation — so chained conversions stay accurate
      instead of drifting. This matters more than it sounds: round a constant to 4 decimal places,
      convert a value through it twice, and the error compounds. Using the defined exact figure
      means converting a value to another unit and back always returns exactly the number you
      started with.
    </p>
    <h2>Mistakes people make</h2>
    <ul>
      <li>
        <strong>Applying the temperature formula to a temperature difference.</strong> Converting
        an absolute reading of 100°F to Celsius uses (F − 32) × 5⁄9. But converting a{' '}
        <strong>change</strong> of 10°C to Fahrenheit is not (10 − 32) × 9⁄5 — that formula is only
        valid for absolute readings, because the −32 offset cancels out when you're talking about
        a delta rather than a point. A 10°C rise is an 18°F rise (10 × 9⁄5, no offset), not the
        nonsensical negative number the absolute formula would produce. This category is the one
        exception in this converter where the relationship is affine (multiply-and-shift) rather
        than a pure ratio — worth remembering before reusing the formula for a difference instead
        of a reading.
      </li>
      <li>
        <strong>Assuming "gallon" means the same thing everywhere.</strong> This converter uses
        the <strong>US liquid gallon</strong> (3.785411784 L). The UK imperial gallon is a
        different, larger unit (≈4.546 L) — about 20% more. The same ambiguity applies to pints
        and fluid ounces. If a recipe, spec sheet, or fuel-economy figure doesn't say which
        gallon it means, check the source country before trusting a conversion.
      </li>
      <li>
        <strong>1000 vs. 1024 in digital storage.</strong> This converter's KB/MB/GB use the
        binary convention (1 KB = 1,024 bytes, 1 MB = 1,024 KB), matching what Windows/macOS file
        browsers show — not the SI decimal convention (1 KB = 1,000 bytes) that storage
        manufacturers use on product packaging, or the formal <strong>KiB/MiB/GiB</strong> naming
        that unambiguously means binary. That's a real, well-known discrepancy: it's why a drive
        sold as "1 TB" shows up as roughly 931 GB in your OS — same physical capacity, two
        different counting conventions for the same word.
      </li>
      <li>
        <strong>Statute miles vs. nautical miles.</strong> The mile in this converter (1,609.344
        m, used for Length and Speed) is the standard statute mile used on land. A nautical mile —
        used in aviation and marine navigation — is a different unit (1,852 m exactly), about 15%
        longer. Converting a flight or shipping distance with the wrong "mile" will be off by that
        margin.
      </li>
      <li>
        <strong>Food "Calories" are actually kilocalories.</strong> A nutrition label's "230
        Calories" is 230 <strong>kilocalories</strong> — capital C is the food-science convention
        for kcal, not the small-c calorie used in chemistry and physics. Converting food energy
        needs the Kilocalories unit in this converter's Energy category, not Calories: 500 kcal
        converts to 2,092 kJ (500 × 4.184), not 2.092 kJ.
      </li>
      <li>
        <strong>Losing precision by rounding mid-chain.</strong> If you convert a value to a
        rounded intermediate unit and then convert that rounded figure again, error accumulates.
        Convert directly from source unit to target unit in one step whenever possible instead of
        chaining through a manually rounded midpoint.
      </li>
    </ul>
    <h2>When not to use this converter</h2>
    <p>
      This is a fixed-ratio and fixed-offset unit converter — it isn't the right tool for anything
      whose "exchange rate" changes over time or by context. <strong>Currency</strong> isn't a
      physical unit with a constant ratio, so it isn't included here and shouldn't be treated like
      one. Density figures for real substances (as opposed to the density unit conversion itself)
      vary with temperature and purity — this tool converts <strong>between density units</strong>{' '}
      correctly, but doesn't know the density of any specific material.
    </p>
    <h2>Categories supported</h2>
    <p>
      This converter covers Length, Weight, Temperature, Speed, Digital Storage, Area, Volume,
      Pressure, Energy, Angle, Time, Density, Power, and Torque. Switch between them with the tabs
      above — the same convert-as-you-type behavior and exact constants apply to every category.
    </p>
  </ToolInfoSection>
);

export default UnitConverterInfo;
