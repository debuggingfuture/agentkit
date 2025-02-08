import SwarmPortfolioService from './swarm-portfolio.service';
import { Address, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { abi } from './erc20-constants';

jest.mock('viem', () => {
    const originalModule = jest.requireActual('viem');
    return {
        ...originalModule,
        createPublicClient: jest.fn(),
        http: originalModule.http,
    };
});

describe('SwarmPortfolioService', () => {
    const mockReadContract = jest.fn();

    beforeAll(() => {
        // Make createPublicClient return a client with a mocked readContract method.
        (createPublicClient as jest.Mock).mockReturnValue({
            readContract: mockReadContract,
        });
    });

    beforeEach(() => {
        mockReadContract.mockReset();
    });

    it('should get balances for provided addresses', async () => {
        // Arrange
        const testAddresses = ['0x123', '0x456'] as Address[];
        const contractAddress = '0xTokenAddress';
        const expectedBalances = ['1000', '2000'];

        // Mock implementation: return different balances based on address.
        mockReadContract.mockImplementation(async ({ args }: { args: any[] }) => {
            const address = args[0];
            if (address === testAddresses[0]) return expectedBalances[0];
            if (address === testAddresses[1]) return expectedBalances[1];
            return '0';
        });

        const swarmPortfolioService = new SwarmPortfolioService(testAddresses, [], 'sepolia');

        // Act
        const balances = await swarmPortfolioService.getBalances(testAddresses, contractAddress);

        // Assert
        expect(balances).toEqual(expectedBalances);
        expect(mockReadContract).toHaveBeenCalledTimes(testAddresses.length);
        expect(mockReadContract).toHaveBeenCalledWith(
            expect.objectContaining({
                address: contractAddress,
                abi,
                functionName: 'balanceOf',
                args: [testAddresses[0]],
            })
        );
    });
});
