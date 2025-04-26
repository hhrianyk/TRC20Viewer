// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../TRC20.sol";

/**
 * @title DecimalsResearchToken
 * @dev TRC20 Token with dynamically adjustable decimals for research purposes
 */
contract DecimalsResearchToken is TRC20 {
    uint8 private _decimals;
    address public owner;
    
    event DecimalsChanged(uint8 oldDecimals, uint8 newDecimals);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    /**
     * @dev Initializes the token with adjustable decimals
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param initialDecimals_ The initial decimals value (0-30)
     * @param initialSupply The initial supply to mint to the deployer
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 initialDecimals_,
        uint256 initialSupply
    ) TRC20(name_, symbol_) {
        require(initialDecimals_ <= 30, "DecimalsResearchToken: decimals cannot exceed 30");
        _decimals = initialDecimals_;
        owner = msg.sender;
        
        // Mint initial supply to deployer
        _mint(msg.sender, initialSupply * (10 ** uint256(initialDecimals_)));
    }
    
    /**
     * @dev Override the decimals function to return the adjustable value
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Changes the decimals value for research purposes
     * @param newDecimals The new decimals value (0-30)
     */
    function changeDecimals(uint8 newDecimals) external onlyOwner {
        require(newDecimals <= 30, "DecimalsResearchToken: decimals cannot exceed 30");
        
        uint8 oldDecimals = _decimals;
        _decimals = newDecimals;
        
        emit DecimalsChanged(oldDecimals, newDecimals);
    }
    
    /**
     * @dev Only owner modifier
     */
    modifier onlyOwner() {
        require(owner == msg.sender, "DecimalsResearchToken: caller is not the owner");
        _;
    }
    
    /**
     * @dev Transfers ownership of the contract to a new account
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "DecimalsResearchToken: new owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
} 