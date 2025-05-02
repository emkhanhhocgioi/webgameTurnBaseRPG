const { Contract } = require('ethers');
const hre = require('hardhat');
const { ethers } = hre;
const {itemTransferFromTo} = require('./CharacterController')
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

let contract = null; // 👈 Biến dùng chung toàn cục trong module
let itemcontract = null
// Hàm khởi tạo contract (gọi 1 lần từ server)
const initContract = async () => {
    const contractArtifact = await hre.artifacts.readArtifact("BidiTOKEN");
    const ItemArtifact = await hre.artifacts.readArtifact("DDTi");
    const signer = await provider.getSigner(); 
    contract = new ethers.Contract(
        "0x25a2CB25D863801E11f802e164744C89b3542041", // Địa chỉ contract
        contractArtifact.abi,
        signer
    );
   

    console.log("✅ Contract đã khởi tạo thành công");
};

// Hàm gọi contract — Dùng ở bất kỳ đâu
const getTokenBalanceOfUser = async (req, res) => {
    const address = req.body.address;

    if (!address) {
        return res.status(400).json({ error: "Địa chỉ không hợp lệ hoặc thiếu!" });
    }

    try {
        console.log("contractaddress", contract);
   
        const balance = await contract.balanceOf(address);
        console.log("balance"+ balance)
        const formatted = ethers.formatUnits(balance, 0); // Use 0 decimals to avoid scaling down
        console.log(formatted)
        return res.json({ address, balance: formatted });
    } catch (err) {
        console.error("Lỗi khi lấy balance:", err);
        return res.status(500).json({ error: "Lỗi khi lấy số dư" });
    }
};




const ListItem = async (req, res) => {
    const { item } = req.body;

    if (!item || !item.name || !item.description || !item.price) {
        return res.status(400).json({ error: "Thông tin item không hợp lệ hoặc thiếu!" });
    }

    const {seller, name,weaponid, description, price } = item;

    try {
        if (!contract) {
            console.log("⚠ Contract chưa được khởi tạo");
            return res.status(500).json({ error: "Contract chưa được khởi tạo" });
        }

        const tx = await contract.listProduct(seller,name,weaponid, description, price.toString());
        await tx.wait();
        

        console.log(`✅ Đã niêm yết sản phẩm: ${name} với giá ${price}`);
        res.status(200).json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error("❌ Lỗi khi niêm yết sản phẩm:", error);
        res.status(500).json({
            error: "Lỗi khi niêm yết sản phẩm",
            details: error.message || error.toString(),
            code: error.code || "UNKNOWN_ERROR"
        });
    }
};

const BuyProduct = async (req, res) => {
    const { data } = req.body;
    console.log(data)
    const productid = data.productid
    const buyer = data.buyer
    const seller = data.seller;
    const itemId = data.itemId;
    
    if (!productid || !buyer) {
        return res.status(400).json({ error: "Thông tin không hợp lệ hoặc thiếu!" });
    }

    try {
        if (!contract) {
            console.log("⚠ Contract chưa được khởi tạo");
            return res.status(500).json({ error: "Contract chưa được khởi tạo" });
        }
        
        const tx = await contract.BuyProduct(productid, buyer);
        await tx.wait();
        if(tx){
            itemTransferFromTo(seller,buyer,itemId)
        }
      
     
        console.log(`✅ Sản phẩm với ID ${productid} đã được mua bởi ${buyer}`);
        console.log(tx)
        res.status(200).json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error("❌ Lỗi khi mua sản phẩm:", error);
        res.status(500).json({
            error: "Lỗi khi mua sản phẩm",
            details: error.message || error.toString(),
            code: error.code || "UNKNOWN_ERROR"
        });
    }
};







const droptokentoplayer = async (address, dlevel) => {
    console.log("address", address);
    console.log("dlevel", dlevel);

    if (!address) {
        console.log("⚠ Không có địa chỉ người nhận");
        return { success: false, message: "Thiếu địa chỉ người nhận" };
    }
    if (!dlevel) {
        console.log("⚠ Không có dlevel");
        return { success: false, message: "Thiếu dlevel" };
    }
    if (!contract) {
        console.log("⚠ Contract chưa được khởi tạo");
        throw new Error("Contract chưa được khởi tạo");
    }

   
    // Tạo xác suất dựa trên level
    const getDropChance = (level) => {
        if (level >= 6) return 100;
        const baseChance = 40; // Cơ bản 40%
        const bonusPerLevel = 10; // Mỗi level +10%
        return Math.min(baseChance + bonusPerLevel * level, 100);
    };

    const chance = getDropChance(dlevel);
    const random = Math.random() * 100;

    console.log(`🎯 Drop chance: ${chance}% | Random rolled: ${random.toFixed(2)}`);

    if (random > chance) {
        console.log("❌ Không rớt token lần này");
        return { success: false, message: "Không nhận được token lần này" };
    }

    // Nếu random thành công -> gửi token
    const amount = getRewardbasedOnLevel(dlevel);
    try {
        const tx = await contract.dropTokenToUser(address, ethers.parseUnits(amount.toString(), 18));
        await tx.wait();
        console.log(`✅ Đã gửi ${amount} token đến địa chỉ ${address}`);
        return { success: true, txHash: tx.hash, amount };
    } catch (err) {
        console.error("❌ Lỗi khi gửi token:", err);
        return { success: false, message: "Gửi token thất bại", error: err.toString() };
    }
};

const DropitemToUser = async (req, res) => {
    const { address } = req.body;

    try {
        // Kiểm tra nếu địa chỉ không hợp lệ
        if (!address ) {
            return res.status(400).json({ error: "Địa chỉ không hợp lệ" });
        }

        // Truyền các tham số đúng khi gọi hàm addItemToAddress
        const id = 1; 
        const amount = ethers.parseUnits("1", 18); 
        const data = "0x"; 

        // Gọi hàm addItemToAddress với các tham số hợp lệ
        const tx = await itemcontract.addItemToAddress(address, id, amount, data);
        await tx.wait();

        console.log(`✅ Đã thêm item với ID ${id} và số lượng ${amount} đến địa chỉ ${address}`);
        res.status(200).json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error("Lỗi khi thêm item:", error);
        res.status(500).json({ error: "Lỗi khi thêm item", details: error.toString() });
    }
};
const testgetmetadata = async (req, res) => {
    const id = "0" ;

    try {
        // Kiểm tra nếu id không hợp lệ
        if (!id) {
            return res.status(400).json({ error: "ID không hợp lệ hoặc thiếu!" });
        }

        // Gọi hàm getIdMetadata để lấy metadata của item
        const metadata = await itemcontract.getIdMetadata(id);

        console.log(`✅ Metadata của ID ${id}:`, metadata);

        // Trả về metadata dưới dạng JSON
        res.status(200).json({ success: true, metadata });
    } catch (error) {
        console.error("❌ Lỗi khi lấy metadata:", error);

        // Trả về lỗi nếu có vấn đề xảy ra
        res.status(500).json({
            error: "Lỗi khi lấy metadata",
            details: error.message || error.toString(),
            code: error.code || "UNKNOWN_ERROR"
        });
    }
};


const getalluseritem = async (req, res) => {
    try {
        if (!contract) {
            console.log('⚠ Contract chưa được khởi tạo');
            return res.status(500).json({ error: "Contract chưa được khởi tạo" });
        }

        const txdata = await contract.getListedProducts();

        if (txdata) {
            // Convert BigInt to string
            const converted = txdata.map(item =>
                item.map(val => typeof val === 'bigint' ? val.toString() : val)
            );

            console.log(converted);
            res.status(200).json({ success: true, data: converted });
        } else {
            res.status(400).json({ success: false, message: "Không có sản phẩm nào được niêm yết" });
        }
    } catch (error) {
        console.error("❌ Lỗi khi lấy item:", error);
        res.status(500).json({
            error: "Lỗi khi lấy item",
            details: error.message || error.toString(),
            code: error.code || "UNKNOWN_ERROR"
        });
    }
};

const getExchanges = async (req,res) =>{
    try {
        if (!contract) {
            console.log('⚠ Contract chưa được khởi tạo');
            return res.status(500).json({ error: "Contract chưa được khởi tạo" });
        }

        const txdata = await contract.getExchangeOffers();

        if (txdata) {
            // Convert BigInt to string
            const converted = txdata.map(item =>
                item.map(val => typeof val === 'bigint' ? val.toString() : val)
            );

            console.log(converted);
            res.status(200).json({ success: true, data: converted });
        } else {
            res.status(400).json({ success: false, message: "Không có sản phẩm nào được niêm yết" });
        }
    } catch (error) {
        console.error("❌ Lỗi khi lấy contract:", error);
        res.status(500).json({
            error: "Lỗi khi lấy contract",
            details: error.message || error.toString(),
            code: error.code || "UNKNOWN_ERROR"
        });
    }
}
 
const ApproveExchange = async (req, res) => {
    const { id } = req.body;
    console.log(id)
    try {
        if (!contract) {
            console.log('⚠ Contract chưa được khởi tạo');
            return res.status(500).json({ error: "Contract chưa được khởi tạo" });
        }

        const tx = await contract.ApprovedOffer(id.toString());
        await tx.wait();

     
        res.status(200).json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error("❌ Lỗi khi phê duyệt giao dịch:", error);
        console.log(error)
    }
};







const ExchangeTokken = async (req , res) => {
 const user = "0xdd51C61689dbfbAAE324430367961B27E419da90"
 const amount = 1000;

try {
    if (!contract) {
        console.log("⚠ Contract chưa được khởi tạo");
        return res.status(500).json({ error: "Contract chưa được khởi tạo" });
    }

    const tx = await contract.dropTokenToUser(user, amount);
    await tx.wait();

    console.log(`✅ Đã gửi ${amount} token đến địa chỉ ${user}`);
    res.status(200).json({ success: true, txHash: tx.hash });
} catch (error) {
    console.error("❌ Lỗi khi gửi token:", error);
    res.status(500).json({
        error: "Lỗi khi gửi token",
        details: error.message || error.toString(),
        code: error.code || "UNKNOWN_ERROR"
    });
}
}


const getOwnerEthers = async (_, res) => {
    try {
        if (!contract) {
            console.log("⚠ Contract chưa được khởi tạo");
            return res.status(500).json({ error: "Contract chưa được khởi tạo" });
        }
        let amount = 10;
        const tx = await contract.getContractEthBalance(amount);
        const formattedTx = tx.toString(); // Serialize BigInt to string
        
        res.status(200).json({ success: true, data: formattedTx });
    } catch (error) {
        console.error("❌ Lỗi khi lấy số dư ETH của chủ sở hữu:", error);
        res.status(500).json({
            error: "Lỗi khi lấy số dư ETH của chủ sở hữu",
            details: error.message || error.toString(),
            code: error.code || "UNKNOWN_ERROR"
        });
    }
};




// Hàm hỗ trợ random phần thưởng
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRewardbasedOnLevel(dlevel) {
    const baseRewards = {
        1: getRandomInt(1, 20) / 10,
        2: getRandomInt(4, 40) / 10,
        3: getRandomInt(10, 50) / 10,
        4: getRandomInt(5, 20),
        5: getRandomInt(10, 30)
    };
    return baseRewards[dlevel] || 0;
}

module.exports = {
    initContract,
    getTokenBalanceOfUser,
    droptokentoplayer,
    ExchangeTokken,
    DropitemToUser,getalluseritem,
    testgetmetadata,ListItem,
    BuyProduct,
    getExchanges,
    ApproveExchange,
    getOwnerEthers

};
