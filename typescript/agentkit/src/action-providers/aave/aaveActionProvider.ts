import { z } from "zod";

import { ethers } from 'ethers-v5';
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


/**
 * ERC20ActionProvider is an action provider for ERC20 tokens.
 */
export class AaveActionProvider extends ActionProvider {
  /**
   * Constructor for the ERC20ActionProvider.
   */
  constructor() {
    super("aave", []);
  }

  /**
   * Supply to aave
   *
   * @param walletProvider - The wallet provider to get the balance from.
   * @param args - The input arguments for the action.
   * @returns A message containing the balance.
   */
  @CreateAction({
    name: "deposit",
    description: `
    This tool will get the balance of an ERC20 asset in the wallet. It takes the contract address as input.
    `,
    schema: SupplySchema,
  })
  async supply(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof SupplySchema>,
  ): Promise<string> {
    try {

        console.log('hi')
      return `Balance `;
    } catch (error) {
      return `Error getting balance: ${error}`;
    }
  }

//   TODO
  /**
   * Checks if the Aave action provider supports the given network.
   *
   * @param _ - The network to check.
   * @returns True if the ERC20 action provider supports the network, false otherwise.
   */
  supportsNetwork = (_: Network) => true;
}

export const aaveActionProvider = () => new AaveActionProvider();
