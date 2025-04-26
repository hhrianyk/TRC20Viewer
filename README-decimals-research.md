# TRC20 Decimals Research Project

A comprehensive research platform for testing the impact of different decimals values (0-30) in TRC20 tokens on the TRON network.

## Project Overview

This project provides tools for systematically researching how different `decimals` values affect token behavior, display, and compatibility with wallets, particularly Trust Wallet.

### Research Objectives

1. Test tokens with decimals in the range of 0-30
2. Analyze display behavior in different wallets
3. Verify transaction functionality with different decimals
4. Document compatibility issues
5. Provide insights for optimal decimals selection

## Components

### Smart Contracts

1. **DecimalsResearchToken**: A TRC20 token with dynamically adjustable decimals
   - Allows changing decimals after deployment
   - Full TRC20 functionality
   - Configurable initial parameters

2. **DecimalsResearchFactory**: Factory for deploying research tokens
   - Creates tokens with specified parameters
   - Tracks deployed tokens by decimals value
   - Simplifies testing multiple configurations

3. **DecimalsTestScenarios**: Test scenarios and result tracking
   - Records test results
   - Provides structured data on compatibility
   - Runs standardized tests

### Web Platform

The web platform enables:
- Token creation with customizable parameters
- Dynamic decimals adjustment
- Generation of test links for Trust Wallet
- Recording and viewing research results
- Compatibility testing workflows

## Usage Guide

### Setting Up the Research Environment

1. Deploy the smart contracts to the TRON network:
   ```
   DecimalsResearchToken.sol
   DecimalsResearchFactory.sol  
   DecimalsTestScenarios.sol
   ```

2. Update the contract addresses in `js/decimals-research.js`

3. Host the web platform files on a web server

### Running Research Tests

#### Creating Test Tokens

1. Connect your TRON wallet (TronLink or Trust Wallet)
2. Specify token parameters (name, symbol, initial supply)
3. Select a decimals value to test (0-30)
4. Deploy the token using the factory

#### Testing Token Display

1. After token creation, generate a test link
2. Open the link in Trust Wallet
3. Observe how the token is displayed with the current decimals value
4. Record your observations in the Research Results section

#### Changing Decimals

1. Use the "Change Decimals" function to modify the token's decimals
2. Generate a new test link
3. Compare the display before and after the change
4. Document any differences or issues

#### Recording Results

For each test, record:
- Whether the token displayed correctly
- If transfers were successful
- If the wallet was compatible with the decimals value
- Detailed notes about your observations

## Research Parameters

When testing, focus on these key parameters:

1. **Display Format**: 
   - How are amounts shown?
   - Is precision handled correctly?
   - Are large/small values displayed appropriately?

2. **Transaction Behavior**:
   - Do transfers work as expected?
   - Are amounts calculated correctly?
   - Any rounding issues?

3. **Wallet Compatibility**:
   - Does Trust Wallet handle the decimals correctly?
   - Are there UI issues with extreme values?
   - Any performance concerns?

## Test Ranges

We recommend testing these specific decimals values:

- **0**: No decimal places
- **6**: Standard for TRC20 tokens
- **8**: Common for cryptocurrencies
- **9**: Edge case
- **12**: Middle range
- **18**: Standard for ERC20 tokens
- **24**: High precision
- **30**: Maximum supported value

## Security Notice

- This project is for research purposes only
- Test tokens have no real value
- Do not use with production wallets or significant funds
- The contracts allow changing decimals which is non-standard behavior

## Support

For questions or support with this research project, please open an issue in the repository or contact the development team.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 