// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FiToken is ERC20 {
    constructor() ERC20("Fi Token", "Fi") {
        _mint(msg.sender, 4244000 * 10**decimals());
    }
}