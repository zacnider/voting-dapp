let provider;
let signer;
let contract;
let blockchains = [];
let maxVotes = 0;
let isConnected = false;
let darkMode = localStorage.getItem('darkMode') === 'true';  
                  
                  // Contract address and ABI
                    const CONTRACT_ADDRESS = '0xf28426AE79b4122A7ae0FF2ed73086fFf65D3112';
                    const CONTRACT_ABI = [
                        
                            {
                                "inputs": [],
                                "stateMutability": "nonpayable",
                                "type": "constructor"
                            },
                            {
                                "anonymous": false,
                                "inputs": [
                                    {
                                        "indexed": false,
                                        "internalType": "string",
                                        "name": "name",
                                        "type": "string"
                                    },
                                    {
                                        "indexed": false,
                                        "internalType": "uint256",
                                        "name": "index",
                                        "type": "uint256"
                                    }
                                ],
                                "name": "BlockchainAdded",
                                "type": "event"
                            },
                            {
                                "anonymous": false,
                                "inputs": [
                                    {
                                        "indexed": true,
                                        "internalType": "address",
                                        "name": "voter",
                                        "type": "address"
                                    },
                                    {
                                        "indexed": true,
                                        "internalType": "uint256",
                                        "name": "blockchainIndex",
                                        "type": "uint256"
                                    }
                                ],
                                "name": "VoteCast",
                                "type": "event"
                            },
                            {
                                "anonymous": false,
                                "inputs": [
                                    {
                                        "indexed": true,
                                        "internalType": "address",
                                        "name": "user",
                                        "type": "address"
                                    },
                                    {
                                        "indexed": false,
                                        "internalType": "uint256",
                                        "name": "amount",
                                        "type": "uint256"
                                    },
                                    {
                                        "indexed": false,
                                        "internalType": "uint256",
                                        "name": "newTotal",
                                        "type": "uint256"
                                    }
                                ],
                                "name": "XPEarned",
                                "type": "event"
                            },
                            {
                                "inputs": [],
                                "name": "MAX_DAILY_VOTES",
                                "outputs": [
                                    {
                                        "internalType": "uint256",
                                        "name": "",
                                        "type": "uint256"
                                    }
                                ],
                                "stateMutability": "view",
                                "type": "function"
                            },
                            {
                                "inputs": [
                                    {
                                        "internalType": "string",
                                        "name": "_name",
                                        "type": "string"
                                    }
                                ],
                                "name": "addBlockchain",
                                "outputs": [],
                                "stateMutability": "nonpayable",
                                "type": "function"
                            },
                            {
                                "inputs": [
                                    {
                                        "internalType": "uint256",
                                        "name": "",
                                        "type": "uint256"
                                    }
                                ],
                                "name": "blockchains",
                                "outputs": [
                                    {
                                        "internalType": "string",
                                        "name": "name",
                                        "type": "string"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "votes",
                                        "type": "uint256"
                                    }
                                ],
                                "stateMutability": "view",
                                "type": "function"
                            },
                            {
                                "inputs": [
                                    {
                                        "internalType": "address",
                                        "name": "",
                                        "type": "address"
                                    }
                                ],
                                "name": "dailyVotesUsed",
                                "outputs": [
                                    {
                                        "internalType": "uint256",
                                        "name": "",
                                        "type": "uint256"
                                    }
                                ],
                                "stateMutability": "view",
                                "type": "function"
                            },
                            {
                                "inputs": [],
                                "name": "getBlockchains",
                                "outputs": [
                                    {
                                        "components": [
                                            {
                                                "internalType": "string",
                                                "name": "name",
                                                "type": "string"
                                            },
                                            {
                                                "internalType": "uint256",
                                                "name": "votes",
                                                "type": "uint256"
                                            }
                                        ],
                                        "internalType": "struct BlockchainVoting.Blockchain[]",
                                        "name": "",
                                        "type": "tuple[]"
                                    }
                                ],
                                "stateMutability": "view",
                                "type": "function"
                            },
                            {
                                "inputs": [],
                                "name": "getRemainingVotes",
                                "outputs": [
                                    {
                                        "internalType": "uint256",
                                        "name": "",
                                        "type": "uint256"
                                    }
                                ],
                                "stateMutability": "view",
                                "type": "function"
                            },
                            {
                                "inputs": [
                                    {
                                        "internalType": "address",
                                        "name": "_user",
                                        "type": "address"
                                    }
                                ],
                                "name": "getUserXP",
                                "outputs": [
                                    {
                                        "internalType": "uint256",
                                        "name": "",
                                        "type": "uint256"
                                    }
                                ],
                                "stateMutability": "view",
                                "type": "function"
                            },
                            {
                                "inputs": [
                                    {
                                        "internalType": "address",
                                        "name": "",
                                        "type": "address"
                                    }
                                ],
                                "name": "lastVoteTime",
                                "outputs": [
                                    {
                                        "internalType": "uint256",
                                        "name": "",
                                        "type": "uint256"
                                    }
                                ],
                                "stateMutability": "view",
                                "type": "function"
                            },
                            {
                                "inputs": [
                                    {
                                        "internalType": "address",
                                        "name": "",
                                        "type": "address"
                                    }
                                ],
                                "name": "userXP",
                                "outputs": [
                                    {
                                        "internalType": "uint256",
                                        "name": "",
                                        "type": "uint256"
                                    }
                                ],
                                "stateMutability": "view",
                                "type": "function"
                            },
                            {
                                "inputs": [
                                    {
                                        "internalType": "uint256",
                                        "name": "_blockchainIndex",
                                        "type": "uint256"
                                    }
                                ],
                                "name": "vote",
                                "outputs": [],
                                "stateMutability": "nonpayable",
                                "type": "function"
                            }
                        ]
                
                    
                    // Blockchain logoları için renkler
                    const LOGO_COLORS = [
                        "linear-gradient(135deg, #a29bfe, #6c5ce7)",
                        "linear-gradient(135deg, #74b9ff, #0984e3)",
                        "linear-gradient(135deg, #55efc4, #00b894)",
                        "linear-gradient(135deg, #ffeaa7, #fdcb6e)",
                        "linear-gradient(135deg, #ff9a9e, #fad0c4)",
                        "linear-gradient(135deg, #fab1a0, #e17055)",
                        "linear-gradient(135deg, #81ecec, #00cec9)"
                    ];
                    
                    // Blockchain ikonları
                    const BLOCKCHAIN_ICONS = {
                        "Ethereum": "fab fa-ethereum",
                        "Bitcoin": "fab fa-bitcoin",
                        "Binance Smart Chain": "fas fa-coins",
                        "Solana": "fas fa-bolt",
                        "Polygon": "fas fa-hexagon",
                        "Monad": "fas fa-code-branch",
                        "default": "fas fa-link"
                    };
                    
                    
                    
                    // Sayfa yüklendiğinde çalışacak kodlar
                    document.addEventListener('DOMContentLoaded', () => {
                        // Dark mode kontrolü
                        if (darkMode) {
                            document.body.classList.add('dark-theme');
                            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
                        }
                        
                        // Tab geçişleri
                        document.querySelectorAll('.tab').forEach(tab => {
                            tab.addEventListener('click', () => {
                                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                                tab.classList.add('active');
                                
                                const tabName = tab.getAttribute('data-tab');
                                document.querySelectorAll('.tab-content').forEach(content => {
                                    content.style.display = 'none';
                                });
                                document.getElementById(`${tabName}Tab`).style.display = 'block';
                            });
                        });
                        
                        // Sıralama değişikliği
                        document.getElementById('sortSelect').addEventListener('change', sortBlockchains);
            
            // Arama işlevi
            document.getElementById('searchInput').addEventListener('input', filterBlockchains);
            
            // Tema değiştirme
            document.getElementById('themeToggle').addEventListener('click', toggleTheme);
            
            // Bildirimi kapatma
            document.getElementById('closeNotification').addEventListener('click', hideNotification);
            
            // Cüzdan bağlama
            document.getElementById('connectWallet').addEventListener('click', connectWallet);
            
            // Sayfa yüklendiğinde blockchainleri getir (bağlantı olmasa bile görüntüleme için)
            initializeApp();
        });
        
        async function initializeApp() {
            try {
                // MetaMask veya diğer cüzdanlar otomatik bağlantı sağlayabilir
                if (window.ethereum && window.ethereum.selectedAddress) {
                    await connectWallet();
                } else {
                    // Cüzdan bağlı değilse örnek verilerle başlat
                    loadSampleData();
                }
            } catch (error) {
                console.error("Error initializing app:", error);
                loadSampleData();
            }
        }
        
        function loadSampleData() {
            // Örnek blockchain verileri
            const sampleBlockchains = [
                { name: "Ethereum", votes: 1250 },
                { name: "Bitcoin", votes: 1100 },
                { name: "Solana", votes: 950 },
                { name: "Binance Smart Chain", votes: 820 },
                { name: "Polygon", votes: 780 },
                { name: "Avalanche", votes: 650 },
                { name: "Cardano", votes: 620 },
                { name: "Polkadot", votes: 580 },
                { name: "Cosmos", votes: 520 },
                { name: "Near Protocol", votes: 480 },
                { name: "Monad", votes: 450 },
                { name: "Arbitrum", votes: 420 },
                { name: "Optimism", votes: 400 },
                { name: "zkSync", votes: 380 },
                { name: "StarkNet", votes: 350 },
                { name: "Fantom", votes: 320 },
                { name: "Tron", votes: 300 },
                { name: "Algorand", votes: 280 },
                { name: "Hedera", votes: 260 },
                { name: "Flow", votes: 240 },
                { name: "Internet Computer", votes: 220 },
                { name: "Aptos", votes: 200 },
                { name: "Sui", votes: 180 },
                { name: "Tezos", votes: 160 },
                { name: "Harmony", votes: 140 },
                { name: "Celo", votes: 120 },
                { name: "Kaspa", votes: 100 },
                { name: "TON", votes: 80 },
                { name: "Filecoin", votes: 60 },
                { name: "Mina Protocol", votes: 40 }
            ];
            
            blockchains = sampleBlockchains;
            maxVotes = Math.max(...blockchains.map(b => b.votes));
            renderBlockchains();
            renderSampleLeaderboard();
        }
        
        function renderSampleLeaderboard() {
            const leaderboardBody = document.getElementById('leaderboardBody');
            leaderboardBody.innerHTML = '';
            
            const sampleUsers = [
                { address: "0x1234...5678", xp: 2500, level: 25 },
                { address: "0x8765...4321", xp: 1800, level: 18 },
                { address: "0x9876...5432", xp: 1600, level: 16 },
                { address: "0x5432...9876", xp: 1400, level: 14 },
                { address: "0x4321...8765", xp: 1200, level: 12 },
                { address: "0x3456...7890", xp: 1000, level: 10 },
                { address: "0x7890...3456", xp: 800, level: 8 },
                { address: "0x2345...6789", xp: 600, level: 6 },
                { address: "0x6789...2345", xp: 400, level: 4 },
                { address: "0x5678...1234", xp: 200, level: 2 }
            ];
            
            sampleUsers.forEach((user, index) => {
                const row = document.createElement('tr');
                
                const rankClass = index < 3 ? `rank-${index + 1}` : 'rank-other';
                
                row.innerHTML = `
                    <td>
                        <div class="rank ${rankClass}">${index + 1}</div>
                    </td>
                    <td>
                        <div class="user-row">
                            <div class="user-avatar">${user.address.charAt(2).toUpperCase()}</div>
                            <div class="user-details">
                                <div class="user-name">User ${index + 1}</div>
                                <div class="user-address-small">${user.address}</div>
                            </div>
                        </div>
                    </td>
                    <td class="xp-col">${user.xp} XP</td>
                    <td>Level ${user.level}</td>
                `;
                
                leaderboardBody.appendChild(row);
            });
        }
        
       async function connectWallet() {
    if (!window.ethereum) {
        showNotification('Wallet Not Found', 'Please install MetaMask or another Ethereum wallet!', 'warning');
        return;
    }

    try {
        document.getElementById('connectButtonText').textContent = 'Connecting...';
        
        // MetaMask bağlantısı
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        // Kontrat bağlantısı
        try {
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        } catch (contractError) {
            console.error("Contract initialization error:", contractError);
            document.getElementById('connectButtonText').textContent = 'Connect Wallet';
            showNotification('Contract Error', 'Could not initialize the smart contract.', 'error');
            return;
        }
        
        // Kullanıcı adresi
        const address = await signer.getAddress();
        const userAddressElement = document.getElementById('userAddress');
        if (userAddressElement) {
            userAddressElement.textContent = shortenAddress(address);
        }
        
        // UI güncelle
        const connectButton = document.getElementById('connectWallet');
        const connectButtonTextElement = document.getElementById('connectButtonText');
        
        if (connectButtonTextElement) {
            connectButtonTextElement.textContent = 'Connected';
        }
        
        if (connectButton) {
            connectButton.disabled = true;
        }
        
        isConnected = true;
        
        // Monad Testnet'e geçiş yap - hatayı yutarak devam et
        try {
            await switchToMonadTestnet();
        } catch (networkError) {
            console.error("Network switching error:", networkError);
            // Devam et, kritik değil
        }
        
        // Kullanıcı istatistiklerini güncelle
        try {
            await updateUserStats();
        } catch (statsError) {
            console.error("Error updating user stats:", statsError);
            // Devam et, kritik değil
        }
        
        // Blokzincirleri yükle
        try {
            await loadBlockchains();
        } catch (loadError) {
            console.error("Error loading blockchains:", loadError);
            showNotification('Data Error', 'Could not load blockchain data.', 'warning');
        }
        
        showNotification('Connected!', 'Your wallet has been successfully connected.', 'success');
        
    } catch (error) {
        console.error("Connection error:", error);
        const connectButtonTextElement = document.getElementById('connectButtonText');
        if (connectButtonTextElement) {
            connectButtonTextElement.textContent = 'Connect Wallet';
        }
        showNotification('Connection Failed', 'Could not connect to your wallet.', 'error');
    }
}
// Monad Testnet'e geçiş yapma fonksiyonu
async function switchToMonadTestnet() {
    try {
        console.log("Attempting to switch to Monad Testnet...");
        
        // Önce ağın zaten ekli olup olmadığını kontrol et
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x98A' }], // 2442 decimal = 0x98A hex
        });
        console.log("Successfully switched to Monad Testnet");
        
    } catch (switchError) {
        console.log("Switch error:", switchError);
        
        // Ağ ekli değilse ekle (4902 error code)
        if (switchError.code === 4902) {
            try {
                console.log("Adding Monad Testnet to wallet...");
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x98A',
                        chainName: 'Monad Testnet',
                        nativeCurrency: {
                            name: 'Monad',
                            symbol: 'MONAD',
                            decimals: 18
                        },
                        rpcUrls: ['https://rpc.monad.xyz/testnet'],
                        blockExplorerUrls: ['https://explorer.monad.xyz/']
                    }]
                });
                console.log("Successfully added Monad Testnet");
                
            } catch (addError) {
                console.error("Error adding Monad Testnet:", addError);
                showNotification('Network Error', 'Failed to add Monad Testnet. Please add it manually.', 'warning');
                // Kritik hata değil, devam et
            }
        } else if (switchError.code === 4001) {
            // Kullanıcı reddettiğinde
            console.log("User rejected the request to switch networks");
            showNotification('Network Switch Rejected', 'You need to switch to Monad Testnet to use this application.', 'warning');
        } else {
            console.error("Unknown error switching networks:", switchError);
            showNotification('Network Error', 'Could not switch to Monad Testnet.', 'warning');
        }
    }
}

// Kullanıcı istatistiklerini güncelleme fonksiyonu
async function updateUserStats() {
    try {
        if (!isConnected || !contract) {
            console.log("Not connected or contract not initialized");
            return;
        }

        // Kalan oyları al
        const remainingVotes = await contract.getRemainingVotes();
        const remainingVotesElement = document.getElementById('remainingVotes');
        if (remainingVotesElement) {
            remainingVotesElement.textContent = remainingVotes.toString();
        }
        
        // Kullanıcı XP'sini al
        const address = await signer.getAddress();
        const userXP = await contract.getUserXP(address);
        const userXPElement = document.getElementById('userXP');
        if (userXPElement) {
            userXPElement.textContent = userXP.toString();
        }
        
        // İlerleme çubuğunu güncelle - HATA BURADA
        const progressBar = document.getElementById('xpProgressBar');
        if (progressBar) {
            // İlerleme çubuğunu güncelle
            const xpPercentage = Math.min(100, (userXP.toNumber() / 1000) * 100);
            progressBar.style.width = `${xpPercentage}%`;
            progressBar.setAttribute('aria-valuenow', xpPercentage);
        } else {
            console.log("Progress bar element not found");
        }
        
        console.log("User stats updated successfully");
    } catch (error) {
        console.error("Error updating user stats:", error);
        // Kritik olmayan hatayı göster ama uygulamayı çalıştırmaya devam et
    }
}
        
        async function loadBlockchains() {
            if (!isConnected) return;
            
            try {
                const blockchainGrid = document.getElementById('blockchainGrid');
                blockchainGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
                
                const blockchainData = await contract.getBlockchains();
                blockchains = blockchainData.map((blockchain, index) => ({
                    name: blockchain.name,
                    votes: blockchain.votes.toNumber(),
                    index: index
                }));
                
                maxVotes = Math.max(...blockchains.map(b => b.votes));
                
                renderBlockchains();
                
            } catch (error) {
                console.error("Error loading blockchains:", error);
                showNotification('Error', 'Could not load blockchain data.', 'error');
            }
        }
        
        function renderBlockchains() {
            const blockchainGrid = document.getElementById('blockchainGrid');
            blockchainGrid.innerHTML = '';
            
            const sortSelect = document.getElementById('sortSelect');
            const sortValue = sortSelect.value;
            const searchInput = document.getElementById('searchInput').value.toLowerCase();
            
            // Sıralama ve filtreleme
            let displayedBlockchains = [...blockchains];
            
            // Arama filtresi
            if (searchInput) {
                displayedBlockchains = displayedBlockchains.filter(blockchain => 
                    blockchain.name.toLowerCase().includes(searchInput)
                );
            }
            
            // Sıralama
            switch (sortValue) {
                case 'name':
                    displayedBlockchains.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'votes-high':
                    displayedBlockchains.sort((a, b) => b.votes - a.votes);
                    break;
                case 'votes-low':
                    displayedBlockchains.sort((a, b) => a.votes - b.votes);
                    break;
                case 'popularity':
                default:
                    displayedBlockchains.sort((a, b) => b.votes - a.votes);
            }
            
            // Render
            displayedBlockchains.forEach((blockchain, i) => {
                const card = document.createElement('div');
                card.className = 'blockchain-card';
                
                const logoColor = LOGO_COLORS[i % LOGO_COLORS.length];
                const icon = BLOCKCHAIN_ICONS[blockchain.name] || BLOCKCHAIN_ICONS.default;
                
                const voteProgress = maxVotes > 0 ? (blockchain.votes / maxVotes * 100) : 0;
                
                card.innerHTML = `
                    <div class="blockchain-logo" style="background: ${logoColor};">
                        <i class="${icon}"></i>
                    </div>
                    <div class="blockchain-name">${blockchain.name}</div>
                    <div class="blockchain-votes">
                        <i class="fas fa-poll"></i> ${blockchain.votes} votes
                    </div>
                    <div class="vote-bar">
                        <div class="vote-progress" style="width: ${voteProgress}%"></div>
                    </div>
                    <button class="vote-button" data-index="${blockchain.index || i}">
                        <i class="fas fa-vote-yea"></i> Vote
                    </button>
                `;
                
                blockchainGrid.appendChild(card);
                
                // Animasyon için gecikme ekle
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, i * 50);
            });
            
            // Oy verme düğmelerine olay dinleyicileri ekle
            document.querySelectorAll('.vote-button').forEach(button => {
                button.addEventListener('click', () => {
                    const index = button.getAttribute('data-index');
                    voteForBlockchain(index);
                });
            });
        }
        
        function sortBlockchains() {
            renderBlockchains();
        }
        
        function filterBlockchains() {
            renderBlockchains();
        }
        
        async function voteForBlockchain(index) {
            if (!isConnected) {
                showNotification('Not Connected', 'Please connect your wallet first!', 'warning');
                return;
            }
            
            try {
                const tx = await contract.vote(index);
                
                // Oylama beklerken düğmeyi devre dışı bırak
                const buttons = document.querySelectorAll('.vote-button');
                buttons.forEach(btn => {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Voting...';
                });
                
                await tx.wait();
                
                // Konfeti efekti
                createConfetti();
                
                showNotification('Vote Successful!', 'Your vote has been recorded and you earned 10 XP!', 'success');
                
                await updateUserStats();
                await loadBlockchains();
                
            } catch (error) {
                console.error("Error voting:", error);
                
                if (error.message.includes("Daily voting limit reached")) {
                    showNotification('Limit Reached', 'You have reached your daily voting limit of 20 votes.', 'warning');
                } else {
                    showNotification('Error', 'Failed to cast your vote. Please try again.', 'error');
                }
                
                // Düğmeleri tekrar etkinleştir
                const buttons = document.querySelectorAll('.vote-button');
                buttons.forEach(btn => {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-vote-yea"></i> Vote';
                });
            }
        }
        
        function showNotification(title, message, type = 'success') {
            const notification = document.getElementById('notification');
            const notificationTitle = document.getElementById('notificationTitle');
            const notificationMessage = document.getElementById('notificationMessage');
            const notificationIcon = document.getElementById('notificationIcon');
            
            notification.className = 'notification ' + type;
            notificationTitle.textContent = title;
            notificationMessage.textContent = message;
            
            notificationIcon.className = 'notification-icon ' + type;
            
            let iconClass = 'fas fa-check-circle';
            if (type === 'error') iconClass = 'fas fa-times-circle';
            if (type === 'warning') iconClass = 'fas fa-exclamation-triangle';
            
            notificationIcon.innerHTML = `<i class="${iconClass}"></i>`;
            
            notification.classList.add('show');
            
            // 5 saniye sonra bildirim kaybolur
            setTimeout(() => {
                hideNotification();
            }, 5000);
        }
        
        function hideNotification() {
            const notification = document.getElementById('notification');
            notification.classList.remove('show');
        }
        
        function toggleTheme() {
            darkMode = !darkMode;
            document.body.classList.toggle('dark-theme');
            
            const themeToggle = document.getElementById('themeToggle');
            themeToggle.innerHTML = darkMode ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
                
            localStorage.setItem('darkMode', darkMode);
        }
        
        function shortenAddress(address) {
            return address.substring(0, 6) + '...' + address.substring(address.length - 4);
        }
        
        function createConfetti() {
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
            
            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                
                // Rastgele özellikler
                const color = colors[Math.floor(Math.random() * colors.length)];
                const left = Math.random() * 100;
                const size = Math.random() * 10 + 5;
                const animationDuration = Math.random() * 3 + 2;
                
                confetti.style.backgroundColor = color;
                confetti.style.left = left + 'vw';
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
                confetti.style.opacity = '1';
                confetti.style.animation = `fall ${animationDuration}s linear forwards`;
                
                document.body.appendChild(confetti);
                
                // Animasyon bittikten sonra kaldır
                setTimeout(() => {
                    document.body.removeChild(confetti);
                }, animationDuration * 1000);
            }
        }
