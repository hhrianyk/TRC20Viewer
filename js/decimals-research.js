document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Connection
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const connectionStatus = document.getElementById('connectionStatus');
    const connectionText = document.getElementById('connectionText');
    const walletAddress = document.getElementById('walletAddress');
    
    // DOM Elements - Token Creation
    const tokenName = document.getElementById('tokenName');
    const tokenSymbol = document.getElementById('tokenSymbol');
    const initialSupply = document.getElementById('initialSupply');
    const tokenDecimals = document.getElementById('tokenDecimals');
    const decimalsDisplay = document.getElementById('decimalsDisplay');
    const decimalOptions = document.querySelectorAll('.decimal-option');
    const createTokenBtn = document.getElementById('createTokenBtn');
    
    // DOM Elements - Token Management
    const tokenManagementCard = document.getElementById('tokenManagementCard');
    const tokenAddressSpan = document.getElementById('tokenAddress');
    const copyAddressBtn = document.getElementById('copyAddressBtn');
    const currentName = document.getElementById('currentName');
    const currentSymbol = document.getElementById('currentSymbol');
    const currentDecimals = document.getElementById('currentDecimals');
    const tokenBalance = document.getElementById('tokenBalance');
    const newDecimals = document.getElementById('newDecimals');
    const changeDecimalsBtn = document.getElementById('changeDecimalsBtn');
    const generateTestLinkBtn = document.getElementById('generateTestLinkBtn');
    const testLinkSection = document.getElementById('testLinkSection');
    const generatedTestLink = document.getElementById('generatedTestLink');
    const copyTestLinkBtn = document.getElementById('copyTestLinkBtn');
    const testQrcode = document.getElementById('testQrcode');
    
    // DOM Elements - Results
    const resultTokenAddress = document.getElementById('resultTokenAddress');
    const displayCorrect = document.getElementById('displayCorrect');
    const transferSuccess = document.getElementById('transferSuccess');
    const walletCompatible = document.getElementById('walletCompatible');
    const resultNotes = document.getElementById('resultNotes');
    const recordResultBtn = document.getElementById('recordResultBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Global variables
    let tronWeb = null;
    let currentAccount = null;
    let isConnected = false;
    let currentTokenAddress = null;
    let factoryContract = null;
    let testScenariosContract = null;
    let currentTokenContract = null;
    
    // Contract addresses - these should be updated after deployment
    const FACTORY_CONTRACT_ADDRESS = 'TX1234567890123456789012345678901234567890'; // Replace with actual address
    const TEST_SCENARIOS_CONTRACT_ADDRESS = 'TX1234567890123456789012345678901234567890'; // Replace with actual address
    
    // ABI definitions
    const FACTORY_ABI = [
        {
            "inputs": [
                {"name": "name", "type": "string"},
                {"name": "symbol", "type": "string"},
                {"name": "decimalsValue", "type": "uint8"},
                {"name": "initialSupply", "type": "uint256"}
            ],
            "name": "createResearchToken",
            "outputs": [{"name": "", "type": "address"}],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];
    
    const RESEARCH_TOKEN_ABI = [
        {"inputs": [], "name": "name", "outputs": [{"name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
        {"inputs": [], "name": "symbol", "outputs": [{"name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
        {"inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "stateMutability": "view", "type": "function"},
        {"inputs": [{"name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
        {"inputs": [{"name": "newDecimals", "type": "uint8"}], "name": "changeDecimals", "outputs": [], "stateMutability": "nonpayable", "type": "function"}
    ];
    
    const TEST_SCENARIOS_ABI = [
        {
            "inputs": [
                {"name": "token", "type": "address"},
                {"name": "displayCorrect", "type": "bool"},
                {"name": "transferSuccessful", "type": "bool"},
                {"name": "walletCompatible", "type": "bool"},
                {"name": "notes", "type": "string"}
            ],
            "name": "recordTestResult",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"name": "token", "type": "address"}],
            "name": "getTestResults",
            "outputs": [
                {
                    "components": [
                        {"name": "decimalsValue", "type": "uint8"},
                        {"name": "displayCorrect", "type": "bool"},
                        {"name": "transferSuccessful", "type": "bool"},
                        {"name": "walletCompatible", "type": "bool"},
                        {"name": "notes", "type": "string"}
                    ],
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    
    // Check if we're in a test link
    checkIfTestPage();
    
    // Event listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    tokenDecimals.addEventListener('input', updateDecimalsDisplay);
    decimalOptions.forEach(option => {
        option.addEventListener('click', setDecimalValue);
    });
    createTokenBtn.addEventListener('click', createTestToken);
    changeDecimalsBtn.addEventListener('click', changeTokenDecimals);
    generateTestLinkBtn.addEventListener('click', generateTestLink);
    copyAddressBtn.addEventListener('click', () => copyToClipboard(tokenAddressSpan.textContent));
    copyTestLinkBtn.addEventListener('click', () => copyToClipboard(generatedTestLink.value));
    recordResultBtn.addEventListener('click', recordResult);
    
    // Functions
    
    function updateDecimalsDisplay() {
        decimalsDisplay.textContent = tokenDecimals.value;
        
        // Update active state for decimal options
        decimalOptions.forEach(option => {
            if (parseInt(option.dataset.value) === parseInt(tokenDecimals.value)) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    function setDecimalValue(e) {
        const value = parseInt(e.target.dataset.value);
        tokenDecimals.value = value;
        updateDecimalsDisplay();
    }
    
    function checkIfTestPage() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('token') && urlParams.has('test')) {
            const tokenAddr = urlParams.get('token');
            resultTokenAddress.value = tokenAddr;
            
            // If on mobile and Trust Wallet is detected, show connect button
            if (isMobile() && !window.tronWeb) {
                showTrustWalletDeepLink(tokenAddr);
            }
        }
    }
    
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    function showTrustWalletDeepLink(tokenAddr) {
        const trustWalletLink = `tronlinkdapp://dapp_browser?search=https://${window.location.host}${window.location.pathname}?token=${tokenAddr}&test=true`;
        
        const trustLinkDiv = document.createElement('div');
        trustLinkDiv.className = 'alert alert-warning mt-3';
        trustLinkDiv.innerHTML = `
            <p>To test this token, please open in Trust Wallet's DApp Browser:</p>
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
                    
                    // Initialize contracts
                    await initializeContracts();
                    
                    // Load previous results
                    loadResults();
                    
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
            } else if (isMobile()) {
                // Redirect to Trust Wallet if on mobile
                const redirectUrl = `tronlinkdapp://dapp_browser?search=${window.location.href}`;
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
    
    async function initializeContracts() {
        try {
            factoryContract = await tronWeb.contract(FACTORY_ABI, FACTORY_CONTRACT_ADDRESS);
            testScenariosContract = await tronWeb.contract(TEST_SCENARIOS_ABI, TEST_SCENARIOS_CONTRACT_ADDRESS);
        } catch (error) {
            console.error('Error initializing contracts:', error);
        }
    }
    
    async function createTestToken() {
        if (!isConnected) {
            await connectWallet();
            if (!isConnected) return;
        }
        
        try {
            const name = tokenName.value;
            const symbol = tokenSymbol.value;
            const decimals = parseInt(tokenDecimals.value);
            const supply = parseInt(initialSupply.value);
            
            if (!name || !symbol || isNaN(decimals) || isNaN(supply)) {
                alert('Please fill in all fields correctly');
                return;
            }
            
            createTokenBtn.disabled = true;
            createTokenBtn.textContent = 'Deploying Token...';
            
            // Create token using factory
            const tokenAddress = await factoryContract.createResearchToken(
                name, symbol, decimals, supply
            ).send({
                feeLimit: 100000000
            });
            
            // Wait for the transaction to be processed
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Initialize the new token contract
            currentTokenAddress = tokenAddress;
            currentTokenContract = await tronWeb.contract(RESEARCH_TOKEN_ABI, tokenAddress);
            
            // Update UI
            tokenAddressSpan.textContent = tokenAddress;
            await updateTokenInfo();
            
            // Show token management section
            tokenManagementCard.style.display = 'block';
            
            createTokenBtn.disabled = false;
            createTokenBtn.textContent = 'Deploy Test Token';
            
            // Scroll to token management card
            tokenManagementCard.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error creating token:', error);
            alert('Error creating token: ' + error.message);
            createTokenBtn.disabled = false;
            createTokenBtn.textContent = 'Deploy Test Token';
        }
    }
    
    async function updateTokenInfo() {
        if (!currentTokenContract) return;
        
        try {
            const name = await currentTokenContract.name().call();
            const symbol = await currentTokenContract.symbol().call();
            const decimals = await currentTokenContract.decimals().call();
            const balance = await currentTokenContract.balanceOf(currentAccount).call();
            
            currentName.textContent = name;
            currentSymbol.textContent = symbol;
            currentDecimals.textContent = decimals;
            
            // Format balance based on decimals
            const formattedBalance = balance / (10 ** decimals);
            tokenBalance.textContent = formattedBalance.toLocaleString() + ' ' + symbol;
        } catch (error) {
            console.error('Error updating token info:', error);
        }
    }
    
    async function changeTokenDecimals() {
        if (!currentTokenContract) {
            alert('No token selected');
            return;
        }
        
        try {
            const newDecimalsValue = parseInt(newDecimals.value);
            
            if (isNaN(newDecimalsValue) || newDecimalsValue < 0 || newDecimalsValue > 30) {
                alert('Please enter a valid decimals value (0-30)');
                return;
            }
            
            changeDecimalsBtn.disabled = true;
            changeDecimalsBtn.textContent = 'Changing Decimals...';
            
            // Call the changeDecimals function
            await currentTokenContract.changeDecimals(newDecimalsValue).send({
                feeLimit: 100000000
            });
            
            // Wait for the transaction to be processed
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Update token info
            await updateTokenInfo();
            
            changeDecimalsBtn.disabled = false;
            changeDecimalsBtn.textContent = 'Change Decimals';
            
            // Show success message
            alert('Decimals changed successfully to ' + newDecimalsValue);
        } catch (error) {
            console.error('Error changing decimals:', error);
            alert('Error changing decimals: ' + error.message);
            changeDecimalsBtn.disabled = false;
            changeDecimalsBtn.textContent = 'Change Decimals';
        }
    }
    
    function generateTestLink() {
        if (!currentTokenAddress) {
            alert('No token selected');
            return;
        }
        
        // Generate the link
        const baseUrl = window.location.origin + window.location.pathname;
        const testLink = `${baseUrl}?token=${currentTokenAddress}&test=true`;
        
        // Show the link section
        testLinkSection.style.display = 'block';
        generatedTestLink.value = testLink;
        
        // Generate QR code
        testQrcode.innerHTML = '';
        new QRCode(testQrcode, {
            text: testLink,
            width: 128,
            height: 128
        });
        
        // Scroll to link section
        testLinkSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        alert('Copied to clipboard!');
    }
    
    async function recordResult() {
        if (!isConnected) {
            await connectWallet();
            if (!isConnected) return;
        }
        
        const tokenAddr = resultTokenAddress.value;
        
        if (!tokenAddr) {
            alert('Please enter a token address');
            return;
        }
        
        try {
            recordResultBtn.disabled = true;
            recordResultBtn.textContent = 'Recording Result...';
            
            // Record test result
            await testScenariosContract.recordTestResult(
                tokenAddr,
                displayCorrect.checked,
                transferSuccess.checked,
                walletCompatible.checked,
                resultNotes.value
            ).send({
                feeLimit: 100000000
            });
            
            // Wait for the transaction to be processed
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Reset form
            displayCorrect.checked = false;
            transferSuccess.checked = false;
            walletCompatible.checked = false;
            resultNotes.value = '';
            
            // Reload results
            await loadResults();
            
            recordResultBtn.disabled = false;
            recordResultBtn.textContent = 'Record Result';
            
            alert('Test result recorded successfully');
        } catch (error) {
            console.error('Error recording result:', error);
            alert('Error recording result: ' + error.message);
            recordResultBtn.disabled = false;
            recordResultBtn.textContent = 'Record Result';
        }
    }
    
    async function loadResults() {
        if (!testScenariosContract) return;
        
        try {
            // Clear current results
            resultsContainer.innerHTML = '';
            
            // If we have a specific token in the URL, load results for that token
            const urlParams = new URLSearchParams(window.location.search);
            let tokenToLoad = null;
            
            if (urlParams.has('token')) {
                tokenToLoad = urlParams.get('token');
            } else if (currentTokenAddress) {
                tokenToLoad = currentTokenAddress;
            }
            
            if (!tokenToLoad) return;
            
            // Get results for this token
            const results = await testScenariosContract.getTestResults(tokenToLoad).call();
            
            // Display results
            if (results && results.length > 0) {
                results.forEach((result, index) => {
                    const resultElement = document.createElement('div');
                    resultElement.className = 'result-item p-3 mb-3 bg-light';
                    resultElement.innerHTML = `
                        <h6>Test #${index + 1} - Decimals: ${result.decimalsValue}</h6>
                        <div class="row">
                            <div class="col-md-4">
                                <span class="badge ${result.displayCorrect ? 'bg-success' : 'bg-danger'}">
                                    Display: ${result.displayCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                            </div>
                            <div class="col-md-4">
                                <span class="badge ${result.transferSuccessful ? 'bg-success' : 'bg-danger'}">
                                    Transfer: ${result.transferSuccessful ? 'Successful' : 'Failed'}
                                </span>
                            </div>
                            <div class="col-md-4">
                                <span class="badge ${result.walletCompatible ? 'bg-success' : 'bg-danger'}">
                                    Wallet: ${result.walletCompatible ? 'Compatible' : 'Incompatible'}
                                </span>
                            </div>
                        </div>
                        <p class="mt-2">${result.notes}</p>
                    `;
                    resultsContainer.appendChild(resultElement);
                });
            } else {
                resultsContainer.innerHTML = '<p>No results found for this token</p>';
            }
        } catch (error) {
            console.error('Error loading results:', error);
            resultsContainer.innerHTML = '<p>Error loading results</p>';
        }
    }
}); 