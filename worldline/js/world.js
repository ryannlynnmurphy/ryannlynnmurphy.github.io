/* WORLDLINE — world description
 *
 * This file is the *stated world*: the regions, the drivers, the causal graph,
 * the source registry, and the authored signals. It contains no numbers that
 * are presented as findings. Everything here is either
 *   (a) a structural fact (where a place is, what borders what), or
 *   (b) a declared parameter of this prototype's model.
 *
 * Model outputs live in model.js and are computed from these parameters.
 * Nothing in WORLDLINE is a published forecast. See METHOD in the interface.
 */

/* ------------------------------------------------------------------ *
 * SOURCES
 * Real datasets and assessments. These are the evidence base the driver
 * shapes are drawn from — they are not the origin of any specific number
 * shown in this interface. That distinction is stated in the UI.
 * ------------------------------------------------------------------ */

export const SOURCES = {
  ipcc_wg1: { org: 'IPCC', title: 'AR6 Working Group I — The Physical Science Basis', year: 2021, url: 'https://www.ipcc.ch/report/ar6/wg1/' },
  ipcc_wg2: { org: 'IPCC', title: 'AR6 Working Group II — Impacts, Adaptation and Vulnerability', year: 2022, url: 'https://www.ipcc.ch/report/ar6/wg2/' },
  gistemp:  { org: 'NASA GISS', title: 'GISTEMP Surface Temperature Analysis', year: null, url: 'https://data.giss.nasa.gov/gistemp/' },
  nsidc:    { org: 'NSIDC', title: 'Sea Ice Index', year: null, url: 'https://nsidc.org/data/seaice_index' },
  noaa_slr: { org: 'NOAA', title: 'Global and Regional Sea Level Rise Scenarios', year: 2022, url: 'https://oceanservice.noaa.gov/hazards/sealevelrise/' },
  wpp:      { org: 'UN DESA', title: 'World Population Prospects', year: 2024, url: 'https://population.un.org/wpp/' },
  aqueduct: { org: 'World Resources Institute', title: 'Aqueduct Water Risk Atlas', year: null, url: 'https://www.wri.org/aqueduct' },
  aquastat: { org: 'FAO', title: 'AQUASTAT — Global Water Information System', year: null, url: 'https://www.fao.org/aquastat/' },
  fao_sofi: { org: 'FAO / IFAD / UNICEF / WFP / WHO', title: 'The State of Food Security and Nutrition in the World', year: null, url: 'https://www.fao.org/publications/sofi/' },
  ucdp:     { org: 'Uppsala University', title: 'UCDP Georeferenced Event Dataset', year: null, url: 'https://ucdp.uu.se/' },
  acled:    { org: 'ACLED', title: 'Armed Conflict Location & Event Data', year: null, url: 'https://acleddata.com/' },
  sipri:    { org: 'SIPRI', title: 'Military Expenditure Database', year: null, url: 'https://www.sipri.org/databases/milex' },
  unhcr:    { org: 'UNHCR', title: 'Global Trends — Forced Displacement', year: null, url: 'https://www.unhcr.org/global-trends' },
  idmc:     { org: 'IDMC', title: 'Global Report on Internal Displacement', year: null, url: 'https://www.internal-displacement.org/global-report/' },
  iom:      { org: 'IOM', title: 'Migration Data Portal', year: null, url: 'https://www.migrationdataportal.org/' },
  iea:      { org: 'IEA', title: 'World Energy Outlook', year: null, url: 'https://www.iea.org/topics/world-energy-outlook' },
  iea_cm:   { org: 'IEA', title: 'Global Critical Minerals Outlook', year: null, url: 'https://www.iea.org/topics/critical-minerals' },
  usgs:     { org: 'USGS', title: 'Mineral Commodity Summaries', year: null, url: 'https://www.usgs.gov/centers/national-minerals-information-center' },
  unctad:   { org: 'UNCTAD', title: 'Review of Maritime Transport', year: null, url: 'https://unctad.org/topic/transport-and-trade-logistics/review-of-maritime-transport' },
  wdi:      { org: 'World Bank', title: 'World Development Indicators', year: null, url: 'https://databank.worldbank.org/source/world-development-indicators' },
  imf:      { org: 'IMF', title: 'World Economic Outlook Database', year: null, url: 'https://www.imf.org/en/Publications/WEO' },
  emdat:    { org: 'CRED / UCLouvain', title: 'EM-DAT International Disaster Database', year: null, url: 'https://www.emdat.be/' },
  celestrak:{ org: 'CelesTrak', title: 'Satellite Catalogue (SATCAT)', year: null, url: 'https://celestrak.org/satcat/search.php' },
  esa_env:  { org: 'ESA', title: 'Annual Space Environment Report', year: null, url: 'https://www.esa.int/Space_Safety/Space_Debris' },
  unoosa:   { org: 'UNOOSA', title: 'Online Index of Objects Launched into Outer Space', year: null, url: 'https://www.unoosa.org/oosa/osoindex/' },
  nasa_m2m: { org: 'NASA', title: 'Moon to Mars Architecture', year: null, url: 'https://www.nasa.gov/moontomarsarchitecture/' },
  imo:      { org: 'IMO', title: 'Polar Code and Arctic shipping guidance', year: null, url: 'https://www.imo.org/en/OurWork/Safety/Pages/polar-code.aspx' },
  amap:     { org: 'AMAP', title: 'Arctic Climate Change Update', year: null, url: 'https://www.amap.no/' },
  naturale: { org: 'Natural Earth', title: 'Public-domain cartographic dataset (1:110m)', year: null, url: 'https://www.naturalearthdata.com/' },
};

/* ------------------------------------------------------------------ *
 * DRIVERS
 * The variables the model actually moves. Each declares how its shape
 * was constructed, so a reader can disagree with the construction.
 * ------------------------------------------------------------------ */

export const DRIVERS = {
  warming: {
    label: 'Temperature anomaly',
    unit: '°C above pre-industrial',
    note: 'A single smooth trajectory whose equilibrium is set by the mitigation knobs. It is drawn inside the SSP1-1.9 → SSP5-8.5 envelope assessed in AR6 WG1; the interpolation between those bounds is this prototype\'s, not the IPCC\'s.',
    sources: ['ipcc_wg1', 'gistemp'],
  },
  seaLevel: {
    label: 'Global mean sea level',
    unit: 'm above 2000 baseline',
    note: 'Integrated year by year from the temperature trajectory using a semi-empirical rate. Deliberately simple: it reproduces the direction and rough magnitude of the AR6 / NOAA scenario range, not any specific scenario.',
    sources: ['ipcc_wg1', 'noaa_slr'],
  },
  population: {
    label: 'Population',
    unit: 'millions',
    note: 'Regional logistic curves with a declared peak year and peak multiplier, shaped after the World Population Prospects medium variant. Peaks and declines are parameters in this file.',
    sources: ['wpp'],
  },
  water: {
    label: 'Freshwater stress',
    unit: 'index 0–100',
    note: 'Baseline stress per region, escalated by warming and population and reduced by adaptation investment. Baselines are ordinal, informed by Aqueduct/AQUASTAT rankings.',
    sources: ['aqueduct', 'aquastat'],
  },
  crop: {
    label: 'Crop suitability',
    unit: 'index 0–100',
    note: 'Falls with warming at a regionally declared sensitivity; some high-latitude regions gain. Adaptation offsets part of the loss.',
    sources: ['ipcc_wg2', 'fao_sofi'],
  },
  coastal: {
    label: 'Coastal exposure',
    unit: 'index 0–100',
    note: 'Regional exposure weight multiplied by modelled sea level. A weight, not a measured share of land or population.',
    sources: ['noaa_slr', 'ipcc_wg2'],
  },
  governance: {
    label: 'State capacity',
    unit: 'index 0–100',
    note: 'A declared baseline, modified by trade openness and eroded by sustained pressure. This is the crudest driver in the model and the one most worth arguing with.',
    sources: ['wdi'],
  },
  militarization: {
    label: 'Military posture',
    unit: 'index 0–100',
    note: 'Declared baseline scaled by the military-spending assumption. Reflects posture and concentration, not order of battle.',
    sources: ['sipri'],
  },
  economy: { label: 'Economic weight', unit: 'index 0–100', note: 'Declared baseline with a growth term modulated by trade and AI adoption.', sources: ['imf', 'wdi'] },
  tech: { label: 'Technological capability', unit: 'index 0–100', note: 'Declared baseline with an AI-adoption term. A capability proxy, not an output measure.', sources: ['wdi'] },
  energy: { label: 'Energy endowment', unit: 'index 0–100', note: 'Hydrocarbon-weighted endowment that loses salience as the energy transition proceeds.', sources: ['iea'] },
  minerals: { label: 'Critical minerals', unit: 'index 0–100', note: 'Endowment that gains salience as the energy transition proceeds — the inverse move to hydrocarbons.', sources: ['iea_cm', 'usgs'] },
  choke: { label: 'Chokepoint salience', unit: 'index 0–100', note: 'Share of trade that must physically pass here. Rises with trade volume; some chokepoints lose salience when new routes open.', sources: ['unctad'] },
  space: { label: 'Space capability', unit: 'index 0–100', note: 'Ground infrastructure and launch access, growing with the space-investment assumption.', sources: ['celestrak', 'unoosa', 'nasa_m2m'] },
};

/* ------------------------------------------------------------------ *
 * REGIONS
 * Structural facts (position, kind) plus declared model parameters.
 * heat = regional warming amplification relative to global mean.
 * ------------------------------------------------------------------ */

const R = (id, name, lat, lng, kind, p) => ({ id, name, lat, lng, kind, ...p });

export const REGIONS = [
  R('arctic', 'Arctic Ocean Basin', 79, 25, 'system', { pop: [0.4, 2100, 2.0], heat: 3.1, water: 5, waterSens: 0.1, crop: 8, cropSens: 0.9, coast: 0.3, gov: 62, mil: 46, econ: 12, tech: 44, energy: 74, minerals: 46, choke: 8, launch: 18, q: 0.72 }),
  R('greenland', 'Greenland', 72, -42, 'territory', { pop: [0.06, 2120, 1.6], heat: 2.9, water: 2, waterSens: 0.1, crop: 6, cropSens: 0.7, coast: 0.2, gov: 66, mil: 20, econ: 6, tech: 40, energy: 22, minerals: 78, choke: 6, launch: 8, q: 0.7 }),
  R('siberia', 'Siberian Interior', 62, 100, 'region', { pop: [24, 2060, 1.0], heat: 2.4, water: 14, waterSens: 0.3, crop: 40, cropSens: 0.6, coast: 0.1, gov: 48, mil: 62, econ: 24, tech: 46, energy: 88, minerals: 62, choke: 10, launch: 40, q: 0.62 }),
  R('canada-north', 'Northern Canada', 61, -104, 'region', { pop: [3.2, 2090, 1.5], heat: 2.6, water: 8, waterSens: 0.2, crop: 44, cropSens: 0.8, coast: 0.15, gov: 82, mil: 34, econ: 30, tech: 66, energy: 70, minerals: 72, choke: 12, launch: 20, q: 0.86 }),
  R('northern-europe', 'Northern Europe', 60, 16, 'region', { pop: [34, 2055, 1.03], heat: 1.5, water: 12, waterSens: 0.3, crop: 74, cropSens: 0.25, coast: 0.28, gov: 90, mil: 44, econ: 62, tech: 84, energy: 40, minerals: 40, choke: 22, launch: 30, q: 0.94 }),
  R('western-europe', 'Western Europe', 48, 4, 'region', { pop: [196, 2042, 1.02], heat: 1.35, water: 34, waterSens: 0.6, crop: 78, cropSens: -0.45, coast: 0.4, gov: 86, mil: 48, econ: 82, tech: 86, energy: 20, minerals: 18, choke: 34, launch: 44, q: 0.95 }),
  R('mediterranean', 'Western Mediterranean', 38, 8, 'region', { pop: [118, 2038, 1.01], heat: 1.6, water: 62, waterSens: 1.0, crop: 66, cropSens: -0.95, coast: 0.44, gov: 72, mil: 40, econ: 54, tech: 68, energy: 16, minerals: 20, choke: 40, launch: 22, q: 0.9 }),
  R('eastern-med', 'Eastern Mediterranean & Levant', 34, 36, 'region', { pop: [128, 2070, 1.34], heat: 1.7, water: 82, waterSens: 1.15, crop: 44, cropSens: -1.0, coast: 0.3, gov: 40, mil: 72, econ: 30, tech: 48, energy: 34, minerals: 14, choke: 46, launch: 12, q: 0.74 }),
  R('black-sea', 'Black Sea Basin', 44, 34, 'system', { pop: [92, 2040, 0.99], heat: 1.5, water: 34, waterSens: 0.5, crop: 82, cropSens: -0.4, coast: 0.22, gov: 46, mil: 84, econ: 32, tech: 52, energy: 44, minerals: 26, choke: 58, launch: 18, q: 0.7 }),
  R('gulf', 'Persian Gulf', 26, 51, 'system', { pop: [82, 2075, 1.35], heat: 1.85, water: 94, waterSens: 1.0, crop: 12, cropSens: -0.8, coast: 0.5, gov: 58, mil: 76, econ: 56, tech: 54, energy: 96, minerals: 12, choke: 82, launch: 22, q: 0.8 }),
  R('red-sea', 'Red Sea & Bab el-Mandeb', 16, 41, 'system', { pop: [64, 2085, 1.7], heat: 1.75, water: 88, waterSens: 1.05, crop: 18, cropSens: -0.85, coast: 0.34, gov: 26, mil: 62, econ: 14, tech: 26, energy: 22, minerals: 20, choke: 88, launch: 6, q: 0.6 }),
  R('nile-delta', 'Nile Delta', 30.6, 31, 'delta', { pop: [112, 2080, 1.6], heat: 1.6, water: 86, waterSens: 1.1, crop: 58, cropSens: -0.9, coast: 0.92, gov: 44, mil: 60, econ: 26, tech: 40, energy: 26, minerals: 14, choke: 72, launch: 8, q: 0.78 }),
  R('sahel', 'Sahel', 14, 4, 'region', { pop: [178, 2100, 3.0], heat: 1.8, water: 78, waterSens: 1.2, crop: 34, cropSens: -1.15, coast: 0.05, gov: 20, mil: 44, econ: 8, tech: 16, energy: 20, minerals: 46, choke: 6, launch: 4, q: 0.5 }),
  R('horn-africa', 'Horn of Africa', 8, 42, 'region', { pop: [166, 2100, 2.6], heat: 1.7, water: 84, waterSens: 1.2, crop: 30, cropSens: -1.1, coast: 0.18, gov: 22, mil: 48, econ: 9, tech: 18, energy: 14, minerals: 30, choke: 66, launch: 4, q: 0.5 }),
  R('gulf-guinea', 'Gulf of Guinea', 6, 3, 'coast', { pop: [268, 2100, 2.7], heat: 1.45, water: 42, waterSens: 0.7, crop: 58, cropSens: -0.7, coast: 0.62, gov: 30, mil: 40, econ: 20, tech: 28, energy: 62, minerals: 42, choke: 26, launch: 6, q: 0.56 }),
  R('congo-basin', 'Congo Basin', -2, 22, 'system', { pop: [148, 2100, 2.9], heat: 1.4, water: 16, waterSens: 0.4, crop: 62, cropSens: -0.6, coast: 0.04, gov: 18, mil: 42, econ: 7, tech: 14, energy: 30, minerals: 92, choke: 8, launch: 2, q: 0.44 }),
  R('southern-africa', 'Southern Africa', -26, 26, 'region', { pop: [82, 2090, 1.5], heat: 1.75, water: 70, waterSens: 1.0, crop: 48, cropSens: -0.9, coast: 0.2, gov: 46, mil: 32, econ: 26, tech: 44, energy: 40, minerals: 86, choke: 30, launch: 12, q: 0.72 }),
  R('himalaya', 'Third Pole — Himalaya', 33, 84, 'system', { pop: [58, 2065, 1.2], heat: 2.1, water: 46, waterSens: 1.3, crop: 26, cropSens: -0.8, coast: 0.02, gov: 44, mil: 78, econ: 14, tech: 34, energy: 26, minerals: 40, choke: 20, launch: 6, q: 0.6 }),
  R('south-asia', 'Indo-Gangetic Plain', 26, 81, 'region', { pop: [742, 2064, 1.22], heat: 1.55, water: 88, waterSens: 1.25, crop: 62, cropSens: -1.05, coast: 0.16, gov: 48, mil: 70, econ: 46, tech: 58, energy: 32, minerals: 34, choke: 24, launch: 52, q: 0.76 }),
  R('bengal-delta', 'Bengal Delta', 23, 90, 'delta', { pop: [196, 2060, 1.18], heat: 1.5, water: 62, waterSens: 0.9, crop: 66, cropSens: -0.95, coast: 0.96, gov: 38, mil: 34, econ: 20, tech: 34, energy: 18, minerals: 12, choke: 30, launch: 6, q: 0.72 }),
  R('central-asia', 'Central Asia', 44, 66, 'region', { pop: [82, 2075, 1.4], heat: 1.9, water: 80, waterSens: 1.15, crop: 40, cropSens: -0.9, coast: 0.02, gov: 40, mil: 46, econ: 22, tech: 36, energy: 68, minerals: 74, choke: 34, launch: 46, q: 0.6 }),
  R('mekong', 'Mekong Basin', 14, 105, 'system', { pop: [252, 2058, 1.12], heat: 1.4, water: 56, waterSens: 1.0, crop: 74, cropSens: -0.85, coast: 0.58, gov: 44, mil: 44, econ: 32, tech: 46, energy: 30, minerals: 38, choke: 32, launch: 8, q: 0.66 }),
  R('malacca', 'Malacca & Maritime SE Asia', 2, 103, 'system', { pop: [304, 2070, 1.3], heat: 1.35, water: 30, waterSens: 0.5, crop: 66, cropSens: -0.6, coast: 0.7, gov: 54, mil: 46, econ: 44, tech: 58, energy: 42, minerals: 58, choke: 94, launch: 18, q: 0.76 }),
  R('east-china', 'Eastern China', 31, 117, 'region', { pop: [712, 2028, 1.0], heat: 1.5, water: 66, waterSens: 0.95, crop: 62, cropSens: -0.7, coast: 0.56, gov: 74, mil: 88, econ: 88, tech: 88, energy: 34, minerals: 62, choke: 60, launch: 82, q: 0.78 }),
  R('taiwan-strait', 'Taiwan Strait', 24.5, 119.5, 'system', { pop: [46, 2032, 1.0], heat: 1.45, water: 34, waterSens: 0.6, crop: 40, cropSens: -0.5, coast: 0.5, gov: 72, mil: 94, econ: 62, tech: 96, energy: 10, minerals: 10, choke: 86, launch: 20, q: 0.82 }),
  R('korea-japan', 'Korea & Japan', 36, 133, 'region', { pop: [176, 2026, 1.0], heat: 1.45, water: 22, waterSens: 0.4, crop: 44, cropSens: -0.4, coast: 0.52, gov: 84, mil: 66, econ: 76, tech: 92, energy: 8, minerals: 14, choke: 44, launch: 54, q: 0.94 }),
  R('australia', 'Australia', -25, 134, 'region', { pop: [28, 2090, 1.6], heat: 1.65, water: 72, waterSens: 1.0, crop: 42, cropSens: -0.9, coast: 0.3, gov: 84, mil: 46, econ: 48, tech: 74, energy: 66, minerals: 90, choke: 26, launch: 34, q: 0.93 }),
  R('pacific-islands', 'Pacific Island States', -10, 172, 'system', { pop: [3, 2075, 1.4], heat: 1.3, water: 58, waterSens: 0.8, crop: 34, cropSens: -0.7, coast: 1.0, gov: 44, mil: 10, econ: 4, tech: 22, energy: 6, minerals: 30, choke: 18, launch: 10, q: 0.62 }),
  R('andes', 'Tropical Andes', -13, -73, 'system', { pop: [78, 2070, 1.25], heat: 1.9, water: 58, waterSens: 1.2, crop: 44, cropSens: -0.85, coast: 0.12, gov: 40, mil: 30, econ: 20, tech: 36, energy: 32, minerals: 88, choke: 14, launch: 6, q: 0.66 }),
  R('amazon', 'Amazon Basin', -5, -60, 'system', { pop: [36, 2080, 1.5], heat: 1.6, water: 12, waterSens: 0.9, crop: 56, cropSens: -1.0, coast: 0.08, gov: 42, mil: 30, econ: 18, tech: 34, energy: 34, minerals: 60, choke: 8, launch: 12, q: 0.6 }),
  R('la-plata', 'Río de la Plata Basin', -32, -60, 'region', { pop: [124, 2060, 1.15], heat: 1.5, water: 30, waterSens: 0.6, crop: 88, cropSens: -0.55, coast: 0.3, gov: 52, mil: 26, econ: 38, tech: 52, energy: 42, minerals: 70, choke: 26, launch: 10, q: 0.8 }),
  R('central-america', 'Central America', 15.5, -89, 'region', { pop: [56, 2075, 1.35], heat: 1.55, water: 62, waterSens: 1.05, crop: 50, cropSens: -1.0, coast: 0.44, gov: 30, mil: 28, econ: 14, tech: 28, energy: 14, minerals: 30, choke: 20, launch: 4, q: 0.6 }),
  R('panama', 'Panama & the Isthmus', 9, -79.5, 'system', { pop: [5, 2080, 1.4], heat: 1.5, water: 48, waterSens: 1.2, crop: 40, cropSens: -0.8, coast: 0.5, gov: 54, mil: 18, econ: 22, tech: 42, energy: 8, minerals: 20, choke: 84, launch: 4, q: 0.78 }),
  R('caribbean', 'Caribbean', 18, -71, 'region', { pop: [46, 2065, 1.15], heat: 1.4, water: 56, waterSens: 0.9, crop: 40, cropSens: -0.85, coast: 0.88, gov: 38, mil: 16, econ: 16, tech: 30, energy: 14, minerals: 22, choke: 34, launch: 6, q: 0.7 }),
  R('us-southwest', 'North American Southwest', 34, -111, 'region', { pop: [62, 2070, 1.3], heat: 1.75, water: 90, waterSens: 1.1, crop: 44, cropSens: -1.0, coast: 0.12, gov: 78, mil: 62, econ: 66, tech: 88, energy: 56, minerals: 52, choke: 16, launch: 62, q: 0.95 }),
  R('gulf-coast', 'US Gulf Coast', 29.4, -92, 'coast', { pop: [42, 2065, 1.25], heat: 1.5, water: 34, waterSens: 0.5, crop: 60, cropSens: -0.6, coast: 0.82, gov: 76, mil: 58, econ: 62, tech: 78, energy: 84, minerals: 30, choke: 44, launch: 78, q: 0.95 }),
  R('great-lakes', 'Great Lakes', 44, -84, 'system', { pop: [86, 2060, 1.12], heat: 1.6, water: 8, waterSens: 0.2, crop: 82, cropSens: -0.25, coast: 0.08, gov: 82, mil: 48, econ: 74, tech: 86, energy: 34, minerals: 44, choke: 18, launch: 26, q: 0.95 }),
];

export const REGION_BY_ID = Object.fromEntries(REGIONS.map(r => [r.id, r]));

/* ------------------------------------------------------------------ *
 * CAUSAL GRAPH
 * The relationship vocabulary. Every chain shown in the interface is a
 * path through these nodes — the arrows are data, not decoration.
 * ------------------------------------------------------------------ */

const N = (id, label, layer, about) => ({ id, label, layer, about });

export const NODES = [
  N('warming', 'Warming', 'climate', 'Rising mean surface temperature and the shift of climate zones that follows it.'),
  N('ice-loss', 'Ice loss', 'climate', 'Loss of sea ice, land ice and permafrost integrity.'),
  N('sea-level', 'Sea-level rise', 'climate', 'Thermal expansion plus land-ice melt, expressed as coastal exposure.'),
  N('water-stress', 'Water stress', 'climate', 'Demand for freshwater exceeding renewable supply, seasonally or structurally.'),
  N('crop-loss', 'Agricultural decline', 'climate', 'Falling yields and the poleward drift of crop suitability.'),
  N('extreme-heat', 'Extreme heat', 'climate', 'Days beyond the limits of outdoor labour and unassisted survival.'),
  N('food-insecurity', 'Food insecurity', 'climate', 'Where production loss, price transmission and income meet.'),
  N('adaptation', 'Adaptation', 'climate', 'Investment that converts pressure into cost instead of collapse. The model treats this as a choice, not a given.'),

  N('population', 'Demographic change', 'migration', 'Growth, decline, ageing, and where working-age people are.'),
  N('displacement', 'Displacement', 'migration', 'Movement forced by pressure rather than chosen for opportunity.'),
  N('migration-pressure', 'Migration pressure', 'migration', 'Accumulated reason to leave, before any question of whether leaving is possible.'),
  N('urbanisation', 'Urbanisation', 'migration', 'Concentration of population and assets into a smaller footprint.'),
  N('labour-gap', 'Labour shortfall', 'migration', 'Shrinking working-age populations in high-capacity economies.'),

  N('governance', 'State capacity', 'power', 'The ability of a state to deliver, tax, police and absorb shocks.'),
  N('instability', 'Political instability', 'conflict', 'Contested legitimacy, irregular transfers of power, loss of monopoly on force.'),
  N('militarisation', 'Military buildup', 'conflict', 'Force posture, procurement, and forward basing.'),
  N('conflict-risk', 'Conflict risk', 'conflict', 'Elevated probability of organised violence under current conditions. Never a prediction of a war.'),
  N('territorial', 'Territorial dispute', 'conflict', 'Contested sovereignty over land, water, seabed or orbit.'),
  N('chokepoint', 'Chokepoint exposure', 'conflict', 'Trade that must physically pass through a place that can be closed.'),

  N('energy', 'Energy access', 'resources', 'Who has it, who sells it, and what it is worth once the transition proceeds.'),
  N('minerals', 'Critical minerals', 'resources', 'The inputs to electrification, storage, and computation.'),
  N('extraction', 'Extraction', 'resources', 'The physical act of taking a resource out of a place.'),
  N('transport', 'Transport', 'resources', 'Routes, ports, cables, and pipelines.'),
  N('processing', 'Processing', 'resources', 'Where raw material becomes usable — historically more concentrated than extraction.'),
  N('shipping', 'Shipping access', 'resources', 'Navigable routes, and the seasons in which they are navigable.'),

  N('economy', 'Economic weight', 'power', 'Output, market size, and the ability to finance.'),
  N('technology', 'Technological capability', 'power', 'Compute, fabrication, and the institutions that use them.'),
  N('infrastructure', 'Infrastructure', 'power', 'The built systems everything else depends on.'),
  N('strategic-salience', 'Strategic salience', 'power', 'How much a place matters to actors who are not in it.'),
  N('alliances', 'Alliance structure', 'power', 'Who is obligated to whom, and how credibly.'),

  N('launch', 'Launch access', 'space', 'The ability to put mass into orbit, and at what cost.'),
  N('orbital', 'Orbital infrastructure', 'space', 'Constellations for communication, navigation, and observation.'),
  N('navigation', 'Navigation & timing', 'space', 'The invisible layer under shipping, finance, agriculture and munitions.'),
  N('lunar', 'Lunar infrastructure', 'space', 'Surface and cislunar systems: power, comms, landing, and eventually production.'),
  N('planetary', 'Planetary infrastructure', 'space', 'Systems beyond cislunar space with independent operating capability.'),
  N('accession', 'The Accession', 'space', 'The expansion of the domains humanity can operate in: land, ocean, air, orbit, Moon, Mars, beyond. Access, not settlement.'),
];

export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]));

const E = (source, target, strength, type = 'increases') => ({ source, target, strength, type });

export const EDGES = [
  E('warming', 'ice-loss', 0.9), E('warming', 'sea-level', 0.8), E('warming', 'water-stress', 0.75),
  E('warming', 'extreme-heat', 0.95), E('warming', 'crop-loss', 0.7),
  E('ice-loss', 'sea-level', 0.6), E('ice-loss', 'shipping', 0.85), E('ice-loss', 'extraction', 0.5),
  E('sea-level', 'displacement', 0.6), E('sea-level', 'infrastructure', 0.55, 'stresses'),
  E('water-stress', 'crop-loss', 0.8), E('water-stress', 'territorial', 0.45),
  E('extreme-heat', 'crop-loss', 0.6), E('extreme-heat', 'displacement', 0.5),
  E('crop-loss', 'food-insecurity', 0.85),
  E('food-insecurity', 'instability', 0.6), E('food-insecurity', 'migration-pressure', 0.7),
  E('adaptation', 'crop-loss', 0.6, 'reduces'), E('adaptation', 'displacement', 0.5, 'reduces'),
  E('adaptation', 'infrastructure', 0.7),
  E('population', 'water-stress', 0.5), E('population', 'migration-pressure', 0.4), E('population', 'urbanisation', 0.6),
  E('migration-pressure', 'displacement', 0.7), E('displacement', 'instability', 0.45),
  E('displacement', 'labour-gap', 0.4, 'reduces'),
  E('labour-gap', 'economy', 0.5, 'reduces'),
  E('urbanisation', 'infrastructure', 0.6, 'stresses'),
  E('governance', 'instability', 0.8, 'reduces'), E('governance', 'adaptation', 0.7),
  E('instability', 'conflict-risk', 0.75), E('instability', 'economy', 0.5, 'reduces'),
  E('militarisation', 'conflict-risk', 0.6), E('militarisation', 'alliances', 0.4),
  E('territorial', 'conflict-risk', 0.7), E('chokepoint', 'conflict-risk', 0.55),
  E('conflict-risk', 'displacement', 0.7), E('conflict-risk', 'transport', 0.6, 'disrupts'),
  E('conflict-risk', 'energy', 0.55, 'disrupts'),
  E('energy', 'economy', 0.6), E('energy', 'strategic-salience', 0.6),
  E('minerals', 'extraction', 0.7), E('minerals', 'strategic-salience', 0.7),
  E('extraction', 'transport', 0.7), E('transport', 'processing', 0.6), E('processing', 'economy', 0.65),
  E('shipping', 'transport', 0.8), E('shipping', 'strategic-salience', 0.6),
  E('transport', 'chokepoint', 0.5),
  E('economy', 'militarisation', 0.5), E('economy', 'infrastructure', 0.6), E('economy', 'strategic-salience', 0.6),
  E('technology', 'economy', 0.7), E('technology', 'militarisation', 0.6), E('technology', 'launch', 0.6),
  E('technology', 'adaptation', 0.5),
  E('infrastructure', 'governance', 0.5),
  E('strategic-salience', 'militarisation', 0.6), E('strategic-salience', 'alliances', 0.5),
  E('launch', 'orbital', 0.9), E('orbital', 'navigation', 0.85), E('orbital', 'technology', 0.4),
  E('navigation', 'transport', 0.7), E('navigation', 'militarisation', 0.6), E('navigation', 'economy', 0.5),
  E('orbital', 'lunar', 0.6), E('lunar', 'planetary', 0.6), E('lunar', 'minerals', 0.3),
  E('launch', 'accession', 0.5), E('lunar', 'accession', 0.7), E('planetary', 'accession', 0.9),
  E('planetary', 'strategic-salience', 0.4),
];

/* ------------------------------------------------------------------ *
 * MIGRATION CORRIDORS
 * Structural pairs. Magnitude is computed by the model, not stated here.
 * ------------------------------------------------------------------ */

export const CORRIDORS = [
  { from: 'sahel', to: 'gulf-guinea', kind: 'internal' },
  { from: 'sahel', to: 'mediterranean', kind: 'cross-border' },
  { from: 'horn-africa', to: 'red-sea', kind: 'cross-border' },
  { from: 'horn-africa', to: 'gulf', kind: 'labour' },
  { from: 'eastern-med', to: 'western-europe', kind: 'cross-border' },
  { from: 'nile-delta', to: 'eastern-med', kind: 'internal' },
  { from: 'bengal-delta', to: 'south-asia', kind: 'internal' },
  { from: 'south-asia', to: 'gulf', kind: 'labour' },
  { from: 'central-america', to: 'us-southwest', kind: 'cross-border' },
  { from: 'caribbean', to: 'gulf-coast', kind: 'cross-border' },
  { from: 'andes', to: 'la-plata', kind: 'cross-border' },
  { from: 'pacific-islands', to: 'australia', kind: 'cross-border' },
  { from: 'mekong', to: 'malacca', kind: 'labour' },
  { from: 'central-asia', to: 'siberia', kind: 'labour' },
  { from: 'gulf-coast', to: 'great-lakes', kind: 'internal' },
  { from: 'us-southwest', to: 'great-lakes', kind: 'internal' },
  { from: 'mediterranean', to: 'northern-europe', kind: 'internal' },
  { from: 'congo-basin', to: 'southern-africa', kind: 'cross-border' },
];

/* ------------------------------------------------------------------ *
 * SIGNALS
 * Authored propositions about the world. Each one is a claim with a
 * shape (layer, place, chain, sources) and a *computed* probability:
 * `p` reads the model state, so moving an assumption moves the signal.
 * ------------------------------------------------------------------ */

const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
const ramp = (v, lo, hi) => clamp01((v - lo) / (hi - lo));

export const SIGNALS = [
  {
    id: 'arctic-shipping', layer: 'resources', region: 'arctic', from: 2030, to: 2200,
    title: 'Trans-Arctic shipping season extends',
    kind: 'Route change',
    chain: ['warming', 'ice-loss', 'shipping', 'transport', 'strategic-salience', 'militarisation'],
    body: 'Sea-ice retreat lengthens the navigable season on northern routes. The consequence is not primarily commercial: a route that can be used is a route that has to be defended, surveyed, and rescued from.',
    sources: ['nsidc', 'amap', 'imo', 'unctad'],
    p: (g, r) => ramp(g.warming, 1.4, 3.0) * ramp(g.year, 2028, 2060) * (0.55 + 0.45 * g.s.trade),
  },
  {
    id: 'arctic-competition', layer: 'conflict', region: 'arctic', from: 2035, to: 2200,
    title: 'Arctic strategic competition intensifies',
    kind: 'Posture',
    chain: ['shipping', 'extraction', 'strategic-salience', 'militarisation', 'conflict-risk'],
    body: 'Access converts a buffer into a frontier. Seabed claims, undersea cable routes, and year-round basing become live questions well before any dispute becomes violent.',
    sources: ['amap', 'sipri', 'ucdp'],
    p: (g, r) => ramp(g.warming, 1.5, 3.2) * (0.4 + 0.6 * g.s.military) * ramp(g.year, 2032, 2070),
  },
  {
    id: 'greenland-minerals', layer: 'resources', region: 'greenland', from: 2035, to: 2150,
    title: 'High-latitude mineral access opens',
    kind: 'Extraction',
    chain: ['ice-loss', 'extraction', 'minerals', 'strategic-salience'],
    body: 'Ice retreat and cheaper cold-weather logistics make deposits legible that were previously only theoretical. Whether they are developed is an economics and consent question, not a geological one.',
    sources: ['usgs', 'iea_cm', 'amap'],
    p: (g, r) => ramp(g.warming, 1.6, 3.0) * (0.35 + 0.65 * g.s.energy) * ramp(g.year, 2034, 2075),
  },
  {
    id: 'permafrost-infra', layer: 'climate', region: 'siberia', from: 2030, to: 2150,
    title: 'Permafrost thaw destabilises built infrastructure',
    kind: 'Infrastructure stress',
    chain: ['warming', 'ice-loss', 'infrastructure', 'economy'],
    body: 'Pipelines, rail, runways and foundations in continuous permafrost were engineered for ground that no longer behaves the way it did. Replacement cost arrives before any relocation decision does.',
    sources: ['ipcc_wg1', 'amap', 'emdat'],
    p: (g, r) => ramp(g.warming * 2.4 / 1.35, 2.2, 5.0) * ramp(g.year, 2028, 2065),
  },
  {
    id: 'med-water', layer: 'climate', region: 'mediterranean', from: 2028, to: 2200,
    title: 'Mediterranean drying becomes structural',
    kind: 'Water',
    chain: ['warming', 'water-stress', 'crop-loss', 'food-insecurity', 'migration-pressure'],
    body: 'The basin sits on a projected drying gradient. What changes is not whether droughts occur but whether the wet years still arrive often enough for the system in between to be designed around them.',
    sources: ['ipcc_wg2', 'aqueduct', 'aquastat'],
    p: (g, r) => ramp(r.water, 55, 90) * ramp(g.warming, 1.3, 2.6),
  },
  {
    id: 'levant-instability', layer: 'conflict', region: 'eastern-med', from: 2026, to: 2200,
    title: 'Compound pressure in the Eastern Mediterranean',
    kind: 'Instability',
    chain: ['water-stress', 'crop-loss', 'food-insecurity', 'instability', 'conflict-risk', 'displacement'],
    body: 'Water scarcity, a young and growing population, contested transboundary rivers and existing militarisation compound rather than add. This is the clearest case in the model where adaptation investment changes the answer.',
    sources: ['aqueduct', 'ucdp', 'acled', 'unhcr'],
    p: (g, r) => clamp01(0.25 + 0.5 * ramp(r.water, 60, 95) + 0.3 * ramp(r.mil, 50, 90) - 0.3 * g.s.climate),
  },
  {
    id: 'nile-delta-salt', layer: 'climate', region: 'nile-delta', from: 2035, to: 2300,
    title: 'Delta salinisation and coastal retreat',
    kind: 'Coastal',
    chain: ['sea-level', 'crop-loss', 'food-insecurity', 'migration-pressure', 'urbanisation'],
    body: 'Low-lying, densely farmed, densely inhabited delta land is exposed to salt intrusion long before it is exposed to permanent inundation. The agricultural loss arrives first and is easier to miss.',
    sources: ['noaa_slr', 'ipcc_wg2', 'aquastat'],
    p: (g, r) => ramp(g.seaLevel, 0.28, 0.95) * 0.92,
  },
  {
    id: 'sahel-food', layer: 'climate', region: 'sahel', from: 2026, to: 2200,
    title: 'Sahel food-system pressure',
    kind: 'Food security',
    chain: ['extreme-heat', 'water-stress', 'crop-loss', 'food-insecurity', 'instability', 'displacement'],
    body: 'Rain-fed agriculture, the fastest population growth in the model, and thin state capacity. The pressure is real in every scenario; what varies enormously is whether it is absorbed or expressed as displacement.',
    sources: ['fao_sofi', 'ipcc_wg2', 'idmc', 'acled'],
    p: (g, r) => clamp01(0.35 + 0.45 * ramp(g.warming, 1.3, 2.8) + 0.2 * ramp(r.popIndex, 1.0, 2.2) - 0.25 * g.s.climate),
  },
  {
    id: 'gulf-heat', layer: 'climate', region: 'gulf', from: 2035, to: 2300,
    title: 'Wet-bulb limits on outdoor labour',
    kind: 'Habitability',
    chain: ['warming', 'extreme-heat', 'infrastructure', 'adaptation'],
    body: 'Beyond certain wet-bulb thresholds outdoor work becomes survivable only with cooling. This is an adaptation-cost question for wealthy Gulf economies and a habitability question for the migrant labour force that does the work.',
    sources: ['ipcc_wg1', 'ipcc_wg2', 'iom'],
    p: (g, r) => ramp(g.warming, 1.5, 3.2) * 0.9,
  },
  {
    id: 'gulf-transition', layer: 'power', region: 'gulf', from: 2035, to: 2150,
    title: 'Hydrocarbon revenue base narrows',
    kind: 'Economic transition',
    chain: ['energy', 'economy', 'governance', 'strategic-salience'],
    body: 'A faster energy transition reduces the strategic salience of the Gulf and the fiscal base of the states in it — two effects that do not necessarily move at the same speed.',
    sources: ['iea', 'imf'],
    p: (g, r) => ramp(g.s.energy, 0.3, 0.95) * ramp(g.year, 2035, 2075),
  },
  {
    id: 'hormuz', layer: 'conflict', region: 'gulf', from: 2026, to: 2120,
    title: 'Strait of Hormuz remains a concentrated risk',
    kind: 'Chokepoint',
    chain: ['chokepoint', 'transport', 'energy', 'conflict-risk'],
    body: 'Concentration of seaborne energy trade through a narrow, militarised passage. In this model the risk falls as the energy transition proceeds — the chokepoint matters less when less has to pass through it.',
    sources: ['unctad', 'iea', 'sipri'],
    p: (g, r) => clamp01(0.7 * (1 - 0.55 * g.s.energy) * (0.5 + 0.5 * g.s.military)),
  },
  {
    id: 'bab-el-mandeb', layer: 'conflict', region: 'red-sea', from: 2026, to: 2150,
    title: 'Red Sea corridor exposure',
    kind: 'Chokepoint',
    chain: ['chokepoint', 'instability', 'transport', 'conflict-risk'],
    body: 'A corridor whose security depends on the stability of the coastlines either side of it, and on an alternative route around a continent that costs time rather than access.',
    sources: ['unctad', 'acled', 'ucdp'],
    p: (g, r) => clamp01(0.35 + 0.4 * ramp(100 - r.gov, 55, 85) + 0.25 * g.s.trade),
  },
  {
    id: 'malacca', layer: 'resources', region: 'malacca', from: 2026, to: 2200,
    title: 'Malacca concentration persists',
    kind: 'Chokepoint',
    chain: ['shipping', 'chokepoint', 'transport', 'economy', 'strategic-salience'],
    body: 'The densest trade concentration on the planet, and the one that overland and Arctic alternatives are explicitly designed to reduce. Watch whether its salience actually falls.',
    sources: ['unctad', 'imf'],
    p: (g, r) => clamp01(0.85 * (0.6 + 0.4 * g.s.trade) - 0.2 * ramp(g.warming, 1.6, 3.2)),
  },
  {
    id: 'taiwan-tech', layer: 'power', region: 'taiwan-strait', from: 2026, to: 2100,
    title: 'Semiconductor concentration as strategic geography',
    kind: 'Technology',
    chain: ['technology', 'economy', 'strategic-salience', 'militarisation', 'conflict-risk'],
    body: 'A single strait carries an outsized share of advanced fabrication. Diversification of capacity is the variable that actually changes this signal — it falls as fabrication disperses, not as tension eases.',
    sources: ['imf', 'wdi', 'sipri'],
    p: (g, r) => clamp01((0.9 - 0.45 * ramp(g.year, 2026, 2065)) * (0.55 + 0.45 * g.s.ai)),
  },
  {
    id: 'east-china-demog', layer: 'power', region: 'east-china', from: 2030, to: 2150,
    title: 'Demographic contraction reshapes economic weight',
    kind: 'Demographics',
    chain: ['population', 'labour-gap', 'economy', 'strategic-salience'],
    body: 'A working-age population that shrinks faster than productivity rises. Automation is the offsetting term in this model, which is why the AI assumption moves this signal.',
    sources: ['wpp', 'imf'],
    p: (g, r) => ramp(g.year, 2030, 2075) * (1 - 0.45 * g.s.ai),
  },
  {
    id: 'korea-japan-demog', layer: 'migration', region: 'korea-japan', from: 2026, to: 2120,
    title: 'Structural labour shortfall',
    kind: 'Demographics',
    chain: ['population', 'labour-gap', 'migration-pressure', 'economy'],
    body: 'Ageing high-capacity economies become destinations by arithmetic rather than by policy — unless automation substitutes, which is the explicit alternative in this model.',
    sources: ['wpp', 'iom', 'wdi'],
    p: (g, r) => clamp01(0.5 + 0.4 * ramp(g.year, 2026, 2070) - 0.35 * g.s.ai),
  },
  {
    id: 'third-pole', layer: 'climate', region: 'himalaya', from: 2030, to: 2250,
    title: 'Cryosphere loss changes downstream flow regimes',
    kind: 'Water',
    chain: ['warming', 'ice-loss', 'water-stress', 'crop-loss', 'territorial'],
    body: 'Glacial melt raises flow before it lowers it. The downstream basins are shared between states with existing disputes and no strong allocation mechanism, which is why this connects to territorial pressure and not only to agriculture.',
    sources: ['ipcc_wg1', 'ipcc_wg2', 'aquastat'],
    p: (g, r) => ramp(g.warming * 2.1 / 1.35, 2.0, 4.6) * ramp(g.year, 2030, 2080),
  },
  {
    id: 'indo-gangetic', layer: 'climate', region: 'south-asia', from: 2030, to: 2200,
    title: 'Groundwater depletion under heat',
    kind: 'Water',
    chain: ['extreme-heat', 'water-stress', 'crop-loss', 'food-insecurity', 'migration-pressure'],
    body: 'The largest agricultural population in the model draws on aquifers being depleted faster than they recharge, in a region where heat is rising and demand is not falling.',
    sources: ['aqueduct', 'aquastat', 'ipcc_wg2'],
    p: (g, r) => clamp01(0.4 + 0.45 * ramp(r.water, 70, 96) + 0.2 * ramp(g.warming, 1.4, 2.8) - 0.25 * g.s.climate),
  },
  {
    id: 'bengal-exposure', layer: 'migration', region: 'bengal-delta', from: 2035, to: 2300,
    title: 'Delta exposure drives internal displacement',
    kind: 'Displacement',
    chain: ['sea-level', 'displacement', 'urbanisation', 'infrastructure'],
    body: 'Most movement out of an exposed delta is short, internal, and toward cities that are themselves exposed. Cross-border movement is the visible minority of it.',
    sources: ['noaa_slr', 'idmc', 'iom'],
    p: (g, r) => ramp(g.seaLevel, 0.3, 1.1) * 0.95,
  },
  {
    id: 'pacific-habitability', layer: 'climate', region: 'pacific-islands', from: 2035, to: 2300,
    title: 'Freshwater lens failure precedes inundation',
    kind: 'Habitability',
    chain: ['sea-level', 'water-stress', 'displacement', 'accession'],
    body: 'Low atolls lose potable groundwater to saline intrusion long before land is permanently lost. Habitability ends earlier than geography does — the sharpest illustration in the model that thresholds are not where you expect.',
    sources: ['ipcc_wg2', 'noaa_slr', 'aquastat'],
    p: (g, r) => ramp(g.seaLevel, 0.3, 0.9) * 0.98,
  },
  {
    id: 'amazon-threshold', layer: 'climate', region: 'amazon', from: 2040, to: 2250,
    title: 'Forest–savanna transition risk',
    kind: 'System state change',
    chain: ['warming', 'crop-loss', 'water-stress', 'food-insecurity'],
    body: 'A basin that recycles its own rainfall can lose the ability to do so. This is a threshold signal, not a gradient one, and the model treats its timing as genuinely uncertain rather than merely imprecise.',
    sources: ['ipcc_wg1', 'ipcc_wg2'],
    p: (g, r) => ramp(g.warming, 2.0, 4.0) * ramp(g.year, 2040, 2110),
    confidencePenalty: 0.55,
  },
  {
    id: 'andes-minerals', layer: 'resources', region: 'andes', from: 2028, to: 2150,
    title: 'Transition minerals meet water scarcity',
    kind: 'Extraction',
    chain: ['minerals', 'extraction', 'water-stress', 'instability'],
    body: 'The extraction the energy transition requires is concentrated in high, arid basins where water is already contested. The transition and its own constraint are in the same place.',
    sources: ['usgs', 'iea_cm', 'aqueduct'],
    p: (g, r) => clamp01(0.3 + 0.55 * g.s.energy) * ramp(g.year, 2028, 2060),
  },
  {
    id: 'congo-minerals', layer: 'resources', region: 'congo-basin', from: 2026, to: 2150,
    title: 'Extraction concentration without processing',
    kind: 'Resource network',
    chain: ['minerals', 'extraction', 'transport', 'processing', 'economy', 'governance'],
    body: 'Where a resource is taken from and where it becomes valuable have been different places for a long time. The model treats the processing step as the one that carries the economic weight.',
    sources: ['usgs', 'iea_cm', 'wdi'],
    p: (g, r) => clamp01(0.45 + 0.45 * g.s.energy),
  },
  {
    id: 'us-southwest-water', layer: 'climate', region: 'us-southwest', from: 2026, to: 2200,
    title: 'Allocated water exceeds available water',
    kind: 'Water',
    chain: ['warming', 'water-stress', 'crop-loss', 'urbanisation', 'adaptation'],
    body: 'A basin whose legal allocations were written against a wetter century than the one being measured. The interesting variable is institutional, not hydrological.',
    sources: ['aqueduct', 'ipcc_wg2', 'wdi'],
    p: (g, r) => clamp01(0.4 + 0.45 * ramp(g.warming, 1.3, 2.6) - 0.3 * g.s.climate),
  },
  {
    id: 'gulf-coast-exposure', layer: 'climate', region: 'gulf-coast', from: 2030, to: 2250,
    title: 'Coastal energy infrastructure exposure',
    kind: 'Infrastructure stress',
    chain: ['sea-level', 'infrastructure', 'energy', 'economy'],
    body: 'Refining, petrochemical and launch infrastructure sited at sea level on subsiding ground. Exposure here propagates into energy markets rather than staying local.',
    sources: ['noaa_slr', 'emdat', 'iea'],
    p: (g, r) => ramp(g.seaLevel, 0.28, 0.9) * 0.85,
  },
  {
    id: 'northern-gain', layer: 'resources', region: 'canada-north', from: 2040, to: 2250,
    title: 'Northward drift of crop suitability',
    kind: 'Agriculture',
    chain: ['warming', 'crop-loss', 'infrastructure', 'economy'],
    body: 'Warming opens growing seasons at high latitude. Soil, daylight and infrastructure do not move with the isotherms, so this is a slower and smaller gain than the temperature map suggests.',
    sources: ['ipcc_wg2', 'fao_sofi'],
    p: (g, r) => ramp(g.warming, 1.8, 3.4) * ramp(g.year, 2040, 2100),
  },
  {
    id: 'panama-water', layer: 'resources', region: 'panama', from: 2028, to: 2150,
    title: 'Canal throughput constrained by freshwater',
    kind: 'Chokepoint',
    chain: ['water-stress', 'shipping', 'transport', 'chokepoint', 'economy'],
    body: 'A sea-level canal that runs on rain. Drought reduces transits directly — a case where a climate variable acts on trade without passing through agriculture or migration at all.',
    sources: ['unctad', 'aquastat', 'ipcc_wg2'],
    p: (g, r) => clamp01(0.35 + 0.45 * ramp(g.warming, 1.3, 2.8)) * (0.6 + 0.4 * g.s.trade),
  },
  {
    id: 'black-sea-grain', layer: 'conflict', region: 'black-sea', from: 2026, to: 2120,
    title: 'Grain corridor exposure',
    kind: 'Chokepoint',
    chain: ['conflict-risk', 'transport', 'food-insecurity', 'instability'],
    body: 'A concentration of exported calories behind a contested sea. Disruption here is transmitted by price into places with no other connection to the conflict.',
    sources: ['ucdp', 'fao_sofi', 'unctad'],
    p: (g, r) => clamp01(0.3 + 0.5 * ramp(r.mil, 60, 95) + 0.2 * (1 - g.s.trade)),
  },
  {
    id: 'leo-congestion', layer: 'space', region: null, from: 2026, to: 2200,
    title: 'Low Earth orbit congestion',
    kind: 'Orbital',
    chain: ['launch', 'orbital', 'navigation', 'economy'],
    body: 'Constellation growth raises collision and debris risk in the shells that carry communications and observation. Orbit becomes a managed commons or it becomes unusable — there is no third state.',
    sources: ['celestrak', 'esa_env', 'unoosa'],
    p: (g, r) => clamp01(0.25 + 0.6 * g.s.space) * ramp(g.year, 2026, 2060),
    orbit: 'leo',
  },
  {
    id: 'navigation-dependency', layer: 'space', region: null, from: 2026, to: 2250,
    title: 'Navigation and timing as critical infrastructure',
    kind: 'Orbital',
    chain: ['orbital', 'navigation', 'transport', 'economy', 'militarisation'],
    body: 'Shipping, agriculture, finance and munitions all depend on a signal from medium orbit. The dependency is invisible until it is interrupted, which is what makes it strategic.',
    sources: ['celestrak', 'unctad', 'sipri'],
    p: (g, r) => clamp01(0.55 + 0.4 * ramp(g.year, 2026, 2070)),
    orbit: 'meo',
  },
  {
    id: 'lunar-surface', layer: 'space', region: null, from: 2035, to: 2400,
    title: 'Sustained lunar surface infrastructure',
    kind: 'Lunar',
    chain: ['launch', 'orbital', 'lunar', 'accession'],
    body: 'Power, communications relay, landing infrastructure and in-situ resource use at the lunar south pole. Sustained presence is an infrastructure problem, not a transport one.',
    sources: ['nasa_m2m', 'unoosa'],
    p: (g, r) => ramp(g.s.space, 0.25, 0.95) * ramp(g.year, 2032, 2075),
    body_: 'moon', confidencePenalty: 0.7,
  },
  {
    id: 'cislunar-competition', layer: 'space', region: null, from: 2045, to: 2400,
    title: 'Cislunar space acquires strategic geography',
    kind: 'Lunar',
    chain: ['lunar', 'strategic-salience', 'militarisation', 'territorial'],
    body: 'Lagrange points, polar landing sites and communications relays are finite and positional. Scarce position is what makes geography strategic — the same logic that made straits matter.',
    sources: ['unoosa', 'sipri', 'nasa_m2m'],
    p: (g, r) => ramp(g.s.space, 0.35, 0.95) * ramp(g.year, 2042, 2090) * (0.5 + 0.5 * g.s.military),
    body_: 'moon', confidencePenalty: 0.55,
  },
  {
    id: 'mars-presence', layer: 'space', region: null, from: 2060, to: 2500,
    title: 'Persistent Mars surface presence',
    kind: 'Planetary',
    chain: ['lunar', 'planetary', 'accession'],
    body: 'Continuous rather than episodic presence, dependent on closed-loop life support and local production. This is where the model stops projecting and starts describing a structural possibility.',
    sources: ['nasa_m2m'],
    p: (g, r) => ramp(g.s.space, 0.5, 1.0) * ramp(g.year, 2055, 2140),
    body_: 'mars', confidencePenalty: 0.35,
  },
  {
    id: 'orbital-industry', layer: 'space', region: null, from: 2090, to: 2600,
    title: 'Off-Earth production becomes self-sustaining',
    kind: 'Planetary',
    chain: ['lunar', 'planetary', 'minerals', 'economy', 'accession'],
    body: 'Material produced off Earth being used off Earth, rather than returned. The threshold that would make the Accession structural rather than expeditionary.',
    sources: ['nasa_m2m', 'unoosa'],
    p: (g, r) => ramp(g.s.space, 0.6, 1.0) * ramp(g.year, 2085, 2250),
    body_: 'moon', confidencePenalty: 0.2,
  },
];

/* ------------------------------------------------------------------ *
 * THE ACCESSION — domains of operation
 * ------------------------------------------------------------------ */

export const ACCESSION = [
  { id: 'land', label: 'Land', year: -300000 },
  { id: 'ocean', label: 'Ocean', year: -6000 },
  { id: 'air', label: 'Air', year: 1903 },
  { id: 'orbit', label: 'Orbit', year: 1957 },
  { id: 'moon', label: 'Moon', reach: 1969, sustainKey: 'lunar-surface' },
  { id: 'mars', label: 'Mars', reach: 1971, sustainKey: 'mars-presence' },
  { id: 'deep', label: 'Deep space', reach: 1977, sustainKey: 'orbital-industry' },
];

/* ------------------------------------------------------------------ *
 * LAYERS
 * ------------------------------------------------------------------ */

export const LAYERS = [
  { id: 'power', label: 'Power', index: '01' },
  { id: 'conflict', label: 'Conflict', index: '02' },
  { id: 'climate', label: 'Climate', index: '03' },
  { id: 'migration', label: 'Migration', index: '04' },
  { id: 'resources', label: 'Resources', index: '05' },
  { id: 'space', label: 'Space', index: '06' },
];

/* ------------------------------------------------------------------ *
 * SCENARIO ASSUMPTIONS
 * ------------------------------------------------------------------ */

export const ASSUMPTIONS = [
  { id: 'climate', label: 'Climate cooperation', base: 0.42, low: 'Fragmented', high: 'Coordinated', note: 'Binding coordination on emissions and on adaptation finance. Moves both the temperature trajectory and the adaptation term.' },
  { id: 'energy', label: 'Energy transition', base: 0.46, low: 'Slow', high: 'Rapid', note: 'Pace of electrification and hydrocarbon displacement. Moves warming down and shifts resource salience from energy to minerals.' },
  { id: 'military', label: 'Military spending', base: 0.55, low: 'Restrained', high: 'Expansive', note: 'Force posture and procurement as a share of capacity. Raises conflict risk without determining any conflict.' },
  { id: 'trade', label: 'Global trade', base: 0.58, low: 'Fragmented', high: 'Open', note: 'Volume and openness of exchange. Raises economic weight and chokepoint salience at the same time.' },
  { id: 'ai', label: 'AI adoption', base: 0.5, low: 'Marginal', high: 'Pervasive', note: 'Diffusion into production. Substitutes for shrinking labour forces and raises technological capability.' },
  { id: 'space', label: 'Space investment', base: 0.5, low: 'Minimal', high: 'Sustained', note: 'Sustained public and private investment in launch and off-Earth infrastructure. Gates every signal in the SPACE layer.' },
];

export const PRESETS = [
  { id: 'baseline', name: 'Baseline', desc: 'Current trajectory. Assumptions left where they sit today.', values: null },
  { id: 'decarbonisation', name: 'Rapid Decarbonisation', desc: 'Coordinated climate action and a fast energy transition.', values: { climate: 0.88, energy: 0.92, military: 0.45, trade: 0.7, ai: 0.6, space: 0.5 } },
  { id: 'fragmented', name: 'Fragmented Earth', desc: 'Cooperation fails; competition and armament rise.', values: { climate: 0.12, energy: 0.22, military: 0.9, trade: 0.22, ai: 0.55, space: 0.4 } },
  { id: 'orbital', name: 'Orbital Civilisation', desc: 'Sustained off-Earth investment across a long horizon.', values: { climate: 0.55, energy: 0.62, military: 0.55, trade: 0.72, ai: 0.8, space: 0.98 } },
  { id: 'adaptation', name: 'Climate Adaptation', desc: 'Warming is not avoided, but it is absorbed.', values: { climate: 0.85, energy: 0.5, military: 0.45, trade: 0.68, ai: 0.75, space: 0.5 } },
];
