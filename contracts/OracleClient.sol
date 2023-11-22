// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "./OracleHub.sol";

contract OracleClient is CallerInterface {
    event RandomReceived(uint256 random);

    address _oracleHub;
    uint256 _lastRandom;

    constructor(address oracleHub) {
        _oracleHub = oracleHub;
        _lastRandom = 0;
    }

    function request(string calldata reqData) external {
        HubInterface hub = HubInterface(_oracleHub);
        hub.request(reqData);
    }

    function onMessageReceived(uint256 random) external {
        _lastRandom = random;
        emit RandomReceived(random);
    }

    function getLastRandom() public view returns (uint256) {
        return _lastRandom;
    }
}
