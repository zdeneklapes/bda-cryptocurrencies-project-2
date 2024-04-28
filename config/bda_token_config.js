// You can adjust these two parameters of tests to your n-of-m multisig wallet contract
const MultiSigWalletConf = Object.freeze({
    NUMBER_OF_OWNERS: 2, // m
    REQUIRED_SIGS: 2, // n
    NAME: "ERC20Token",
    SYMBOL: "BDA_TOKEN",
    CAP: 1000000,
    TMAX: 100,
    TRANSFER_LIMIT: 1000,
})

module.exports = MultiSigWalletConf;
