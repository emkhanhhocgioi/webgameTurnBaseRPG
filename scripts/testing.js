const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test getIdMetadata Function", function () {
    let contract;
    const contractAddress = "0x1f98aC46Ef7C34Dce0Fc832A72c53AB897e3B28b"; // 🛠 Địa chỉ đúng, sửa lại nếu khác
    const invalidId = ethers.constants.MaxUint256; // -1 tương đương

    before(async function () {
        // Kết nối tới contract đã deploy sẵn
        const abi = [
            "function getIdMetadata(uint256 id) public view returns (string memory)"
        ];
        contract = await ethers.getContractAt(abi, contractAddress);
    });

    it("Should revert or return metadata for invalid ID (-1)", async function () {
        try {
            const metadataUri = await contract.getIdMetadata(invalidId);
            console.log("✅ Metadata URI for ID = -1 (MaxUint256):", metadataUri);
        } catch (error) {
            console.error("❌ Error calling getIdMetadata:", error.message);
            expect.fail("Calling getIdMetadata with -1 (MaxUint256) failed");
        }
    });
});
