// import { CdpWalletProvider, EvmWalletProvider } from "../../wallet-providers";
// import { AaveActionProvider } from "./aaveActionProvider";
// import { providers } from "ethers-v5";

// describe('withdraw', () => {
//     const actionProvider = new AaveActionProvider({
//         alchemyApiKey: process.env.ALCHEMY_API_KEY,
//     });
//     const CDP_WALLET_CONFIG = {
//         apiKeyName: process.env.CDP_API_KEY_NAME,
//         apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
//         cdpWalletData: process.env.CDP_WALLET_DATA || '{}'
//     };

//     it("should successfully withdraw USDC from Aave v3 L2 bas-sepolia", async () => {

//         const evmWalletProvider = await CdpWalletProvider.configureWithWallet({
//             ...CDP_WALLET_CONFIG,
//             networkId: "base-sepolia", // other options: "base-mainnet", "ethereum-mainnet", "arbitrum-mainnet", "polygon-mainnet".
//         });

//         const response = await actionProvider.supply(evmWalletProvider, {
//             amount: '1',
//             poolAddress: market.POOL,
//             asset
//         });
//     })

// });
