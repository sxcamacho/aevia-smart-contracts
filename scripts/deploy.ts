import { ethers, run } from "hardhat";

async function main() {
  console.log("Deploying AeviaProtocol...");

  const AeviaProtocol = await ethers.getContractFactory("AeviaProtocol");
  const aeviaProtocol = await AeviaProtocol.deploy();

  await aeviaProtocol.waitForDeployment();

  const address = await aeviaProtocol.getAddress();
  console.log(`AeviaProtocol deployed to: ${address}`);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await aeviaProtocol.deploymentTransaction()?.wait(5);

  // Verify contract
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.log("Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 