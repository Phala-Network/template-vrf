import { ethers } from "hardhat";
import "dotenv/config";
import dedent from "dedent"

async function main() {
  const VrfOracle = await ethers.getContractFactory("VRFOracle");
  const VrfConsumer = await ethers.getContractFactory("VRFConsumer");

  const [deployer] = await ethers.getSigners();

  console.log('Deploying...');
  const attestor = process.env['MUMBAI_PHALA_ORACLE_ATTESTOR'] || deployer.address;  // When deploy for real e2e test, change it to the real attestor wallet.
  const vrfOracle = await VrfOracle.deploy(attestor);
  await vrfOracle.deployed();
  const vrfConsumer = await VrfConsumer.deploy(vrfOracle.address);
  await vrfConsumer.deployed();

  const finalMessage = dedent`
    🎉 Your Consumer Contract has been deployed successfully 🎉

    VRFOracle address ${vrfOracle.address}
    VRFConsumer address ${vrfConsumer.address}

    Check it out here:
    - https://mumbai.polygonscan.com/address/${vrfOracle.address} 
    - https://mumbai.polygonscan.com/address/${vrfConsumer.address}

    You can continue deploying the default Phat Contract with the following command & set the consumerAddress to the VRFOracle contract address:

    npx @phala/fn upload -b --mode dev --consumerAddress=${vrfOracle.address}
    
    You also need to set up the consumer contract address in your .env file:
    
    MUMBAI_CONSUMER_CONTRACT_ADDRESS=${vrfConsumer.address}
    MUMBAI_VRF_ORACLE_CONTRACT_ADDRESS=${vrfOracle.address}
  `
  console.log(`\n${finalMessage}\n`);
  console.log('Done');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
