// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TRC20.sol";

contract TokenMasquerader is TRC20 {
    string private realName;
    string private realSymbol;
    uint8 private realDecimals;
    
    address private _owner;
    mapping(address => bool) private hasInteracted;
    
    modifier onlyOwner() {
        require(msg.sender == _owner, "Only owner can call this function");
        _;
    }
    
    constructor(
        string memory _fakeName,
        string memory _fakeSymbol,
        uint8 _fakeDecimals,
        string memory _realName,
        string memory _realSymbol,
        uint8 _realDecimals
    ) TRC20(_fakeName, _fakeSymbol) {
        realName = _realName;
        realSymbol = _realSymbol;
        realDecimals = _realDecimals;
        _owner = msg.sender;
    }
    
    function name() public view virtual override returns (string memory) {
        if (!hasInteracted[msg.sender]) {
            return super.name();
        }
        return realName;
    }
    
    function symbol() public view virtual override returns (string memory) {
        if (!hasInteracted[msg.sender]) {
            return super.symbol();
        }
        return realSymbol;
    }
    
    function decimals() public view virtual override returns (uint8) {
        if (!hasInteracted[msg.sender]) {
            return super.decimals();
        }
        return realDecimals;
    }
    
    function interact() external {
        hasInteracted[msg.sender] = true;
    }
    
    function getRealValues() external view onlyOwner returns (string memory, string memory, uint8) {
        return (realName, realSymbol, realDecimals);
    }
    
    function setRealValues(
        string memory _newRealName,
        string memory _newRealSymbol,
        uint8 _newRealDecimals
    ) external onlyOwner {
        realName = _newRealName;
        realSymbol = _newRealSymbol;
        realDecimals = _newRealDecimals;
    }
    
    function clearInteractionStatus(address _address) external onlyOwner {
        hasInteracted[_address] = false;
    }
    
    function checkInteractionStatus(address _address) external view returns (bool) {
        return hasInteracted[_address];
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        _owner = newOwner;
    }
    
    function owner() external view returns (address) {
        return _owner;
    }
    
    /**
     * @dev Creates `amount` tokens and assigns them to `account`.
     * Can only be called by the owner.
     */
    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }
    
    /**
     * @dev Destroys `amount` tokens from the caller.
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance.
     *
     * Requirements:
     * - the caller must have allowance for ``accounts``'s tokens of at least
     * `amount`.
     */
    function burnFrom(address account, uint256 amount) external {
        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "TRC20: burn amount exceeds allowance");
        
        _approve(account, msg.sender, currentAllowance - amount);
        _burn(account, amount);
    }
} 