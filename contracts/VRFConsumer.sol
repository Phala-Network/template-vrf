// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "./VRFOracle.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

abstract contract VRFConsumer is VRFConsumerBaseV2 {
    event RandomReceived(uint256 requestId, uint256[] random);

    address _oracle;
    uint256[] _lastRandom;

    constructor(address oracle) VRFConsumerBaseV2(oracle) {
        _oracle = oracle;
        _lastRandom = new uint256[](0);
    }

    function request(string calldata reqData, uint32 numWords) external {
        VRFOracleInterface oracle = VRFOracleInterface(_oracle);
        oracle.requestRandomWords(reqData, numWords);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        emit RandomReceived(requestId, randomWords);
        _lastRandom = randomWords;
    }

    function getLastRandom() public view returns (uint256[] memory) {
        return _lastRandom;
    }
}
