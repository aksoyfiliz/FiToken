const { expect } = require('chai');
const { ethers } = require('hardhat');
const { isCallTrace } = require('hardhat/internal/hardhat-network/stack-traces/message-trace');
const provider = ethers.provider;

function ethToNum(val) {
    return Number(ethers.utils.formatEther(val))
}

describe("OwnToken Contract", function() {
    let owner, user1, user2;
    let Token, token;
    let OwnToken, ownToken;
    let balances;

    before(async function() {
        [owner, user1, user2] = await ethers.getSigners();

        Token = await ethers.getContractFactory("FiToken");
        token = await Token.connect(owner).deploy();

        OwnToken = await ethers.getContractFactory("OwnToken");
        ownToken = await OwnToken.connect(owner).deploy(token.address);

        token.connect(owner).transfer(user1.address, ethers.utils.parseUnits("100",18));
        token.connect(owner).transfer(user2.address, ethers.utils.parseEther("50"));

        token.connect(user1).approve(ownToken.address, ethers.constants.MaxInt256);
        token.connect(user2).approve(ownToken.address, ethers.constants.MaxInt256);
    });
    
    beforeEach(async function() {
        balances = [
            ethToNum(await token.balanceOf(owner.address)),
            ethToNum(await token.balanceOf(user1.address)),
            ethToNum(await token.balanceOf(user2.address)),
            ethToNum(await token.balanceOf(ownToken.address))
        ]
    });

    it("Deploys the contracts", async function() {
        expect(token.address).to.not.be.undefined;
        expect(ownToken.address).to.be.properAddress;
    });

    it("Send token", async function() {
        expect(balances[1]).to.be.equal(100);
        expect(balances[2]).to.be.equal(50);
        expect(balances[0]).to.be.greaterThan(balances[1]);

        console.log("balances", balances);
    });

    it("Approve", async function() {
        let allowances = [
            await token.allowance(user1.address, ownToken.address),
            await token.allowance(user2.address, ownToken.address)
        ]
        expect(allowances[0]).to.be.equal(ethers.constants.MaxInt256);
        expect(allowances[0]).to.be.equal(allowances[1]);

    });

    it("Reverts exceeding transfer", async function() {
        await expect(token.connect(user1).transfer(user2.address, ethers.utils.parseUnits("300", 18))).to.be.reverted;
    })

    it("Print timestamp", async function() {
        let block_number = await provider.getBlockNumber();
        let block = await provider.getBlock(block_number);
        console.log("timestamp", block.timestamp);
    });

    describe("Contract Functions", function() {
        let totalOwned = 0; 
        let totalUser = 0; 
        let balance = [0,0];
        it("user1 own 10 tokens", async function() {
            totalOwned += 10;
            balance[0] += 10;
            totalUser++;

            await ownToken.connect(user1).tokenOwned(ethers.utils.parseEther("10"));

            expect(balances[3] + 10).to.be.equal(ethToNum(await token.balanceOf(ownToken.address)));
            expect(balance[0]).to.be.equal(ethToNum(await ownToken.balance(user1.address)));
            console.log(totalOwned, totalUser, balance);
        });

        it("TotalOwned and TotalUser amount increase?", async function() {
            expect(ethToNum(await ownToken.totalOwned())).to.be.equal(totalOwned);
            expect(await ownToken.totalUser()).to.be.equal(totalUser);
        });

        it("user2 cannot withdraw tokens", async function() {
            await expect(ownToken.connect(user2).withdrawTokens()).to.be.reverted;
        });

        it("user1 withdraw token", async function() {
            totalOwned -= balance[0];
            balance[0] = 0;
            totalUser--;

            await ownToken.connect(user1).withdrawTokens();

            expect(balances[3] -10).to.be.equal(ethToNum(await token.balanceOf(ownToken.address)));

        });

        it("TotalOwned and TotalUser amount decrease", async function() {
            expect(ethToNum(await ownToken.totalOwned())).to.be.equal(totalOwned);
            expect(await ownToken.totalUser()).to.be.equal(totalUser);
        });

    });
});