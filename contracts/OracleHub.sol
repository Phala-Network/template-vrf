// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PhatRollupAnchor.sol";

interface HubInterface {
    function request(string calldata reqData) external;
}

interface CallerInterface {
    function onMessageReceived(uint256 random) external;
}

contract OracleHub is HubInterface, PhatRollupAnchor, Ownable {
    event ResponseReceived(uint reqId, string reqData, uint256 value);
    event ErrorReceived(uint reqId, string reqData, uint256 errno);

    uint constant TYPE_RESPONSE = 0;
    uint constant TYPE_ERROR = 2;

    struct Request {
        address caller;
        string data;
    }

    mapping(uint => Request) requests;
    uint nextRequest = 1;

    constructor(address phatAttestor) {
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
    }

    function setAttestor(address phatAttestor) public {
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
    }

    function request(string calldata reqData) external {
        // assemble the request
        uint id = nextRequest;
        if (isContract(msg.sender)) {
            requests[id] = Request(msg.sender, reqData);
        } else {
            requests[id] = Request(address(0), reqData);
        }
        _pushMessage(abi.encode(id, reqData));
        nextRequest += 1;
    }

    function _onMessageReceived(bytes calldata action) internal override {
        // Optional to check length of action
        // require(action.length == 32 * 3, "cannot parse action");
        (uint respType, uint id, uint256 data) = abi.decode(
            action,
            (uint, uint, uint256)
        );
        if (respType == TYPE_RESPONSE) {
            emit ResponseReceived(id, requests[id].data, data);
            if (requests[id].caller != address(0)) {
                CallerInterface caller = CallerInterface(requests[id].caller);
                caller.onMessageReceived(data);
            }
            delete requests[id];
        } else if (respType == TYPE_ERROR) {
            emit ErrorReceived(id, requests[id].data, data);
            delete requests[id];
        }
    }

    function isContract(address account) internal view returns (bool) {
        // This method relies in extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
}
