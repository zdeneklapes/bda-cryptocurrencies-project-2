// You can adjust these two parameters of tests to your n-of-m multisig wallet contract
const MultiSigWalletConf = Object.freeze({
    NUMBER_OF_OWNERS: 2, // m
    REQUIRED_SIGS: 2, // n
    NAME: "BDAToken",
    SYMBOL: "BT",
    CAP: 10_000_000,
    TMAX: 100,
    TRANSFER_LIMIT: 100,
})

module.exports = MultiSigWalletConf;
