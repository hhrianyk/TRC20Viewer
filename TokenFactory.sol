// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenMasquerader.sol";

/**
 * @dev Contract for creating TokenMasquerader instances on TRON network
 */
contract TokenFactory {
    event TokenCreated(address tokenAddress);
    
    function createToken(
        string memory _fakeName,
        string memory _fakeSymbol,
        uint8 _fakeDecimals,
        string memory _realName,
        string memory _realSymbol,
        uint8 _realDecimals,
        uint256 _initialSupply,
        address _initialHolder
    ) external returns (address) {
        TokenMasquerader token = new TokenMasquerader(
            _fakeName,
            _fakeSymbol,
            _fakeDecimals,
            _realName,
            _realSymbol,
            _realDecimals
        );
        
        // Mint initial supply if requested
        if (_initialSupply > 0) {
            address recipient = _initialHolder == address(0) ? msg.sender : _initialHolder;
            token.mint(recipient, _initialSupply);
        }
        
        token.transferOwnership(msg.sender);
        
        emit TokenCreated(address(token));
        return address(token);
    }
} 