import { expect } from "chai";
import { BigNumber, type Contract, type Event } from "ethers";
import { ethers } from "hardhat";
import { execSync } from "child_process";

async function waitForResponse(consumer: Contract, data: string) {
  // Run Phat Function
  const result = execSync(`phat-fn run --json dist/index.js -a ${data} ''`).toString();
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

describe("VRFConsumer.sol", function () {
  it("Push and receive message", async function () {
    // Deploy the contract
    const [deployer] = await ethers.getSigners();
    const OracleHub = await ethers.getContractFactory("VRFOracle");
    const OracleClient = await ethers.getContractFactory("VRFConsumer");
    const hub = await OracleHub.deploy(deployer.address);
    const consumer = await OracleClient.deploy(hub.address);
    // Make a request
    const nonce = "test";
    const tx = await consumer.request(nonce, 1);
    // Don't know why HH cannot catch the event in the cross-contract-called hub, so we turn to hardcoded data
    // const reqEvents = receipt.events;
    // expect(reqEvents![0]).to.have.property("event", "MessageQueued");
    const data = "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000047465737400000000000000000000000000000000000000000000000000000000";
    const receipt = await tx.wait();
    // Wait for Phat Contract response
    const respEvents = await waitForResponse(hub, data)
    // Check response data
    expect(respEvents[0]).to.have.property("event", "ResponseReceived");
    const [reqId, pair, value] = respEvents[0].args;
    expect(ethers.BigNumber.isBigNumber(reqId)).to.be.true;
    expect(pair).to.equal(nonce);
    expect(value.length).to.gt(0);
    const lastRandom = await consumer.getLastRandom();
    expect(lastRandom.length).not.to.equal(0);
    expect(lastRandom[0]).to.equal(782455294003821874n);
  });
});
