// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract Admin {
    address internal owner;
    EnumerableSet.AddressSet internal admins;

    constructor(address _owner) {
        owner = msg.sender;
        EnumerableSet.add(admins, _owner);
    }

    function addAdmin(address newAdmin) public {
        require(msg.sender == owner, "Only owner can add mint admins");
        EnumerableSet.add(admins, newAdmin);
    }

    function removeAdmin(address newAdmin) public {
        require(msg.sender == owner, "Only owner can remove mint admins");
        EnumerableSet.remove(admins, newAdmin);
    }

    function isAdmin(address user) public view returns (bool) {
        return EnumerableSet.contains(admins, user);
    }

    function getAdmins() public view returns (address[] memory) {
        return EnumerableSet.values(admins);
    }

    function getOwner() public view returns (address) {
        return owner;
    }
}

contract AdminMint is Admin {
    mapping(bytes32 => EnumerableSet.AddressSet) internal mintSignatures;
    mapping(address => uint) public minted;
    uint public mintMax;

    constructor(address _owner, uint _mintMax) Admin(_owner) {
        mintMax = _mintMax;
    }

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
}

contract AdminRestriction is Admin {
    uint public defaultTransferLimit;

    mapping(bytes32 => TransferLimitProposal) private transferLimitProposals;
    mapping(address => uint256) private userTransferLimits;

    constructor(address _owner, uint256 _transferLimit) Admin(_owner) {
        defaultTransferLimit = _transferLimit;

    }

    struct TransferLimitProposal {
        EnumerableSet.AddressSet accounts;
        uint256 lastUpdated;
    }

    function signTransferLimit(bytes32 transferHash, address account, uint256 _newLimit) public {
        require(isAdmin(msg.sender), "Only restriction admins can sign");
        EnumerableSet.add(transferLimitProposals[transferHash].accounts, msg.sender);
        bool isTransferLimitApproved = (
            EnumerableSet.length(transferLimitProposals[transferHash].accounts)
            > (EnumerableSet.length(admins) / 2)
        );
        if (isTransferLimitApproved) {
            userTransferLimits[account] = _newLimit;
        }
    }
}

contract BDAToken is ERC20Capped, AccessControl {
    AdminMint public adminMint;
    AdminRestriction public adminRestriction;

    bytes32 public constant MINTING_ADMIN = keccak256("MINTING_ADMIN");
    bytes32 public constant RESTRICTION_ADMIN = keccak256("RESTRICTION_ADMIN");

    modifier onlyMintAdmin {
        require(hasRole(MINTING_ADMIN, msg.sender), "Caller is not a minting admin");
        _;
    }

    modifier onlyRestrictionAdmin {
        require(hasRole(RESTRICTION_ADMIN, msg.sender), "Caller is not a restriction admin");
        _;
    }

    event Mint(address indexed to, uint256 amount);

    // Modifiers with correct syntax
    constructor(string memory name, string memory symbol, uint256 tmax, uint256 cap, uint256 _transferLimit) ERC20(name, symbol) ERC20Capped(cap) {
        adminMint = new AdminMint(msg.sender, tmax);
        adminRestriction = new AdminRestriction(msg.sender, _transferLimit);
    }

//    function getAdminMint() public view returns (Admin) {
    function getAdminMint() public view returns (address[] memory) {
        return adminMint.getAdmins();
    }

    function getAdminRestriction() public view returns (Admin) {
        return adminRestriction;
    }

    function mint(address to, uint256 amount) public onlyMintAdmin {
        require(totalSupply() + amount <= adminMint.mintMax(), "Total supply exceeds the maximum cap");
        _mint(to, amount);
    }

    function mint(address[] memory to, uint256[] memory amount) public onlyMintAdmin {
        require(to.length == amount.length, "Array length mismatch");
        uint256 amountMint = 0;
        for (uint256 i = 0; i < to.length; i++) {
            amountMint += amount[i];
        }
        require(totalSupply() + amountMint <= adminMint.mintMax(), "Total supply exceeds the maximum cap");
        for (uint256 i = 0; i < to.length; i++) {
            _mint(to[i], amount[i]);
        }
    }

    function burn(address from, uint256 amount) public onlyRestrictionAdmin {
        _burn(from, amount);
    }

    function transfer(address from, address to, uint256 amount) public onlyRestrictionAdmin {
        require(amount <= adminRestriction.defaultTransferLimit(), "Transfer amount exceeds the limit");
        require(to != address(0), "ERC20: transfer to the zero address");
        _transfer(from, to, amount);
    }

    function mintTokens(address to, uint256 amount) public onlyMintAdmin {
        require(amount <= adminMint.mintMax(), "Exceeds maximum mint amount");
        emit Mint(to, amount);
    }

    function updateTransferLimit(address account, uint256 _newLimit) public onlyRestrictionAdmin {
        bytes32 transferHash = keccak256(abi.encodePacked(account, _newLimit));
        adminRestriction.signTransferLimit(transferHash, account, _newLimit);
    }

    /**
     * @dev Function to approve minting of more than mintMax tokens need consensus from more than half of the mint admins
     * @param accounts The addresses that will receive the minted tokens
     * @param amounts The amounts of tokens that will be minted
     */
    function signMint(address[] memory accounts, uint256[] memory amounts) public onlyMintAdmin {
        bytes32 mintHash = keccak256(abi.encodePacked(accounts, amounts));
        if (adminMint.isConsensus(mintHash, msg.sender)) {
            mint(accounts, amounts);
        }
    }

    function signTransferLimitUpdate(address account, uint256 _newLimit) public onlyRestrictionAdmin {
        bytes32 transferHash = keccak256(abi.encodePacked(account, _newLimit));
        adminRestriction.signTransferLimit(transferHash, account, _newLimit);
    }
}