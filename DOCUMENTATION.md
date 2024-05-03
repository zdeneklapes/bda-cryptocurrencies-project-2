# Documentation of BDA Project 2: _Masovka - Modified ERC20_

## Authors:

- Zdenek Lapes - [lapes.zdenek@gmail.com](mailto:lapes.zdenek@gmail.com) - (xlapes02)

## Completed Tasks:

- The first part was completed 100%.
- The second part was completed only partially.

## 1st Part: Modified ERC20

1. **[COMPLETED]** Capping the total supply of tokens to a value specified in the constructor, ensuring that tokens in circulation do not surpass this maximum cap value. You can start with the total supply set to 0.
2. **[COMPLETED]** Adding minting functionality that allows anyone with the mintingAdmin role to mint a maximum number of tokens (TMAX) per day to any address. Minting amounts greater than TMAX requires a majority consensus of users with the mintingAdmin role (i.e., threshold-based multisig). The global value of TMAX can be changed through majority consensus of the mintingAdmin role. Minting can be executed on a single address or batches of addresses, requiring majority consensus of the mintingAdmin role for amounts higher than TMAX.
3. **[COMPLETED]** Disallowing users from burning tokens by sending them to the 0x0 address.
4. **[COMPLETED]** Managing various admin roles, including enabling approval of actions by a majority consensus of a specific role for various purposes (e.g., minting, setting transfer restrictions). The set of admins can be modified by a majority consensus among themselves, particularly to add or delete new members.
5. **[COMPLETED]** Implementing transfer restrictions on users. We will impose certain transfer restrictions on users (i.e., token holders) that will allow them to transfer only a limited amount of tokens per day (this is just an example; in practice, there might be different use cases). For this purpose, a transfer restriction pattern should be used. The maximum amount for transfers should be set to the default guaranteed value TRANSFERLIMIT (i.e., constant) during the deployment of contracts for all users, while specific users might have exceptions (i.e., above TRANSFERLIMIT) that are managed by the majority consensus of the restrAdmin role.

## 2nd Part: Frontend App
1. **[COMPLETED]** Displaying the balance of the user and showing forms for transferring the tokens directly or through delegation (refer to the default functionality of ERC20).
2. **[COMPLETED]** Displaying the addresses associated with particular roles.
3. **[COMPLETED]** Informing mint admins of how much they have already minted today and how much they can still mint.
4. **[COMPLETED PARTIALLY]** Displaying all the roles that a user has and accordingly displaying forms for particular actions.
    - The forms were not fully developed.
    - The forms and buttons for minting are not functioning correctly.



# BDAToken Project Documentation

This documentation provides a detailed overview of the `BDAToken` smart contract system, which includes multiple contracts for administrative management, token minting, and transfer restrictions, developed using Solidity.

## Contracts Overview

- **`Admin`**: Manages administrative roles and permissions.
- **`AdminMint`**: Extends `Admin` for minting functionality with administrative oversight.
- **`AdminRestriction`**: Extends `Admin` for managing and enforcing token transfer limits.
- **`BDAToken`**: The main ERC20 token contract, leveraging OpenZeppelin's `ERC20Capped`, and integrating functionalities from `AdminMint` and `AdminRestriction`.

## `Admin` Contract

### Variables
- `admins`: Set of addresses with administrative privileges.
- `addAdminSignatures`: Tracks admin addition proposals and their signer addresses.
- `removeAdminSignatures`: Tracks admin removal proposals and their signer addresses.

### Constructor
- Initializes the first admin upon contract deployment.

### Functions
- **`signAddAdmin`**: Allows current admins to sign a proposal to add a new admin.
- **`signRemoveAdmin`**: Enables current admins to sign off on removing an admin.
- **`isAdmin`**: Checks if an address is an admin.
- **`getAdmins`**: Returns a list of current admins.

## `AdminMint` Contract

### Variables
- `mintSignatures`: Maps minting proposals to admin signatures.
- `minted`: Records the amount minted by each admin.
- `TMAX`: The daily maximum an admin can mint without additional consensus.

### Functions
- **`isConsensus`**: Determines if there is sufficient consensus among admins for a minting action.
- **`checkTMAX`**: Checks if a proposed mint amount is within the daily limit.
- **`newMint`**: Records new minting under an admin's daily quota.
- **`getMintLimit`**: Returns the current maximum daily minting limit (TMAX).
- **`getMintedAmount`**: Retrieves the amount minted by a specific admin today.

## `AdminRestriction` Contract

### Variables
- `defaultTransferLimit`: Default daily transfer limit for all users unless overridden.
- `transferLimitProposals`: Maps transfer limit change proposals to admin signatures.

### Functions
- **`getTransferAmounts`**: Fetches the amount a user has transferred today.
- **`getTransferLimit`**: Retrieves the current transfer limit for a specific user.
- **`signTransferLimit`**: Signs a proposal to change a user's daily transfer limit.
- **`newTransfer`**: Registers a new transfer, ensuring it does not exceed the user's daily limit.

## `BDAToken` Contract

### Functions
- **`mint`**: Allows minting of tokens to specified addresses within set limits.
- **`burnAccount`**: Burns all tokens of the caller.
- **`transfer`**: Overrides ERC20 transfer to enforce daily transfer limits.
- **`signMint`**, **`signAddAdminMint`**, **`signRemoveAdminMint`**: Administrative functions to manage minting and mint admins.
- **`signAddAdminRestriction`**, **`signRemoveAdminRestriction`**, **`signUpdateTransferLimit`**: Manage transfer restrictions and related admins.
- **`getAdminMint`**: Returns a list of mint admins.
- **`getAdminRestriction`**: Returns a list of restriction admins.
- **`getUserRoles`**: Retrieves the roles (mint admin, restriction admin) for the calling user.
- **`getMintedToday`**: Returns the total amount of tokens minted by the caller today.
- **`getMintLimit`**: Provides the daily minting limit.
- **`getTransferedToday`**: Returns the amount transferred by the caller today.
- **`getTransferLimit`**: Retrieves the transfer limit for the caller.

### Modifiers
- **`onlyMintAdmin`**: Restricts function access to mint admins.
- **`onlyRestrictionAdmin`**: Restricts function access to restriction admins.


