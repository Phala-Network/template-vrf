import { ethers } from "hardhat";
import "dotenv/config";
import dedent from "dedent"

async function main() {
  const OracleHub = await ethers.getContractFactory("OracleHub");
  const OracleClient = await ethers.getContractFactory("OracleClient");

  const [deployer] = await ethers.getSigners();

  console.log('Deploying...');
  const attestor = process.env['MUMBAI_PHALA_ORACLE_ATTESTOR'] || deployer.address;  // When deploy for real e2e test, change it to the real attestor wallet.
  const hub = await OracleHub.deploy(attestor);
  await hub.deployed();
  const consumer = await OracleClient.deploy(hub.address);
  await consumer.deployed();
  const finalMessage = dedent`
    Hub to ${hub.address}
    Consumer to ${consumer.address}
  `
  console.log(`\n${finalMessage}\n`);

  console.log('Sending a request...');
  await consumer.connect(deployer).request("nonce");
  console.log('Done');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
