// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BidiTOKEN is ERC20, ERC20Burnable, Ownable {
    uint256 public blockReward;
    address public Isowner;
    uint256 public price = 0.00005 ether;
    uint256 public withdrawn_price = 0.00005 ether;
    uint256 public productCounter = 0;
    uint256 public ExchangeCounter = 0;
    
    // Define decimals for token
    uint8 private constant _decimals = 18;
    
    constructor(uint256 reward) Ownable(msg.sender) ERC20("BidiTOKEN", "BIDI") {
        _mint(msg.sender, 100000000 * 10**_decimals); // Adding decimals to initial supply
        Isowner = msg.sender;
        blockReward = reward;

        luckyChests[1] = luckychest(1, 60);  // 0-59:   60% chance (most common)
        luckyChests[2] = luckychest(2, 80);  // 60-79:  20% chance  
        luckyChests[3] = luckychest(3, 90);  // 80-89:  10% chance
        luckyChests[4] = luckychest(4, 97);  // 90-96:  7% chance
        luckyChests[5] = luckychest(5, 100); // 97-99:  3% chance (rarest)

        

    }
    
    struct listItem {
        uint256 id;
        address payable seller;
        string name;
        string weaponid;
        string description;
        uint256 price; // price in tokens (BIDI) with decimals
        bool isSold;
    }

    struct listExchange {
        uint256 id;
        address account;
        address from;
        uint256 amount;
        bool isApproved;
    }


    struct luckychest {
        uint256 id;
        uint256 rollchance;

    }
    
    mapping(uint256 => luckychest) public luckyChests;
    event ChestRolled(address indexed user, uint256 chestId);
    

    mapping(uint256 => listExchange) public listExchanges;
    mapping(uint256 => listItem) public listItems;
    
    event ProductListed(uint256 id, address seller, string name, uint256 itemprice);
    event ProductPurchased(uint256 id, address buyer);

    event WithdrawListed(uint256 id, address account, address from, uint256 amount);
    event ExchangeApproved(uint256 id, address account);
    event DebugLog(
        uint256 offerId,
        uint256 amount,
        uint256 withdrawnPrice,
        uint256 totalCost,
        address account,
        address caller
    );
    event OfferApproved(
        uint256 offerId,
        address account,
        uint256 tokenAmount,
        uint256 etherTransferred
    );

     function getRandomRoll() public view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(block.timestamp, msg.sender, block.difficulty)
            )
        ) % 100;
    }

   function rollLuckyChest(address user, uint256 amount) public payable returns (uint256) {
    require(user != address(0), "Invalid user address");
    require(msg.value >= amount, "Insufficient ETH sent");

    uint256 randomRoll = getRandomRoll(); // 0–99
    uint256 selectedId = 0;

    // Find lucky chest with suitable rollchance using cumulative ranges
    for (uint256 i = 1; i <= 5; i++) {
        if (randomRoll < luckyChests[i].rollchance) {
            selectedId = luckyChests[i].id;
            break;
        }
    }

    // Transfer ETH to owner
    payable(owner()).transfer(amount);

    if (selectedId > 0) {
        emit ChestRolled(user, selectedId);
        return selectedId;
    } else {
        revert("Roll failed, try again!");
    }
}



    

    // Override decimals() function to return our custom decimals value
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }

    function burn(uint256 amount) public override onlyOwner {
        _burn(_msgSender(), amount);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * 10**_decimals); // Convert to token units with decimals
    }

    function dropTokenToUser(address user, uint256 amount) public onlyOwner {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than zero");
        
        uint256 amountWithDecimals = amount * 10**_decimals;
        require(balanceOf(owner()) >= amountWithDecimals, "Insufficient balance to drop");
      
        _transfer(owner(), user, amountWithDecimals);
    }
    
    // Owner deposit to contract
    function depositToContract(uint256 amount) external payable {
        require(msg.sender == owner(), "Only owner can deposit");
        bool ownerbalance = getOwnerEthBalance(amount);

        if (ownerbalance) {
            payable(address(this)).transfer(msg.value);
        } else {
            revert("Owner does not have enough Ether balance to match the deposit.");
        }
    }

    function withdrawEthToOwner() public onlyOwner {
     require(msg.sender == owner(), "Only owner can run this");
  
    uint256 contractBalance = address(this).balance;
    require(contractBalance > 0, "No Ether available in the contract");

    payable(owner()).transfer(contractBalance);
    }

    
    // Withdraw BDC token
    function WithDrawFromWallet(address from, address to, uint256 amount) public {
        uint256 amountWithDecimals = amount * 10**_decimals;
        require(balanceOf(from) >= amountWithDecimals, "Insufficient balance");
        _transfer(from, to, amountWithDecimals);
    }

    function buyMoreTokken(uint256 amount, address account) public payable {
        uint256 totalCost = amount * price;
        require(msg.value >= totalCost, "Not enough Ether");

        uint256 amountWithDecimals = amount * 10**_decimals;
        _transfer(owner(), account, amountWithDecimals);

        // Transfer Ether to contract owner
        payable(owner()).transfer(msg.value);

        // Refund excess Ether
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
    }

    function CreateExchangeOffer(uint256 amount, address from) public {
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 amountWithDecimals = amount * 10**_decimals;
        require(balanceOf(from) >= amountWithDecimals, "Not enough BDC token");
        
        ExchangeCounter++;
        
        listExchanges[ExchangeCounter] = listExchange({
            id: ExchangeCounter,
            account: msg.sender,
            from: from,
            amount: amount, // Store the non-decimal amount for calculation
            isApproved: false
        });

        emit WithdrawListed(ExchangeCounter, msg.sender, from, amount);
    }

    function ApprovedOffer(uint256 OfferId) public payable {
        listExchange storage exchange = listExchanges[OfferId];
        
        require(exchange.id > 0 && exchange.id <= ExchangeCounter, "Invalid Offer ID");
        require(!exchange.isApproved, "Offer already approved");

        uint256 totalcost = exchange.amount * withdrawn_price;
        uint256 amountWithDecimals = exchange.amount * 10**_decimals;
        
        emit DebugLog(OfferId, exchange.amount, withdrawn_price, totalcost, exchange.account, msg.sender);
        
        // Transfer tokens with decimal adjustment
        _transfer(exchange.from, owner(), amountWithDecimals);

        payable(exchange.account).transfer(totalcost);
        
        exchange.isApproved = true;
        
        emit OfferApproved(OfferId, exchange.account, exchange.amount, totalcost);
    }

    function DeclinedOffer(uint256 OfferId) public {
        listExchange storage exchange = listExchanges[OfferId];

        require(exchange.id > 0 && exchange.id <= ExchangeCounter, "Invalid Offer ID");
        require(!exchange.isApproved, "Offer already approved");
        require(exchange.account == msg.sender || msg.sender == owner(), "Only the offer creator or owner can decline the offer");

        delete listExchanges[OfferId];

        emit DebugLog(OfferId, exchange.amount, withdrawn_price, 0, exchange.account, msg.sender);
    }

    function getOwnerEthBalance(uint256 amount) public view returns (bool) {
        uint256 totalcost = amount * withdrawn_price;
        uint256 ownerBalance = owner().balance;
        if(ownerBalance >= totalcost) {
            return true;
        } else {
            return false;
        }
    }

    function getContractEthBalance(uint256 amount) public view returns (uint256 totalCost, uint256 contractBalance) {
        totalCost = amount * withdrawn_price;
        contractBalance = address(this).balance;
        return (totalCost, contractBalance);
    }

    function listProduct(address seller, string memory name, string memory description, string memory weaponid, uint256 price) public {
        require(price > 0, "Price must be > 0");

        productCounter++;

        listItems[productCounter] = listItem({
            id: productCounter,
            seller: payable(seller),
            name: name,
            weaponid: weaponid,
            description: description,
            price: price * 10**_decimals, // Convert to token units with decimals
            isSold: false
        });

        emit ProductListed(productCounter, msg.sender, name, price);
    }

    function BuyProduct(uint256 productid, address from) public {
        listItem storage listitem = listItems[productid];
        require(listitem.id > 0 && listitem.id <= productCounter, "Invalid product ID");
        require(!listitem.isSold, "Already sold");
        require(balanceOf(from) >= listitem.price, "Insufficient token balance");

        // Transfer tokens with decimal adjustment
        _transfer(from, listitem.seller, listitem.price);

        listitem.isSold = true;

        emit ProductPurchased(productid, from);
    }
    
    function getListedProducts() public view returns (listItem[] memory) {
        uint256 totalProducts = productCounter;
        uint256 currentIndex = 0;

        listItem[] memory products = new listItem[](totalProducts);

        for (uint256 i = 1; i <= totalProducts; i++) {
            listItem storage item = listItems[i];
            products[currentIndex] = item;
            currentIndex++;
        }

        return products;
    }
    
    function getExchangeOffers() public view returns (listExchange[] memory) {
        uint256 totalExchanges = ExchangeCounter;
        uint256 currentIndex = 0;

        listExchange[] memory exchanges = new listExchange[](totalExchanges);

        for (uint256 i = 1; i <= totalExchanges; i++) {
            listExchange storage exchange = listExchanges[i];
            exchanges[currentIndex] = exchange;
            currentIndex++;
        }

        return exchanges;
    }
    
    

    
    

    receive() external payable {}

    fallback() external payable {}
}