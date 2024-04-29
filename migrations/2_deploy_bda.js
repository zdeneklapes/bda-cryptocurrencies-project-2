var W3 = require('web3');
var BDAToken = artifacts.require("BDAToken");
MAX_NUMBER_OF_OWNERS = 10

var conf = require("../config/bda_token_config.js");

module.exports = function (deployer, network, accounts) {

    result = deployer.deploy(
        BDAToken,
        conf.NAME,
        conf.SYMBOL,
        conf.TMAX,
        conf.CAP,
        conf.TRANSFER_LIMIT,
    ).then(() => {
        console.log(`==> Deployed BDAToken to ${network} network with configuration:`, conf);
        console.log("==> Available accounts: ", accounts);
    });
};
