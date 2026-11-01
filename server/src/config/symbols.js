// Shared base-asset list (USDT-quoted) available across all supported exchanges.
// Kept as base assets so each stream can format them for its own symbol convention.
export const BASE_SYMBOLS = [
  'BTC', 'ETH', 'TRX', 'BNB', 'SOL', 'NEAR', 'PEPE', 'UNI', 'XRP', 'XPL',
  'LINK', 'AVAX', 'HYPE', 'SUI', 'ENA', 'AAVE', 'DOGE', 'CELO', 'WLD', 'TRUMP',
  'G', 'ADA', 'ZRO', 'FET', 'LTC', 'ARB', 'XLM', 'INJ', 'ZAMA', 'ONDO',
  'STX', 'BCH', 'PUMP', 'MORPHO', 'GRAM', 'HBAR', 'ASTER', 'STRK', 'FIL', 'TIA',
  'EIGEN', 'APT', 'PENGU', 'ATOM', 'ICP', 'NIGHT', 'PENDLE', 'SEI', 'DOT', 'WLFI',
  'CRV', 'OP', 'POL', 'PYTH', 'VIRTUAL', 'LDO', 'ETC', 'PARTI', 'PROVE', 'RENDER',
  'BAT', 'SHIB', 'ZEN', 'HUMA', 'SKY', 'ETHFI', 'SENT', 'SAND', 'JUP', 'AR',
  'MEGA', 'JTO', 'BONK', 'SPK', 'FOGO', '1INCH', 'S', 'AGLD', 'FLOKI', 'KMNO',
  'ZK', 'ALGO', '2Z', 'GALA', 'XTZ', 'CHZ', 'ARKM', 'COMP', 'W', 'BOME',
  'ENS', 'APE', 'SNX', 'ROBO', 'WIF', 'MINA', 'BREV', 'DYDX', 'WOO', 'AXS',
  'MKR', 'GRT', 'FTM', 'KAS', 'TAO', 'GMX', 'THETA', 'RUNE', 'EGLD', 'FLOW',
    'NEO', 'VET', 'ACH', 'ROSE', 'HNT', 'KSM', 'CAKE', 'BAND', 'ANKR', 'OM',
  'ZRX', 'BAL', 'YFI', 'SUSHI', 'ENJ', 'MANA', 'GAL', 'MASK', 'LRC', 'IMX', 'BLUR', 'MEME', 'TWT', 'CELR', 'IOTA', 'ZIL', 'RVN', 'DASH', 'WAVES', 'QTUM',
  'ZEC', 'XMR', 'ONT', 'EOS', 'KAVA',
  'MATIC', 'RNDR', 'POPCAT', 'MANTA', 'ALT', 'PIXEL', 'PORTAL', 'AI', 'NFP', 'XAI', 'MAV', 'ACE', 'OMNI', 'REZ', 'BB',
  'RPL', 'STETH', 'WBTC',
  '0G', 'A', 'AERO', 'AEVO', 'AIXBT', 'ANIME', 'AVA', 'AVNT', 'AXL', 'BARD', 'BEL', 'BERA', 'BICO', 'BMT', 'C98', 'CATI', 'CFG', 'CGPT', 'CHIP', 'CITY', 'COOKIE', 'CYBER', 'DOGS', 'DOLO', 'DYM', 'ENSO', 'ERA', 'F', 'FF', 'FIDA', 'FRAX', 'FTT', 'GLMR', 'GMT', 'GPS', 'HAEDAL', 'HMSTR', 'HOLO', 'HOME', 'HYPER', 'ID', 'INIT', 'IO', 'JASMY', 'JST', 'JUV', 'KAIA', 'LA', 'LAYER', 'LINEA', 'LUNA', 'LUNC', 'MAGIC', 'MANTRA', 'ME', 'MET', 'MMT', 'MOVE', 'MOVR', 'NEWT', 'NEXO', 'NOM', 'NOT', 'NXPC', 'OPG', 'OPN', 'ORDI', 'PEOPLE', 'PLUME', 'PNUT', 'PSG', 'QNT', 'RED', 'RESOLV', 'RLUSD', 'SAHARA', 'SC', 'SCR', 'SIGN', 'SOLV', 'SOMI', 'SSV', 'SUN', 'SXT', 'TNSR', 'TOWNS', 'TREE', 'UMA', 'USD1', 'USDC', 'USDE', 'USDS', 'USTC', 'VANA', 'VTHO', 'WAL', 'WAXP', 'WCT', 'XAUT', 'XUSD', 'YB', 'ZBT', 'ZKC', 'ZKP',
  'ACT', 'ALLO', 'API3', 'ASTR', 'ATH', 'AUCTION', 'BABY', 'BABYDOGE', 'BANANA', 'BASED', 'BIGTIME', 'BIO', 'BNT', 'CAT', 'CC', 'CETUS', 'CFX', 'CORE', 'CSPR', 'CTC', 'CVC', 'CVX', 'DATA', 'DEGEN', 'DGB', 'DOOD', 'EDGE', 'ETHW', 'FLR', 'FLUID', 'GAS', 'GLM', 'GOAT', 'GRASS', 'GRVT', 'ILV', 'IOST', 'JOE', 'KAITO', 'KAT', 'KITE', 'KNC', 'LIT', 'LPT', 'LQTY', 'LSK', 'MERL', 'METIS', 'MEW', 'MON', 'NAVX', 'NEIRO', 'NFT', 'NMR', 'ONE', 'PAXG', 'PHA', 'PONS', 'PYUSD', 'RAY', 'RE', 'RSR', 'SAFE', 'SATS', 'SD', 'SKL', 'SLP', 'SLX', 'SONIC', 'SOPH', 'T', 'TOSHI', 'TRB', 'TURBO', 'USAT', 'VELO', 'VELODROME', 'VVV', 'WET', 'WIN', 'YGG', 'ZENT', 'ZETA', 'ZKJ', 'ZORA',
  '2U2', '4STOCK', '9BIT', 'A8', 'AAPLX', 'AB', 'ACM', 'ACN', 'ACS', 'ACU', 'ADI', 'ADX', 'AEON', 'AGI', 'AGT', 'AIA', 'AIN', 'AIO', 'AIOZ', 'AKE', 'AKITA', 'ALCH', 'ALEPH', 'ALEX', 'ALICE', 'ALIGN', 'ALPH', 'ALPINE', 'ALU', 'AMP', 'AMZNX', 'ANSEM', 'ANYONE', 'APEX', 'APR', 'ARG', 'ARIA', 'ARK', 'ARPA', 'ARTX', 'ARX', 'ASP', 'ASR', 'ASSET', 'AT', 'ATM', 'AURORA', 'AVAAI', 'AVAIL', 'AVV', 'AWE', 'AXIS', 'AZERO', 'AZTEC', 'B', 'B2', 'B3', 'BABYSHARK', 'BAN', 'BANANAS31', 'BANK', 'BAR', 'BAS', 'BAY', 'BDX', 'BEAM', 'BEAMX', 'BEAT', 'BERT', 'BGB', 'BILL', 'BIRB', 'BLEND', 'BLESS', 'BLUAI', 'BLUE', 'BNKR', 'BOB', 'BOBA', 'BR', 'BRETT', 'BRISE', 'BSB', 'BSV', 'BTR', 'BTT', 'BTW', 'BULLA', 'C', 'CAP', 'CARDS', 'CARV', 'CASHCAT', 'CCD', 'CENT', 'CGN', 'CHEEMS', 'CHEQ', 'CHILLGUY', 'CHIRP', 'CHR', 'CKB', 'CLANKER', 'CLO', 'CLOUD', 'CNPY', 'COAI', 'COINX', 'COLLECT', 'COQ', 'CORN', 'COTI', 'COW', 'CP', 'CPOOL', 'CRCLX', 'CRO', 'CROSS', 'CT', 'CTK', 'CTR', 'CTSI', 'CYS', 'DAG', 'DAO', 'DBR', 'DCR', 'DEBIT', 'DEEP', 'DEFI', 'DEUS', 'DEXE', 'DGAI', 'DIA', 'DIAM', 'DIN', 'DMC', 'DMTR', 'DNA', 'DODO', 'DOS', 'DRIFT', 'DSYNC', 'DTEC', 'DUSK', 'EDEN', 'EDU', 'EGL1', 'ELON', 'ELSA', 'EPIC', 'ERG', 'ESE', 'ESP', 'ESPORTS', 'ETN', 'EUL', 'EUR', 'EVAA', 'EWT', 'FARTCOIN', 'FB', 'FDUSD', 'FHE', 'FIGHT', 'FLOCK', 'FLUX', 'FOLKS', 'FORM', 'FORT', 'FUEL', 'FUN', 'GAIA', 'GAIB', 'GENIUS', 'GF', 'GHX', 'GIGA', 'GIGGLE', 'GMEE', 'GNO', 'GOMINING', 'GOOGLX', 'GRIFFAIN', 'GROVE', 'GTAI', 'GTC', 'GUN', 'GWEI', 'H', 'HAI', 'HANA', 'HEI', 'HEMI', 'HFT', 'HIVE', 'HMND', 'HOLD', 'HOODX', 'HOT', 'HSK', 'HTR', 'HTX', 'IAG', 'ICNT', 'IDOL', 'ILY', 'IN', 'INX', 'ION', 'IOTX', 'IQ', 'IR', 'IRYS', 'JCT', 'JELLYJELLY', 'KAIO', 'KCS', 'KERNEL', 'KGEN', 'KII', 'KLV', 'KOMA', 'KUB', 'LAB', 'LADYS', 'LAT', 'LAVA', 'LAZIO', 'LIGHT', 'LINGO', 'LISTA', 'LMWR', 'LNQ', 'LOFI', 'LOT', 'LUMIA', 'LYN', 'LYX', 'M', 'MAGMA', 'MAJOR', 'MANYU', 'MAPO', 'MARSCOIN', 'MAS', 'MAT', 'MAVIA', 'MBL', 'MBX', 'MCAT', 'MCDX', 'MEE', 'MELANIA', 'MENGO', 'METAX', 'MGO', 'MHA', 'MIN', 'MIRA', 'MITO', 'ML', 'MNT', 'MOCA', 'MOEW', 'MOG', 'MOODENG', 'MPC', 'MPLX', 'MTL', 'MUBARAK', 'MX', 'MYRO', 'MYX', 'NAKA', 'NAORIS', 'NATIX', 'NEIROCTO', 'NERO', 'NES', 'NEX', 'NIL', 'NODE', 'NPC', 'NS', 'NUM', 'NVDAX', 'NXT', 'NYM', 'O', 'OBI', 'OBT', 'OFC', 'OG', 'OGN', 'OKB', 'OMI', 'ON', 'ONG', 'OORT', 'OPEN', 'ORAI', 'ORBS', 'ORCA', 'ORDER', 'OSMO', 'OTK', 'OVR', 'P2P', 'PAAL', 'PEAQ', 'PI', 'PIEVERSE', 'PIN', 'PLAI', 'PLAY', 'POKT', 'POLS', 'POLYX', 'POND', 'PONKE', 'POR', 'PORTO', 'POWER', 'PRCL', 'PRIME', 'PRL', 'PRO', 'PROM', 'PROMPT', 'PROPS', 'PROS', 'PTB', 'PUBLIC', 'PUFFER', 'PUNDIX', 'PYBOBO', 'PYR', 'Q', 'QI', 'QKC', 'QORPO', 'QUBIC', 'QUID', 'RAD', 'RAIN', 'RARE', 'RATS', 'RAVE', 'RBNT', 'RC', 'READY', 'RECALL', 'REQ', 'RH', 'RICE', 'RIF', 'RIO', 'RITUAL', 'RIVER', 'RLC', 'RLS', 'RNBW', 'ROAM', 'ROLL', 'RON', 'RONIN', 'RT', 'RWA', 'RWS', 'SAGA', 'SANTOS', 'SAPIEN', 'SENSO', 'SFP', 'SHARE', 'SHELL', 'SHM', 'SHR', 'SIREN', 'SKR', 'SKYAI', 'SLC', 'SNEK', 'SNT', 'SOON', 'SOSO', 'SPA', 'SPACE', 'SPCXX', 'SPX', 'SQD', 'STABLE', 'STAR', 'STBL', 'STEEM', 'STO', 'STORJ', 'STRAX', 'STREAM', 'SUPER', 'SUPRA', 'SWARM', 'SWARMS', 'SWELL', 'SWFTC', 'SYN', 'SYRUP', 'TA', 'TAC', 'TAG', 'TAI', 'TAIKO', 'TCOM', 'TEL', 'TFUEL', 'THE', 'TINA', 'TKO', 'TLM', 'TLOS', 'TMX', 'TOKEN', 'TOWER', 'TRAC', 'TRADE', 'TRADOOR', 'TRIA', 'TRUST', 'TRUTH', 'TSLAX', 'TST', 'TURTLE', 'TUSD', 'TUT', 'U', 'UAI', 'UB', 'UDS', 'ULTIMA', 'UMXM', 'UP', 'UPC', 'UQC', 'US', 'USDD', 'USDG', 'USDGO', 'USELESS', 'USUAL', 'VELVET', 'VERONA', 'VINE', 'VINU', 'VOOI', 'VR', 'VSN', 'VSYS', 'WARD', 'WEMIX', 'WILD', 'WOD', 'XAN', 'XAVA', 'XCH', 'XCN', 'XCX', 'XDC', 'XDP', 'XEC', 'XL1', 'XMN', 'XNO', 'XNY', 'XPIN', 'XPR', 'XRD', 'XTER', 'XU3O8', 'XVG', 'XVS', 'XYO', 'YOM', 'ZBCN', 'ZEREBRO', 'ZEST', 'ZIG', 'ZTC', '币安人生', '牛来',
];

export const toBinanceSymbol = (base) => `${base}USDT`.toLowerCase();
export const toBybitSymbol = (base) => `${base}USDT`;
export const toOkxInstId = (base) => `${base}-USDT`;
export const toBitfinexSymbol = (base) => `t${base}USD`;
export const toMexcSymbol = (base) => `${base}USDT`;

// Optional cross pairs (base/quote) available on most major exchanges.
export const CROSS_PAIRS = [
  { base: 'BNB', quote: 'ETH' },
  { base: 'LINK', quote: 'ETH' },
  { base: 'SOL', quote: 'ETH' },
  { base: 'TRX', quote: 'ETH' },
  { base: 'XRP', quote: 'ETH' },
  { base: 'ADA', quote: 'ETH' },
  { base: 'ARB', quote: 'ETH' },
  { base: 'ZEC', quote: 'ETH' },
  { base: 'LTC', quote: 'ETH' },
  { base: 'AAVE', quote: 'ETH' },
  { base: 'XLM', quote: 'ETH' },
  { base: 'WBETH', quote: 'ETH' },
];

export const formatCrossPair = {
  binance: ({ base, quote }) => `${base}${quote}`.toLowerCase(),
  bybit: ({ base, quote }) => `${base}${quote}`.toUpperCase(),
  bitget: ({ base, quote }) => `${base}${quote}`.toUpperCase(),
  mexc: ({ base, quote }) => `${base}${quote}`.toUpperCase(),
  okx: ({ base, quote }) => `${base}-${quote}`.toUpperCase(),
  kucoin: ({ base, quote }) => `${base}-${quote}`.toUpperCase(),
  bitfinex: ({ base, quote }) => `t${base.toUpperCase()}${quote.toUpperCase()}`,
};