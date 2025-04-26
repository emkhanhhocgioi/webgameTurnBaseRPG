// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BidiTOKEN is ERC20, ERC20Burnable, Ownable {
    uint256 public blockReward;

    constructor(uint256 reward) Ownable(msg.sender) ERC20("BidiTOKEN", "BIDI") {
        _mint(msg.sender, 100000000 * 10 ** decimals());
        blockReward = reward * 10 ** decimals();
    }
  
    function burn(uint256 amount) public override onlyOwner {
        _burn(_msgSender(), amount);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    
    function dropTokenToUser(address user, uint256 amount) public onlyOwner {
    _mint(user, amount);
    }
    function sendTokenToUser(address user, uint256 amount) public onlyOwner {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _transfer(msg.sender, user, amount);
    }


 

}

