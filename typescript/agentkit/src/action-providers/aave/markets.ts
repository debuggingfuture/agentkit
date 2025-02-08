import { Address } from "viem";
import * as markets from "@bgd-labs/aave-address-book";
import { AaveAsset } from "./aaveActionUtil";

export type MarketConfig = {
  POOL: Address;
  L2_ENCODER?: Address;
  WETH_GATEWAY: Address;
};

// Base Sepolia Addresses at @bgd-labs/aave-address-book seems outdated
// use belwo config retrieved from UI, or get from provider
// https://github.com/aave/interface/blob/6b52156d694b320021cc533551407b680436e5ce/src/ui-config/marketsConfig.tsx#L411

export const AAVEV3_SEPOLIA_MARKET_CONFIG = markets.AaveV3Sepolia as MarketConfig;

export const AAVEV3_BASE_SEPOLIA_MARKET_CONFIG = {
  LENDING_POOL_ADDRESS_PROVIDER: "0xd449FeD49d9C443688d6816fE6872F21402e41de", // AaveV3BaseSepolia.POOL_ADDRESSES_PROVIDER,
  POOL: "0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b", // AaveV3BaseSepolia.POOL,
  WETH_GATEWAY: "0xF6Dac650dA5616Bc3206e969D7868e7c25805171", // AaveV3BaseSepolia.WETH_GATEWAY,
  WALLET_BALANCE_PROVIDER: "0xdeB02056E277174566A1c425a8e60550142B70A2", // AaveV3BaseSepolia.WALLET_BALANCE_PROVIDER,
  UI_POOL_DATA_PROVIDER: "0x884702E4b1d0a2900369E83d5765d537F469cAC9", // AaveV3BaseSepolia.UI_POOL_DATA_PROVIDER,
  UI_INCENTIVE_DATA_PROVIDER: "0x52Cb5CDf732889be3fd5d5E3A5D589446e060C0D", // AaveV3BaseSepolia.UI_INCENTIVE_DATA_PROVIDER,
  L2_ENCODER: "0x458d281bFFCE958E34571B33F1F26Bd42Aa27c44", // AaveV3BaseSepolia.L2_ENCODER,
} as MarketConfig;

export const AAVEV3_SEPOLIA = {
  market: AAVEV3_SEPOLIA_MARKET_CONFIG,
  assets: {
    [markets.AaveV3Sepolia.ASSETS.USDC.UNDERLYING]: markets.AaveV3Sepolia.ASSETS.USDC,
  } as Record<string, AaveAsset>,
};

export const AAVEV3_BASE_SEPOLIA = {
  market: AAVEV3_BASE_SEPOLIA_MARKET_CONFIG,
  assets: {
    [markets.AaveV3BaseSepolia.ASSETS.USDC.UNDERLYING]: markets.AaveV3BaseSepolia.ASSETS.USDC,
  } as Record<string, AaveAsset>,
};
