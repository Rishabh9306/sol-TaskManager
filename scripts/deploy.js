// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

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
  
  // We get the contract to deploy
  const TaskManager = await hre.ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.deploy();

  // Wait for the contract to be deployed
  await taskManager.deployed();

  console.log("TaskManager deployed to:", taskManager.address);
  
  // Wait for a few block confirmations to ensure the contract is properly deployed
  console.log("Waiting for block confirmations...");
  await taskManager.deployTransaction.wait(5);
  
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
    }
  }
  
  // Log deployment information for easy reference
  console.log("\n----- Deployment Summary -----");
  console.log(`Network: ${network}`);
  console.log(`Contract address: ${taskManager.address}`);
  console.log(`Transaction hash: ${taskManager.deployTransaction.hash}`);
  console.log(`Gas used: ${taskManager.deployTransaction.gasLimit.toString()}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log("------------------------------\n");
  
  console.log("Deployment completed successfully!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  }); 