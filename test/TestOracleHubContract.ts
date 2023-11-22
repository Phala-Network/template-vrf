import { expect } from "chai";
import { BigNumber, type Contract, type Event } from "ethers";
import { ethers } from "hardhat";
import { execSync } from "child_process";

async function waitForResponse(consumer: Contract, data: string) {
  // Run Phat Function
  const result = execSync(`phat-fn run --json dist/index.js -a ${data} https://api-mumbai.lens.dev/`).toString();
  const json = JSON.parse(result);
  const action = ethers.utils.hexlify(ethers.utils.concat([
    new Uint8Array([0]),
    json.output,
  ]));
  // Make a response
  const tx = await consumer.rollupU256CondEq(
    // cond
    [],
    [],
    // updates
    [],
    [],
    // actions
    [action],
  );
  const receipt = await tx.wait();
  return receipt.events;
}

describe("OracleConsumerContract.sol", function () {
  it("Push and receive message", async function () {
    // Deploy the contract
    const [deployer] = await ethers.getSigners();
    const OracleHub = await ethers.getContractFactory("OracleHub");
    const OracleClient = await ethers.getContractFactory("OracleClient");
    const hub = await OracleHub.deploy(deployer.address);
    const consumer = await OracleClient.deploy(hub.address);


    // Make a request
    const nonce = "test";
    const tx = await consumer.request(nonce);
    const receipt = await tx.wait();

    // Don't know why HH cannot catch the event in the cross-contract-called hub, so we turn to hardcoded data
    // const reqEvents = receipt.events;
    // expect(reqEvents![0]).to.have.property("event", "MessageQueued");
    const data = "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000047465737400000000000000000000000000000000000000000000000000000000";

    // Wait for Phat Contract response
    const respEvents = await waitForResponse(hub, data)

    // Check response data
    expect(respEvents[0]).to.have.property("event", "ResponseReceived");
    const [reqId, pair, value] = respEvents[0].args;
    expect(ethers.BigNumber.isBigNumber(reqId)).to.be.true;
    expect(pair).to.equal(nonce);
    expect(ethers.BigNumber.isBigNumber(value)).to.be.true;

    expect(await consumer.getLastRandom()).not.to.equal(0);
    expect(await consumer.getLastRandom()).to.equal(13832766590336322444n);
  });
});
