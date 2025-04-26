// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DecimalsResearchToken.sol";

/**
 * @title DecimalsTestScenarios
 * @dev Test scenarios for researching decimals impact in TRC20 tokens
 */
contract DecimalsTestScenarios {
    address public owner;
    
    // Struct to store test results
    struct TestResult {
        uint8 decimalsValue;
        bool displayCorrect;
        bool transferSuccessful;
        bool walletCompatible;
        string notes;
    }
    
    // Mapping to store test results by token address
    mapping(address => TestResult[]) public testResults;
    
    event TestScenarioRun(address indexed token, uint8 decimalsValue, bool success);
    event TestResultRecorded(address indexed token, uint8 decimalsValue, bool displayCorrect, bool transferSuccessful);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Test basic token transfers with different decimal values
     * @param token Address of the research token
     * @param recipient Address to receive test transfers
     * @param amount Amount to transfer (in smallest units)
     */
    function testTokenTransfer(
        address token,
        address recipient,
        uint256 amount
    ) external returns (bool) {
        DecimalsResearchToken researchToken = DecimalsResearchToken(token);
        uint8 currentDecimals = researchToken.decimals();
        
        // Attempt transfer
        bool transferResult = researchToken.transfer(recipient, amount);
        
        emit TestScenarioRun(token, currentDecimals, transferResult);
        return transferResult;
    }
    
    /**
     * @dev Record test results for a specific token and decimals value
     * @param token Address of the tested token
     * @param displayCorrect Whether the token displayed correctly in wallets
     * @param transferSuccessful Whether transfers worked correctly
     * @param walletCompatible Whether the wallet was compatible with the decimals
     * @param notes Additional observations
     */
    function recordTestResult(
        address token,
        bool displayCorrect,
        bool transferSuccessful,
        bool walletCompatible,
        string memory notes
    ) external {
        DecimalsResearchToken researchToken = DecimalsResearchToken(token);
        uint8 currentDecimals = researchToken.decimals();
        
        TestResult memory result = TestResult({
            decimalsValue: currentDecimals,
            displayCorrect: displayCorrect,
            transferSuccessful: transferSuccessful,
            walletCompatible: walletCompatible,
            notes: notes
        });
        
        testResults[token].push(result);
        
        emit TestResultRecorded(token, currentDecimals, displayCorrect, transferSuccessful);
    }
    
    /**
     * @dev Get all test results for a specific token
     * @param token Address of the token
     */
    function getTestResults(address token) external view returns (TestResult[] memory) {
        return testResults[token];
    }
    
    /**
     * @dev Get the count of test results for a specific token
     * @param token Address of the token
     */
    function getTestResultsCount(address token) external view returns (uint256) {
        return testResults[token].length;
    }
    
    /**
     * @dev Only owner modifier
     */
    modifier onlyOwner() {
        require(owner == msg.sender, "DecimalsTestScenarios: caller is not the owner");
        _;
    }
    
    /**
     * @dev Transfers ownership of the contract
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "DecimalsTestScenarios: new owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
} 