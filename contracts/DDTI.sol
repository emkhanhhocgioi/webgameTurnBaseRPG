// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DDTi is ERC1155, Ownable {
      
    uint256[]  supplies  = [100];
    uint256[]  minted  = [100];
    uint256[] rates = [0.05 ether];
    // Constructor với URI cho metadata, gọi constructor của ERC1155 và Ownable
    constructor() ERC1155("https://localhost:3000/api/item/{id}.json") Ownable(msg.sender)  {
     

    }

    function mint(uint256 id, uint256 amount) public payable {
        require(id > 0 && id <= supplies.length, "Token doesn't exist");
        uint256 index = id - 1;

        require(minted[index] + amount <= supplies[index], "Not enough supply");
        require(msg.value >= amount * rates[index], "Not enough ether sent");

        _mint(msg.sender, id, amount, "");
        minted[index] += amount;
    }

    function getBalance(address account, uint256 id) public view returns (uint256) {
        return balanceOf(account, id);
    }

    // Hàm mint token mới
    function mint(address to, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        _mint(to, id, amount, data);
    }



    function getIdMetadata(uint256 id) public pure returns (string memory) {
    // Lấy baseURI từ contract gốc
    string memory baseURI = "https://localhost:3000/api/item/";
    return string(abi.encodePacked(baseURI, Strings.toString(id), ".json"));
    }





    
    // Hàm lấy tất cả token của một địa chỉ
    function getUserItemTokens(address account) public view onlyOwner returns (uint256[] memory, uint256[] memory) {
        uint256 totalTokens = 0;
        uint256[] memory ids = new uint256[](totalTokens);
        uint256[] memory balances = new uint256[](totalTokens);

        for (uint256 i = 0; i < totalTokens; i++) {
            uint256 balance = balanceOf(account, i);
            if (balance > 0) {
                ids[i] = i;
                balances[i] = balance;
            }
        }

        return (ids, balances);
    }

    
}
