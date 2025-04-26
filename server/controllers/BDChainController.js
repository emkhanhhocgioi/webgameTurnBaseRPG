const { Contract } = require('ethers');
const hre = require('hardhat');
const { ethers } = hre;

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

let contract = null; // 👈 Biến dùng chung toàn cục trong module

// Hàm khởi tạo contract (gọi 1 lần từ server)
const initContract = async () => {
    const contractArtifact = await hre.artifacts.readArtifact("BidiTOKEN");
    const signer = await provider.getSigner(); 
    contract = new ethers.Contract(
        "0x73678f56420df54547f9C07b91c0E2B577CcbE46", // Địa chỉ contract
        contractArtifact.abi,
        signer
    );
    console.log("✅ Contract đã khởi tạo thành công");
};

// Hàm gọi contract — Dùng ở bất kỳ đâu
const getTokenBalanceOfUser = async (req, res) => {
    const address = req.body.address;

    if (!address ) {
        return res.status(400).json({ error: "Địa chỉ không hợp lệ hoặc thiếu!" });
    }

    try {
      
        console.log("contractaddress", contract);
        const balance = await contract.balanceOf(address);
        const formatted = ethers.formatUnits(balance, 18);
        return res.json({ address, balance: formatted });
    } catch (err) {
        console.error("Lỗi khi lấy balance:", err);
        return res.status(500).json({ error: "Lỗi khi lấy số dư" });
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



const ExchangeTokken = async (req , res) => {
    const{amount,toAddress} = req.body; // Lấy address và amount từ request body

    console.log("amount",amount);
    console.log("toAddress",toAddress);
    
    try {
      const tx = await contract.sendTokenToUser(toAddress, ethers.parseUnits(amount.toString(), 18));
      await tx.wait();
      res.status(200).json({ success: true, txHash: tx.hash });
      console.log(`✅ Đã gửi ${amount} token đến địa chỉ ${toAddress}`);
    } catch (error) {
        
    }
}

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
    ExchangeTokken
};
