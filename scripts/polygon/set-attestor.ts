import { ethers } from "hardhat";
import "dotenv/config";
async function main() {
  const VrfOracleContract = await ethers.getContractFactory("VRFOracle");

  const [deployer] = await ethers.getSigners();

  const vrfOracle = process.env['POLYGON_VRF_ORACLE_CONTRACT_ADDRESS'] || "";
  const oracle = VrfOracleContract.attach(vrfOracle);
  await Promise.all([
    oracle.deployed(),
  ])

  console.log('Setting attestor...');
  const attestor = process.env['POLYGON_PHALA_ORACLE_ATTESTOR'] || deployer.address;
  await oracle.connect(deployer).setAttestor(attestor); // change this to the identity of your ActionOffchainRollup found in your Phala Oracle deployment labeled 'Oracle Endpoint'
  console.log(`🚨NOTE🚨\nMake sure to set the Consumer Contract Address in your Phat Dashboard (https://dashboard.phala.network)\n- Go to 'Configure Client' section where a text box reads 'Add Consumer Smart Contract'\n- Set value to ${vrfOracle}`)
  console.log('Done');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
