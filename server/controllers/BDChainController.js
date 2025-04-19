const hre = require('hardhat');
const { ethers } = hre;

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

let contract = null; // 👈 Biến dùng chung toàn cục trong module

// Hàm khởi tạo contract (gọi 1 lần từ server)
const initContract = async () => {
    const contractArtifact = await hre.artifacts.readArtifact("BidiTOKEN");
    const signer = await provider.getSigner(); 
    contract = new ethers.Contract(
        "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", // Địa chỉ contract
        contractArtifact.abi,
        signer
    );
    console.log("✅ Contract đã khởi tạo thành công");
};

// Hàm gọi contract — Dùng ở bất kỳ đâu
const getTokenBalanceOfUser = async (req, res) => {
    const address = req.query.address;

    if (!address ) {
        return res.status(400).json({ error: "Địa chỉ không hợp lệ hoặc thiếu!" });
    }

    try {
        const balance = await contract.balanceOf(address);
        const formatted = ethers.formatUnits(balance, 18);
        return res.json({ address, balance: formatted });
    } catch (err) {
        console.error("Lỗi khi lấy balance:", err);
        return res.status(500).json({ error: "Lỗi khi lấy số dư" });
    }
};



const droptokentoplayer = async (req,res) => {
    const {address,dlevel} = req.body; // Lấy address và dlevel từ request body
    console.log("address",address);
    console.log("dlevel",dlevel);
    if (!address) {
        console.log("⚠ Không có địa chỉ người nhận trong request body");
    }
    if (!dlevel) {
        console.log("⚠ Không có dlevel trong request body");
    }

    if (!contract) throw new Error("⚠ Contract chưa được khởi tạo");

    const amount = getRewardbasedOnLevel(dlevel);
    try {
        const tx = await contract.dropTokenToUser(address, ethers.parseUnits(amount.toString(), 18));
        await tx.wait();
        res.status(200).json({ success: true, txHash: tx.hash });
        console.log(`✅ Đã gửi ${amount} token đến địa chỉ ${address}`);      
        
    } catch (err) {
        throw err;
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
