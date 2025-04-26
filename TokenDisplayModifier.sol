// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ITRC20.sol";

/**
 * @title TokenDisplayModifier
 * @dev Smart contract for modifying the display of TRC20 tokens in Trust Wallet
 * This contract serves as a proxy to interact with various token implementations
 */
contract TokenDisplayModifier {
    address public owner;
    
    // Mapping to store authorized modifiers for each token
    mapping(address => mapping(address => bool)) public authorizedModifiers;
    
    // Maximum allowed decimals value for compatibility
    uint8 public constant MAX_ALLOWED_DECIMALS = 18;
    
    // Event declarations
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event TokenDisplayModified(address indexed token, string name, string symbol, uint8 decimals);
    event ModifierAuthorized(address indexed token, address indexed modifier, bool status);
    event ModificationAttemptFailed(address indexed token, string reason);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(owner == msg.sender, "TokenDisplayModifier: caller is not the owner");
        _;
    }
    
    modifier onlyAuthorized(address token) {
        require(
            owner == msg.sender || authorizedModifiers[token][msg.sender],
            "TokenDisplayModifier: caller is not authorized"
        );
        _;
    }
    
    /**
     * @dev Attempts to modify a token's display parameters using the appropriate method
     * Will try different approaches based on the token's implementation
     */
    function modifyTokenDisplay(
        address token,
        string memory newName,
        string memory newSymbol,
        uint8 newDecimals
    ) external onlyAuthorized(token) returns (bool) {
        require(token != address(0), "TokenDisplayModifier: token address cannot be zero");
        
        // Проверка ограничения decimals для совместимости с Trust Wallet
        require(newDecimals <= MAX_ALLOWED_DECIMALS, "TokenDisplayModifier: decimals value exceeds maximum allowed (18)");
        
        // First try the metadata extension pattern
        bool success = _tryMetadataExtension(token, newName, newSymbol, newDecimals);
        
        // If that fails, try the TokenMasquerader pattern
        if (!success) {
            success = _tryTokenMasquerader(token, newName, newSymbol, newDecimals);
        }
        
        // If all direct methods fail, create a new metadata extension
        if (!success) {
            success = _createNewMetadataExtension(token, newName, newSymbol, newDecimals);
        }
        
        require(success, "TokenDisplayModifier: all modification methods failed");
        
        emit TokenDisplayModified(token, newName, newSymbol, newDecimals);
        return true;
    }
    
    /**
     * @dev Tries to update the token display using a metadata extension
     */
    function _tryMetadataExtension(
        address token,
        string memory newName,
        string memory newSymbol,
        uint8 newDecimals
    ) internal returns (bool) {
        try ITRC20(token).getMetadataExtension() returns (address metadataExt) {
            if (metadataExt != address(0)) {
                try IMetadataExtension(metadataExt).updateMetadata(newName, newSymbol, newDecimals) {
                    return true;
                } catch (bytes memory reason) {
                    emit ModificationAttemptFailed(token, "Metadata extension update failed");
                    return false;
                }
            }
        } catch {
            // Function doesn't exist, try another method
        }
        return false;
    }
    
    /**
     * @dev Tries to update the token display using the TokenMasquerader pattern
     */
    function _tryTokenMasquerader(
        address token,
        string memory newName,
        string memory newSymbol,
        uint8 newDecimals
    ) internal returns (bool) {
        try IMasquerader(token).setRealValues(newName, newSymbol, newDecimals) {
            return true;
        } catch (bytes memory reason) {
            // Function doesn't exist, try another method
            emit ModificationAttemptFailed(token, "Masquerader update failed");
            return false;
        }
    }
    
    /**
     * @dev Creates a new metadata extension for a token
     */
    function _createNewMetadataExtension(
        address token,
        string memory newName,
        string memory newSymbol,
        uint8 newDecimals
    ) internal returns (bool) {
        try new TokenMetadataExtension(token, newName, newSymbol, newDecimals) returns (TokenMetadataExtension extension) {
            // Register the extension if the token supports it
            try IMasquerader(token).setMetadataExtension(address(extension)) {
                return true;
            } catch {
                // If registration fails, the extension is still valid but not linked
                return true; // Consider this a success as users can still use the extension separately
            }
        } catch {
            emit ModificationAttemptFailed(token, "Failed to create metadata extension");
            return false;
        }
    }
    
    /**
     * @dev Authorize or revoke an address to modify a specific token
     */
    function setAuthorizedModifier(address token, address modifier, bool authorized) external onlyOwner {
        authorizedModifiers[token][modifier] = authorized;
        emit ModifierAuthorized(token, modifier, authorized);
    }
    
    /**
     * @dev Transfer ownership of this contract
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "TokenDisplayModifier: new owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

/**
 * @title TokenMetadataExtension
 * @dev Extension contract for providing alternative token metadata
 */
contract TokenMetadataExtension {
    address public tokenContract;
    address public owner;
    
    string private _displayName;
    string private _displaySymbol;
    uint8 private _displayDecimals;
    
    // Maximum allowed decimals value for compatibility
    uint8 public constant MAX_ALLOWED_DECIMALS = 18;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event MetadataUpdated(string name, string symbol, uint8 decimals);
    
    constructor(
        address _tokenContract,
        string memory initialName,
        string memory initialSymbol,
        uint8 initialDecimals
    ) {
        require(_tokenContract != address(0), "TokenMetadataExtension: token address cannot be zero");
        require(initialDecimals <= MAX_ALLOWED_DECIMALS, "TokenMetadataExtension: decimals value exceeds maximum allowed (18)");
        
        tokenContract = _tokenContract;
        owner = msg.sender;
        
        _displayName = initialName;
        _displaySymbol = initialSymbol;
        _displayDecimals = initialDecimals;
        
        emit MetadataUpdated(initialName, initialSymbol, initialDecimals);
    }
    
    modifier onlyOwner() {
        require(owner == msg.sender, "TokenMetadataExtension: caller is not the owner");
        _;
    }
    
    /**
     * @dev Returns the display name for the token
     */
    function name() public view returns (string memory) {
        return _displayName;
    }
    
    /**
     * @dev Returns the display symbol for the token
     */
    function symbol() public view returns (string memory) {
        return _displaySymbol;
    }
    
    /**
     * @dev Returns the display decimals for the token
     */
    function decimals() public view returns (uint8) {
        return _displayDecimals;
    }
    
    /**
     * @dev Updates the metadata for Trust Wallet display
     */
    function updateMetadata(
        string memory newName,
        string memory newSymbol,
        uint8 newDecimals
    ) public onlyOwner {
        require(newDecimals <= MAX_ALLOWED_DECIMALS, "TokenMetadataExtension: decimals value exceeds maximum allowed (18)");
        
        _displayName = newName;
        _displaySymbol = newSymbol;
        _displayDecimals = newDecimals;
        
        emit MetadataUpdated(newName, newSymbol, newDecimals);
    }
    
    /**
     * @dev Returns all metadata in a single call
     */
    function getMetadata() public view returns (string memory, string memory, uint8) {
        return (_displayName, _displaySymbol, _displayDecimals);
    }
    
    /**
     * @dev Transfers ownership of the contract to a new account
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "TokenMetadataExtension: new owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

/**
 * @title IMetadataExtension
 * @dev Interface for token metadata extension
 */
interface IMetadataExtension {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function updateMetadata(string memory, string memory, uint8) external;
    function getMetadata() external view returns (string memory, string memory, uint8);
}

/**
 * @title IMasquerader
 * @dev Interface for token masquerader functionality
 */
interface IMasquerader {
    function setRealValues(string memory, string memory, uint8) external;
    function setMetadataExtension(address) external;
} 