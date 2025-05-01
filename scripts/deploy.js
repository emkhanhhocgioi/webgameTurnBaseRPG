const hre = require("hardhat");

async function main() {
  const BidiToken = await hre.ethers.getContractFactory("BidiTOKEN");
  const DDTitems =  await hre.ethers.getContractFactory("DDTi")
  const rewardPerBlock = 50; // bạn có thể đổi giá trị reward ở đây
  const token = await BidiToken.deploy(rewardPerBlock);


  await token.waitForDeployment();

  const contractAddress = await token.getAddress();

  console.log(`✅ Contract deployed at: ${contractAddress}`);


  // 👉 In ra ABI của contract
  const artifact = await hre.artifacts.readArtifact("BidiTOKEN");
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
