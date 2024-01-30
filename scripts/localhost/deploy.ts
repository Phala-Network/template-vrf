import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const VrfOracle = await ethers.getContractFactory("VRFOracle");
  const VrfConsumer = await ethers.getContractFactory("VRFConsumer");

  const [deployer] = await ethers.getSigners();

  console.log("Deploying...");
  const oracle = await VrfOracle.deploy(deployer.address);
  await oracle.deployed();
  console.log("Deployed", {
    oracle: oracle.address,
  });
  const consumer = await VrfConsumer.deploy(oracle.address);
  await consumer.deployed();
  console.log("Deployed", {
    consumer: consumer.address,
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
