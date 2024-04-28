var BDAToken = artifacts.require("BDAToken");
const AdminMint = artifacts.require("AdminMint");
var Web3 = require('web3');

// NOTE: Not needed
const truffleConfig = require('../truffle-config.js');
const url = "http://" + truffleConfig.networks.development.host + ":" + truffleConfig.networks.development.port;
var web3 = new Web3(url);

// var conf = require("../config/bda_token_config.js");

const accounts_local = [{
    address: "0x256Bc864654D5edE164D3F60aa8428415E55A616",
    privateKey: "0x062ad970e34803f09cbedb16c2f54932fd12417d23a64623cac1e43eb6a29125"
}, {
    address: "0x2E22AA0E248C994863594d1a1842db87fd298821",
    privateKey: "0x080684f113c7374488f5a45b7dfce00cb22a14769c0dda69424f55f99c36fcf9"
}]

contract(' TEST SUITE 1 [ Solidity ]', function (accounts) {
    it("test1", async () => {
        let token = await BDAToken.deployed();
        let adminMint = await token.getAdminMint();
        console.log("address: ", token.address);
        console.log("keys: ", Object.keys(token));
        console.log("adminMint: ", adminMint);
        console.log("accounts: ", accounts);
    });

    it.only("account[0] is admin in all admin roles", async () => {
        let token = await BDAToken.deployed();
        // const admins = await token.getAdminMint({ from: accounts[1] });

        const adminMintAddress = await token.adminMint(); // Get the address of the adminMint contract
        const adminMintInstance = await AdminMint.at(adminMintAddress); // Access the AdminMint instance using the address
        const admins = await adminMintInstance.getAdmins(); // Call the getAdmins method

        console.log("admins: ", admins);
        console.log("account[0]: ", accounts[0]);
    });
});
