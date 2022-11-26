const { ethers } = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("FiToken");
    const token = await Token.deploy();

    const OwnToken = await ethers.getContractFactory("OwnToken");
    const ownToken = await OwnToken.deploy(token.address);

    console.log("Token Address", token.address);
    console.log("Contract Address", ownToken.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
