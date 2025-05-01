// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BidiTOKEN is ERC20, ERC20Burnable, Ownable {
    uint256 public blockReward;
    address public Isowner ;
    uint256 public price  = 0.005 ether ;
    uint256 public withdrawn_price = 0.001 ether;
    uint256 public productCounter = 0;
    uint256 public ExchangeCounter = 0;
    
    constructor(uint256 reward) Ownable(msg.sender) ERC20("BidiTOKEN", "BIDI") {
        _mint(msg.sender, 100000000 * 10 ** decimals());
        Isowner = msg.sender;
        blockReward = reward * 10 ** decimals();
    }
    struct listItem {
        uint256 id;
        address payable seller;
        string name;
        string weaponid;
        string description;
        uint256 price; // đơn vị là token (BIDI)
        bool isSold;
    }

    struct listExchange {
            uint256 id;
            address account;
            address from;
            uint256 amount;
            bool isApproved;
        }
        mapping(uint256 => listExchange) public listExchanges;
        mapping(uint256 => listItem) public listItems;
        event ProductListed(uint256 id, address seller, string name, uint256 itemprice);
        event ProductPurchased(uint256 id, address buyer);


        event WithdrawListed(uint256 id, address account, address from , uint256 amount);
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
    function burn(uint256 amount) public override onlyOwner {
        _burn(_msgSender(), amount);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    
    function dropTokenToUser(address user, uint256 amount) public onlyOwner {
    _transfer(owner(), user, amount * 10 ** decimals());
    }


    function WithDrawFromWallet(address from, address to, uint256 amount) public {
        require(balanceOf(from) >= amount, "Insufficient balance");
        require(msg.sender == from, "You can only withdraw from your own wallet");
        _transfer(from, to, amount); // Transfer from one user to another user
    }


    function buyMoreTokken(uint256 amount,address account) public payable {
        uint256 totalCost = amount * price;
        require(msg.value >= totalCost, "Not enough Ether");

        // Chuyển token từ chủ sở hữu hợp đồng (owner) sang người mua
        _transfer(owner(), account, amount * 10 ** decimals());

        // Chuyển Ether vào ví của chủ sở hữu hợp đồng
        payable(owner()).transfer(msg.value);

        // Refund nếu gửi dư
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
    }
    

    function CreateExchangeOffer(uint256 amount,address from) public {
    require(amount > 0, "Amount must be greater than 0");
    require(balanceOf(from) >= amount,"Not enough BDC token");
    
    ExchangeCounter++;
    

    listExchanges[ExchangeCounter] = listExchange({
        id: ExchangeCounter,
        account: msg.sender,
        from:from,
        amount: amount,
        isApproved: false
    });

    emit WithdrawListed(ExchangeCounter, msg.sender,from, amount);
    }


    function ApprovedOffer(uint256 OfferId, address account) public payable {
    listExchange storage exchange = listExchanges[OfferId];

    // Check if the offer exists
    require(exchange.id > 0 && exchange.id <= ExchangeCounter, "Invalid Offer ID");

    // Check if already approved
    require(!exchange.isApproved, "Offer already approved");

    // Check token balance of owner
    uint256 ownerTokenBalance = balanceOf(owner());
    require(ownerTokenBalance >= exchange.amount, "Insufficient token balance");

    // Check ETH balance of the contract
    uint256 totalcost = exchange.amount * withdrawn_price;
    uint256 contractEthBalance = msg.value;
    require(contractEthBalance >= totalcost, "Contract has insufficient Ether ");

    // Emit debug before transfers
    emit DebugLog(OfferId, exchange.amount, withdrawn_price, totalcost, account, msg.sender);

    // Transfer tokens from buyer to owner
    _transfer(account, owner(), exchange.amount);

    // Safe transfer of ETH to buyer
    (bool success, ) = payable(account).call{value: totalcost}("");
    require(success, "ETH transfer to buyer failed");

    // Mark offer as approved
    exchange.isApproved = true;

    emit OfferApproved(OfferId, account, exchange.amount, totalcost);
    }


     


   
  
    function listProduct(address seller , string memory name, string memory description,string memory weaponid ,uint256 price) public {
        require(price > 0, "Price must be > 0");

        productCounter++;

        listItems[productCounter] = listItem({
            id: productCounter,
            seller: payable(seller) ,
            name: name,
            weaponid: weaponid,
            description: description,
            price: price,
            isSold: false
        });

        emit ProductListed(productCounter, msg.sender, name, price);
    }

    function BuyProduct(uint256 productid,address from) public {
    listItem storage listitem = listItems[productid];
    require(listitem.id > 0 && listitem.id <= productCounter, "Invalid product ID");
    require(!listitem.isSold, "Already sold");
    require(balanceOf(from) >= listitem.price, "Insufficient token balance");

    // Trừ token từ người mua và chuyển cho người bán
    _transfer(from, listitem.seller, listitem.price);

    listitem.isSold = true;

    emit ProductPurchased(productid,from);
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





 

}

