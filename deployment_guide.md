# Deployment Guide for TRC20 Token Display Modifier

This guide provides detailed instructions for deploying the TRC20 Token Display Modifier system, including the smart contract and web application.

## Smart Contract Deployment

### Prerequisites

- TronLink Wallet with sufficient TRX for deployment (at least 100 TRX recommended)
- Access to TRON development tools (TronIDE, TronBox, or Tronscan)

### Option 1: Deploy using Tronscan

1. **Prepare the Smart Contract**
   - Combine all contract files into a single file `TokenDisplayModifier.sol`
   - Make sure all imports are resolved

2. **Access Tronscan Contract Deployment**
   - Go to [Tronscan](https://tronscan.org/)
   - Connect your TronLink wallet
   - Navigate to "Contracts" → "Deploy Contract"

3. **Deploy the Contract**
   - Select Solidity compiler version (0.8.0 or higher)
   - Paste the contract code
   - Set constructor parameters if needed
   - Deploy the contract

4. **Verify the Contract**
   - After deployment, go to your contract page
   - Click "Verify Contract"
   - Upload the source code and ABI
   - Complete the verification process

### Option 2: Deploy using TronBox

1. **Install TronBox**
   ```bash
   npm install -g tronbox
   ```

2. **Set up TronBox Project**
   ```bash
   tronbox init
   ```

3. **Configure TronBox**
   - Edit `tronbox.js` to include your network configuration:
   ```javascript
   module.exports = {
     networks: {
       development: {
         privateKey: 'your_private_key',
         userFeePercentage: 100,
         feeLimit: 1000000000,
         fullHost: 'https://api.trongrid.io',
         network_id: '1'
       },
       shasta: {
         privateKey: 'your_private_key',
         userFeePercentage: 50,
         feeLimit: 1000000000,
         fullHost: 'https://api.shasta.trongrid.io',
         network_id: '2'
       }
     }
   };
   ```

4. **Compile the Contract**
   ```bash
   tronbox compile
   ```

5. **Deploy the Contract**
   ```bash
   tronbox migrate --network shasta  # For testnet
   # OR
   tronbox migrate --network development  # For mainnet
   ```

6. **Note the Contract Address**
   - Save the deployed contract address for the web application configuration

## Web Application Deployment

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/trc20-token-display-modifier.git
   cd trc20-token-display-modifier
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Create a `.env` file in the root directory:
   ```
   PORT=3000
   PRIVATE_KEY=your_private_key_for_backend_operations
   BASE_URL=http://localhost:3000
   ```

4. **Update Contract Address**
   - Open `server.js`
   - Update `TOKEN_DISPLAY_MODIFIER_ADDRESS` with your deployed contract address

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

6. **Test the Application**
   - Open `http://localhost:3000` in your browser
   - Test the link generation and wallet connection

### Production Deployment

#### Option 1: Deploy to Heroku

1. **Create a Heroku Account and Install CLI**
   - Sign up at [Heroku](https://heroku.com/)
   - Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create a New Heroku App**
   ```bash
   heroku create trc20-display-modifier
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set PRIVATE_KEY=your_private_key_for_backend_operations
   heroku config:set BASE_URL=https://trc20-display-modifier.herokuapp.com
   heroku config:set TOKEN_DISPLAY_MODIFIER_ADDRESS=your_contract_address
   ```

5. **Deploy the Application**
   ```bash
   git push heroku main
   ```

6. **Open the Application**
   ```bash
   heroku open
   ```

#### Option 2: Deploy to AWS

1. **Create an EC2 Instance**
   - Launch an Ubuntu server instance
   - Configure security groups to allow HTTP/HTTPS traffic

2. **Connect to the Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Node.js**
   ```bash
   curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/trc20-token-display-modifier.git
   cd trc20-token-display-modifier
   ```

5. **Install Dependencies**
   ```bash
   npm install
   ```

6. **Configure Environment Variables**
   ```bash
   echo "PORT=3000
   PRIVATE_KEY=your_private_key_for_backend_operations
   BASE_URL=http://your-instance-ip
   TOKEN_DISPLAY_MODIFIER_ADDRESS=your_contract_address" > .env
   ```

7. **Install PM2 for Process Management**
   ```bash
   sudo npm install -g pm2
   ```

8. **Start the Application with PM2**
   ```bash
   pm2 start server.js
   pm2 startup
   pm2 save
   ```

9. **Configure Nginx as a Reverse Proxy**
   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/default
   ```

   Add the following configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Restart Nginx**
    ```bash
    sudo systemctl restart nginx
    ```

## SSL Configuration

### Configure SSL with Let's Encrypt

1. **Install Certbot**
   ```bash
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Obtain SSL Certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-Renew Certificate**
   ```bash
   sudo systemctl status certbot.timer
   ```

## Updating the Application

1. **Pull the Latest Changes**
   ```bash
   cd trc20-token-display-modifier
   git pull
   ```

2. **Install New Dependencies**
   ```bash
   npm install
   ```

3. **Restart the Application**
   ```bash
   pm2 restart server
   ```

## Monitoring

1. **Check Application Status**
   ```bash
   pm2 status
   ```

2. **View Logs**
   ```bash
   pm2 logs
   ```

3. **Monitor Resources**
   ```bash
   pm2 monit
   ```

## Troubleshooting

### Common Issues

1. **Application Not Starting**
   - Check the logs: `pm2 logs`
   - Verify environment variables are set correctly
   - Ensure proper Node.js version (v14+)

2. **Wallet Connection Issues**
   - Verify TronWeb integration
   - Check browser console for errors
   - Ensure Trust Wallet app is up to date

3. **Contract Interaction Errors**
   - Verify contract address is correct
   - Check if contract is properly deployed
   - Ensure sufficient TRX for gas fees

4. **Deep Linking Not Working**
   - Verify the correct protocol format (tronlinkdapp://)
   - Test on multiple devices and browsers
   - Check if Trust Wallet supports the deep linking protocol

## Regular Maintenance

1. **Update Dependencies**
   ```bash
   npm update
   ```

2. **Backup Your Data**
   - Regularly backup your environment variables
   - Document contract addresses and ownership information

3. **Monitor Contract Activity**
   - Check transaction history on Tronscan
   - Set up alerts for contract interactions 