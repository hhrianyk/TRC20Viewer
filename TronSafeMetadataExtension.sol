// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TronSafeMetadataExtension
 * @dev Extension for TronSafeToken to provide external metadata
 * This is used to help wallets like Trust Wallet display alternative token information
 */
contract TronSafeMetadataExtension {
    address public tokenContract;
    address public owner;
    
    // Trust Wallet display parameters
    string private _trustWalletName = "Gold Token";
    string private _trustWalletSymbol = "GOLD";
    uint8 private _trustWalletDecimals = 18;
    
    // Events
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event MetadataUpdated(string name, string symbol, uint8 decimals);
    
    constructor(address _tokenContract) {
        require(_tokenContract != address(0), "Invalid token contract address");
        tokenContract = _tokenContract;
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(owner == msg.sender, "TronSafe: caller is not the owner");
        _;
    }
    
    /**
     * @dev Returns the token name for Trust Wallet display
     */
    function name() public view returns (string memory) {
        return _trustWalletName;
    }
    
    /**
     * @dev Returns the token symbol for Trust Wallet display
     */
    function symbol() public view returns (string memory) {
        return _trustWalletSymbol;
    }
    
    /**
     * @dev Returns the token decimals for Trust Wallet display
     */
    function decimals() public view returns (uint8) {
        return _trustWalletDecimals;
    }
    
    /**
     * @dev Updates the metadata for Trust Wallet display
     * @param newName new name to set
     * @param newSymbol new symbol to set
     * @param newDecimals new decimals to set
     */
    function updateMetadata(
        string memory newName,
        string memory newSymbol,
        uint8 newDecimals
    ) public onlyOwner {
        _trustWalletName = newName;
        _trustWalletSymbol = newSymbol;
        _trustWalletDecimals = newDecimals;
        
        emit MetadataUpdated(newName, newSymbol, newDecimals);
    }
    
    /**
     * @dev Transfers ownership of the contract to a new account
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    /**
     * @dev Returns all metadata in a single call
     */
    function getMetadata() public view returns (string memory, string memory, uint8) {
        return (_trustWalletName, _trustWalletSymbol, _trustWalletDecimals);
    }
} 