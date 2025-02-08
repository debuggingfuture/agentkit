import { AaveAsset, createApprovePoolTxData, createSupplyTxData, createWithdrawTxData, SupplyParams } from "./aaveActionUtil";

import { ethers, Wallet } from 'ethers-v5';
import { AAVEV3_BASE_SEPOLIA_MARKET_CONFIG, AAVEV3_SEPOLIA_MARKET_CONFIG } from "./markets";

import * as markets from '@bgd-labs/aave-address-book';
import { Address, encodeFunctionData, Hex, createWalletClient, http } from "viem";
import { CdpWalletProvider, EvmWalletProvider, ViemWalletProvider } from "../../wallet-providers";
import { ERC20Service, Pool } from "@aave/contract-helpers";

import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, sepolia } from "viem/chains";
import { approve } from "../../utils";
import { createProvider } from "./ethers-v5-adapter";

// Use aave Faucet to get assets on testnet
// Sepolia https://app.aave.com/faucet/?marketName=proto_sepolia_v3
// Base Sepolia (use circle for USDC) https://faucet.circle.com/
// https://sepolia.basescan.org/token/0x036cbd53842c5426634e7929541ec2318f3dcf7e
// cross-check with aave test case
// https://github.com/aave/aave-utilities/blob/master/packages/contract-helpers/src/v3-pool-contract-bundle/pool-bundle.test.ts#L109

jest.setTimeout(60_000);
describe('aaveActionUtil', () => {
    // 0x4A9b1ECD1297493B4EfF34652710BD1cE52c6526
    const privateKey = process.env.PRIVATE_KEY! as Address;
    const CDP_WALLET_CONFIG = {
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        cdpWalletData: process.env.CDP_WALLET_DATA || '{}'
    };

    const ALLOWANCE_DEFAULT = BigInt(1000 * 1e6)

    const account = privateKeyToAccount(
        privateKey
    );


    let alchemyConfig = {
        apiKey: process.env.ALCHEMY_API_KEY
    };


    const supplyAndWithdraw = async (
        evmWalletProvider: EvmWalletProvider,
        provider: ethers.providers.Provider,
        params: SupplyParams,
        expectedSupplyTo: Address
    ) => {
        const { user, amount, asset, market } = params;

        console.log('USER', user, 'supply to pool', market.POOL, amount);

        const { txData } = await createSupplyTxData(provider, {
            market,
            amount,
            user,
            asset,
        });

        expect(txData.from).toEqual(user);
        expect(txData.to).toEqual(expectedSupplyTo);



        const txhash = await evmWalletProvider.sendTransaction({
            ...txData,
        })
        console.log('results', txhash)

        const { withDrawTxDatas } = await createWithdrawTxData(provider, {
            market,
            amount,
            user,
            asset
        });


        expect(withDrawTxDatas?.[0].to).toEqual(market.POOL);

        // use utilties with ethers-v5 provider to encode, while send txn with viem
        const withdrawTxHash = await evmWalletProvider.sendTransaction({
            to: withDrawTxDatas?.[0].to as Address,
            data: withDrawTxDatas?.[0].data as Hex,

        })

        await evmWalletProvider.waitForTransactionReceipt(withdrawTxHash);

        console.log('withdraw txn hash', withdrawTxHash)
    }

    describe('L1 sepolia with native wallet', () => {

        const provider = createProvider('sepolia');
        const market = AAVEV3_SEPOLIA_MARKET_CONFIG;

        const client = createWalletClient({
            account,
            chain: sepolia,
            transport: http(),
        });

        const evmWalletProvider = new ViemWalletProvider(client);
        const user = evmWalletProvider.getAddress() as Address;
        // sepolia not supported by CDP

        beforeAll(async () => {
            await approve(evmWalletProvider, markets.AaveV3Sepolia.ASSETS.USDC.UNDERLYING, market.POOL, ALLOWANCE_DEFAULT);
        })


        test('supply and withdraw USDC work with native wallet', async () => {

            const asset = markets.AaveV3Sepolia.ASSETS.USDC

            const amount = 1n;

            await supplyAndWithdraw(evmWalletProvider, provider, { user, amount, market, asset }, market.POOL);
        });

        test('supply and withdraw ETH work with native wallet', async () => {

            const asset = {
                decimals: 18,
                UNDERLYING: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address,
                A_TOKEN: markets.AaveV3Sepolia.ASSETS.WETH.A_TOKEN as Address
            }

            await supplyAndWithdraw(evmWalletProvider, provider, { user, amount: 1n, market, asset }, market.WETH_GATEWAY);


        });



    })



    describe.skip.each([
        ['viem'],
        ['cdp']
    ])('L2 base sepolia with evm provider %s', (walletType) => {
        let evmWalletProvider;

        const provider = createProvider('base-sepolia');
        const client = createWalletClient({
            account,
            chain: baseSepolia,
            transport: http(),
        });


        beforeEach(async () => {
            if (walletType === 'cdp') {
                evmWalletProvider = await CdpWalletProvider.configureWithWallet({
                    ...CDP_WALLET_CONFIG,
                    networkId: "base-sepolia", // other options: "base-mainnet", "ethereum-mainnet", "arbitrum-mainnet", "polygon-mainnet".
                });
            }


            evmWalletProvider = new ViemWalletProvider(client);

        })


        const market = AAVEV3_BASE_SEPOLIA_MARKET_CONFIG;
        const asset = markets.AaveV3BaseSepolia.ASSETS.USDC;


        test('supply and withdraw work with USDC', async () => {

            const user = evmWalletProvider.getAddress() as Address;
            const amount = 1n;

            await supplyAndWithdraw(evmWalletProvider, provider, { user, amount, market, asset }, market.POOL);


        })

    });


});