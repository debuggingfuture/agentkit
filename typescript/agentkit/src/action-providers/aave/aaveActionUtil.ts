import { ERC20Service, Pool, PoolBundle } from "@aave/contract-helpers";
import { providers } from "ethers-v5";
import { Address, formatEther, formatGwei, formatUnits, TransactionRequest } from "viem";
import { MarketConfig } from "./markets";

// align addres-book convention
export type AaveAsset = {
  UNDERLYING: Address;
  decimals: number;
  A_TOKEN: Address;
}

export type SupplyParams = {
  user: Address;
  amount: bigint;
  asset: AaveAsset;
  market: MarketConfig;
}

export type WithdrawParams = {
  user: Address;
  amount: bigint;
  asset: AaveAsset;
  market: MarketConfig;
}

// pre-approve, consider use permit
// @deprecated use typescript/agentkit/src/utils.ts
export const createApprovePoolTxData = async (provider: providers.Provider, params: SupplyParams) => {

  const { user, asset, amount } = params;

  const { WETH_GATEWAY, L2_ENCODER, POOL } = params.market;

  const erc20Service = new ERC20Service(provider);

  const txData = await erc20Service.approveTxData({
    user,
    spender: POOL,
    token: asset.UNDERLYING,
    amount: amount.toString(),
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
 *    amount - expect bigint accounted for decimals
 *    poolBundle.supplyTxBuilder.encodeSupplyParams will not adjust for decimals
 * @returns 
 */
export const createSupplyTxData = async (provider: providers.Provider, params: SupplyParams) => {

  const { user, asset } = params;

  const { WETH_GATEWAY, L2_ENCODER, POOL } = params.market;

  const poolBundle = new PoolBundle(provider, {
    WETH_GATEWAY,
    POOL,
    L2_ENCODER
  });

  const amount = params.amount.toString();


  if (!L2_ENCODER) {
    // L1

    const txData = await poolBundle.supplyTxBuilder.generateTxData({
      user,
      reserve: asset.UNDERLYING,
      amount,
    });

    return {
      poolBundle,
      txData: txData as TransactionRequest
    }

  }

  // L2
  const encodedTxData = await poolBundle.supplyTxBuilder.encodeSupplyParams({
    reserve: asset.UNDERLYING,
    amount,
    referralCode: '0',
  });

  const txData = await poolBundle.supplyTxBuilder.generateTxData({
    user,
    reserve: asset.UNDERLYING,
    amount,
    encodedTxData,
  });

  return {
    poolBundle,
    encodedTxData,
    txData: txData as TransactionRequest
  };

}

/**
 * 
 * @param provider 
 * @param params 
 *    amount - expect bigint accounted for decimals per token (to align supply)
 *    pool.withdraw handle decimals from token contract internally
 * @returns 
 */
export const createWithdrawTxData = async (provider: providers.Provider, params: WithdrawParams) => {

  const { user, asset } = params;

  const { WETH_GATEWAY, L2_ENCODER, POOL } = params.market;

  const pool = new Pool(provider, {
    WETH_GATEWAY,
    POOL,
    L2_ENCODER
  });



  let amount = formatUnits(params.amount, asset.decimals);
  if (asset.UNDERLYING === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    amount = formatEther(params.amount);
    // wethGatewayService.withdrawEth will revert this to gwei
  }


  const withDrawTxs = await pool.withdraw({
    user,
    reserve: asset.UNDERLYING,
    amount,
    aTokenAddress: asset.A_TOKEN,
    useOptimizedPath: !!L2_ENCODER
    // onBehalfOf,
  });

  const withDrawTxDatas = await Promise.all(
    withDrawTxs.map(({ tx }) => tx())
  )


  return {
    pool,
    withDrawTxDatas
  };

}