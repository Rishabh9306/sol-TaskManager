// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Network-specific configurations
const NETWORK_CONFIGS = {
  sepolia: {
    confirmations: 5,
    verifyApiKey: "ETHERSCAN_API_KEY",
    blockExplorer: "https://sepolia.etherscan.io/address/",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    gasPrice: 3000000000, // 3 gwei
  },
  mumbai: {
    confirmations: 5,
    verifyApiKey: "POLYGONSCAN_API_KEY",
    blockExplorer: "https://mumbai.polygonscan.com/address/",
    rpcUrl: "https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY",
    gasPrice: 2000000000, // 2 gwei
  },
};

// Save deployment information to a file
async function saveDeploymentInfo(deploymentInfo) {
  const deploymentsDir = path.join(__dirname, "../deployments");
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const network = hre.network.name;
  const filePath = path.join(deploymentsDir, `${network}.json`);
  
  // Save deployment info to file
  fs.writeFileSync(
    filePath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`Deployment information saved to ${filePath}`);
  
  // Also update the frontend .env file if it exists
  try {
    const frontendEnvPath = path.join(__dirname, "../frontend/.env.local");
    if (fs.existsSync(frontendEnvPath)) {
      let envContent = fs.readFileSync(frontendEnvPath, "utf8");
      
      // Update the contract address for the current network
      if (network === "sepolia") {
        envContent = envContent.replace(
          /NEXT_PUBLIC_TASK_MANAGER_CONTRACT_SEPOLIA=.*/,
          `NEXT_PUBLIC_TASK_MANAGER_CONTRACT_SEPOLIA=${deploymentInfo.contractAddress}`
        );
      } else if (network === "mumbai") {
        envContent = envContent.replace(
          /NEXT_PUBLIC_TASK_MANAGER_CONTRACT_MUMBAI=.*/,
          `NEXT_PUBLIC_TASK_MANAGER_CONTRACT_MUMBAI=${deploymentInfo.contractAddress}`
        );
      }
      
      fs.writeFileSync(frontendEnvPath, envContent);
      console.log(`Updated contract address in frontend .env.local file`);
    }
  } catch (error) {
    console.warn("Could not update frontend .env file:", error.message);
  }
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  await hre.run('compile');

  console.log("Deploying TaskManager contract...");
  
  // Get the network we're deploying to for logging purposes
  const network = hre.network.name;
  console.log(`Deploying to ${network} network...`);
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  // Check deployer balance
  const balance = await deployer.getBalance();
  console.log(`Account balance: ${hre.ethers.utils.formatEther(balance)} ETH`);
  
  // Check if balance is sufficient (at least 0.1 ETH/MATIC)
  const minimumBalance = hre.ethers.utils.parseEther("0.1");
  if (balance.lt(minimumBalance)) {
    console.error(`Insufficient balance. You need at least 0.1 ${network === "mumbai" ? "MATIC" : "ETH"}`);
    process.exit(1);
  }
  
  // Set gas price based on network if available
  const deployOptions = {};
  if (NETWORK_CONFIGS[network]?.gasPrice) {
    deployOptions.gasPrice = NETWORK_CONFIGS[network].gasPrice;
    console.log(`Using gas price: ${deployOptions.gasPrice / 1e9} gwei`);
  }
  
  // We get the contract to deploy
  const TaskManager = await hre.ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.deploy(deployOptions);

  // Wait for the contract to be deployed
  await taskManager.deployed();

  console.log("TaskManager deployed to:", taskManager.address);
  
  // Wait for block confirmations based on network
  const confirmations = NETWORK_CONFIGS[network]?.confirmations || 1;
  console.log(`Waiting for ${confirmations} block confirmations...`);
  await taskManager.deployTransaction.wait(confirmations);
  
  // Prepare deployment info
  const deploymentInfo = {
    network,
    contractAddress: taskManager.address,
    transactionHash: taskManager.deployTransaction.hash,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: taskManager.deployTransaction.blockNumber,
  };
  
  // Save deployment information
  await saveDeploymentInfo(deploymentInfo);
  
  // Verify the contract on Etherscan/Polygonscan if not on a local network
  if (network !== "hardhat" && network !== "localhost") {
    console.log("Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: taskManager.address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.error("Error verifying contract:", error.message);
      console.log("\nManual verification instructions:");
      console.log("1. Wait a few minutes for the block explorer to index your contract");
      console.log(`2. Go to ${NETWORK_CONFIGS[network]?.blockExplorer || "the block explorer"}${taskManager.address}`);
      console.log("3. Click on the 'Contract' tab");
      console.log("4. Click on 'Verify and Publish'");
      console.log("5. Select 'Solidity (Single file)' as compiler type");
      console.log("6. Select the compiler version used in your hardhat.config.js");
      console.log("7. Set optimization to 'Yes' if you enabled it in hardhat.config.js");
      console.log("8. Enter the contract code and verify");
      console.log("\nAlternatively, you can run the following command:");
      console.log(`npx hardhat verify --network ${network} ${taskManager.address}`);
    }
  }
  
  // Log deployment information for easy reference
  console.log("\n----- Deployment Summary -----");
  console.log(`Network: ${network}`);
  console.log(`Contract address: ${taskManager.address}`);
  console.log(`Transaction hash: ${taskManager.deployTransaction.hash}`);
  console.log(`Block number: ${taskManager.deployTransaction.blockNumber}`);
  console.log(`Gas used: ${taskManager.deployTransaction.gasLimit.toString()}`);
  console.log(`Deployer: ${deployer.address}`);
  if (NETWORK_CONFIGS[network]?.blockExplorer) {
    console.log(`Block explorer: ${NETWORK_CONFIGS[network].blockExplorer}${taskManager.address}`);
  }
  console.log("------------------------------\n");
  
  console.log("Deployment completed successfully!");
  
  // Frontend integration instructions
  console.log("\n----- Frontend Integration -----");
  console.log("To connect your frontend to this contract:");
  console.log(`1. Update your frontend/.env.local file with the contract address:`);
  if (network === "sepolia") {
    console.log(`   NEXT_PUBLIC_TASK_MANAGER_CONTRACT_SEPOLIA=${taskManager.address}`);
  } else if (network === "mumbai") {
    console.log(`   NEXT_PUBLIC_TASK_MANAGER_CONTRACT_MUMBAI=${taskManager.address}`);
  }
  console.log(`2. Set NEXT_PUBLIC_DEFAULT_NETWORK=${network} in your frontend/.env.local file`);
  console.log(`3. Deploy your frontend to Vercel or Netlify`);
  console.log("--------------------------------\n");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  }); 