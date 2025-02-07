import { AaveActionProvider, aaveActionProvider } from "./aaveActionProvider";
import { ethers, providers, Wallet } from 'ethers-v5';
import { CdpWalletProvider, EvmWalletProvider } from "../../wallet-providers";
import { ActionBundle, FaucetService, PoolBundle } from '@aave/contract-helpers';
import * as markets from '@bgd-labs/aave-address-book';
import { Address, Hex } from "viem";
import { AAVEV3_BASE_SEPOLIA_MARKET_CONFIG } from "./markets";
import { SupplySchema, WithdrawSchema } from "./schemas";
import { approve } from "../../utils";
import { createSupplyTxData } from "./aaveActionUtil";

import { Block, BlockTag, Filter, FilterByBlockHash, Listener, Log, Provider, TransactionReceipt, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";

jest.mock("../../utils");
const mockApprove = approve as jest.MockedFunction<typeof approve>;

const cdpWalletData = process.env.CDP_WALLET_DATA || '{}';

describe('SupplySchema', () => {

  it("should successfully parse valid input", () => {

    const market = AAVEV3_BASE_SEPOLIA_MARKET_CONFIG;
    const validInput = {
      amount: '1',
      underlyingAddress: markets.AaveV3Sepolia.ASSETS.USDC.UNDERLYING,
    };

    const result = SupplySchema.safeParse(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validInput);
  });

  it("should fail parsing empty input", () => {
    const emptyInput = {};
    const result = SupplySchema.safeParse(emptyInput);

    expect(result.success).toBe(false);
  });
});



describe('WithdrawSchema', () => {

  it("should successfully parse valid input", () => {

    const market = AAVEV3_BASE_SEPOLIA_MARKET_CONFIG;
    const validInput = {
      amount: '1',
      underlyingAddress: markets.AaveV3Sepolia.ASSETS.USDC.UNDERLYING,
    };

    const result = WithdrawSchema.safeParse(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validInput);
  });

  it("should fail parsing empty input", () => {
    const emptyInput = {};
    const result = WithdrawSchema.safeParse(emptyInput);

    expect(result.success).toBe(false);
  });
});


describe("Aave Action Provider", () => {
  const alchemyConfig = {
    apiKey: process.env.ALCHEMY_API_KEY
  };

  const actionProvider = new AaveActionProvider({
    alchemyApiKey: process.env.ALCHEMY_API_KEY,
  });
  let mockWallet: jest.Mocked<EvmWalletProvider>;
  let mockProvider: jest.Mocked<providers.Provider>;


  const MOCK_USER_ADDRESS = "0x9876543210987654321098765432109876543210";
  const MOCK_TX_HASH = "0xabcdef1234567890";
  const MOCK_RECEIPT = { status: 1, blockNumber: 1234567 };

  const market = AAVEV3_BASE_SEPOLIA_MARKET_CONFIG;




  beforeEach(() => {
    mockWallet = {
      getAddress: jest.fn().mockReturnValue(MOCK_USER_ADDRESS),
      getNetwork: jest.fn().mockReturnValue({ protocolFamily: "evm", networkId: "1" }),
      sendTransaction: jest.fn().mockResolvedValue(MOCK_TX_HASH as `0x${string}`),
      waitForTransactionReceipt: jest.fn().mockResolvedValue(MOCK_RECEIPT),
    } as unknown as jest.Mocked<EvmWalletProvider>;

    // mockProvider = {
    //   _isProvider: true,
    //   call: jest.fn(),
    //   Contract: jest.fn().mockImplementation(() => {
    //     return {
    //       balanceOf: jest.fn(),
    //       decimals: jest.fn(),
    //     }
    //   }),
    //   // Wallet: {
    //   //   fromMnemonic: () => mockedEthersWallet
    //   // }


    // } as unknown as jest.Mocked<providers.Provider>;



    mockApprove.mockResolvedValue("Approval successful");

  });

  describe('withdraw', () => {
    it("should successfully withdraw USDC from Aave v3 L2 bas-sepolia", async () => {
      const asset = markets.AaveV3Sepolia.ASSETS.USDC;
      const args = {
        amount: '1',
        poolAddress: market.POOL,
        assetUnderlyingAddress: asset.UNDERLYING,
        assetATokenAddress: asset.A_TOKEN,
      };


      const provider = new ethers.providers.JsonRpcProvider(
        `https://base-sepolia.g.alchemy.com/v2/${alchemyConfig.apiKey}`
      );


      // const response = await actionProvider.withdraw(mockWallet, args);

    });

  })

  describe("supply", () => {
    it("should successfully supply USDC on Aaave v3 L2 base-sepolia", async () => {
      const asset = markets.AaveV3Sepolia.ASSETS.USDC;
      const args = {
        amount: '1',
        poolAddress: market.POOL,
        asset
      };



      const provider = new ethers.providers.JsonRpcProvider(
        `https://base-sepolia.g.alchemy.com/v2/${alchemyConfig.apiKey}`
      );


      const response = await actionProvider.supply(mockWallet, args);

      // fixture from createSupplyTxData with actual provider
      // as we try to avoid mocking the L2Encoder encode logic and provider 
      const encodedTxData = '0x0000000000000000000000000000000000000000000000000000000000010000';

      const txData = '0x617ba03700000000000000000000000094a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8000000000000000000000000000000000000000000000000000000000000000100000000000000000000000098765432109876543210987654321098765432100000000000000000000000000000000000000000000000000000000000000000';

      console.log('encodedTxData', encodedTxData)


      expect(mockWallet.sendTransaction).toHaveBeenCalledWith({
        to: market.POOL as `0x${string}`,
        data: txData
      });

      expect(mockWallet.waitForTransactionReceipt).toHaveBeenCalledWith(MOCK_TX_HASH);
      expect(response).toContain(`Supplied ${args.asset.UNDERLYING} to Aave v3 Pool`);
      expect(response).toContain(MOCK_TX_HASH);
      expect(response).toContain(JSON.stringify(MOCK_RECEIPT));
    });

    it("should handle transaction errors when supplying", async () => {

      const asset = markets.AaveV3Sepolia.ASSETS.USDC;
      const args = {
        amount: '0',
        poolAddress: market.POOL,
        asset
      };

      mockWallet.sendTransaction.mockRejectedValue(new Error("Failed to supply"));

      const response = await actionProvider.supply(mockWallet, args);

      expect(response).toContain("Error supplying to Aave v3: Error: Failed to supply");
    });
  });




  describe("supportsNetwork", () => {
    it("should return true for Base Sepolia", () => {
      const result = actionProvider.supportsNetwork({
        protocolFamily: "evm",
        networkId: "base-sepolia",
      });
      expect(result).toBe(true);
    });

    it("should return true for Sepolia", () => {
      const result = actionProvider.supportsNetwork({
        protocolFamily: "evm",
        networkId: "sepolia",
      });
      expect(result).toBe(true);
    });

    // For now
    it("should return false for other EVM networks except sepolia", () => {
      const result = actionProvider.supportsNetwork({
        protocolFamily: "evm",
        networkId: "ethereum",
      });
      expect(result).toBe(false);
    });

    it("should return false for non-EVM networks", () => {
      const result = actionProvider.supportsNetwork({
        protocolFamily: "bitcoin",
        networkId: "base-mainnet",
      });
      expect(result).toBe(false);
    });
  });
});
