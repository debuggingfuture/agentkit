import { createApprovePoolTxData, createSupplyTxData, createWithdrawTxData } from "./aaveActionUtil";

import { ethers, Wallet } from 'ethers-v5';
import { AAVEV3_BASE_SEPOLIA_MARKET_CONFIG, AAVEV3_SEPOLIA_MARKET_CONFIG } from "./markets";

import * as markets from '@bgd-labs/aave-address-book';
import { Address, encodeFunctionData, Hex } from "viem";
import { CdpWalletProvider } from "../../wallet-providers";
import { ERC20Service } from "@aave/contract-helpers";


jest.setTimeout(60_000);
describe('aaveActionUtil', () => {
    // 0x4A9b1ECD1297493B4EfF34652710BD1cE52c6526
    const privateKey = process.env.PRIVATE_KEY || '';

    const cdpWalletData = process.env.CDP_WALLET_DATA || '{}';

    let alchemyConfig = {
        apiKey: process.env.ALCHEMY_API_KEY
    };


    describe('L1 sepolia', () => {
        const provider = new ethers.providers.JsonRpcProvider(
            `https://eth-sepolia.g.alchemy.com/v2/${alchemyConfig.apiKey}`
        );

        const market = AAVEV3_SEPOLIA_MARKET_CONFIG;


        test.skip('#createSupplyTxData work with native wallet', async () => {

            const wallet = new Wallet(privateKey, provider);
            const user = await wallet.getAddress() as Address;

            // TODO segregation integration test with mocks
            const { txData } = await createSupplyTxData(provider, {
                market,
                amount: 1n,
                user,
                asset: markets.AaveV3Sepolia.ASSETS.USDC
            });
            const tx = await wallet.sendTransaction({
                to: market.POOL,
                data: txData.data,
                gasLimit: 21000000,
            });
            console.log('tx', tx);

            const results = await tx.wait();
            console.log('results', results.transactionHash)
        });
    })

    describe('L2 base sepolia', () => {
        const provider = new ethers.providers.JsonRpcProvider(
            `https://base-sepolia.g.alchemy.com/v2/${alchemyConfig.apiKey}`
        );

        const market = AAVEV3_BASE_SEPOLIA_MARKET_CONFIG;
        const asset = markets.AaveV3BaseSepolia.ASSETS.USDC;

        const ALLOWANCE_DEFAULT = (1000 * 1e6).toString();

        test('#createSupplyTxData work with native wallet', async () => {
            // 0x4A9b1ECD1297493B4EfF34652710BD1cE52c6526
            const privateKey = process.env.PRIVATE_KEY || '';

            const wallet = new Wallet(privateKey, provider);
            const user = await wallet.getAddress() as Address;


            // const { erc20Service, txData: approvalTxData } = await createApprovePoolTxData(provider, {
            //     market,
            //     amount: ALLOWANCE_DEFAULT,
            //     USER,
            //     ASSET
            // });

            // await wallet.sendTransaction({
            //     ...approvalTxData
            // });

            const amount = (1e6 / 100).toString();
            console.log('USER', user, 'supply to pool', market.POOL, amount);


            // TODO segregation integration test with mocks
            const { poolBundle, txData } = await createSupplyTxData(provider, {
                market,
                amount: 1n,
                user,
                asset
            });


            const tx = await wallet.sendTransaction({
                to: market.POOL,
                data: txData.data,
                gasLimit: 21000000,
            });
            console.log('tx', tx);


            const supplyTxReceipt = await tx.wait();
            console.log('supply txn hash', supplyTxReceipt.transactionHash)

            expect(supplyTxReceipt.transactionHash).toBeDefined();

            // estimateGas error if withdraw amount incorrect
            // TODO this amount to be parsed as wei
            const { withDrawTxDatas } = await createWithdrawTxData(provider, {
                market,
                amount: 1n,
                user,
                asset
            });

            const withdrawTxHash = await wallet.sendTransaction({
                to: withDrawTxDatas?.[0].to as Address,
                data: withDrawTxDatas?.[0].data as Hex,

            })
            console.log(withdrawTxHash);


            console.log('withdraw txn hash', supplyTxReceipt.transactionHash)
            expect(withdrawTxHash).toBeDefined();

        })


        test.skip('#createSupplyTxData work with cdp wallet', async () => {
            const cdpWalletProvider = await CdpWalletProvider.configureWithWallet({
                // Optional: Provide API key details. If not provided, it will attempt to configure from JSON.
                apiKeyName: process.env.CDP_API_KEY_NAME,
                apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n'),

                // Optional: Provide network ID (defaults to base-sepolia if not specified)
                networkId: "base-sepolia", // other options: "base-mainnet", "ethereum-mainnet", "arbitrum-mainnet", "polygon-mainnet".
                cdpWalletData,
            });

            const user = cdpWalletProvider.getAddress() as Address;
            const amount = (1e6 / 100).toString();
            console.log('USER', user, 'supply to pool', market.POOL, amount);


            // Approve for allowance
            // const { erc20Service, txData: approvalTxData } = await createApprovePoolTxData(provider, {
            //     market,
            //     amount: ALLOWANCE_DEFAULT,
            //     USER,
            //     TOKEN
            // });

            // await cdpWalletProvider.sendTransaction({
            //     to: TOKEN as Address,
            //     from: USER as Address,
            //     data: approvalTxData.data as Hex
            // });



            // use utilties with ethers-v5 provider to encode, while send txn with viem
            const { txData } = await createSupplyTxData(provider, {
                market,
                amount: 1n,
                user,
                asset
            });

            console.log('txData', txData);

            const supplyTxHash = await cdpWalletProvider.sendTransaction({
                to: txData.to as Address,
                data: txData.data as Hex,

            })

            console.log('supply txn hash', supplyTxHash)
            await cdpWalletProvider.waitForTransactionReceipt(supplyTxHash);


            expect(supplyTxHash).toBeDefined();

            const { withDrawTxDatas } = await createWithdrawTxData(provider, {
                market,
                amount: 1n,
                user,
                asset
            });

            console.log('withDrawTxDatas', withDrawTxDatas)

            const withdrawTxHash = await cdpWalletProvider.sendTransaction({
                to: txData.to as Address,
                data: txData.data as Hex,

            })
            console.log(withdrawTxHash);
            await cdpWalletProvider.waitForTransactionReceipt(withdrawTxHash);



        })

    })
});