import { aaveActionProvider } from "./aaveActionProvider";
import { ethers, Wallet } from 'ethers-v5';
import { CdpWalletProvider, EvmWalletProvider } from "../../wallet-providers";
import { ActionBundle, FaucetService, PoolBundle } from '@aave/contract-helpers';
import * as markets from '@bgd-labs/aave-address-book';
import { Address, Hex } from "viem";
// import { createSupplyTxData, MarketConfig } from "./aaveActionUtil";

jest.setTimeout(60_000);

describe('SupplySchema', () => {

  const cdpWalletData = process.env.CDP_WALLET_DATA || '{}';
  // it("should successfully parse valid input", () => {
  //     const validInput = {
  //       amount: MOCK_AMOUNT,
  //       contractAddress: MOCK_CONTRACT_ADDRESS,
  //       destination: MOCK_DESTINATION,
  //     };

  //     const result = TransferSchema.safeParse(validInput);

  //     expect(result.success).toBe(true);
  //     expect(result.data).toEqual(validInput);
  //   });

  //   it("should fail parsing empty input", () => {
  //     const emptyInput = {};
  //     const result = TransferSchema.safeParse(emptyInput);

  //     expect(result.success).toBe(false);
  //   });
});

// Use aave Faucet to get assets on testnet
// Sepolia https://app.aave.com/faucet/?marketName=proto_sepolia_v3
// Base Sepolia (use circle for USDC) https://faucet.circle.com/
// https://sepolia.basescan.org/token/0x036cbd53842c5426634e7929541ec2318f3dcf7e
// cross-check with aave test case
// https://github.com/aave/aave-utilities/blob/master/packages/contract-helpers/src/v3-pool-contract-bundle/pool-bundle.test.ts#L109
describe('aave utilites learning test', () => {

  let alchemyConfig = {
    apiKey: ''
  };

  // 0x4A9b1ECD1297493B4EfF34652710BD1cE52c6526
  const privateKey = process.env.PRIVATE_KEY || '';
  const USER = '0x4A9b1ECD1297493B4EfF34652710BD1cE52c6526';

  beforeAll(() => {
    alchemyConfig.apiKey = process.env.ALCHEMY_API_KEY || 'tQhwxQjcpEdTJ0QhTCQmpvtlUlppXO6s';

  })


  // transaction failed [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (transactionHash="0x882aabeeb96734c2afcbcc9f131025f7d0adb447ebc72b6129e45e1aea091de0", transaction={"type":2,"chainId":11155111,"nonce":3,"maxPriorityFeePerGas":{"type":"BigNumber","hex":"0x59682f00"},"maxFeePerGas":{"type":"BigNumber","hex":"0x0a858acb9c"},"gasPrice":null,"gasLimit":{"type":"BigNumber","hex":"0x0493e0"},"to":"0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951","value":{"type":"BigNumber","hex":"0x00"},"data":"0x617ba03700000000000000000000000094a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c800000000000000000000000000000000000000000000000000000000000000010000000000000000000000004a9b1ecd1297493b4eff34652710bd1ce52c65260000000000000000000000000000000000000000000000000000000000000000","accessList":[],"hash":"0x882aabeeb96734c2afcbcc9f131025f7d0adb447ebc72b6129e45e1aea091de0","v":0,"r":"0x65e2c1f42d19b7b2aed9ec0ea106e3ed619acb2650f894f77960e55717f813e8","s":"0x18cf7604a6d5e7a9d583e308d67d90afdd73f6a055ce307e421027c89dbec840","from":"0x4A9b1ECD1297493B4EfF34652710BD1cE52c6526","confirmations":0}, receipt={"to":"0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951","from":"0x4A9b1ECD1297493B4EfF34652710BD1cE52c6526","contractAddress":null,"transactionIndex":26,"gasUsed":{"type":"BigNumber","hex":"0x01efd5"},"logsBloom":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","blockHash":"0xd5f42469d0edcac50b66482b0102a09d3be0e330d96c873589fe80a5278d1d3c","transactionHash":"0x882aabeeb96734c2afcbcc9f131025f7d0adb447ebc72b6129e45e1aea091de0","logs":[],"blockNumber":7646807,"confirmations":1,"cumulativeGasUsed":{"type":"BigNumber","hex":"0x27f98a"},"effectiveGasPrice":{"type":"BigNumber","hex":"0x0596074bf6"},"status":0,"type":2,"byzantium":true}, code=CALL_EXCEPTION, version=providers/5.7.2)

  //   it.only('should supply USDC on L1', async ()=>{

  //     const provider = new ethers.providers.JsonRpcProvider(
  //       "https://eth-sepolia.g.alchemy.com/v2/tQhwxQjcpEdTJ0QhTCQmpvtlUlppXO6s"
  //       );

  // const faucetAddress = '0xFaEc9cDC3Ef75713b48f46057B98BA04885e3391';

  // const faucetService = new FaucetService(provider, faucetAddress);

  // const tx = faucet.mint({ userAddress, reserve, tokenSymbol: 'USDC' });


  //     const market = markets.AaveV3Sepolia;
  //     const {POOL, WETH_GATEWAY} = market;
  //     const TOKEN = market.ASSETS.USDC.UNDERLYING;

  //     const poolBundle = new PoolBundle(provider, {
  //       WETH_GATEWAY,
  //       POOL,
  //     });


  //     const txData = await poolBundle.supplyTxBuilder.generateTxData({
  //       user: USER,
  //       reserve: TOKEN,
  //       amount: (1e18 / 1000).toString(),

  //     });


  //   })

  it.skip("should supply ETH on L1 sepolia", async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://eth-sepolia.g.alchemy.com/v2/tQhwxQjcpEdTJ0QhTCQmpvtlUlppXO6s"
    );

    const market = markets.AaveV3Sepolia;
    const { POOL, WETH_GATEWAY } = market;
    const TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const poolBundle = new PoolBundle(provider, {
      WETH_GATEWAY,
      POOL,
    });

    // if TOKEN is ETH, to = WETH_GATEWAY otherwise POOL
    // expect(result.amount).toEqual('0');
    // expect(result.token).toEqual(TOKEN);
    // expect(result.user).toEqual(USER);

    // TODO explicit approval?


    const txData = await poolBundle.supplyTxBuilder.generateTxData({
      user: USER,
      reserve: TOKEN,
      amount: (1e18 / 1000).toString(),
      // onBehalfOf,
      // referralCode,
      // useOptimizedPath,
      // encodedTxData,

    });

    console.log('txData', txData)

    // expect(txData.from).toEqual(USER)
    // expect(txData.to).toEqual(POOL)


    const wallet = new Wallet(privateKey, provider);

    const tx = await wallet.sendTransaction({
      ...txData,
    });
    console.log('tx', tx);

    const results = await tx.wait();
    console.log('results', results.transactionHash)
  });


  describe('on base L2 sepolia', () => {

    // const { WETH_GATEWAY, L2_ENCODER, POOL } = market;

    const provider = new ethers.providers.JsonRpcProvider(
      "https://base-sepolia.g.alchemy.com/v2/zrrG4ff6UcLSAHWkrkVpVrX2gBef_YY-"
    );

    //   const 



    //   const poolBundle = new PoolBundle(provider, {
    //     WETH_GATEWAY,
    //     POOL,
    //     L2_ENCODER
    //  });

    //   it("should supply on L2 base sepolia", async () => {

    //     const txData = await createSupplyTxData(provider, {
    //       market,
    //       amount: '1',
    //       USER,
    //       TOKEN: markets.AaveV3BaseSepolia.ASSETS.USDC.UNDERLYING
    //     })

    //     // working with direct contract call at 
    //     // https://basescan.org/address/0x39e97c588B2907Fb67F44fea256Ae3BA064207C5#readContract

    //     // console.log('supply to pool', POOL, 'with token', TOKEN);

    //     //   const params = await poolBundle.supplyTxBuilder.encodeSupplyParams({
    //     //     reserve: TOKEN,
    //     //     amount: '1',
    //     //     referralCode: '0',
    //     //   });


    //     // const txData = await poolBundle.supplyTxBuilder.generateTxData({
    //     //   user: USER,
    //     //   reserve: TOKEN,
    //     //   amount: '',
    //     //   // amount: (1e6 / 1000).toString(),
    //     //   // onBehalfOf,
    //     //   // referralCode,
    //     //   // useOptimizedPath,
    //     //   encodedTxData: params,

    //     // });



    //     console.log('params', txData);

    //     const wallet = new Wallet(privateKey, provider);

    //     const tx = await wallet.sendTransaction({
    //       to: POOL,
    //       // data: params,
    //       data: txData.data,
    //       gasLimit: 21000000,
    //     });
    //     console.log('tx', tx);

    //     const results = await tx.wait();
    //     console.log('results', results.transactionHash)
    //     // await poolBundle.supplyTxBuilder.generateSignedTxData({
    //     //   user: USER,
    //     // reserve: TOKEN,
    //     // amount: '1',
    //     // signature: '',
    //     // deadline,
    //     // })
    //     // expect(result.success).toBe(true);
    //     // expect(result.data).toEqual(validInput);
    //   });



    it.only('with cdp provider', async () => {
      // TODO need stable wallet
      const provider = await CdpWalletProvider.configureWithWallet({
        // Optional: Provide API key details. If not provided, it will attempt to configure from JSON.
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n'),

        // Optional: Provide network ID (defaults to base-sepolia if not specified)
        networkId: "base-sepolia", // other options: "base-mainnet", "ethereum-mainnet", "arbitrum-mainnet", "polygon-mainnet".

        cdpWalletData
      });
      console.log('provider', provider);

      const address = await provider.getAddress();
      const balance = await provider.getBalance();

      console.log('address', address, balance);
      //   console.log('supply to pool', POOL, 'with token', TOKEN);

      //   // TODO approval first

      // const params = await poolBundle.supplyTxBuilder.encodeSupplyParams({
      //   reserve: TOKEN,
      //   amount: '1',
      //   referralCode: '0',
      // });


      // const txData = await poolBundle.supplyTxBuilder.generateTxData({
      //   user: USER,
      //   reserve: TOKEN,
      //   amount: '1',
      //   // amount: (1e6 / 1000).toString(),
      //   // onBehalfOf,
      //   // referralCode,
      //   // useOptimizedPath,
      //   encodedTxData: params,

      // });

      // console.log('cdp txData', txData)
      // const txHash = await provider.sendTransaction({
      //   to: POOL as Address,
      //   // data: params,
      //   data: txData.data as Hex,
      //   // gasLimit: 21000000,
      // });
      // console.log('txHash', txHash);

      // const results = await tx.wait();
    })

  })

}); 