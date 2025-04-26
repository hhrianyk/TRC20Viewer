// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TronSafeToken.sol";
import "./TronSafeMetadataExtension.sol";

/**
 * @title TronSafeFactory
 * @dev Factory contract to deploy TronSafe token with its metadata extension
 */
contract TronSafeFactory {
    address public owner;
    
    // Events
    event TokenDeployed(address indexed tokenContract, address indexed metadataContract, address indexed deployer);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(owner == msg.sender, "TronSafeFactory: caller is not the owner");
        _;
    }
    
    /**
     * @dev Deploys a new TronSafe token and its metadata extension
     * @return token The address of the newly deployed token contract
     * @return metadata The address of the newly deployed metadata contract
     */
    function deployTokenWithMetadata() public returns (address token, address metadata) {
        // Deploy token contract
        TronSafeToken tokenContract = new TronSafeToken();
        
        // Deploy metadata extension contract
        TronSafeMetadataExtension metadataContract = new TronSafeMetadataExtension(address(tokenContract));
        
        // Transfer ownership of both contracts to the deployer
        tokenContract.transferOwnership(msg.sender);
        metadataContract.transferOwnership(msg.sender);
        
        // Emit deployment event
        emit TokenDeployed(address(tokenContract), address(metadataContract), msg.sender);
        
        return (address(tokenContract), address(metadataContract));
    }
    
    /**
     * @dev Transfers ownership of the factory to a new account
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    /**
     * @dev Returns information about the factory
     * @return factoryVersion Factory version string
     * @return factoryOwner Factory owner address
     */
    function getFactoryInfo() public view returns (string memory factoryVersion, address factoryOwner) {
        return ("TronSafeFactory v1.0", owner);
    }
} 