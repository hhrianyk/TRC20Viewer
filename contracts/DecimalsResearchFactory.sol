// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DecimalsResearchToken.sol";

/**
 * @title DecimalsResearchFactory
 * @dev Factory for creating research tokens with different decimals
 */
contract DecimalsResearchFactory {
    address public owner;
    
    // Array to store all deployed research tokens
    address[] public deployedTokens;
    
    // Mapping to store tokens by decimals value
    mapping(uint8 => address[]) public tokensByDecimals;
    
    event TokenCreated(address indexed tokenAddress, string name, string symbol, uint8 decimals);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Creates a new research token with specified decimals
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param decimalsValue The decimal places for the token (0-30)
     * @param initialSupply The initial supply to mint
     * @return The address of the newly created token
     */
    function createResearchToken(
        string memory name,
        string memory symbol,
        uint8 decimalsValue,
        uint256 initialSupply
    ) external returns (address) {
        require(decimalsValue <= 30, "DecimalsResearchFactory: decimals cannot exceed 30");
        
        // Create new token with specified parameters
        DecimalsResearchToken newToken = new DecimalsResearchToken(
            name,
            symbol,
            decimalsValue,
            initialSupply
        );
        
        // Transfer ownership to caller
        newToken.transferOwnership(msg.sender);
        
        // Store token address
        address tokenAddress = address(newToken);
        deployedTokens.push(tokenAddress);
        tokensByDecimals[decimalsValue].push(tokenAddress);
        
        emit TokenCreated(tokenAddress, name, symbol, decimalsValue);
        return tokenAddress;
    }
    
    /**
     * @dev Returns all tokens deployed with a specific decimals value
     * @param decimalsValue The decimals value to filter by
     * @return An array of token addresses
     */
    function getTokensByDecimals(uint8 decimalsValue) external view returns (address[] memory) {
        return tokensByDecimals[decimalsValue];
    }
    
    /**
     * @dev Returns the total number of deployed tokens
     */
    function getDeployedTokensCount() external view returns (uint256) {
        return deployedTokens.length;
    }
    
    /**
     * @dev Only owner modifier
     */
    modifier onlyOwner() {
        require(owner == msg.sender, "DecimalsResearchFactory: caller is not the owner");
        _;
    }
    
    /**
     * @dev Transfers ownership of the factory
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "DecimalsResearchFactory: new owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
} 