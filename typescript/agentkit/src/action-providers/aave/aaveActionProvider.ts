import { z } from "zod";

import { ethers, providers } from 'ethers-v5';
import {
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId,
} from '@aave/contract-helpers';
import * as markets from '@bgd-labs/aave-address-book';

import { CreateAction } from "../actionDecorator";
import { ActionProvider } from "../actionProvider";
import { Network } from "../../network";
import { EvmWalletProvider } from "../../wallet-providers";
import { SupplySchema } from "./schemas";
import { WithdrawSchema } from "../morpho";
import { AAVEV3_BASE_SEPOLIA_MARKET_CONFIG } from "./markets";
import { createSupplyTxData } from "./aaveActionUtil";
import { Address, Hex } from "viem";


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
export class AaveActionProvider extends ActionProvider {
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

    // TODO network
    this.provider = new ethers.providers.JsonRpcProvider(
      `https://base-sepolia.g.alchemy.com/v2/${config.alchemyApiKey}`
    );

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
This tool allows depositing assets into a Morpho Vault. 

It takes:
- underlyingAddress: The address of the asset to deposit to
- assets: The amount of assets to deposit in units accounted for decimal
  Examples for USDC:
  - 100000 USDC
  - 1000000 USDc
  - 10000000 USDC
  
Important notes:
- Make sure to use the exact amount provided. Do not convert units for assets for this action.
- Please use a token address (example 0x4200000000000000000000000000000000000006) for the tokenAddress field.
`,
    schema: SupplySchema,
  })
  async supply(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof SupplySchema>,
  ): Promise<string> {
    try {

      console.log('supply', args);

      // TODO get current network
      // const provider = walletProvider.provider;
      // const networkId = provider.network.chainId as ChainId;
      const networkId = 'base-sepolia';

      // const market = markets.getMarket(networkId);

      const market = AAVEV3_BASE_SEPOLIA_MARKET_CONFIG;

      const { poolAddress, assetUnderlyingAddress, assetATokenAddress } = args;

      const user = await walletProvider.getAddress() as Address;

      const { poolBundle, txData, encodedTxData } = await createSupplyTxData(this.provider, {
        market,
        amount: 1n,
        user,
        asset: {
          UNDERLYING: assetUnderlyingAddress as Address,
          decimals: 6,
          A_TOKEN: assetATokenAddress as Address
        }

      });

      console.log(txData, encodedTxData)


      const txHash = await walletProvider.sendTransaction({
        to: poolAddress as Address,
        data: txData.data as Hex,
      });

      const receipt = await walletProvider.waitForTransactionReceipt(txHash);

      // TODO get symbol froma assets

      return `Supplied ${args.assetUnderlyingAddress} to Aave v3 Pool ${args.poolAddress} with transaction hash: ${txHash}\nTransaction receipt: ${JSON.stringify(receipt)}`;
    } catch (error) {
      return `Error getting balance: ${error}`;
    }
  }

  /**
   * Checks if the Aave action provider supports the given network.
   *
   * @param network - The network to check.
   * @returns True if the ERC20 action provider supports the network, false otherwise.
   */
  supportsNetwork = (network: Network) => ['sepolia', 'base-sepolia'].includes(network.networkId!);
}

export const aaveActionProvider = (config: AaveActionProviderConfig) => new AaveActionProvider(config);
