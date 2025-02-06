import { ERC20Service, Pool, PoolBundle } from "@aave/contract-helpers";
import { providers } from "ethers-v5";
import { Address } from "viem";
import { MarketConfig } from "./markets";

type Asset = {
  UNDERLYING: Address;
  A_TOKEN: Address;
}

export type SupplyParams = {
  USER: Address;
  amount: string;
  ASSET: Asset;
  market: MarketConfig;
}

export type WithdrawParams = {
  USER: Address;
  amount: string;
  ASSET: Asset;
  market: MarketConfig;
}

// pre-approve, consider use permit
export const createApprovePoolTxData = async (provider: providers.Provider, params: SupplyParams) => {

  const { USER, ASSET, amount } = params;

  const { WETH_GATEWAY, L2_ENCODER, POOL } = params.market;

  const erc20Service = new ERC20Service(provider);

  const txData = await erc20Service.approveTxData({
    user: USER,
    spender: POOL,
    token: ASSET.UNDERLYING,
    amount: amount,
  })

  return {
    erc20Service,
    txData,
  };

}




/**
 * PoolBundle is capable to approve if required and use supplyWithPermit 
 * Current implementation assume pre-approved
 * @param provider 
 * @param params 
 * @returns 
 */
export const createSupplyTxData = async (provider: providers.Provider, params: SupplyParams) => {

  const { USER, ASSET, amount } = params;

  const { WETH_GATEWAY, L2_ENCODER, POOL } = params.market;

  const poolBundle = new PoolBundle(provider, {
    WETH_GATEWAY,
    POOL,
    L2_ENCODER
  });


  const encodedTxData = await poolBundle.supplyTxBuilder.encodeSupplyParams({
    reserve: ASSET.UNDERLYING,
    amount,
    referralCode: '0',
  });

  const txData = await poolBundle.supplyTxBuilder.generateTxData({
    user: USER,
    reserve: ASSET.UNDERLYING,
    amount,
    encodedTxData,
  });

  return {
    poolBundle,
    txData
  };

}

export const createWithdrawTxData = async (provider: providers.Provider, params: WithdrawParams) => {

  const { USER, ASSET, amount } = params;

  const { WETH_GATEWAY, L2_ENCODER, POOL } = params.market;

  const pool = new Pool(provider, {
    WETH_GATEWAY,
    POOL,
    L2_ENCODER
  });


  const withDrawTxs = await pool.withdraw({
    user: USER,
    reserve: ASSET.UNDERLYING,
    amount,
    aTokenAddress: ASSET.A_TOKEN,
    useOptimizedPath: true
    // onBehalfOf,
  });

  return {
    pool,
    withDrawTxs
  };

}