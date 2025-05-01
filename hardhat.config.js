require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28", // Bạn có thể thay đổi phiên bản Solidity nếu cần
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545", // RPC URL của Ganache
      chainId: 1337, // Chain ID của Ganache
      accounts: [
        "0x709c64d1b90fa6152d3a4021c4ab42755ba14039f058deab4015675d7fa39d8f" // Thêm private key của ví từ Ganache vào đây
      ]
    }
  }
};
