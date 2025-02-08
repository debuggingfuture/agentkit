import { z } from "zod";

import { ethers, providers } from 'ethers-v5';

import { CreateAction } from "../actionDecorator";
import { ActionProvider } from "../actionProvider";
import { Network } from "../../network";
import { EvmWalletProvider, WalletProvider } from "../../wallet-providers";
import { SupplySchema } from "./schemas";
import { AAVEV3_BASE_SEPOLIA, AAVEV3_BASE_SEPOLIA_MARKET_CONFIG, AAVEV3_SEPOLIA, AAVEV3_SEPOLIA_MARKET_CONFIG, MarketConfig } from "./markets";
import { AaveAsset, createSupplyTxData } from "./aaveActionUtil";
import { Address, Hex, parseUnits } from "viem";
import { approve } from "../../utils";

export const SUPPORTED_NETWORKS = ["sepolia", "base-sepolia"];

// @ts-ignore
BigInt.prototype.toJSON = function () {

  return this.toString();

};
// Not as action args for better agent guardrails

export const findAaveMarketAssets = (networkId: string): {
  market: MarketConfig,
  assets: Record<string, AaveAsset>
} => {
  const config = {
    'base-sepolia': AAVEV3_BASE_SEPOLIA,
    'sepolia': AAVEV3_SEPOLIA
  }[networkId];

  if (!config) {
    throw new Error(`MarketAssets not found for network ${networkId}`);
  }
  return config

}



/**
 * Configuration options for the AaveActionProvider.
 * TODO extract provider for flexibility
 */
export interface AaveActionProviderConfig {
  /**
   * Alchemy API Key
   */
  alchemyApiKey?: string;
}

/**
 * ERC20ActionProvider is an action provider for ERC20 tokens.
 */
export class AaveActionProvider extends ActionProvider<WalletProvider> {
  private readonly provider: providers.Provider;

  /**
   * Constructor for the ERC20ActionProvider.
   */
  constructor(config: AaveActionProviderConfig) {
    super("aave", []);

    config.alchemyApiKey ||= process.env.ALCHEMY_API_KEY;
    if (!config.alchemyApiKey) {
      throw new Error("ALCHEMY_API_KEY is not configured.");
    }

    // TODO network agnostic
    this.provider = new ethers.providers.JsonRpcProvider(
      `https://base-sepolia.g.alchemy.com/v2/${config.alchemyApiKey}`
    );

  }

  async approveAll(walletProvider: EvmWalletProvider) {


    const networkId = walletProvider.getNetwork().networkId || 'base-sepolia';
    const { market, assets } = findAaveMarketAssets(networkId);
    console.log('approve all assets on ', networkId);
    for await (const asset of Object.values(assets)) {
      console.log('approve', asset.UNDERLYING, 'pool', market.POOL);
      const results = await approve(walletProvider, asset.UNDERLYING, market.POOL, 1000000000n);
      console.log(results);
    }

  }

  private getProvider(network: Network) {
    // TODO
    return this.provider;
  }

  /**
   * Supply assets into a Aave v3 protocol
   *
   * @param wallet - The wallet instance to execute the transaction
   * @param args - The input arguments for the action
   * @returns A success message with transaction details or an error message
   */
  @CreateAction({
    name: "supply",
    description: `
* This tool allows supplying assets into a Aave v3 protocol market such as USDC

It takes:
- assetAddress: The address of the asset to supply
- amount: The amount of assets to deposit in whole units accounted for decimal. 
Important notes:
- Make sure to use the exact amount provided. Do not convert units for assets for this action.
- Please use a token address (example 0x4200000000000000000000000000000000000006) for the assetAddress field.
`,
    schema: SupplySchema,
  })
  async supply(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof SupplySchema>,
  ): Promise<string> {
    try {

      if (args.amount === '0') {
        // TODO bigint > 0
        throw new Error('Supply amount must be > 0')
      }
      const networkId = walletProvider.getNetwork().networkId || 'base-sepolia';
      const { market, assets } = findAaveMarketAssets(networkId);
      const asset = assets?.[args.assetAddress] as AaveAsset;

      console.log('aave supply', args, parseUnits(args.amount, 0),);

      console.log('asset', assets?.[args.assetAddress]);

      const poolAddress = market.POOL;

      const user = await walletProvider.getAddress() as Address;

      const { poolBundle, txData, encodedTxData } = await createSupplyTxData(this.provider, {
        market,
        amount: parseUnits(args.amount, 0),
        user,
        asset
      });

      console.log('create supply tx data')

      console.log(txData, encodedTxData);


      const txHash = await walletProvider.sendTransaction({
        to: poolAddress as Address,
        data: txData.data as Hex,
      });

      const receipt = await walletProvider.waitForTransactionReceipt(txHash);

      return `Supplied ${args.amount} units of ${args.assetAddress} to Aave v3 Pool ${poolAddress} with transaction hash: ${txHash} status:${receipt.status}`;
    } catch (error) {
      console.error(error)
      return `Error supplying to Aave v3: ${error}`;
    }
  }

  /**
   * Checks if the Aave action provider supports the given network.
   *
   * @param network - The network to check.
   * @returns True if the ERC20 action provider supports the network, false otherwise.
   */
  supportsNetwork = (network: Network) => SUPPORTED_NETWORKS.includes(network.networkId!);
}

export const aaveActionProvider = (config: AaveActionProviderConfig) => new AaveActionProvider(config);
