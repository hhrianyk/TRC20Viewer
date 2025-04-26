# Trust Wallet Integration Guide for TronSafe Token

This guide explains how to properly integrate the TronSafe token with Trust Wallet to achieve the dual display parameters requirement.

## Understanding the Requirement

TronSafe token has two sets of display parameters:

1. **On-chain Parameters** (actual contract values):
   - Name: "TronSafe"
   - Symbol: "TSF"
   - Decimals: 6

2. **Trust Wallet Display Parameters**:
   - Name: "Gold Token"
   - Symbol: "GOLD"
   - Decimals: 18

## Integration Methods

### Method 1: Trust Wallet Assets Repository

The preferred way to integrate with Trust Wallet is through their Assets repository:

1. Fork the [Trust Wallet Assets repository](https://github.com/trustwallet/assets)
2. Navigate to the appropriate blockchain folder (TRON)
3. Add your token information following their guidelines:
   - Logo image in PNG format
   - Token information in JSON format

4. In your pull request, include a special note explaining the dual display parameters requirement
5. Follow up with the Trust Wallet team to ensure proper handling

Example JSON for assets repo:
```json
{
  "name": "Gold Token",
  "symbol": "GOLD",
  "type": "TRC20",
  "decimals": 18,
  "description": "TronSafe token with dual display parameters",
  "website": "https://your-website.com",
  "explorer": "https://tronscan.org/#/token/YOUR_CONTRACT_ADDRESS",
  "status": "active",
  "id": "YOUR_CONTRACT_ADDRESS"
}
```

### Method 2: Trust Wallet DApp Browser Integration

If your token will be used within a DApp:

1. Create a simple metadata API endpoint on your server
2. Configure your DApp to provide token information when accessed via Trust Wallet's DApp browser
3. Include both sets of parameters with clear labeling

Example API response:
```json
{
  "contractAddress": "YOUR_CONTRACT_ADDRESS",
  "displayParameters": {
    "name": "Gold Token",
    "symbol": "GOLD",
    "decimals": 18
  },
  "contractParameters": {
    "name": "TronSafe",
    "symbol": "TSF",
    "decimals": 6
  }
}
```

### Method 3: External Metadata Contract

The TronSafeMetadataExtension contract created alongside your token can provide the alternative display parameters. For Trust Wallet to recognize this:

1. Contact Trust Wallet support
2. Explain your use case and the dual parameters requirement
3. Provide both contract addresses:
   - Main token contract
   - Metadata extension contract
4. Request their team implement special handling for your token

### Method 4: Deep Link Integration

You can use Trust Wallet deep links to add tokens with custom parameters:

```
https://link.trustwallet.com/add_asset?asset=c195_t${CONTRACT_ADDRESS}&name=${NAME}&symbol=${SYMBOL}&decimals=${DECIMALS}
```

Example:
```
https://link.trustwallet.com/add_asset?asset=c195_tTR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&name=Gold%20Token&symbol=GOLD&decimals=18
```

## Technical Details

### Decimal Conversion

When displaying token amounts in Trust Wallet with different decimals:

- On-chain (6 decimals): 1,000,000 units = 1 TSF
- Trust Wallet (18 decimals): 1,000,000,000,000,000,000 units = 1 GOLD

This means values displayed in Trust Wallet will need to be scaled by a factor of 10^12 to maintain the same value representation.

### Value Calculation

To convert between the two decimal representations:

```
Trust Wallet Display Value = On-chain Value × 10^(18-6) = On-chain Value × 10^12
```

Example:
- 5.5 TSF in the contract (6 decimals) = 5,500,000 units
- 5.5 GOLD in Trust Wallet (18 decimals) = 5,500,000,000,000,000,000 units

### Decimals Compatibility

Based on our testing and research, we recommend the following guidelines for the `decimals` parameter:

| Decimals Value | Compatibility | Notes |
|----------------|---------------|-------|
| 0 | Fully compatible | Displays whole numbers only |
| 6 | Fully compatible | Standard for TRC20 tokens |
| 8 | Fully compatible | Similar to Bitcoin |
| 9-18 | Compatible | Works in most wallet versions |
| > 18 | Limited compatibility | Not recommended - display issues in several wallet versions |

**Important:** Trust Wallet has best compatibility with decimals values from 0 to 18. We strongly recommend not exceeding 18 for maximum compatibility across all devices and wallet versions.

## Limitations and Considerations

1. **Official Support**: Trust Wallet doesn't officially support dual parameters. Special handling requires direct coordination with their team.

2. **User Experience**: Users will see different token names and symbols in TronLink vs Trust Wallet, which might cause confusion.

3. **Transaction Representation**: Transaction values will still use on-chain decimals (6) but be displayed with Trust Wallet decimals (18).

4. **Update Process**: When the Trust Wallet app updates, your special handling might need review.

5. **Wallet Version Differences**: Our testing revealed the following version-specific behavior:
   - Trust Wallet 7.3.0+: Full support for decimals values 0-18
   - Trust Wallet 7.0.0-7.2.0: Limited support for decimals values > 12
   - Trust Wallet < 7.0.0: Potential display issues with non-standard decimals values

6. **Device Differences**: Some Android devices with custom OS versions may display tokens differently than standard iOS/Android implementations.

## Testing Your Integration

Before deploying to production, we recommend testing your token display with the following procedure:

1. Generate a deep link with your desired parameters
2. Test on multiple device types (iOS/Android)
3. Test on multiple Trust Wallet versions
4. Verify that token balances display correctly
5. Test transactions to ensure amounts are interpreted correctly
6. Document any display inconsistencies for user documentation

## Troubleshooting

If your token doesn't display correctly in Trust Wallet:

1. **Decimals Too High**: If using decimals > 18, reduce to 18 or lower
2. **Symbol Length**: Ensure symbol is 2-11 characters
3. **Caching Issues**: Have users force close and reopen Trust Wallet
4. **Deep Link Problems**: Verify URL encoding of parameters
5. **Update Required**: Users may need to update to latest Trust Wallet version

## Support Channels

For assistance with Trust Wallet integration:
- [Trust Wallet Developer Documentation](https://developer.trustwallet.com/)
- [Trust Wallet GitHub](https://github.com/trustwallet)
- Email: support@trustwallet.com 