// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./Token.sol";

contract OwnToken {
    uint256 public totalOwned;
    uint256 public totalUser;
    mapping(address => uint256) public balance;
    FiToken token;

    constructor(address tokenAddress) {
        token = FiToken(tokenAddress);
    }

    function tokenOwned(uint256 _amount) external {
        require(_amount > 0, "Token amount must be bigger then 0");

        totalOwned += _amount;
        if (!(balance[msg.sender] > 0)) totalUser++;
        balance[msg.sender] += _amount;

        bool ok = token.transferFrom(msg.sender, address(this), _amount);
        require(ok, "Transfer failed");
    }

    function withdrawTokens() external {
        require(balance[msg.sender] > 0, "Not enough token");
        uint256 _amount = balance[msg.sender];
        totalUser--;
        totalOwned -= _amount;

        token.transfer(msg.sender, _amount);
    }
}