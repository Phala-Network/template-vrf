import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const VrfOracle = await ethers.getContractFactory("VRFOracle");
  const VrfConsumer = await ethers.getContractFactory("VRFConsumer");

  const [deployer] = await ethers.getSigners();

  const consumerSC = process.env["LOCALHOST_CONSUMER_CONTRACT_ADDRESS"] || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  if (!consumerSC) {
    console.error("Error: Please provide LOCALHOST_CONSUMER_CONTRACT_ADDRESS");
    process.exit(1);
  }
  const consumer = VrfConsumer.attach(consumerSC);
  const oracle = VrfOracle.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3")
  console.log("Pushing a request...");
  await consumer.connect(deployer).request("test", 1);
  oracle.on("ResponseReceived", async (reqId: number, pair: string, value: string) => {
    console.info("Received event [ResponseReceived]:", {
      reqId,
      pair,
      value,
    });
    process.exit();
  });
  oracle.on("ErrorReceived", async (reqId: number, pair: string, value: string) => {
    console.info("Received event [ErrorReceived]:", {
      reqId,
      pair,
      value,
    });
    process.exit();
  });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
