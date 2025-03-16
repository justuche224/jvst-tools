"use client"

import { useState, useEffect } from "react"
import { Search, History, BookOpen, Star, StarOff, Info, Copy, ArrowRight, Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Define unit categories
const categories = [
  { id: "length", name: "Length" },
  { id: "area", name: "Area" },
  { id: "volume", name: "Volume" },
  { id: "mass", name: "Mass/Weight" },
  { id: "time", name: "Time" },
  { id: "digital", name: "Digital Storage" },
  { id: "speed", name: "Speed" },
  { id: "temperature", name: "Temperature" },
  { id: "pressure", name: "Pressure" },
  { id: "energy", name: "Energy" },
  { id: "power", name: "Power" },
  { id: "angle", name: "Angle" },
  { id: "historical", name: "Historical" },
  { id: "obscure", name: "Obscure/Fun" },
  { id: "nautical", name: "Nautical" },
  { id: "typography", name: "Typography" },
  { id: "radiation", name: "Radiation" },
  { id: "cooking", name: "Cooking" },
]

// Define units with conversion factors to base unit
const units = {
  // Length (base: meter)
  length: [
    { id: "m", name: "Meter", factor: 1, base: true, region: "SI" },
    { id: "km", name: "Kilometer", factor: 1000, region: "SI" },
    { id: "cm", name: "Centimeter", factor: 0.01, region: "SI" },
    { id: "mm", name: "Millimeter", factor: 0.001, region: "SI" },
    { id: "in", name: "Inch", factor: 0.0254, region: "Imperial" },
    { id: "ft", name: "Foot", factor: 0.3048, region: "Imperial" },
    { id: "yd", name: "Yard", factor: 0.9144, region: "Imperial" },
    { id: "mi", name: "Mile", factor: 1609.344, region: "Imperial" },
    { id: "nmi", name: "Nautical Mile", factor: 1852, region: "Nautical" },
    { id: "au", name: "Astronomical Unit", factor: 1.495978707e11, region: "Astronomy" },
    { id: "ly", name: "Light Year", factor: 9.46073047e15, region: "Astronomy" },
    { id: "pc", name: "Parsec", factor: 3.08567758e16, region: "Astronomy" },
    {
      id: "cubit",
      name: "Cubit (Ancient Egypt)",
      factor: 0.52,
      region: "Historical",
      description:
        "An ancient unit based on the forearm length from the elbow to the tip of the middle finger. Varied by region and era.",
    },
    {
      id: "hand",
      name: "Hand",
      factor: 0.1016,
      region: "Equestrian",
      description: "Used to measure horse height at the withers (shoulders).",
    },
    {
      id: "span",
      name: "Span",
      factor: 0.2286,
      region: "Historical",
      description:
        "Based on the distance from the tip of the thumb to the tip of the little finger when the hand is fully extended.",
    },
    {
      id: "league",
      name: "League",
      factor: 4828.032,
      region: "Historical",
      description: "Originally the distance a person could walk in an hour.",
    },
    {
      id: "rod",
      name: "Rod (Pole/Perch)",
      factor: 5.0292,
      region: "Historical",
      description:
        "Originally defined as the total length of the left feet of the first 16 men to leave church on Sunday morning.",
    },
    {
      id: "chain",
      name: "Gunter's Chain",
      factor: 20.1168,
      region: "Surveying",
      description: "Used in land survey, defined as 66 feet or 100 links.",
    },
    {
      id: "angstrom",
      name: "Ångström",
      factor: 1e-10,
      region: "Scientific",
      description: "Used in atomic physics and to express wavelengths of electromagnetic radiation.",
    },
    { id: "micron", name: "Micron", factor: 1e-6, region: "Scientific" },
    {
      id: "thou",
      name: "Thou (Mil)",
      factor: 0.0000254,
      region: "Engineering",
      description: "Used in engineering and manufacturing for small measurements.",
    },
    {
      id: "barleycorn",
      name: "Barleycorn",
      factor: 0.008467,
      region: "Historical",
      description: "Traditional English unit, the basis for shoe sizes.",
    },
    {
      id: "smoot",
      name: "Smoot",
      factor: 1.7018,
      region: "Obscure",
      description: "Created when MIT student Oliver Smoot was used to measure the Harvard Bridge in 1958.",
    },
  ],

  // Area (base: square meter)
  area: [
    { id: "m2", name: "Square Meter", factor: 1, base: true, region: "SI" },
    { id: "km2", name: "Square Kilometer", factor: 1000000, region: "SI" },
    { id: "cm2", name: "Square Centimeter", factor: 0.0001, region: "SI" },
    { id: "mm2", name: "Square Millimeter", factor: 0.000001, region: "SI" },
    { id: "ha", name: "Hectare", factor: 10000, region: "SI" },
    { id: "in2", name: "Square Inch", factor: 0.00064516, region: "Imperial" },
    { id: "ft2", name: "Square Foot", factor: 0.09290304, region: "Imperial" },
    { id: "yd2", name: "Square Yard", factor: 0.83612736, region: "Imperial" },
    { id: "ac", name: "Acre", factor: 4046.8564224, region: "Imperial" },
    { id: "mi2", name: "Square Mile", factor: 2589988.110336, region: "Imperial" },
    {
      id: "rood",
      name: "Rood",
      factor: 1011.7141056,
      region: "Historical",
      description: "An old English unit equal to quarter of an acre.",
    },
    {
      id: "township",
      name: "Township",
      factor: 93239571.9721,
      region: "Historical",
      description: "Used in US land surveys, equal to 36 square miles.",
    },
    {
      id: "hide",
      name: "Hide",
      factor: 485000,
      region: "Historical",
      description: "Anglo-Saxon unit representing the amount of land that would support a household.",
    },
    {
      id: "carucate",
      name: "Carucate",
      factor: 490000,
      region: "Historical",
      description: "Medieval unit representing the amount of land that could be plowed by one eight-ox team in a year.",
    },
    {
      id: "barn",
      name: "Barn",
      factor: 1e-28,
      region: "Nuclear Physics",
      description: "Used to measure cross-sectional area in nuclear physics.",
    },
    {
      id: "circular_mil",
      name: "Circular Mil",
      factor: 5.067075e-10,
      region: "Electrical",
      description: "Used for measuring wire cross-sectional area in North America.",
    },
    {
      id: "ping",
      name: "Ping",
      factor: 3.3057851882,
      region: "East Asian",
      description: "Used in Taiwan, China, and Japan for measuring floor space.",
    },
    {
      id: "tatami",
      name: "Tatami",
      factor: 1.62,
      region: "Japanese",
      description: "Traditional Japanese floor mat, used as a unit for measuring room size.",
    },
  ],

  // Volume (base: cubic meter)
  volume: [
    { id: "m3", name: "Cubic Meter", factor: 1, base: true, region: "SI" },
    { id: "L", name: "Liter", factor: 0.001, region: "SI" },
    { id: "mL", name: "Milliliter", factor: 0.000001, region: "SI" },
    { id: "cm3", name: "Cubic Centimeter", factor: 0.000001, region: "SI" },
    { id: "mm3", name: "Cubic Millimeter", factor: 1e-9, region: "SI" },
    { id: "gal_us", name: "US Gallon", factor: 0.00378541, region: "US" },
    { id: "qt_us", name: "US Quart", factor: 0.000946353, region: "US" },
    { id: "pt_us", name: "US Pint", factor: 0.000473176, region: "US" },
    { id: "cup_us", name: "US Cup", factor: 0.000236588, region: "US" },
    { id: "fl_oz_us", name: "US Fluid Ounce", factor: 2.95735e-5, region: "US" },
    { id: "tbsp_us", name: "US Tablespoon", factor: 1.47868e-5, region: "US" },
    { id: "tsp_us", name: "US Teaspoon", factor: 4.92892e-6, region: "US" },
    { id: "gal_uk", name: "UK Gallon", factor: 0.00454609, region: "UK" },
    { id: "qt_uk", name: "UK Quart", factor: 0.00113652, region: "UK" },
    { id: "pt_uk", name: "UK Pint", factor: 0.000568261, region: "UK" },
    { id: "fl_oz_uk", name: "UK Fluid Ounce", factor: 2.84131e-5, region: "UK" },
    { id: "in3", name: "Cubic Inch", factor: 1.6387064e-5, region: "Imperial" },
    { id: "ft3", name: "Cubic Foot", factor: 0.028316846592, region: "Imperial" },
    { id: "yd3", name: "Cubic Yard", factor: 0.764554857984, region: "Imperial" },
    {
      id: "barrel_oil",
      name: "Oil Barrel",
      factor: 0.158987294928,
      region: "Industry",
      description: "Standard unit for oil and petroleum products.",
    },
    {
      id: "cord",
      name: "Cord",
      factor: 3.62456,
      region: "Forestry",
      description: "Unit for measuring firewood, equal to 128 cubic feet of stacked wood.",
    },
    {
      id: "board_foot",
      name: "Board Foot",
      factor: 0.002359737216,
      region: "Lumber",
      description: "Unit of volume for lumber in North America.",
    },
    {
      id: "hogshead",
      name: "Hogshead",
      factor: 0.238481,
      region: "Historical",
      description: "Old English unit for measuring wine and other alcoholic beverages.",
    },
    {
      id: "firkin",
      name: "Firkin",
      factor: 0.04091481,
      region: "Historical",
      description: "Traditional unit for butter, soap, and fish.",
    },
    {
      id: "noggin",
      name: "Noggin",
      factor: 0.0001420652,
      region: "Historical",
      description: "Old English unit for liquids, about a quarter of a pint.",
    },
    {
      id: "jigger",
      name: "Jigger",
      factor: 4.436e-5,
      region: "Bartending",
      description: "Used for measuring spirits in cocktails.",
    },
    {
      id: "drop",
      name: "Drop",
      factor: 5e-8,
      region: "Cooking/Medicine",
      description: "Approximate volume of a liquid drop, varies by liquid and dropper.",
    },
  ],

  // Mass (base: kilogram)
  mass: [
    { id: "kg", name: "Kilogram", factor: 1, base: true, region: "SI" },
    { id: "g", name: "Gram", factor: 0.001, region: "SI" },
    { id: "mg", name: "Milligram", factor: 0.000001, region: "SI" },
    { id: "mt", name: "Metric Ton", factor: 1000, region: "SI" },
    { id: "lb", name: "Pound", factor: 0.45359237, region: "Imperial" },
    { id: "oz", name: "Ounce", factor: 0.028349523125, region: "Imperial" },
    { id: "st", name: "Stone", factor: 6.35029318, region: "UK" },
    { id: "ton_us", name: "US Ton (Short)", factor: 907.18474, region: "US" },
    { id: "ton_uk", name: "UK Ton (Long)", factor: 1016.0469088, region: "UK" },
    {
      id: "grain",
      name: "Grain",
      factor: 0.00006479891,
      region: "Historical",
      description:
        "Originally based on the weight of a grain of wheat or barley. Still used for bullets, arrows, and pharmaceuticals.",
    },
    {
      id: "drachm",
      name: "Drachm (Dram)",
      factor: 0.0017718451953125,
      region: "Historical",
      description: "Ancient Greek unit, used in apothecary systems.",
    },
    {
      id: "scruple",
      name: "Scruple",
      factor: 0.00129598,
      region: "Historical",
      description: "Apothecary unit used by pharmacists and jewelers.",
    },
    { id: "carat", name: "Carat", factor: 0.0002, region: "Jewelry", description: "Used for gemstones and pearls." },
    {
      id: "dalton",
      name: "Dalton (Atomic Mass Unit)",
      factor: 1.6605390666e-27,
      region: "Chemistry",
      description: "Used in chemistry and physics for atomic and molecular masses.",
    },
    {
      id: "slug",
      name: "Slug",
      factor: 14.593903,
      region: "Engineering",
      description: "Unit of mass in the foot-pound-second system.",
    },
    {
      id: "assay_ton",
      name: "Assay Ton",
      factor: 0.02917,
      region: "Metallurgy",
      description: "Used in precious metal assaying.",
    },
    {
      id: "quintal",
      name: "Quintal",
      factor: 100,
      region: "Agriculture",
      description: "Used in agriculture and commodity trading.",
    },
    {
      id: "mite",
      name: "Mite",
      factor: 3.2399455e-6,
      region: "Historical",
      description: "Medieval unit, 1/20 of a grain.",
    },
    {
      id: "gamma",
      name: "Gamma",
      factor: 1e-9,
      region: "Scientific",
      description: "Used in scientific contexts for very small masses.",
    },
    {
      id: "planck_mass",
      name: "Planck Mass",
      factor: 2.176434e-8,
      region: "Physics",
      description: "Natural unit of mass in quantum physics.",
    },
  ],

  // Time (base: second)
  time: [
    { id: "s", name: "Second", factor: 1, base: true, region: "SI" },
    { id: "min", name: "Minute", factor: 60, region: "Standard" },
    { id: "h", name: "Hour", factor: 3600, region: "Standard" },
    { id: "d", name: "Day", factor: 86400, region: "Standard" },
    { id: "wk", name: "Week", factor: 604800, region: "Standard" },
    { id: "mo_avg", name: "Month (Average)", factor: 2629746, region: "Standard" },
    { id: "yr", name: "Year (365 days)", factor: 31536000, region: "Standard" },
    { id: "yr_leap", name: "Leap Year", factor: 31622400, region: "Standard" },
    { id: "decade", name: "Decade", factor: 315360000, region: "Standard" },
    { id: "century", name: "Century", factor: 3153600000, region: "Standard" },
    { id: "millennium", name: "Millennium", factor: 31536000000, region: "Standard" },
    { id: "ms", name: "Millisecond", factor: 0.001, region: "SI" },
    { id: "us", name: "Microsecond", factor: 0.000001, region: "SI" },
    { id: "ns", name: "Nanosecond", factor: 1e-9, region: "SI" },
    { id: "ps", name: "Picosecond", factor: 1e-12, region: "SI" },
    {
      id: "fortnight",
      name: "Fortnight",
      factor: 1209600,
      region: "Historical",
      description: "Period of fourteen nights (two weeks).",
    },
    {
      id: "olympiad",
      name: "Olympiad",
      factor: 126144000,
      region: "Historical",
      description: "Period of four years between Olympic Games in ancient Greece.",
    },
    {
      id: "indiction",
      name: "Indiction",
      factor: 473040000,
      region: "Historical",
      description: "15-year cycle used in medieval tax assessment and dating documents.",
    },
    {
      id: "lustrum",
      name: "Lustrum",
      factor: 157680000,
      region: "Historical",
      description: "Five-year period in ancient Rome, originally the interval between census counts.",
    },
    {
      id: "jiffy",
      name: "Jiffy (Electronics)",
      factor: 1 / 60,
      region: "Technical",
      description: "In electronics, the time between alternating current power cycles (1/60 or 1/50 second).",
    },
    {
      id: "jiffy_physics",
      name: "Jiffy (Physics)",
      factor: 3e-24,
      region: "Physics",
      description: "In quantum physics, the time it takes light to travel one fermi (about 3×10^-24 seconds).",
    },
    {
      id: "svedberg",
      name: "Svedberg",
      factor: 1e-13,
      region: "Biochemistry",
      description: "Used to measure sedimentation rate in centrifuges.",
    },
    {
      id: "planck_time",
      name: "Planck Time",
      factor: 5.39116e-44,
      region: "Physics",
      description: "The smallest meaningful unit of time in physics.",
    },
    {
      id: "shake",
      name: "Shake",
      factor: 1e-8,
      region: "Nuclear Physics",
      description: "Used in nuclear physics, approximately 10 nanoseconds.",
    },
    {
      id: "moment",
      name: "Moment (Medieval)",
      factor: 90,
      region: "Historical",
      description: "Medieval unit of time, 1/40 of an hour or 90 seconds.",
    },
  ],

  // Digital Storage (base: byte)
  digital: [
    { id: "B", name: "Byte", factor: 1, base: true, region: "Computing" },
    { id: "KB", name: "Kilobyte", factor: 1024, region: "Computing" },
    { id: "MB", name: "Megabyte", factor: 1048576, region: "Computing" },
    { id: "GB", name: "Gigabyte", factor: 1073741824, region: "Computing" },
    { id: "TB", name: "Terabyte", factor: 1099511627776, region: "Computing" },
    { id: "PB", name: "Petabyte", factor: 1125899906842624, region: "Computing" },
    { id: "EB", name: "Exabyte", factor: 1152921504606846976, region: "Computing" },
    { id: "ZB", name: "Zettabyte", factor: 1180591620717411303424, region: "Computing" },
    { id: "YB", name: "Yottabyte", factor: 1208925819614629174706176, region: "Computing" },
    { id: "bit", name: "Bit", factor: 0.125, region: "Computing" },
    { id: "Kbit", name: "Kilobit", factor: 128, region: "Computing" },
    { id: "Mbit", name: "Megabit", factor: 131072, region: "Computing" },
    { id: "Gbit", name: "Gigabit", factor: 134217728, region: "Computing" },
    { id: "Tbit", name: "Terabit", factor: 137438953472, region: "Computing" },
    { id: "KiB", name: "Kibibyte", factor: 1024, region: "Computing", description: "Binary kilobyte (2^10 bytes)" },
    { id: "MiB", name: "Mebibyte", factor: 1048576, region: "Computing", description: "Binary megabyte (2^20 bytes)" },
    {
      id: "GiB",
      name: "Gibibyte",
      factor: 1073741824,
      region: "Computing",
      description: "Binary gigabyte (2^30 bytes)",
    },
    {
      id: "TiB",
      name: "Tebibyte",
      factor: 1099511627776,
      region: "Computing",
      description: "Binary terabyte (2^40 bytes)",
    },
    {
      id: "PiB",
      name: "Pebibyte",
      factor: 1125899906842624,
      region: "Computing",
      description: "Binary petabyte (2^50 bytes)",
    },
    {
      id: "EiB",
      name: "Exbibyte",
      factor: 1152921504606846976,
      region: "Computing",
      description: "Binary exabyte (2^60 bytes)",
    },
    {
      id: "ZiB",
      name: "Zebibyte",
      factor: 1180591620717411303424,
      region: "Computing",
      description: "Binary zettabyte (2^70 bytes)",
    },
    {
      id: "YiB",
      name: "Yobibyte",
      factor: 1208925819614629174706176,
      region: "Computing",
      description: "Binary yottabyte (2^80 bytes)",
    },
    {
      id: "word",
      name: "Word (16-bit)",
      factor: 2,
      region: "Computing",
      description: "Traditional unit in computing, typically 16 bits or 2 bytes.",
    },
    {
      id: "block",
      name: "Block (512 bytes)",
      factor: 512,
      region: "Storage",
      description: "Traditional disk storage allocation unit.",
    },
    { id: "nibble", name: "Nibble", factor: 0.5, region: "Computing", description: "4 bits, half a byte." },
    { id: "sector", name: "Sector", factor: 512, region: "Storage", description: "Traditional unit of disk storage." },
    {
      id: "punch_card",
      name: "Punch Card",
      factor: 80,
      region: "Historical",
      description: "IBM punch cards typically stored 80 characters (bytes).",
    },
  ],

  // Speed (base: meters per second)
  speed: [
    { id: "mps", name: "Meters per Second", factor: 1, base: true, region: "SI" },
    { id: "kph", name: "Kilometers per Hour", factor: 0.277778, region: "Common" },
    { id: "mph", name: "Miles per Hour", factor: 0.44704, region: "Imperial" },
    { id: "fps", name: "Feet per Second", factor: 0.3048, region: "Imperial" },
    { id: "knot", name: "Knot", factor: 0.514444, region: "Nautical" },
    {
      id: "mach",
      name: "Mach (at sea level)",
      factor: 340.29,
      region: "Aviation",
      description: "Speed of sound at sea level and standard temperature.",
    },
    { id: "c", name: "Speed of Light", factor: 299792458, region: "Physics" },
    {
      id: "furlong_fortnight",
      name: "Furlongs per Fortnight",
      factor: 0.000166309,
      region: "Humorous",
      description: "A humorous unit combining an obscure unit of distance with an obscure unit of time.",
    },
    {
      id: "league_day",
      name: "Leagues per Day",
      factor: 0.05583,
      region: "Historical",
      description: "Historical unit used in maritime navigation.",
    },
    {
      id: "earth_orbit",
      name: "Earth's Orbital Speed",
      factor: 29780,
      region: "Astronomy",
      description: "Average speed of Earth in its orbit around the Sun.",
    },
    {
      id: "continental_drift",
      name: "Continental Drift",
      factor: 1.58e-9,
      region: "Geology",
      description: "Typical speed of tectonic plate movement, about 5 cm per year.",
    },
    {
      id: "snail",
      name: "Snail's Pace",
      factor: 0.001,
      region: "Biological",
      description: "Approximate speed of a garden snail.",
    },
    {
      id: "cheetah",
      name: "Cheetah Sprint",
      factor: 33,
      region: "Biological",
      description: "Top speed of a cheetah, the fastest land animal.",
    },
  ],

  // Temperature (special case - needs conversion formulas)
  temperature: [
    { id: "C", name: "Celsius", base: true, region: "SI" },
    { id: "F", name: "Fahrenheit", region: "US" },
    { id: "K", name: "Kelvin", region: "Scientific" },
    {
      id: "R",
      name: "Rankine",
      region: "Engineering",
      description: "Absolute temperature scale used in engineering in the US.",
    },
    {
      id: "De",
      name: "Delisle",
      region: "Historical",
      description: "Created by French astronomer Joseph-Nicolas Delisle in 1732.",
    },
    { id: "N", name: "Newton", region: "Historical", description: "Created by Isaac Newton around 1700." },
    {
      id: "Ré",
      name: "Réaumur",
      region: "Historical",
      description: "Used in Europe, especially France, in the 18th and 19th centuries.",
    },
    {
      id: "Rø",
      name: "Rømer",
      region: "Historical",
      description: "Created by Danish astronomer Ole Christensen Rømer in 1701.",
    },
  ],

  // Pressure (base: Pascal)
  pressure: [
    { id: "Pa", name: "Pascal", factor: 1, base: true, region: "SI" },
    { id: "kPa", name: "Kilopascal", factor: 1000, region: "SI" },
    { id: "MPa", name: "Megapascal", factor: 1000000, region: "SI" },
    { id: "bar", name: "Bar", factor: 100000, region: "Meteorology" },
    { id: "mbar", name: "Millibar", factor: 100, region: "Meteorology" },
    { id: "atm", name: "Atmosphere", factor: 101325, region: "Physics" },
    { id: "psi", name: "Pounds per Square Inch", factor: 6894.76, region: "Imperial" },
    { id: "torr", name: "Torr", factor: 133.322, region: "Scientific" },
    { id: "mmHg", name: "Millimeters of Mercury", factor: 133.322, region: "Medical" },
    { id: "inHg", name: "Inches of Mercury", factor: 3386.39, region: "Weather" },
    { id: "ftH2O", name: "Feet of Water", factor: 2989.07, region: "Engineering" },
    {
      id: "dyn_cm2",
      name: "Dyne per Square Centimeter",
      factor: 0.1,
      region: "CGS",
      description: "Unit in the centimeter-gram-second system.",
    },
    {
      id: "barye",
      name: "Barye",
      factor: 0.1,
      region: "CGS",
      description: "CGS unit of pressure, equal to 1 dyne per square centimeter.",
    },
    {
      id: "at",
      name: "Technical Atmosphere",
      factor: 98066.5,
      region: "Engineering",
      description: "Used in Europe, defined as 1 kilogram-force per square centimeter.",
    },
    {
      id: "inH2O",
      name: "Inches of Water",
      factor: 249.089,
      region: "Engineering",
      description: "Used in HVAC, plumbing, and other applications.",
    },
    {
      id: "Planck_pressure",
      name: "Planck Pressure",
      factor: 4.63309e113,
      region: "Physics",
      description: "Natural unit of pressure in quantum physics.",
    },
  ],

  // Energy (base: Joule)
  energy: [
    { id: "J", name: "Joule", factor: 1, base: true, region: "SI" },
    { id: "kJ", name: "Kilojoule", factor: 1000, region: "SI" },
    { id: "MJ", name: "Megajoule", factor: 1000000, region: "SI" },
    { id: "cal", name: "Calorie", factor: 4.184, region: "Nutrition" },
    { id: "kcal", name: "Kilocalorie", factor: 4184, region: "Nutrition" },
    { id: "Wh", name: "Watt-hour", factor: 3600, region: "Electricity" },
    { id: "kWh", name: "Kilowatt-hour", factor: 3600000, region: "Electricity" },
    { id: "eV", name: "Electron Volt", factor: 1.602176634e-19, region: "Physics" },
    { id: "keV", name: "Kiloelectron Volt", factor: 1.602176634e-16, region: "Physics" },
    { id: "MeV", name: "Megaelectron Volt", factor: 1.602176634e-13, region: "Physics" },
    { id: "GeV", name: "Gigaelectron Volt", factor: 1.602176634e-10, region: "Physics" },
    { id: "BTU", name: "British Thermal Unit", factor: 1055.06, region: "Imperial" },
    {
      id: "therm",
      name: "Therm",
      factor: 105506000,
      region: "Natural Gas",
      description: "Used for natural gas measurements in the US.",
    },
    {
      id: "ft_lbf",
      name: "Foot-pound Force",
      factor: 1.35582,
      region: "Imperial",
      description: "Work done by a force of one pound acting through a distance of one foot.",
    },
    {
      id: "erg",
      name: "Erg",
      factor: 1e-7,
      region: "CGS",
      description: "Unit of energy in the centimeter-gram-second system.",
    },
    {
      id: "toe",
      name: "Tonne of Oil Equivalent",
      factor: 41868000000,
      region: "Energy Industry",
      description: "Amount of energy released by burning one tonne of crude oil.",
    },
    {
      id: "tce",
      name: "Tonne of Coal Equivalent",
      factor: 29307600000,
      region: "Energy Industry",
      description: "Amount of energy released by burning one tonne of coal.",
    },
    {
      id: "TNT",
      name: "Ton of TNT",
      factor: 4184000000,
      region: "Explosives",
      description: "Energy released in the detonation of one ton of TNT.",
    },
    {
      id: "quad",
      name: "Quad",
      factor: 1055e15,
      region: "Energy Policy",
      description: "Quadrillion BTUs, used in energy policy and analysis.",
    },
  ],

  // Power (base: Watt)
  power: [
    { id: "W", name: "Watt", factor: 1, base: true, region: "SI" },
    { id: "kW", name: "Kilowatt", factor: 1000, region: "SI" },
    { id: "MW", name: "Megawatt", factor: 1000000, region: "SI" },
    { id: "GW", name: "Gigawatt", factor: 1000000000, region: "SI" },
    { id: "hp", name: "Horsepower (Mechanical)", factor: 745.7, region: "Imperial" },
    { id: "hp_metric", name: "Horsepower (Metric)", factor: 735.5, region: "Metric" },
    { id: "hp_electric", name: "Horsepower (Electric)", factor: 746, region: "Electrical" },
    { id: "BTU_h", name: "BTU per Hour", factor: 0.29307107, region: "HVAC" },
    { id: "ft_lbf_s", name: "Foot-pound Force per Second", factor: 1.35582, region: "Imperial" },
    {
      id: "dBm",
      name: "Decibel-milliwatt",
      factor: 0.001 * Math.pow(10, 3 / 10),
      region: "Telecommunications",
      description: "Power ratio in decibels relative to one milliwatt.",
    },
    { id: "erg_s", name: "Erg per Second", factor: 1e-7, region: "CGS" },
    { id: "cal_s", name: "Calorie per Second", factor: 4.184, region: "Nutrition" },
    {
      id: "ton_refrigeration",
      name: "Ton of Refrigeration",
      factor: 3516.85,
      region: "HVAC",
      description:
        "Cooling power equal to the rate of heat transfer needed to freeze 2000 pounds of water at 0°C in 24 hours.",
    },
    {
      id: "donkey_power",
      name: "Donkey Power",
      factor: 250,
      region: "Historical",
      description: "Approximately one-third of a horsepower.",
    },
    {
      id: "manpower",
      name: "Manpower",
      factor: 74.57,
      region: "Historical",
      description: "Approximately one-tenth of a horsepower.",
    },
  ],

  // Angle (base: radian)
  angle: [
    { id: "rad", name: "Radian", factor: 1, base: true, region: "SI" },
    { id: "deg", name: "Degree", factor: 0.0174533, region: "Common" },
    { id: "arcmin", name: "Arcminute", factor: 0.000290888, region: "Astronomy" },
    { id: "arcsec", name: "Arcsecond", factor: 4.84814e-6, region: "Astronomy" },
    {
      id: "grad",
      name: "Gradian",
      factor: 0.015708,
      region: "Engineering",
      description: "Also called gon, equal to 1/400 of a full circle.",
    },
    { id: "turn", name: "Turn", factor: 6.28319, region: "Mathematics", description: "A full circle or 360 degrees." },
    { id: "rev", name: "Revolution", factor: 6.28319, region: "Engineering" },
    {
      id: "quadrant",
      name: "Quadrant",
      factor: 1.5708,
      region: "Navigation",
      description: "Quarter of a circle or 90 degrees.",
    },
    {
      id: "sextant",
      name: "Sextant",
      factor: 1.0472,
      region: "Navigation",
      description: "Sixth of a circle or 60 degrees.",
    },
    {
      id: "sign",
      name: "Sign",
      factor: 0.523599,
      region: "Astrology",
      description: "Twelfth of a circle or 30 degrees, used in the zodiac.",
    },
    {
      id: "mil_nato",
      name: "NATO Mil",
      factor: 0.0009817477,
      region: "Military",
      description: "Used in artillery, equal to 1/6400 of a circle.",
    },
    {
      id: "mil_soviet",
      name: "Soviet Mil",
      factor: 0.0009424778,
      region: "Military",
      description: "Used in former Soviet and Warsaw Pact countries, equal to 1/6000 of a circle.",
    },
    {
      id: "point",
      name: "Point (16-wind compass)",
      factor: 0.3927,
      region: "Navigation",
      description: "Used in the 16-point compass rose, equal to 22.5 degrees.",
    },
  ],

  // Historical units (mixed base units)
  historical: [
    {
      id: "roman_uncia",
      name: "Roman Uncia (Weight)",
      factor: 0.0272875,
      base: "kg",
      region: "Ancient Rome",
      description: "1/12 of a Roman pound (libra), about 27.3 grams.",
    },
    {
      id: "roman_libra",
      name: "Roman Libra (Pound)",
      factor: 0.32745,
      base: "kg",
      region: "Ancient Rome",
      description: "Roman pound, about 327.45 grams.",
    },
    {
      id: "roman_pes",
      name: "Roman Pes (Foot)",
      factor: 0.296,
      base: "m",
      region: "Ancient Rome",
      description: "Roman foot, about 29.6 cm.",
    },
    {
      id: "roman_passus",
      name: "Roman Passus (Pace)",
      factor: 1.48,
      base: "m",
      region: "Ancient Rome",
      description: "Roman pace, 5 Roman feet.",
    },
    {
      id: "roman_mille_passus",
      name: "Roman Mile",
      factor: 1480,
      base: "m",
      region: "Ancient Rome",
      description: "1000 Roman paces, about 1.48 km.",
    },
    {
      id: "biblical_cubit",
      name: "Biblical Cubit",
      factor: 0.45,
      base: "m",
      region: "Biblical",
      description: "Ancient unit mentioned in the Bible, approximately 18 inches.",
    },
    {
      id: "biblical_talent",
      name: "Biblical Talent (Weight)",
      factor: 34,
      base: "kg",
      region: "Biblical",
      description: "Ancient unit of mass mentioned in the Bible.",
    },
    {
      id: "biblical_shekel",
      name: "Biblical Shekel",
      factor: 0.011,
      base: "kg",
      region: "Biblical",
      description: "Ancient unit of currency and weight mentioned in the Bible.",
    },
    {
      id: "egyptian_royal_cubit",
      name: "Egyptian Royal Cubit",
      factor: 0.525,
      base: "m",
      region: "Ancient Egypt",
      description: "Used in ancient Egyptian architecture and construction.",
    },
    {
      id: "babylonian_mina",
      name: "Babylonian Mina",
      factor: 0.5,
      base: "kg",
      region: "Mesopotamia",
      description: "Ancient Babylonian unit of weight.",
    },
    {
      id: "greek_stadion",
      name: "Greek Stadion",
      factor: 185,
      base: "m",
      region: "Ancient Greece",
      description: "Ancient Greek unit of length, the origin of the modern stadium.",
    },
    {
      id: "greek_drachma",
      name: "Greek Drachma (Weight)",
      factor: 0.0043,
      base: "kg",
      region: "Ancient Greece",
      description: "Ancient Greek unit of weight and currency.",
    },
    {
      id: "chinese_li",
      name: "Chinese Li",
      factor: 500,
      base: "m",
      region: "Ancient China",
      description: "Traditional Chinese unit of distance.",
    },
    {
      id: "chinese_jin",
      name: "Chinese Jin (Catty)",
      factor: 0.5,
      base: "kg",
      region: "China",
      description: "Traditional Chinese unit of weight, still in use.",
    },
    {
      id: "japanese_ri",
      name: "Japanese Ri",
      factor: 3927,
      base: "m",
      region: "Japan",
      description: "Traditional Japanese unit of distance.",
    },
    {
      id: "japanese_ken",
      name: "Japanese Ken",
      factor: 1.818,
      base: "m",
      region: "Japan",
      description: "Traditional Japanese unit of length used in architecture.",
    },
    {
      id: "japanese_shaku",
      name: "Japanese Shaku",
      factor: 0.303,
      base: "m",
      region: "Japan",
      description: "Traditional Japanese unit of length.",
    },
    {
      id: "indian_yojana",
      name: "Indian Yojana",
      factor: 12000,
      base: "m",
      region: "Ancient India",
      description: "Ancient Indian unit of distance mentioned in Hindu and Buddhist texts.",
    },
  ],

  // Obscure/Fun units
  obscure: [
    {
      id: "beard_second",
      name: "Beard-second",
      factor: 5e-9,
      base: "m",
      region: "Humorous",
      description: "Distance a beard grows in one second, approximately 5 nanometers.",
    },
    {
      id: "mickey",
      name: "Mickey",
      factor: 0.000127,
      base: "m",
      region: "Computing",
      description: "The smallest resolvable unit of distance by a computer mouse.",
    },
    {
      id: "helen",
      name: "Helen",
      factor: 1,
      base: "helen",
      region: "Humorous",
      description: "The amount of beauty needed to launch a thousand ships. Used humorously to measure beauty.",
    },
    {
      id: "millihelen",
      name: "Millihelen",
      factor: 0.001,
      base: "helen",
      region: "Humorous",
      description: "Enough beauty to launch a single ship.",
    },
    {
      id: "microcentury",
      name: "Microcentury",
      factor: 3153.6,
      base: "s",
      region: "Academia",
      description: "About 52 minutes and 36 seconds, used by professors to time lectures.",
    },
    {
      id: "galactic_year",
      name: "Galactic Year",
      factor: 7.44e15,
      base: "s",
      region: "Astronomy",
      description: "Time it takes the Sun to orbit the center of the Milky Way, about 230 million Earth years.",
    },
    {
      id: "dog_year",
      name: "Dog Year",
      factor: 7,
      base: "yr",
      region: "Colloquial",
      description: "Based on the notion that one calendar year for a dog is equivalent to 7 years for a human.",
    },
    {
      id: "warhol",
      name: "Warhol",
      factor: 900,
      base: "s",
      region: "Pop Culture",
      description:
        "15 minutes of fame, based on Andy Warhol's statement that 'In the future, everyone will be world-famous for 15 minutes.'",
    },
    {
      id: "kardashian",
      name: "Kardashian",
      factor: 72,
      base: "d",
      region: "Pop Culture",
      description: "Humorously defined as 72 days, the length of Kim Kardashian's marriage to Kris Humphries.",
    },
    {
      id: "sheppey",
      name: "Sheppey",
      factor: 1400,
      base: "m",
      region: "Humorous",
      description: "Distance at which sheep remain picturesque, about 7/8 of a mile.",
    },
    {
      id: "barn_megaparsec",
      name: "Barn-megaparsec",
      factor: 3.08567758e-22,
      base: "m3",
      region: "Physics Humor",
      description:
        "Extremely small volume, combination of a very small area (barn) and very large length (megaparsec).",
    },
    { id: "nibble", name: "Nibble", factor: 4, base: "bit", region: "Computing", description: "4 bits, half a byte." },
    {
      id: "donkeypower",
      name: "Donkeypower",
      factor: 250,
      base: "W",
      region: "Humorous",
      description: "Approximately one-third of a horsepower.",
    },
    {
      id: "pirate_ninja",
      name: "Pirate-Ninja",
      factor: 1,
      base: "pirate_ninja",
      region: "Internet",
      description: "Humorous unit for the ratio of pirates to ninjas in a given population.",
    },
  ],

  // Nautical units
  nautical: [
    { id: "nautical_mile", name: "Nautical Mile", factor: 1852, base: "m", region: "Maritime" },
    {
      id: "cable_length",
      name: "Cable Length",
      factor: 185.2,
      base: "m",
      region: "Maritime",
      description: "One-tenth of a nautical mile.",
    },
    {
      id: "fathom",
      name: "Fathom",
      factor: 1.8288,
      base: "m",
      region: "Maritime",
      description: "Used for measuring water depth.",
    },
    {
      id: "knot",
      name: "Knot",
      factor: 0.514444,
      base: "mps",
      region: "Maritime",
      description: "One nautical mile per hour.",
    },
    {
      id: "league_nautical",
      name: "Nautical League",
      factor: 5556,
      base: "m",
      region: "Maritime",
      description: "Three nautical miles.",
    },
    {
      id: "shot",
      name: "Shot of Anchor Chain",
      factor: 27.432,
      base: "m",
      region: "Maritime",
      description: "Length of anchor chain, 15 fathoms or 90 feet.",
    },
    {
      id: "bell",
      name: "Ship's Bell",
      factor: 1800,
      base: "s",
      region: "Maritime",
      description: "Traditional measure of time on a ship, one bell equals 30 minutes.",
    },
    {
      id: "watch",
      name: "Watch",
      factor: 14400,
      base: "s",
      region: "Maritime",
      description: "Period of duty, typically 4 hours on a ship.",
    },
    {
      id: "glass",
      name: "Glass",
      factor: 1800,
      base: "s",
      region: "Maritime",
      description: "Half-hour measured by a ship's sandglass.",
    },
    {
      id: "beaufort",
      name: "Beaufort Scale",
      factor: 1,
      base: "beaufort",
      region: "Maritime",
      description: "Scale for measuring wind speed based on observed sea conditions.",
    },
  ],

  // Typography units
  typography: [
    {
      id: "point",
      name: "Point (pt)",
      factor: 0.000352778,
      base: "m",
      region: "Typography",
      description: "Traditional unit for measuring font size and line height.",
    },
    {
      id: "pica",
      name: "Pica",
      factor: 0.00423333,
      base: "m",
      region: "Typography",
      description: "12 points, used in typography.",
    },
    {
      id: "em",
      name: "Em",
      factor: 1,
      base: "em",
      region: "Typography",
      description: "Relative to the font size, traditionally the width of the capital 'M'.",
    },
    { id: "en", name: "En", factor: 0.5, base: "em", region: "Typography", description: "Half the width of an em." },
    {
      id: "didot_point",
      name: "Didot Point",
      factor: 0.000376065,
      base: "m",
      region: "Typography",
      description: "European typographic unit, slightly larger than the Anglo-American point.",
    },
    {
      id: "cicero",
      name: "Cicero",
      factor: 0.00451278,
      base: "m",
      region: "Typography",
      description: "European typographic unit, 12 Didot points.",
    },
    {
      id: "line",
      name: "Line",
      factor: 0.00423333,
      base: "m",
      region: "Typography",
      description: "1/12 of an inch, equivalent to a pica.",
    },
    {
      id: "twip",
      name: "Twip",
      factor: 1.7639e-5,
      base: "m",
      region: "Typography",
      description: "1/20 of a point, used in some computer typography systems.",
    },
  ],

  // Radiation units
  radiation: [
    {
      id: "Bq",
      name: "Becquerel",
      factor: 1,
      base: true,
      region: "SI",
      description: "SI unit of radioactivity, one decay per second.",
    },
    {
      id: "Ci",
      name: "Curie",
      factor: 3.7e10,
      base: "Bq",
      region: "Traditional",
      description: "Traditional unit of radioactivity, 3.7×10^10 decays per second.",
    },
    {
      id: "Gy",
      name: "Gray",
      factor: 1,
      base: true,
      region: "SI",
      description: "SI unit of absorbed radiation dose, 1 joule per kilogram.",
    },
    {
      id: "rad",
      name: "Rad",
      factor: 0.01,
      base: "Gy",
      region: "Traditional",
      description: "Traditional unit of absorbed radiation dose.",
    },
    {
      id: "Sv",
      name: "Sievert",
      factor: 1,
      base: true,
      region: "SI",
      description: "SI unit of equivalent radiation dose, weighted by type of radiation.",
    },
    {
      id: "rem",
      name: "Rem",
      factor: 0.01,
      base: "Sv",
      region: "Traditional",
      description: "Traditional unit of equivalent radiation dose.",
    },
    {
      id: "R",
      name: "Roentgen",
      factor: 0.000258,
      base: "C/kg",
      region: "Traditional",
      description: "Unit of X-ray and gamma ray exposure.",
    },
    {
      id: "banana_equivalent",
      name: "Banana Equivalent Dose",
      factor: 1e-7,
      base: "Sv",
      region: "Informal",
      description: "Humorous unit representing the radiation exposure from eating one banana.",
    },
  ],

  // Cooking units
  cooking: [
    { id: "tsp_us", name: "US Teaspoon", factor: 4.92892e-6, base: "m3", region: "US" },
    { id: "tbsp_us", name: "US Tablespoon", factor: 1.47868e-5, base: "m3", region: "US" },
    { id: "fl_oz_us", name: "US Fluid Ounce", factor: 2.95735e-5, base: "m3", region: "US" },
    { id: "cup_us", name: "US Cup", factor: 0.000236588, base: "m3", region: "US" },
    { id: "pt_us", name: "US Pint", factor: 0.000473176, base: "m3", region: "US" },
    { id: "qt_us", name: "US Quart", factor: 0.000946353, base: "m3", region: "US" },
    { id: "gal_us", name: "US Gallon", factor: 0.00378541, base: "m3", region: "US" },
    { id: "tsp_metric", name: "Metric Teaspoon", factor: 5e-6, base: "m3", region: "Metric" },
    { id: "tbsp_metric", name: "Metric Tablespoon", factor: 1.5e-5, base: "m3", region: "Metric" },
    { id: "fl_oz_uk", name: "UK Fluid Ounce", factor: 2.84131e-5, base: "m3", region: "UK" },
    { id: "pt_uk", name: "UK Pint", factor: 0.000568261, base: "m3", region: "UK" },
    { id: "qt_uk", name: "UK Quart", factor: 0.00113652, base: "m3", region: "UK" },
    { id: "gal_uk", name: "UK Gallon", factor: 0.00454609, base: "m3", region: "UK" },
    {
      id: "dash",
      name: "Dash",
      factor: 5e-7,
      base: "m3",
      region: "Cooking",
      description: "Approximately 1/8 teaspoon or a few drops.",
    },
    {
      id: "pinch",
      name: "Pinch",
      factor: 2.5e-7,
      base: "m3",
      region: "Cooking",
      description: "Approximately 1/16 teaspoon or what you can pick up between finger and thumb.",
    },
    {
      id: "drop",
      name: "Drop",
      factor: 5e-8,
      base: "m3",
      region: "Cooking",
      description: "Approximate volume of a liquid drop, varies by liquid.",
    },
    {
      id: "smidgen",
      name: "Smidgen",
      factor: 1.25e-7,
      base: "m3",
      region: "Cooking",
      description: "Half a pinch or 1/32 teaspoon.",
    },
    {
      id: "jigger",
      name: "Jigger",
      factor: 4.436e-5,
      base: "m3",
      region: "Bartending",
      description: "Standard measure for liquor, typically 1.5 fluid ounces.",
    },
  ],
}

// Define temperature conversion functions
const temperatureConversions = {
  C_to_F: (celsius) => (celsius * 9) / 5 + 32,
  C_to_K: (celsius) => celsius + 273.15,
  C_to_R: (celsius) => ((celsius + 273.15) * 9) / 5,
  C_to_De: (celsius) => ((100 - celsius) * 3) / 2,
  C_to_N: (celsius) => (celsius * 33) / 100,
  C_to_Ré: (celsius) => (celsius * 4) / 5,
  C_to_Rø: (celsius) => (celsius * 21) / 40 + 7.5,

  F_to_C: (fahrenheit) => ((fahrenheit - 32) * 5) / 9,
  K_to_C: (kelvin) => kelvin - 273.15,
  R_to_C: (rankine) => ((rankine - 491.67) * 5) / 9,
  De_to_C: (delisle) => 100 - (delisle * 2) / 3,
  N_to_C: (newton) => (newton * 100) / 33,
  Ré_to_C: (reaumur) => (reaumur * 5) / 4,
  Rø_to_C: (romer) => ((romer - 7.5) * 40) / 21,
}

interface ConversionHistory {
  id: string
  fromValue: number
  fromUnit: string
  fromUnitName: string
  toValue: number
  toUnit: string
  toUnitName: string
  category: string
  date: string
}

interface FavoriteConversion {
  id: string
  fromUnit: string
  fromUnitName: string
  toUnit: string
  toUnitName: string
  category: string
}

export default function UnitConverter() {
  const [category, setCategory] = useState<string>("length")
  const [fromUnit, setFromUnit] = useState<string>("")
  const [toUnit, setToUnit] = useState<string>("")
  const [fromValue, setFromValue] = useState<string>("1")
  const [toValue, setToValue] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [history, setHistory] = useState<ConversionHistory[]>([])
  const [favorites, setFavorites] = useState<FavoriteConversion[]>([])
  const [unitInfo, setUnitInfo] = useState<any>(null)

  // Load history and favorites from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("unitConverterHistory")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse history from localStorage", e)
      }
    }

    const savedFavorites = localStorage.getItem("unitConverterFavorites")
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.error("Failed to parse favorites from localStorage", e)
      }
    }
  }, [])

  // Set default units when category changes
  useEffect(() => {
    if (units[category] && units[category].length > 0) {
      // Find the base unit if available
      const baseUnit = units[category].find((unit) => unit.base === true)
      const firstUnit = units[category][0]
      const secondUnit = units[category][1] || units[category][0]

      setFromUnit(baseUnit ? baseUnit.id : firstUnit.id)
      setToUnit(baseUnit ? (baseUnit.id !== secondUnit.id ? secondUnit.id : firstUnit.id) : secondUnit.id)
    }
  }, [category])

  // Perform conversion when inputs change
  useEffect(() => {
    if (fromUnit && toUnit && fromValue) {
      convert()
    }
  }, [category, fromUnit, toUnit, fromValue])

  // Search for units
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results: any[] = []

    Object.keys(units).forEach((categoryKey) => {
      units[categoryKey].forEach((unit) => {
        if (
          unit.name.toLowerCase().includes(query) ||
          unit.id.toLowerCase().includes(query) ||
          (unit.description && unit.description.toLowerCase().includes(query)) ||
          (unit.region && unit.region.toLowerCase().includes(query))
        ) {
          results.push({
            ...unit,
            category: categoryKey,
            categoryName: categories.find((c) => c.id === categoryKey)?.name || categoryKey,
          })
        }
      })
    })

    setSearchResults(results)
  }, [searchQuery])

  // Convert between units
  const convert = () => {
    if (!fromUnit || !toUnit || !fromValue) return

    const fromValueNum = Number.parseFloat(fromValue)
    if (isNaN(fromValueNum)) {
      setToValue("Invalid input")
      return
    }

    // Handle temperature conversions separately
    if (category === "temperature") {
      const result = convertTemperature(fromValueNum, fromUnit, toUnit)
      setToValue(result.toFixed(8).replace(/\.?0+$/, ""))
      addToHistory(fromValueNum, result)
      return
    }

    // For other categories
    const fromUnitObj = units[category].find((u) => u.id === fromUnit)
    const toUnitObj = units[category].find((u) => u.id === toUnit)

    if (!fromUnitObj || !toUnitObj) {
      setToValue("Unit not found")
      return
    }

    // Convert to base unit, then to target unit
    let result
    if (fromUnitObj.base) {
      result = fromValueNum * (toUnitObj.factor / 1)
    } else if (toUnitObj.base) {
      result = fromValueNum * (1 / fromUnitObj.factor)
    } else {
      result = fromValueNum * (toUnitObj.factor / fromUnitObj.factor)
    }

    setToValue(result.toFixed(8).replace(/\.?0+$/, ""))
    addToHistory(fromValueNum, result)
  }

  // Convert temperature
  const convertTemperature = (value: number, from: string, to: string) => {
    if (from === to) return value

    // First convert to Celsius as the intermediate unit
    let celsius
    if (from === "C") {
      celsius = value
    } else {
      const conversionFunc = temperatureConversions[`${from}_to_C`]
      celsius = conversionFunc(value)
    }

    // Then convert from Celsius to the target unit
    if (to === "C") {
      return celsius
    } else {
      const conversionFunc = temperatureConversions[`C_to_${to}`]
      return conversionFunc(celsius)
    }
  }

  // Add conversion to history
  const addToHistory = (fromVal: number, toVal: number) => {
    const fromUnitObj = units[category].find((u) => u.id === fromUnit)
    const toUnitObj = units[category].find((u) => u.id === toUnit)

    if (!fromUnitObj || !toUnitObj) return

    const newEntry: ConversionHistory = {
      id: Date.now().toString(),
      fromValue: fromVal,
      fromUnit,
      fromUnitName: fromUnitObj.name,
      toValue: toVal,
      toUnit,
      toUnitName: toUnitObj.name,
      category,
      date: new Date().toLocaleString(),
    }

    const updatedHistory = [newEntry, ...history].slice(0, 50) // Keep only the last 50 entries
    setHistory(updatedHistory)
    localStorage.setItem("unitConverterHistory", JSON.stringify(updatedHistory))
  }

  // Clear history
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("unitConverterHistory")
    toast({
      title: "History cleared",
      description: "Your conversion history has been cleared.",
      duration: 2000,
    })
  }

  // Add to favorites
  const addToFavorites = () => {
    const fromUnitObj = units[category].find((u) => u.id === fromUnit)
    const toUnitObj = units[category].find((u) => u.id === toUnit)

    if (!fromUnitObj || !toUnitObj) return

    // Check if already in favorites
    const alreadyExists = favorites.some(
      (fav) => fav.fromUnit === fromUnit && fav.toUnit === toUnit && fav.category === category,
    )

    if (alreadyExists) {
      toast({
        title: "Already in favorites",
        description: "This conversion is already in your favorites.",
        duration: 2000,
      })
      return
    }

    const newFavorite: FavoriteConversion = {
      id: Date.now().toString(),
      fromUnit,
      fromUnitName: fromUnitObj.name,
      toUnit,
      toUnitName: toUnitObj.name,
      category,
    }

    const updatedFavorites = [newFavorite, ...favorites]
    setFavorites(updatedFavorites)
    localStorage.setItem("unitConverterFavorites", JSON.stringify(updatedFavorites))

    toast({
      title: "Added to favorites",
      description: `${fromUnitObj.name} to ${toUnitObj.name} conversion has been saved.`,
      duration: 2000,
    })
  }

  // Remove from favorites
  const removeFromFavorites = (id: string) => {
    const updatedFavorites = favorites.filter((fav) => fav.id !== id)
    setFavorites(updatedFavorites)
    localStorage.setItem("unitConverterFavorites", JSON.stringify(updatedFavorites))

    toast({
      title: "Removed from favorites",
      description: "The conversion has been removed from your favorites.",
      duration: 2000,
    })
  }

  // Load a favorite conversion
  const loadFavorite = (favorite: FavoriteConversion) => {
    setCategory(favorite.category)
    setFromUnit(favorite.fromUnit)
    setToUnit(favorite.toUnit)

    toast({
      title: "Favorite loaded",
      description: `Loaded ${favorite.fromUnitName} to ${favorite.toUnitName} conversion.`,
      duration: 2000,
    })
  }

  // Load a conversion from history
  const loadFromHistory = (historyItem: ConversionHistory) => {
    setCategory(historyItem.category)
    setFromUnit(historyItem.fromUnit)
    setToUnit(historyItem.toUnit)
    setFromValue(historyItem.fromValue.toString())

    toast({
      title: "Loaded from history",
      description: `Loaded conversion from ${historyItem.date}.`,
      duration: 2000,
    })
  }

  // Show unit information
  const showUnitInfo = (unitId: string, categoryId: string) => {
    const unit = units[categoryId].find((u) => u.id === unitId)
    if (unit) {
      setUnitInfo({
        ...unit,
        category: categoryId,
        categoryName: categories.find((c) => c.id === categoryId)?.name || categoryId,
      })
    }
  }

  // Copy result to clipboard
  const copyResult = () => {
    navigator.clipboard.writeText(`${fromValue} ${getUnitName(fromUnit)} = ${toValue} ${getUnitName(toUnit)}`)
    toast({
      title: "Copied to clipboard",
      description: `${fromValue} ${getUnitName(fromUnit)} = ${toValue} ${getUnitName(toUnit)}`,
      duration: 2000,
    })
  }

  // Get unit name by ID
  const getUnitName = (unitId: string) => {
    const unit = units[category].find((u) => u.id === unitId)
    return unit ? unit.name : unitId
  }

  // Check if current conversion is in favorites
  const isInFavorites = () => {
    return favorites.some((fav) => fav.fromUnit === fromUnit && fav.toUnit === toUnit && fav.category === category)
  }

  // Swap from and to units
  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setFromValue(toValue)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Advanced Unit Converter</CardTitle>
              <CardDescription>Convert between common, historical, and obscure units of measurement</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)}>
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {showSearch && (
            <div className="mt-4">
              <Input
                placeholder="Search for units..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />

              {searchResults.length > 0 && (
                <ScrollArea className="h-60 mt-2 border rounded-md">
                  <div className="p-2">
                    {searchResults.map((result, index) => (
                      <div
                        key={`${result.category}-${result.id}-${index}`}
                        className="p-2 hover:bg-muted rounded-md cursor-pointer"
                        onClick={() => {
                          setCategory(result.category)
                          setFromUnit(result.id)
                          setShowSearch(false)
                          setSearchQuery("")
                        }}
                      >
                        <div className="flex justify-between">
                          <div>
                            <span className="font-medium">{result.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({result.id})</span>
                          </div>
                          <Badge variant="outline">{result.categoryName}</Badge>
                        </div>
                        {result.description && (
                          <p className="text-xs text-muted-foreground mt-1">{result.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Region: {result.region}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="text-center py-4 text-muted-foreground border rounded-md mt-2">
                  No units found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="converter" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="converter">Converter</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="converter" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Converter */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="flex justify-between items-center">
                        <Label htmlFor="fromUnit">From</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showUnitInfo(fromUnit, category)}
                          className="h-6 px-2"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Select value={fromUnit} onValueChange={setFromUnit}>
                          <SelectTrigger id="fromUnit">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {units[category]?.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name}
                                {unit.base && <span className="ml-2 text-xs text-muted-foreground">(Base)</span>}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="text"
                          value={fromValue}
                          onChange={(e) => setFromValue(e.target.value)}
                          className="w-32"
                        />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button variant="ghost" size="icon" onClick={swapUnits}>
                        <ArrowRight className="h-5 w-5 rotate-90" />
                      </Button>
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <Label htmlFor="toUnit">To</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showUnitInfo(toUnit, category)}
                          className="h-6 px-2"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Select value={toUnit} onValueChange={setToUnit}>
                          <SelectTrigger id="toUnit">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {units[category]?.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name}
                                {unit.base && <span className="ml-2 text-xs text-muted-foreground">(Base)</span>}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input type="text" value={toValue} readOnly className="w-32 bg-muted" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={convert} className="flex-1">
                      Convert
                    </Button>
                    <Button variant="outline" onClick={copyResult}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant={isInFavorites() ? "destructive" : "outline"}
                      onClick={
                        isInFavorites()
                          ? () => {
                              const fav = favorites.find(
                                (f) => f.fromUnit === fromUnit && f.toUnit === toUnit && f.category === category,
                              )
                              if (fav) removeFromFavorites(fav.id)
                            }
                          : addToFavorites
                      }
                    >
                      {isInFavorites() ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Right column - Unit Information */}
                <div>
                  <div className="border rounded-md p-4 h-full">
                    <h3 className="text-lg font-medium mb-2">Unit Information</h3>

                    {unitInfo ? (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium">{unitInfo.name}</h4>
                          <Badge variant="outline">{unitInfo.categoryName}</Badge>
                          <Badge variant="outline" className="ml-2">
                            {unitInfo.region}
                          </Badge>
                        </div>

                        {unitInfo.description && <p className="text-sm">{unitInfo.description}</p>}

                        {unitInfo.factor && (
                          <div className="text-sm">
                            <p>Conversion factor: {unitInfo.factor}</p>
                            {unitInfo.base && <p className="text-muted-foreground">This is a base unit</p>}
                          </div>
                        )}

                        <div className="pt-2">
                          <h5 className="text-sm font-medium">Example Conversions:</h5>
                          <div className="space-y-1 mt-1 text-sm">
                            {units[unitInfo.category]
                              .filter((u) => u.id !== unitInfo.id)
                              .slice(0, 3)
                              .map((u, i) => {
                                const value = 1
                                let result

                                if (unitInfo.category === "temperature") {
                                  result = convertTemperature(value, unitInfo.id, u.id)
                                } else if (unitInfo.base) {
                                  result = value * (u.factor / 1)
                                } else if (u.base) {
                                  result = value * (1 / unitInfo.factor)
                                } else {
                                  result = value * (u.factor / unitInfo.factor)
                                }

                                return (
                                  <p key={i}>
                                    1 {unitInfo.name} = {result.toFixed(6).replace(/\.?0+$/, "")} {u.name}
                                  </p>
                                )
                              })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>Click the info icon next to a unit to see details</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              {favorites.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                  <Star className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No favorite conversions yet. Add some by clicking the star icon.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {favorites.map((favorite) => (
                    <Card key={favorite.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-medium">
                                {favorite.fromUnitName} to {favorite.toUnitName}
                              </h4>
                              <Badge variant="outline" className="ml-2">
                                {categories.find((c) => c.id === favorite.category)?.name || favorite.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {favorite.fromUnit} → {favorite.toUnit}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => loadFavorite(favorite)}>
                              Load
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeFromFavorites(favorite.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Conversion History</h3>
                {history.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={clearHistory}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No conversion history yet. Your recent conversions will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {history.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-medium">
                                {item.fromValue} {item.fromUnitName} = {item.toValue.toFixed(6).replace(/\.?0+$/, "")}{" "}
                                {item.toUnitName}
                              </h4>
                              <Badge variant="outline" className="ml-2">
                                {categories.find((c) => c.id === item.category)?.name || item.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {item.date}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => loadFromHistory(item)}>
                            Load
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Includes {Object.values(units).reduce((acc, curr) => acc + curr.length, 0)} units across {categories.length}{" "}
            categories
          </div>
        </CardFooter>
      </Card>

      {/* Unit Information Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <span className="hidden">Open Unit Info</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unit Information</DialogTitle>
            <DialogDescription>Details about the selected unit of measurement</DialogDescription>
          </DialogHeader>
          {unitInfo && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{unitInfo.name}</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">{unitInfo.categoryName}</Badge>
                  <Badge variant="outline">{unitInfo.region}</Badge>
                  {unitInfo.base && <Badge>Base Unit</Badge>}
                </div>
              </div>

              {unitInfo.description && (
                <div>
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="text-sm">{unitInfo.description}</p>
                </div>
              )}

              {unitInfo.factor && (
                <div>
                  <h4 className="text-sm font-medium">Conversion Factor</h4>
                  <p className="text-sm">{unitInfo.factor}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

