export interface Token {
  pairAddress: string;
  tokenCa: string;
  name: string;
  symbol: string;
  dexId: string;
  priceUsd: string;
  change: number;
  mcap: string;
  liquidity: string;
  volume24h: string;
  age: number;
  logo?: string;
  launchpad?: string;
  socials?: {
    website?: string;
    twitter?: string;
    telegram?: string;
  };
  volume?: {
    h24: number;
  };
  priceChange?: {
    h24: number;
  };
}
