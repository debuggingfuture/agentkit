import { providers } from 'ethers-v5'
import { createPublicClient, http, type Chain, type Client, type Transport } from 'viem'
import { baseSepolia, sepolia } from 'viem/chains'

export function clientToProvider(client: Client<Transport, Chain>) {
    const { chain, transport } = client
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    }
    if (transport.type === 'fallback')
        return new providers.FallbackProvider(
            (transport.transports as ReturnType<Transport>[]).map(
                ({ value }) => new providers.JsonRpcProvider(value?.url, network),
            ),
        )
    return new providers.JsonRpcProvider(transport.url, network)
}

export const createProvider = (networkId: string) => {

    const chain = networkId === 'sepolia' ? sepolia : baseSepolia;
    const transport = http();

    const publicClient = createPublicClient({
        chain,
        transport,
    });

    return clientToProvider(publicClient);

}

