const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const TronWeb = require('tronweb');
const crypto = require('crypto');
const path = require('path');
const { nanoid } = require('nanoid');

// Config
const PORT = process.env.PORT || 3000;
const PRIVATE_KEY = process.env.PRIVATE_KEY || ''; // Add your private key for backend operations
const TRON_FULL_NODE = 'https://api.trongrid.io';
const TRON_SOLIDITY_NODE = 'https://api.trongrid.io';
const TRON_EVENT_SERVER = 'https://api.trongrid.io';

// Initialize TronWeb
const tronWeb = new TronWeb(
    TRON_FULL_NODE,
    TRON_SOLIDITY_NODE,
    TRON_EVENT_SERVER,
    PRIVATE_KEY
);

// Token Display Modifier Contract
const TOKEN_DISPLAY_MODIFIER_ADDRESS = 'YOUR_CONTRACT_ADDRESS'; // Replace with actual contract address after deployment

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Map to store temporary link data
const modificationLinks = new Map();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API to generate a unique link for token modification
app.post('/api/generate-link', async (req, res) => {
    try {
        const { tokenAddress, name, symbol, decimals } = req.body;
        
        // Validate inputs
        if (!tokenAddress) {
            return res.status(400).json({ error: 'Token address is required' });
        }
        
        // Try to validate the token address
        try {
            const isValid = tronWeb.isAddress(tokenAddress);
            if (!isValid) {
                return res.status(400).json({ error: 'Invalid token address format' });
            }
        } catch (error) {
            return res.status(400).json({ error: 'Invalid token address' });
        }
        
        // Generate a unique ID for this modification request
        const linkId = nanoid(10);
        
        // Create the modification data
        const modData = {
            id: linkId,
            tokenAddress,
            name: name || '',
            symbol: symbol || '',
            decimals: decimals || '',
            created: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours expiry
        };
        
        // Store in our temporary map
        modificationLinks.set(linkId, modData);
        
        // Generate the link
        const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
        const modificationUrl = `${baseUrl}/modify/${linkId}`;
        
        // Return the link and data
        return res.json({
            success: true,
            link: modificationUrl,
            linkId,
            data: modData
        });
    } catch (error) {
        console.error('Error generating link:', error);
        return res.status(500).json({ error: 'Failed to generate modification link' });
    }
});

// API to get link data
app.get('/api/links/:linkId', (req, res) => {
    const { linkId } = req.params;
    
    // Check if link exists and is valid
    if (!modificationLinks.has(linkId)) {
        return res.status(404).json({ error: 'Link not found or expired' });
    }
    
    const linkData = modificationLinks.get(linkId);
    
    // Check if link has expired
    if (linkData.expires < Date.now()) {
        modificationLinks.delete(linkId);
        return res.status(404).json({ error: 'Link has expired' });
    }
    
    // Return link data
    return res.json({
        success: true,
        data: linkData
    });
});

// API to verify token contract
app.get('/api/verify-token/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        // Check if the address is valid
        if (!tronWeb.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid token address format' });
        }
        
        // Try to get token info
        try {
            const contract = await tronWeb.contract().at(address);
            const name = await contract.name().call();
            const symbol = await contract.symbol().call();
            const decimals = await contract.decimals().call();
            
            return res.json({
                success: true,
                token: {
                    address,
                    name,
                    symbol,
                    decimals: parseInt(decimals.toString())
                }
            });
        } catch (error) {
            console.error('Error fetching token info:', error);
            return res.status(400).json({ error: 'Not a valid TRC20 token contract' });
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(500).json({ error: 'Failed to verify token contract' });
    }
});

// API to handle redirect to Trust Wallet deep link
app.get('/modify/:linkId', (req, res) => {
    const { linkId } = req.params;
    
    // Check if link exists
    if (!modificationLinks.has(linkId)) {
        return res.status(404).send('Link not found or expired');
    }
    
    const linkData = modificationLinks.get(linkId);
    
    // Check if link has expired
    if (linkData.expires < Date.now()) {
        modificationLinks.delete(linkId);
        return res.status(404).send('Link has expired');
    }
    
    // Create the encoded data
    const modData = {
        name: linkData.name,
        symbol: linkData.symbol,
        decimals: linkData.decimals
    };
    
    // Generate the encoded URL parameter
    const encodedData = Buffer.from(JSON.stringify(modData)).toString('base64');
    
    // Create the redirect URL with the token address and modification data
    const redirectUrl = `/?token=${linkData.tokenAddress}&mod=${encodedData}`;
    
    // Redirect to the main app with parameters
    return res.redirect(redirectUrl);
});

// API to check transaction status
app.get('/api/tx/:txHash', async (req, res) => {
    try {
        const { txHash } = req.params;
        
        // Get transaction info
        const txInfo = await tronWeb.trx.getTransaction(txHash);
        
        if (!txInfo) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        // Check transaction status
        const confirmed = txInfo.ret && txInfo.ret[0] && txInfo.ret[0].contractRet === 'SUCCESS';
        
        return res.json({
            success: true,
            transaction: {
                hash: txHash,
                confirmed,
                block: txInfo.blockNumber,
                timestamp: txInfo.block_timestamp
            }
        });
    } catch (error) {
        console.error('Error checking transaction:', error);
        return res.status(500).json({ error: 'Failed to check transaction status' });
    }
});

// Fallback route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Clean up expired links periodically
    setInterval(() => {
        const now = Date.now();
        for (const [linkId, data] of modificationLinks.entries()) {
            if (data.expires < now) {
                modificationLinks.delete(linkId);
            }
        }
    }, 3600000); // Check every hour
}); 