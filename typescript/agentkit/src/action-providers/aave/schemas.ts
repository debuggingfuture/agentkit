import { z } from "zod";

/**
 * Input schema for supply action.
 */
export const SupplySchema = z
  .object({
    // amount: z.custom<bigint>().describe("The amount of the asset to supply"),
    amount: z.string()
      .regex(/^\d+$/, "Must be a valid whole number")
      .describe("The amount of the asset to supply"),

    assetUnderlyingAddress: z.string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .describe("The contract address of the underlying token of asset to supply"),

    poolAddress: z.string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .describe("The contract address of the market pool to supply"),

    assetATokenAddress: z.string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .optional()
      .describe("The contract address of the underlying token of asset to supply"),
  })
  .strip()
  .describe("Instructions for supplying assets");


export const WithdrawSchema = z
  .object({
    amount: z.custom<bigint>().describe("The amount of the asset to withdraw"),
    underlyingAddress: z.string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .describe("The contract address of the underlying token of asset to withdraw"),
    // aTokenAddress
  })
  .strip()
  .describe("Instructions for transferring assets");
