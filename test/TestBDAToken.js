var BDAToken = artifacts.require("BDAToken");
const fs = require('fs');
const Admin = artifacts.require("Admin");
const AdminMint = artifacts.require("AdminMint");
const AdminRestriction = artifacts.require("AdminRestriction");
var Web3 = require('web3');
const truffleAssertions = require('truffle-assertions');

// NOTE: Not needed
const truffleConfig = require('../truffle-config.js');
const conf = require("../config/bda_token_config");
const url = "http://" + truffleConfig.networks.development.host + ":" + truffleConfig.networks.development.port;
var web3 = new Web3(url);

async function expectError(promise, message) {
    try {
        await promise;
        assert(false, message);
    } catch (error) {
        assert(error, "Exception not thrown");
    }
}

contract('TEST SUITE [ Solidity ]', function (accounts) {
    let token;

    beforeEach(async () => {
        token = await BDAToken.new(
            conf.NAME,
            conf.SYMBOL,
            conf.TMAX,
            conf.CAP,
            conf.TRANSFER_LIMIT,
        );
    });

    it("Show admins, owner, and account[0]", async () => {
        const admins = await token.getAdminMint({from: accounts[1]});
        console.log("admins: ", admins);
        console.log("account[0]: ", accounts[0]);
        console.log("token.address: ", token.address);
    });

    it("Add adminMint via consensus", async () => {
        await token.signAddAdminMint(accounts[1], {from: accounts[0]});
        await token.signAddAdminMint(accounts[2], {from: accounts[0]});
        await token.signAddAdminMint(accounts[2], {from: accounts[1]});
        const adminMint = await token.getAdminMint({from: accounts[1]});
        console.log("adminMint: ", adminMint);
        const isAdded = adminMint.includes(accounts[1]);
        assert(isAdded, "AdminMint not added");
    });

    it("Remove adminMint via consensus", async () => {
        await token.signAddAdminMint(accounts[1], {from: accounts[0]});
        await token.signAddAdminMint(accounts[2], {from: accounts[0]});
        await token.signAddAdminMint(accounts[2], {from: accounts[1]});
        await token.signRemoveAdminMint(accounts[1], {from: accounts[0]});
        await token.signRemoveAdminMint(accounts[1], {from: accounts[2]});
        let admins1 = await token.getAdminMint({from: accounts[1]});
        const isRemoved = !admins1.includes(accounts[1]);
        assert(isRemoved, "AdminMint not removed");
    });

    it("Get user roles", async () => {
        const result = await token.getUserRoles({from: accounts[0]});
        assert(result.isAdminMint === true, "isAdminMint not false");
        assert(result.isAdminRestriction === true, "isAdminRestriction not false");
    });

});

contract('TEST SUITE [ Mint ]', function (accounts) {
    let token;

    beforeEach(async () => {
        token = await BDAToken.new(
            conf.NAME,
            conf.SYMBOL,
            conf.TMAX,
            conf.CAP,
            conf.TRANSFER_LIMIT,
        );
    });

    it("Mint tokens", async () => {
        await token.mint([accounts[0]], [100], {from: accounts[0]});
        const balance1 = await token.balanceOf(accounts[0]);
        assert(balance1.toNumber() === 100, "Tokens not minted");
    });

    it("Mint tokens more than TMAX (error)", async () => {
        const balance = await token.balanceOf(accounts[0]);
        console.log("balance: ", balance.toNumber());
        // await token.mint([accounts[0]], [101], {from: accounts[0]});
        await truffleAssertions.reverts(
            token.mint([accounts[0]], [101], {from: accounts[0]}),
            "Exceeds maximum mint amount"
        );
        const balance1 = await token.balanceOf(accounts[0]);
        assert(balance1.toNumber() === 0, "Tokens minted, even TMAX exceeded");
    });

    it("Mint more tokens than TMAX (consensus)", async () => {
        await token.signAddAdminMint(accounts[1], {from: accounts[0]});
        await token.signAddAdminMint(accounts[2], {from: accounts[0]});
        await token.signAddAdminMint(accounts[2], {from: accounts[1]});

        await token.signMint([accounts[0]], [150], {from: accounts[0]});
        const balance0 = await token.balanceOf(accounts[0]);
        console.log("balance0: ", balance0.toNumber());
        assert(balance0.toNumber() === 0, "Tokens minted, even not consensus");

        await token.signMint([accounts[0]], [150], {from: accounts[1]});
        const balance1 = await token.balanceOf(accounts[0]);
        assert(balance1.toNumber() === 150, "Tokens not minted");
    });
});

contract('TEST SUITE [ Transfer ]', function (accounts) {
    let token;

    beforeEach(async () => {
        token = await BDAToken.new(
            conf.NAME,
            conf.SYMBOL,
            conf.TMAX,
            conf.CAP,
            conf.TRANSFER_LIMIT,
        );
    });

    it("Disallow the users to burn tokens by sending them to 0x0 address.", async () => {
        await token.mint([accounts[0]], [100], {from: accounts[0]});
        const balance = await token.balanceOf(accounts[0]);
        assert(balance.toNumber() === 100, "Tokens not minted");

        const zeroAddress = "0x" + "0".repeat(40);
        expectError(token.transfer(zeroAddress, 100, {from: accounts[0]}),
            "Tokens transferred to 0x0 address");
    });

    it("Transfer tokens", async () => {
        await token.signMint([accounts[0]], [100], {from: accounts[0]});

        const balance = await token.balanceOf(accounts[0]);
        assert(balance.toNumber() === 100, "Tokens not minted");

        await token.transfer(accounts[1], 100, {from: accounts[0]});

        const balance1 = await token.balanceOf(accounts[0]);
        assert(balance1.toNumber() === 0, "Tokens not transferred");

        const balance2 = await token.balanceOf(accounts[1]);
        assert(balance2.toNumber() === 100, "Tokens not transferred");
    });

    it("Transfer more than TRANSFER_LIMIT tokens", async () => {
        let token = await BDAToken.deployed();
        await token.signMint([accounts[0]], [200], {from: accounts[0]});
        const balance = await token.balanceOf(accounts[0]);
        assert(balance.toNumber() === 200, "Tokens not minted");
        await token.transfer(accounts[1], 99, {from: accounts[0]});
        expectError(token.transfer(accounts[1], 2, {from: accounts[0]}),
            "Tokens transferred, even TRANSFER_LIMIT exceeded");
    });

    it("Update TRANSFER_LIMIT", async () => {
        await token.signAddAdminRestriction(accounts[1], {from: accounts[0]});
        await token.signAddAdminRestriction(accounts[2], {from: accounts[0]});
        await token.signAddAdminRestriction(accounts[2], {from: accounts[1]});

        await token.signUpdateTransferLimit(accounts[2], 200, {from: accounts[0]});
        await token.signUpdateTransferLimit(accounts[2], 200, {from: accounts[1]});

        // const userLimit = await token.getTransferLimit(accounts[2]);
        // console.log("userLimit: ", userLimit.toNumber());

        await token.signMint([accounts[2]], [200], {from: accounts[0]});
        const balance1 = await token.balanceOf(accounts[2]);
        assert(balance1.toNumber() === 200, "Tokens not minted");

        await token.transfer(accounts[1], 200, {from: accounts[2]});
        const balance2 = await token.balanceOf(accounts[2]);
        const balance3 = await token.balanceOf(accounts[1]);
        // console.log("balance2: ", balance2.toNumber());
        // console.log("balance3: ", balance3.toNumber());
        assert(balance2.toNumber() === 0, "Tokens not transferred from account[2]");
        assert(balance3.toNumber() === 200, "Tokens not transferred to account[1]");
    });
});


