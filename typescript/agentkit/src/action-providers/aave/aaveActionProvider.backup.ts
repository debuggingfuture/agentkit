// import { aaveActionProvider } from "./aaveActionProvider";
// import { ethers, Wallet } from 'ethers-v5';
// import { CdpWalletProvider, EvmWalletProvider } from "../../wallet-providers";
// import { ActionBundle, FaucetService, PoolBundle } from '@aave/contract-helpers';
// import * as markets from '@bgd-labs/aave-address-book';
// import { Address, Hex } from "viem";
// // import { createSupplyTxData, MarketConfig } from "./aaveActionUtil";

// jest.setTimeout(60_000);

// const cdpWalletData = process.env.CDP_WALLET_DATA || '{}';

// describe('SupplySchema', () => {


//   // it("should successfully parse valid input", () => {
//   //     const validInput = {
//   //       amount: MOCK_AMOUNT,
//   //       contractAddress: MOCK_CONTRACT_ADDRESS,
//   //       destination: MOCK_DESTINATION,
//   //     };

//   //     const result = TransferSchema.safeParse(validInput);

//   //     expect(result.success).toBe(true);
//   //     expect(result.data).toEqual(validInput);
//   //   });

//   //   it("should fail parsing empty input", () => {
//   //     const emptyInput = {};
//   //     const result = TransferSchema.safeParse(emptyInput);

//   //     expect(result.success).toBe(false);
//   //   });
// });

// // Use aave Faucet to get assets on testnet
// // Sepolia https://app.aave.com/faucet/?marketName=proto_sepolia_v3
// // Base Sepolia (use circle for USDC) https://faucet.circle.com/
// // https://sepolia.basescan.org/token/0x036cbd53842c5426634e7929541ec2318f3dcf7e
// // cross-check with aave test case
// // https://github.com/aave/aave-utilities/blob/master/packages/contract-helpers/src/v3-pool-contract-bundle/pool-bundle.test.ts#L109
// describe('aave utilites learning test', () => {


//   it.skip("should supply ETH on L1 sepolia", async () => {
//     const provider = new ethers.providers.JsonRpcProvider(
//       "https://eth-sepolia.g.alchemy.com/v2/tQhwxQjcpEdTJ0QhTCQmpvtlUlppXO6s"
//     );

//     const market = markets.AaveV3Sepolia;
//     const { POOL, WETH_GATEWAY } = market;
//     const TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
//     const poolBundle = new PoolBundle(provider, {
//       WETH_GATEWAY,
//       POOL,
//     });

//     // if TOKEN is ETH, to = WETH_GATEWAY otherwise POOL
//     // expect(result.amount).toEqual('0');
//     // expect(result.token).toEqual(TOKEN);
//     // expect(result.user).toEqual(USER);

//     // TODO explicit approval?


//     const txData = await poolBundle.supplyTxBuilder.generateTxData({
//       user: USER,
//       reserve: TOKEN,
//       amount: (1e18 / 1000).toString(),
//       // onBehalfOf,
//       // referralCode,
//       // useOptimizedPath,
//       // encodedTxData,

//     });

//     console.log('txData', txData)

//     // expect(txData.from).toEqual(USER)
//     // expect(txData.to).toEqual(POOL)


//     const wallet = new Wallet(privateKey, provider);

//     const tx = await wallet.sendTransaction({
//       ...txData,
//     });
//     console.log('tx', tx);

//     const results = await tx.wait();
//     console.log('results', results.transactionHash)
//   });


//   describe('on base L2 sepolia', () => {

//     // const { WETH_GATEWAY, L2_ENCODER, POOL } = market;

//     const provider = new ethers.providers.JsonRpcProvider(
//       "https://base-sepolia.g.alchemy.com/v2/zrrG4ff6UcLSAHWkrkVpVrX2gBef_YY-"
//     );

//     //   const 



//     //   const poolBundle = new PoolBundle(provider, {
//     //     WETH_GATEWAY,
//     //     POOL,
//     //     L2_ENCODER
//     //  });

//     //   it("should supply on L2 base sepolia", async () => {

//     //     const txData = await createSupplyTxData(provider, {
//     //       market,
//     //       amount: '1',
//     //       USER,
//     //       TOKEN: markets.AaveV3BaseSepolia.ASSETS.USDC.UNDERLYING
//     //     })

//     //     // working with direct contract call at 
//     //     // https://basescan.org/address/0x39e97c588B2907Fb67F44fea256Ae3BA064207C5#readContract

//     //     // console.log('supply to pool', POOL, 'with token', TOKEN);

//     //     //   const params = await poolBundle.supplyTxBuilder.encodeSupplyParams({
//     //     //     reserve: TOKEN,
//     //     //     amount: '1',
//     //     //     referralCode: '0',
//     //     //   });


//     //     // const txData = await poolBundle.supplyTxBuilder.generateTxData({
//     //     //   user: USER,
//     //     //   reserve: TOKEN,
//     //     //   amount: '',
//     //     //   // amount: (1e6 / 1000).toString(),
//     //     //   // onBehalfOf,
//     //     //   // referralCode,
//     //     //   // useOptimizedPath,
//     //     //   encodedTxData: params,

//     //     // });



//     //     console.log('params', txData);

//     //     const wallet = new Wallet(privateKey, provider);

//     //     const tx = await wallet.sendTransaction({
//     //       to: POOL,
//     //       // data: params,
//     //       data: txData.data,
//     //       gasLimit: 21000000,
//     //     });
//     //     console.log('tx', tx);

//     //     const results = await tx.wait();
//     //     console.log('results', results.transactionHash)
//     //     // await poolBundle.supplyTxBuilder.generateSignedTxData({
//     //     //   user: USER,
//     //     // reserve: TOKEN,
//     //     // amount: '1',
//     //     // signature: '',
//     //     // deadline,
//     //     // })
//     //     // expect(result.success).toBe(true);
//     //     // expect(result.data).toEqual(validInput);
//     //   });



//     it.skip('with cdp provider', async () => {
//       // TODO need stable wallet
//       const provider = await CdpWalletProvider.configureWithWallet({
//         // Optional: Provide API key details. If not provided, it will attempt to configure from JSON.
//         apiKeyName: process.env.CDP_API_KEY_NAME,
//         apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n'),

//         // Optional: Provide network ID (defaults to base-sepolia if not specified)
//         networkId: "base-sepolia", // other options: "base-mainnet", "ethereum-mainnet", "arbitrum-mainnet", "polygon-mainnet".

//         cdpWalletData
//       });
//       console.log('provider', provider);

//       const address = await provider.getAddress();
//       const balance = await provider.getBalance();

//       console.log('address', address, balance);
//       //   console.log('supply to pool', POOL, 'with token', TOKEN);

//       //   // TODO approval first

//       // const params = await poolBundle.supplyTxBuilder.encodeSupplyParams({
//       //   reserve: TOKEN,
//       //   amount: '1',
//       //   referralCode: '0',
//       // });


//       // const txData = await poolBundle.supplyTxBuilder.generateTxData({
//       //   user: USER,
//       //   reserve: TOKEN,
//       //   amount: '1',
//       //   // amount: (1e6 / 1000).toString(),
//       //   // onBehalfOf,
//       //   // referralCode,
//       //   // useOptimizedPath,
//       //   encodedTxData: params,

//       // });

//       // console.log('cdp txData', txData)
//       // const txHash = await provider.sendTransaction({
//       //   to: POOL as Address,
//       //   // data: params,
//       //   data: txData.data as Hex,
//       //   // gasLimit: 21000000,
//       // });
//       // console.log('txHash', txHash);

//       // const results = await tx.wait();
//     })

//   })

// }); 