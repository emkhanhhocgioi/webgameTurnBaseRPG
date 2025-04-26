const hre = require("hardhat");

async function main() {
    const [owner] = await hre.ethers.getSigners(); // Lấy tài khoản deployer
    const tokenAddress = "0x73678f56420df54547f9C07b91c0E2B577CcbE46";  // Địa chỉ contract token
    const recipient = "0xdd51C61689dbfbAAE324430367961B27E419da90";  // Địa chỉ ví MetaMask

    const MyToken = await hre.ethers.getContractAt("BidiTOKEN", tokenAddress);
    

    const amount = hre.ethers.parseUnits("0.00001", 18); 

    console.log(`🔄 Sending ${hre.ethers.formatUnits(amount, 18)} MTK to ${recipient}...`);

    const tx = await MyToken.transfer(recipient, amount);
    await tx.wait(); 
    
    console.log(`✅ Sent ${hre.ethers.formatUnits(amount, 18)} MTK successfully!`);
}

main().catch((error) => {
    console.error("❌ Error sending token:", error);
    process.exitCode = 1;
});
