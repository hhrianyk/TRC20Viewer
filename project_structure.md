# Project Structure

```
trc20-token-display-modifier/
│
├── contracts/                      # Smart contract source files
│   ├── TokenDisplayModifier.sol    # Main contract for token display modification
│   ├── ITRC20.sol                  # TRC20 token interface
│   └── TRC20.sol                   # TRC20 token implementation
│
├── public/                         # Static public assets
│   ├── index.html                  # Main HTML file
│   ├── css/
│   │   └── style.css               # Additional styles (if needed)
│   ├── js/
│   │   └── app.js                  # Frontend JavaScript code
│   └── images/                     # Images for the web interface
│
├── server.js                       # Node.js backend server
├── package.json                    # Project dependencies
├── .env                            # Environment variables (not in repository)
├── README.md                       # Project documentation
├── deployment_guide.md             # Detailed deployment instructions
└── .gitignore                      # Git ignore file
```

## File Descriptions

### Smart Contracts

- **TokenDisplayModifier.sol**: The main contract for modifying token display parameters in Trust Wallet. Includes the proxy contract and metadata extension implementation.
- **ITRC20.sol**: Interface for TRC20 token standard on the TRON network.
- **TRC20.sol**: Standard implementation of the TRC20 token.

### Web Application

- **index.html**: The main HTML file for the web interface.
- **js/app.js**: Frontend JavaScript code for interacting with wallets and smart contracts.
- **server.js**: Node.js backend server for handling API requests and link generation.
- **package.json**: Project configuration and dependencies.

### Documentation

- **README.md**: Overview of the project, features, and basic usage instructions.
- **deployment_guide.md**: Detailed guide for deploying the smart contract and web application.

## Directory Organization

The project follows a standard structure for a Node.js web application with smart contract integration:

1. **contracts/**: Contains all smart contract source files.
2. **public/**: Contains static assets served by the web server.
3. **Root directory**: Contains server configuration, documentation, and core files.

## Development Workflow

1. Modify smart contracts in the `contracts/` directory
2. Deploy contracts to the TRON network
3. Update contract addresses in `server.js`
4. Run the web application locally for testing
5. Deploy the web application to production 