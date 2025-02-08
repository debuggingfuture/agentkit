import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
  morphoActionProvider,
  EvmWalletProvider,
} from "@coinbase/agentkit";
import { aaveActionProvider, findAaveMarketAssets } from "../../agentkit/src/action-providers/aave/aaveActionProvider";
// import { AAVEV3_SEPOLIA, AAVEV3_BASE_SEPOLIA, AAVEV3_BASE_SEPOLIA } from "../../agentkit/src/action-providers/aave/markets";
import { approve } from "../../agentkit/src/utils";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as markets from '@bgd-labs/aave-address-book';
// TODO replace dotenv with external env config
import * as dotenv from "dotenv";

import { expand, fromEvent, interval, of, race, repeat, take } from 'rxjs';
import { createAddressbookPrompt, createPortfolioPrompt } from "./prompt-util";
import SwarmPortfolioService from "./swarm-portfolio.service";

dotenv.config();

/**
 * Validates that required environment variables are set
 *
 * @throws {Error} - If required environment variables are missing
 * @returns {void}
 */
function validateEnvironment(): void {
  const missingVars: string[] = [];

  // Check required variables
  const requiredVars = ["OPENAI_API_KEY", "CDP_API_KEY_NAME", "CDP_API_KEY_PRIVATE_KEY"];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Exit if any required variables are missing
  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach(varName => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }

  // Warn about optional NETWORK_ID
  if (!process.env.NETWORK_ID) {
    console.warn("Warning: NETWORK_ID not set, defaulting to base-sepolia testnet");
  }
}

// Add this right after imports and before any other code
validateEnvironment();


/**
 * Initialize the agent with CDP Agentkit
 *
 * @returns Agent executor and config
 */
async function initializeAgent() {
  try {
    // Initialize LLM
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
    });


    // we could use watchEvents to listen to aave contract events
    // or balances change
    // now we keep it simple to keep update portfolio

    // Configure CDP Wallet Provider
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      cdpWalletData: process.env.CDP_WALLET_DATA || '{}',
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    const aaveAction = aaveActionProvider({
      alchemyApiKey: process.env.ALCHEMY_API_KEY,
    });

    const walletProvider = await CdpWalletProvider.configureWithWallet(config);

    // @ts-ignore
    await aaveAction.approveAll(walletProvider);

    // Initialize AgentKit
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        wethActionProvider(),
        pythActionProvider(),
        walletActionProvider(),
        erc20ActionProvider(),
        // @ts-ignore outdated types
        aaveAction,
        // cdpApiActionProvider({
        //   apiKeyName: process.env.CDP_API_KEY_NAME,
        //   apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        // }),
        // morphoActionProvider(),
        // cdpWalletActionProvider({
        //   apiKeyName: process.env.CDP_API_KEY_NAME,
        //   apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        // }),
      ],
    });

    const tools = await getLangChainTools(agentkit);

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = { configurable: { thread_id: "CDP AgentKit Chatbot Example!" } };

    // Create React Agent using the LLM and CDP AgentKit tools
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
        empowered to interact onchain using your tools. Never use faucet and request_faucet_funds action. Before executing your first action, get the wallet details to see what network 
        you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
        asks you to do something you can't do with your currently available tools, you must say so, and 
        encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
        docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
        restating your tools' descriptions unless it is explicitly requested.
        `,
    });


    return { agent, config: agentConfig, walletProvider };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error; // Re-throw to be handled by caller
  }
}

/**
 * Run the agent autonomously with specified intervals
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 * @param interval - Time interval between actions in seconds
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runAutonomousMode(agent: any, config: any, walletProvider: EvmWalletProvider) {
  console.log("Starting autonomous mode...");


  // TODO load policy from ipfs 

  const swarmAddresses = [
    walletProvider.getAddress(),
    '0x4A9b1ECD1297493B4EfF34652710BD1cE52c6526'
  ] as `0x${string}`[];
  // eslint-disable-next-line no-constant-condition
  const swarmPortfolioService = new SwarmPortfolioService(
    swarmAddresses,
    [markets.AaveV3BaseSepolia.ASSETS.USDC.UNDERLYING]
    , 'base-sepolia');


  // Create an observable from an event (replace 'actionEvent' with the actual event name)
  const event$ = swarmPortfolioService.listenToTransactions();

  const interval$ = interval(10 * 1000);


  // Build a cycle that waits for either an event or the interval, then re-runs indefinitely.
  const cycle$ = of(null).pipe(
    expand(() => race(event$, interval$).pipe(take(1)))
  ).subscribe(async (value) => {


    console.log('agent cycle');
    try {
      const portfolio = await swarmPortfolioService.getPortfolio();

      console.log(portfolio);

      const thought =
        createPortfolioPrompt(config.networkId, portfolio) +
        "When you communicate token balance, append n to the amount if it is whole unit. i.e. 4n USDC" +


        "You can use the tools to gather data to make your decision" +
        "Aave refers to the v3 lending protocol" +
        "for erc20 token and actions like get_balance or supply, results is whole unit accounted for decimals. i.e. 4 means 0.000004USDC not 4USDC as USDC use 6 decimals" +
        "Supply is not a simple transfer. use aave action to supply USDC onto Aave protocol, in testnet such as sepolia or base-sepolia." +
        "Do not ask for confirmation for supply" +
        "Do not use typical address on mainnet which will be different" +
        "Do not deploy any ERC20, NFT" +
        createAddressbookPrompt(config.networkId) +
        "Choose an action or set of actions and execute it that highlights your abilities." +

        // TODO system prompt
        // load policy from nillion
        "Act accord to the policy below. Policy:" +
        "(Top takes precedence)" +
        "you should take advantage of higher yield. If yield is higher at your responsible market, supply more." +
        "You can only supply your own wallet balance, but not control wallet balance of others in the portfolio " +

        "Avoid supplying more than 90% of your total USDC balance" +
        "Avoid supplying more than 40% of total swarm portofolio value at all time" +

        "Avoid supplying more than 10n at a time"

      const stream = await agent.stream({ messages: [new HumanMessage(thought)] }, config);


      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
          console.log(chunk.tools);
        }
        console.log("-------------------");
      }

    } catch (err) {
      console.error(err);



    };


  });
}


/**
 * Start the chatbot agent
 */
async function main() {
  try {
    const { agent, config, walletProvider } = await initializeAgent();
    // always run autonomous mode
    await runAutonomousMode(agent, config, walletProvider);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  console.log("Starting Agent...");
  main().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
