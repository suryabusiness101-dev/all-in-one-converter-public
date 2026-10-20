import type { UnitDef } from '../components/UnitConverterCard';

// Base unit: meters. Constants are exact (1 in = 0.0254 m, 1 ft = 0.3048 m, 1 mi = 1609.344 m).
export const lengthUnits: UnitDef[] = [
  { key: 'meters', label: 'Meters', toBase: (v) => v, fromBase: (v) => v },
  { key: 'centimeters', label: 'Centimeters', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
  { key: 'kilometers', label: 'Kilometers', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  { key: 'inches', label: 'Inches', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
  { key: 'feet', label: 'Feet', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  { key: 'miles', label: 'Miles', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
];

// Base unit: kilograms. Constants are exact (1 lb = 0.45359237 kg, 1 oz = 1/16 lb).
export const weightUnits: UnitDef[] = [
  { key: 'kilograms', label: 'Kilograms', toBase: (v) => v, fromBase: (v) => v },
  { key: 'grams', label: 'Grams', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { key: 'pounds', label: 'Pounds', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
  { key: 'ounces', label: 'Ounces', toBase: (v) => v * 0.028349523125, fromBase: (v) => v / 0.028349523125 },
];

// Base unit: Celsius.
export const temperatureUnits: UnitDef[] = [
  { key: 'celsius', label: 'Celsius (°C)', toBase: (v) => v, fromBase: (v) => v },
  { key: 'fahrenheit', label: 'Fahrenheit (°F)', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
  { key: 'kelvin', label: 'Kelvin (K)', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
];

// Base unit: meters per second.
export const speedUnits: UnitDef[] = [
  { key: 'mps', label: 'Meters/sec', toBase: (v) => v, fromBase: (v) => v },
  { key: 'kmh', label: 'Km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
  { key: 'mph', label: 'Miles/h', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
  { key: 'knots', label: 'Knots', toBase: (v) => v * 0.5144444444, fromBase: (v) => v / 0.5144444444 },
];

// Base unit: bytes (binary multiples of 1024, matching OS file-size convention).
export const digitalStorageUnits: UnitDef[] = [
  { key: 'bytes', label: 'Bytes', toBase: (v) => v, fromBase: (v) => v },
  { key: 'kb', label: 'Kilobytes (KB)', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
  { key: 'mb', label: 'Megabytes (MB)', toBase: (v) => v * 1024 ** 2, fromBase: (v) => v / 1024 ** 2 },
  { key: 'gb', label: 'Gigabytes (GB)', toBase: (v) => v * 1024 ** 3, fromBase: (v) => v / 1024 ** 3 },
];

// Base unit: square meters. Constants are exact.
export const areaUnits: UnitDef[] = [
  { key: 'sqmeters', label: 'Square Meters', toBase: (v) => v, fromBase: (v) => v },
  { key: 'sqkilometers', label: 'Square Kilometers', toBase: (v) => v * 1_000_000, fromBase: (v) => v / 1_000_000 },
  { key: 'hectares', label: 'Hectares', toBase: (v) => v * 10_000, fromBase: (v) => v / 10_000 },
  { key: 'sqfeet', label: 'Square Feet', toBase: (v) => v * 0.09290304, fromBase: (v) => v / 0.09290304 },
  { key: 'sqyards', label: 'Square Yards', toBase: (v) => v * 0.83612736, fromBase: (v) => v / 0.83612736 },
  { key: 'acres', label: 'Acres', toBase: (v) => v * 4046.8564224, fromBase: (v) => v / 4046.8564224 },
  { key: 'sqmiles', label: 'Square Miles', toBase: (v) => v * 2_589_988.110336, fromBase: (v) => v / 2_589_988.110336 },
];

// Base unit: liters. Constants are exact (US customary volume units).
export const volumeUnits: UnitDef[] = [
  { key: 'liters', label: 'Liters', toBase: (v) => v, fromBase: (v) => v },
  { key: 'milliliters', label: 'Milliliters', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { key: 'cubicmeters', label: 'Cubic Meters', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  { key: 'cubicfeet', label: 'Cubic Feet', toBase: (v) => v * 28.316846592, fromBase: (v) => v / 28.316846592 },
  { key: 'usgallons', label: 'US Gallons', toBase: (v) => v * 3.785411784, fromBase: (v) => v / 3.785411784 },
  { key: 'usquarts', label: 'US Quarts', toBase: (v) => v * 0.946352946, fromBase: (v) => v / 0.946352946 },
  { key: 'uscups', label: 'US Cups', toBase: (v) => v * 0.2365882365, fromBase: (v) => v / 0.2365882365 },
  { key: 'usfluidounces', label: 'US Fluid Ounces', toBase: (v) => v * 0.0295735295625, fromBase: (v) => v / 0.0295735295625 },
];

// Base unit: pascals. Constants are exact.
export const pressureUnits: UnitDef[] = [
  { key: 'pascals', label: 'Pascals', toBase: (v) => v, fromBase: (v) => v },
  { key: 'kilopascals', label: 'Kilopascals', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  { key: 'bar', label: 'Bar', toBase: (v) => v * 100_000, fromBase: (v) => v / 100_000 },
  { key: 'psi', label: 'PSI', toBase: (v) => v * 6894.757293168, fromBase: (v) => v / 6894.757293168 },
  { key: 'atm', label: 'Atmospheres', toBase: (v) => v * 101_325, fromBase: (v) => v / 101_325 },
  { key: 'mmhg', label: 'mmHg (Torr)', toBase: (v) => v * 133.322387415, fromBase: (v) => v / 133.322387415 },
];

// Base unit: joules. Constants are exact (thermochemical calorie).
export const energyUnits: UnitDef[] = [
  { key: 'joules', label: 'Joules', toBase: (v) => v, fromBase: (v) => v },
  { key: 'kilojoules', label: 'Kilojoules', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  { key: 'calories', label: 'Calories (cal)', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
  { key: 'kilocalories', label: 'Kilocalories (kcal)', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
  { key: 'watthours', label: 'Watt-hours', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
  { key: 'kilowatthours', label: 'Kilowatt-hours', toBase: (v) => v * 3_600_000, fromBase: (v) => v / 3_600_000 },
  { key: 'btu', label: 'BTU', toBase: (v) => v * 1055.05585262, fromBase: (v) => v / 1055.05585262 },
];

// Base unit: degrees. Constants are exact.
export const angleUnits: UnitDef[] = [
  { key: 'degrees', label: 'Degrees (°)', toBase: (v) => v, fromBase: (v) => v },
  { key: 'radians', label: 'Radians', toBase: (v) => (v * 180) / Math.PI, fromBase: (v) => (v * Math.PI) / 180 },
  { key: 'gradians', label: 'Gradians', toBase: (v) => v * 0.9, fromBase: (v) => v / 0.9 },
  { key: 'turns', label: 'Turns', toBase: (v) => v * 360, fromBase: (v) => v / 360 },
];

// Base unit: seconds. Constants are exact.
export const timeUnits: UnitDef[] = [
  { key: 'seconds', label: 'Seconds', toBase: (v) => v, fromBase: (v) => v },
  { key: 'minutes', label: 'Minutes', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
  { key: 'hours', label: 'Hours', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
  { key: 'days', label: 'Days', toBase: (v) => v * 86_400, fromBase: (v) => v / 86_400 },
  { key: 'weeks', label: 'Weeks', toBase: (v) => v * 604_800, fromBase: (v) => v / 604_800 },
];

// Base unit: kilograms per cubic meter. Constants are exact.
export const densityUnits: UnitDef[] = [
  { key: 'kgm3', label: 'Kilograms/m³', toBase: (v) => v, fromBase: (v) => v },
  { key: 'gcm3', label: 'Grams/cm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  { key: 'gml', label: 'Grams/mL', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  { key: 'lbft3', label: 'Pounds/ft³', toBase: (v) => v * 16.01846337396, fromBase: (v) => v / 16.01846337396 },
  { key: 'lbgal', label: 'Pounds/US gal', toBase: (v) => v * 119.826427317, fromBase: (v) => v / 119.826427317 },
];

// Base unit: watts. Constants are exact (mechanical horsepower).
export const powerUnits: UnitDef[] = [
  { key: 'watts', label: 'Watts', toBase: (v) => v, fromBase: (v) => v },
  { key: 'kilowatts', label: 'Kilowatts', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  { key: 'horsepower', label: 'Horsepower (hp)', toBase: (v) => v * 745.69987158227, fromBase: (v) => v / 745.69987158227 },
  { key: 'btuh', label: 'BTU/hour', toBase: (v) => v * 0.29307107017, fromBase: (v) => v / 0.29307107017 },
];

// Base unit: newton-meters. Constants are exact.
export const torqueUnits: UnitDef[] = [
  { key: 'nm', label: 'Newton-meters (N·m)', toBase: (v) => v, fromBase: (v) => v },
  { key: 'kgfm', label: 'Kilogram-force meters', toBase: (v) => v * 9.80665, fromBase: (v) => v / 9.80665 },
  { key: 'lbft', label: 'Pound-feet (lb·ft)', toBase: (v) => v * 1.3558179483, fromBase: (v) => v / 1.3558179483 },
  { key: 'lbin', label: 'Pound-inches (lb·in)', toBase: (v) => v * 0.1129848290, fromBase: (v) => v / 0.1129848290 },
];

export type UnitCategory =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'speed'
  | 'storage'
  | 'area'
  | 'volume'
  | 'pressure'
  | 'energy'
  | 'angle'
  | 'time'
  | 'density'
  | 'power'
  | 'torque';

export const unitCategories: { key: UnitCategory; label: string; units: UnitDef[] }[] = [
  { key: 'length', label: 'Length', units: lengthUnits },
  { key: 'weight', label: 'Weight', units: weightUnits },
  { key: 'temperature', label: 'Temperature', units: temperatureUnits },
  { key: 'speed', label: 'Speed', units: speedUnits },
  { key: 'storage', label: 'Digital Storage', units: digitalStorageUnits },
  { key: 'area', label: 'Area', units: areaUnits },
  { key: 'volume', label: 'Volume', units: volumeUnits },
  { key: 'pressure', label: 'Pressure', units: pressureUnits },
  { key: 'energy', label: 'Energy', units: energyUnits },
  { key: 'angle', label: 'Angle', units: angleUnits },
  { key: 'time', label: 'Time', units: timeUnits },
  { key: 'density', label: 'Density', units: densityUnits },
  { key: 'power', label: 'Power', units: powerUnits },
  { key: 'torque', label: 'Torque', units: torqueUnits },
];
