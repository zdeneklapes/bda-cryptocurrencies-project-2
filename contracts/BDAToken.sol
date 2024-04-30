// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract Admin {
    // Variables
    EnumerableSet.AddressSet internal admins;
    mapping(bytes32 => EnumerableSet.AddressSet) internal addAdminSignatures;
    mapping(bytes32 => EnumerableSet.AddressSet) internal removeAdminSignatures;

    // Constructor
    constructor(address firstAdmin) {
        EnumerableSet.add(admins, firstAdmin);
    }

    // Events
    event SingAddAdmin(
        address indexed newAdmin,
        address indexed signer,
        uint256 adminCount,
        uint256 signatureCount,
        bool isApproved
    );
    event SingRemoveAdmin(
        address indexed removedAdmin,
        address indexed signer,
        uint256 adminCount,
        uint256 signatureCount,
        bool isApproved
    );

    // Functions
    function signAddAdmin(bytes32 adminHash, address newAdmin, address signer) public {
        require(isAdmin(signer), "Only admins can sign");
        EnumerableSet.add(addAdminSignatures[adminHash], signer);
        uint256 adminCount = EnumerableSet.length(admins);
        uint256 signatureCount = EnumerableSet.length(addAdminSignatures[adminHash]);
        bool isApproved = signatureCount > (adminCount / 2);
        emit SingAddAdmin(
            newAdmin,
            signer,
            adminCount,
            signatureCount,
            isApproved
        );
        if (isApproved) {
            delete addAdminSignatures[adminHash]; // clear the signatures
            EnumerableSet.add(admins, newAdmin);
        }
    }

    function signRemoveAdmin(bytes32 adminHash, address newAdmin, address signer) public {
        require(isAdmin(signer), "Only admins can remove");
        require(EnumerableSet.length(admins) > 1, "Cannot remove the last admin");
        EnumerableSet.add(removeAdminSignatures[adminHash], signer);
        uint256 adminCount = EnumerableSet.length(admins);
        uint256 signatureCount = EnumerableSet.length(removeAdminSignatures[adminHash]);
        bool isApproved = signatureCount > (adminCount / 2);
        emit SingRemoveAdmin(
            newAdmin,
            signer,
            adminCount,
            signatureCount,
            isApproved
        );
        if (isApproved) {
            delete removeAdminSignatures[adminHash]; // clear the signatures
            EnumerableSet.remove(admins, newAdmin);
        }
    }

    function isAdmin(address account) public view returns (bool) {
        return EnumerableSet.contains(admins, account);
    }

    function getAdmins() public view returns (address[] memory) {
        return EnumerableSet.values(admins);
    }
}

contract AdminMint is Admin {
    // Variables
    mapping(bytes32 => EnumerableSet.AddressSet) internal mintSignatures;
    mapping(address => uint) public minted;
    uint public TMAX;
    mapping(address => MintedAmount) public mintedAmounts;

    // Constructor
    constructor(address firstAdmin, uint _tmax) Admin(firstAdmin) {
        TMAX = _tmax;
    }

    struct MintedAmount {
        uint256 amount;
        uint256 lastUpdated;
    }

    function getMintLimit() public view returns (uint256) {
        return TMAX;
    }

    function getMintedAmount(address account) public view returns (uint256) {
        return mintedAmounts[account].amount;
    }

    // Functions
    function isConsensus(bytes32 mintHash, address signer) public returns (bool) {
        require(isAdmin(signer), "Only mint admins can sign");
        EnumerableSet.add(mintSignatures[mintHash], signer);
        bool isMintApproved = EnumerableSet.length(mintSignatures[mintHash]) > (EnumerableSet.length(admins) / 2);
        if (isMintApproved) {
            delete mintSignatures[mintHash]; // clear the signatures
            return true;
        } else {
            return false;
        }
    }

    function checkTMAX(uint256 mintAmount) public view returns (bool) {
        return mintAmount <= TMAX;
    }

    function newMint(address account, uint256 amount) public {
        MintedAmount storage data = mintedAmounts[account];

        // reset the amount if a new day has started
        if (block.timestamp / 86400 > data.lastUpdated / 86400) {
            data.amount = 0;
        }

        // check if the transfer amount not exceeds the limit
        require(data.amount + amount <= TMAX, "Mint amount exceeds the limit");

        data.amount += amount;
        data.lastUpdated = block.timestamp;
    }
}

contract AdminRestriction is Admin {
    // Variables
    uint public defaultTransferLimit;
    mapping(bytes32 => EnumerableSet.AddressSet) private transferLimitProposals;
    mapping(address => uint256) private userTransferLimits;
    mapping(address => TransferedAmount) private transferedAmounts;

    // Constructor
    constructor(address firstAdmin, uint256 _transferLimit) Admin(firstAdmin) {
        defaultTransferLimit = _transferLimit;
    }

    // Structs
    struct TransferedAmount {
        uint256 amount;
        uint256 lastUpdated;
    }

    event SignTransferLimit(
        bytes32 indexed transferHash,
        address indexed account,
        uint256 newLimit,
        address indexed signer,
        uint256 adminCount,
        uint256 signatureCount,
        bool isApproved
    );

    // Functions
    function getTransferAmounts(address account) public view returns (uint256) {
        return transferedAmounts[account].amount;
    }

    function getTransferLimit(address account) public view returns (uint256) {
        if (userTransferLimits[account] == 0) {
            return defaultTransferLimit;
        } else {
            return userTransferLimits[account];
        }
    }


    function signTransferLimit(bytes32 transferHash, address account, uint256 _newLimit, address signer) public {
        require(isAdmin(signer), "Only restriction admins can sign");
        EnumerableSet.add(transferLimitProposals[transferHash], signer);
        uint256 adminCount = EnumerableSet.length(admins);
        uint256 signatureCount = EnumerableSet.length(transferLimitProposals[transferHash]);
        bool isApproved = signatureCount > (adminCount / 2);
        emit SignTransferLimit(
            transferHash,
            account,
            _newLimit,
            signer,
            adminCount,
            signatureCount,
            isApproved
        );
        if (isApproved) {
            userTransferLimits[account] = _newLimit;
        }
    }

    function newTransfer(address account, uint256 amount) public {
        TransferedAmount storage data = transferedAmounts[account];

        // reset the amount if a new day has started
        if (block.timestamp / 86400 > data.lastUpdated / 86400) {
            data.amount = 0;
        }

        // check if the transfer amount not exceeds the limit
        uint256 userLimit = getTransferLimit(account);
        require(data.amount + amount <= userLimit, "Transfer amount exceeds the limit");

        data.amount += amount;
        data.lastUpdated = block.timestamp;
    }
}

contract BDAToken is ERC20Capped {
    // Variables
    AdminMint public adminMint;
    AdminRestriction public adminRestriction;
    uint256 transferLimit;

    // Constructor
    constructor(string memory name, string memory symbol, uint256 tmax, uint256 _cap, uint256 _transferLimit) ERC20(name, symbol) ERC20Capped(_cap) {
        adminMint = new AdminMint(msg.sender, tmax);
        adminRestriction = new AdminRestriction(msg.sender, _transferLimit);
    }

    // Modifiers
    modifier onlyMintAdmin {
        require(adminMint.isAdmin(msg.sender), "Caller is not a mint admin");
        _;
    }

    modifier onlyRestrictionAdmin {
        require(adminRestriction.isAdmin(msg.sender), "Caller is not a restriction admin");
        _;
    }

    // Events
    event Mint(address indexed to, uint256 amount);
    event SignAddingAdminMint(address indexed account, address indexed signer);
    event SignRemovingAdminMint(address indexed account, address indexed signer);
    event TransferBDAToken(address indexed from, address indexed to, uint256 amount, uint256 limit);

    // Functions
    function getAdminMint() public view returns (address[] memory) {
        return adminMint.getAdmins();
    }

    function getAdminRestriction() public view returns (address[] memory) {
        return adminRestriction.getAdmins();
    }

    function getTransferLimit(address account) public view returns (uint256) {
        return adminRestriction.getTransferLimit(account);
    }

    function mint(address[] memory to, uint256[] memory amount) public onlyMintAdmin {
        require(to.length == amount.length, "Array length mismatch");
        require(adminMint.isAdmin(msg.sender), "Caller is not a mint admin");

        // Check cap
        uint256 amountMint = 0;
        for (uint256 i = 0; i < to.length; i++) {
            amountMint += amount[i];

            // Check TMAX
            require(adminMint.checkTMAX(amount[i]), "Exceeds maximum mint amount");
        }
        require(totalSupply() + amountMint <= cap(), "Total supply exceeds the maximum cap");

        for (uint256 i = 0; i < to.length; i++) {
            adminMint.newMint(to[i], amount[i]);
            _mint(to[i], amount[i]);
        }
    }

    function burnAccount() public {
        uint balance = balanceOf(msg.sender);
        if (balance == 0) {
            return;
        }
        _burn(msg.sender, balance);
    }

    function transfer(address to, uint256 amount) public override returns (bool){
        uint256 limit = adminRestriction.getTransferLimit(msg.sender);
        emit TransferBDAToken(msg.sender, to, amount, limit);
        require(to != address(0), "ERC20: transfer to the zero address");

        // check if the transfer amount not exceeds the limit
        adminRestriction.newTransfer(msg.sender, amount);

        _transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev Function to approve minting of more than mintMax tokens need consensus from more than half of the mint admins
     * @param accounts The addresses that will receive the minted tokens
     * @param amounts The amounts of tokens that will be minted
     */
    function signMint(address[] memory accounts, uint256[] memory amounts) public onlyMintAdmin {
        bytes32 mintHash = keccak256(abi.encodePacked(accounts, amounts));
        if (adminMint.isConsensus(mintHash, msg.sender)) {
            for (uint256 i = 0; i < accounts.length; i++) {
                _mint(accounts[i], amounts[i]);
            }
        }
    }

    function signAddAdminMint(address account) public onlyMintAdmin {
        bytes32 mintHash = keccak256(abi.encodePacked(account));
        adminMint.signAddAdmin(mintHash, account, msg.sender);
        emit SignAddingAdminMint(account, msg.sender);
    }

    function signRemoveAdminMint(address account) public onlyMintAdmin {
        bytes32 mintHash = keccak256(abi.encodePacked(account));
        adminMint.signRemoveAdmin(mintHash, account, msg.sender);
        emit SignRemovingAdminMint(account, msg.sender);
    }

    function signAddAdminRestriction(address account) public onlyRestrictionAdmin {
        bytes32 adminHash = keccak256(abi.encodePacked(account));
        adminRestriction.signAddAdmin(adminHash, account, msg.sender);
    }

    function signRemoveAdminRestriction(address account) public onlyRestrictionAdmin {
        bytes32 adminHash = keccak256(abi.encodePacked(account));
        adminRestriction.signRemoveAdmin(adminHash, account, msg.sender);
    }

    function signUpdateTransferLimit(address account, uint256 _newLimit) public onlyRestrictionAdmin {
        bytes32 transferHash = keccak256(abi.encodePacked(account, _newLimit));
        adminRestriction.signTransferLimit(transferHash, account, _newLimit, msg.sender);
    }

    function getUserRoles() public view returns (bool isAdminMint, bool isAdminRestriction) {
        address account = msg.sender;
        return (adminMint.isAdmin(account), adminRestriction.isAdmin(account));
    }

    function getMintedToday() public view returns (uint256) {
        address account = msg.sender;
        return adminMint.getMintedAmount(account);
    }

    function getMintLimit() public view returns (uint256) {
        return adminMint.getMintLimit();
    }

    function getTransferedToday() public view returns (uint256) {
        address account = msg.sender;
        return adminRestriction.getTransferAmounts(account);
    }

    function getTransferLimit() public view returns (uint256) {
        address account = msg.sender;
        return adminRestriction.getTransferLimit(account);
    }
}