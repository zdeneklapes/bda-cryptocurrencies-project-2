var W3 = require('web3');
var BDAToken = artifacts.require("BDAToken");
MAX_NUMBER_OF_OWNERS = 10

// load parameters of multisig wallet from config file
// var conf = require("../config/wallet_config.js");
var conf = require("../config/bda_token_config.js");

module.exports = function (deployer, network, accounts) {
    var owners = []

    if (conf.NUMBER_OF_OWNERS > MAX_NUMBER_OF_OWNERS) {
        throw "The number of owners is bigger than maximum"
    }

    if (network == "mainnet") {
        throw "Halt. Sanity check. Not ready for deployment to mainnet.";
    } else if (network == "sepolia" || network == "sepolia-fork") {
        owners.push("0x07F065753F2137580619486D14f5c82FF9f84736")
        owners.push("0xB098a974f390a5D66aC405B5058E05F41133a12A")
    } else { // development & test networks
        for (let i = 0; i < conf.NUMBER_OF_OWNERS; i++) {
            owners.push(accounts[i])
        }
    }

    const tokenName = conf.NAME;
    console.log('Deploying BDAToken to network', network);
    console.log("\t --owners: ", owners, ";\n\t --required signatures", conf.REQUIRED_SIGS);

    result = deployer.deploy(
        BDAToken,
        conf.NAME,
        conf.SYMBOL,
        conf.TMAX,
        conf.CAP,
        conf.TRANSFER_LIMIT,
    ).then(() => {
        // console.log('Deployed BDAToken with address', BDAToken.address);
    });
};
