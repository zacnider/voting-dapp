// App.js veya main.js başlangıcında
window.addEventListener('load', function() {
  if (typeof window.ethereum === 'undefined') {
    console.log('MetaMask yüklü değil!');
    // MetaMask'in yüklü olmadığını kullanıcıya bildiren bir UI gösterin
    document.getElementById('metamask-warning').style.display = 'block';
  } else {
    console.log('MetaMask yüklü!');
    // Ethereum ile etkileşime geçen kodunuz burada
    startApp();
  }
});

// Web3 ve kontrat değişkenleri
let web3;
let votingContract;
let contractAddress = '0x95e59390829E3c50C6e21858b4db3659B4af8Ccc'; // Kontrat deploy edildikten sonra bu adresi güncelleyin
let currentAccount = null;
let isOwner = false;
let votingActive = false;
let selectedCandidateId = null;
let updateInterval;

// DOM yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    // Connect düğmesine tıklama olayı ekle
    document.getElementById('connectBtn').addEventListener('click', connectWallet);
    
    // Admin form ve düğme olaylarını ekle
    document.getElementById('addCandidateForm').addEventListener('submit', addCandidate);
    document.getElementById('startVotingBtn').addEventListener('click', startVoting);
    document.getElementById('endVotingBtn').addEventListener('click', endVoting);
    document.getElementById('voteBtn').addEventListener('click', castVote);
    
    // Ethereum provider kontrolü
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        checkConnection();
    } else {
        showError("Please install MetaMask or another Web3 provider to use this application.");
    }
});


// Cüzdan bağlantısını kontrol et
async function checkConnection() {
try {
    // Ethereum provider kontrolü
    if (typeof window.ethereum === 'undefined') {
      console.log("MetaMask yüklü değil!");
      // UI'da bir uyarı göster
      return false;
    }

    // Cüzdan bağlantısı kontrolü
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const currentAccount = accounts;
    
    // currentAccount kontrolü
    if (currentAccount && typeof currentAccount === 'string') {
      console.log("Bağlandı:", currentAccount);
      // Adresin kısaltılmış halini göster
      const shortAddress = currentAccount.substring(0, 6) + "..." + currentAccount.substring(currentAccount.length - 4);
      document.getElementById('wallet-address').textContent = shortAddress;
      return true;
    } else {
      console.log("Cüzdan bağlı değil!");
      return false;
    }
  } catch (error) {
    console.error("Bağlantı kontrolü sırasında hata:", error);
    return false;
  }
}

// Cüzdana bağlan
async function connectWallet() {
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        location.reload(); // Sayfayı yenile
    } catch (error) {
        console.error("Error connecting to wallet:", error);
        showError("Failed to connect wallet: " + error.message);
    }
}

// Kontratı başlat
async function initializeContract() {
    try {
        // Kontrat ABI'sini tanımla (Remix veya Truffle compile sonrası elde edilir)
        const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_info",
				"type": "string"
			}
		],
		"name": "addCandidate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
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
				"internalType": "uint256",
				"name": "candidateId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "CandidateAdded",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "endVoting",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_durationInMinutes",
				"type": "uint256"
			}
		],
		"name": "startVoting",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_candidateId",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "candidateId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			}
		],
		"name": "VoteCast",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "VotingEnded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			}
		],
		"name": "VotingStarted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "candidates",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "info",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "voteCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "candidatesCount",
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
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "getCandidate",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "info",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "voteCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getVotingStatus",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "timeRemaining",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getWinner",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "winnerId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "winnerName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "winnerVotes",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
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
		"name": "voters",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "votingActive",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "votingEnd",
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
		"name": "votingStart",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}    
        ];
        
        // Kontrat instance'ını oluştur
        votingContract = new web3.eth.Contract(contractABI, contractAddress);
        
        // Kontrat sahibi kontrolü
        const owner = await votingContract.methods.owner().call();
        isOwner = owner.toLowerCase() === currentAccount.toLowerCase();
        
        // Uygulama verilerini yükle
        await loadApplicationData();
        
        // Periyodik güncelleme başlat
        startPeriodicUpdates();
        
    } catch (error) {
        console.error("Error initializing contract:", error);
        showError("Error initializing blockchain contract: " + error.message);
    }
}

// Uygulama verilerini yükle
async function loadApplicationData() {
    try {
        document.getElementById('loadingSpinner').classList.remove('d-none');
        
        // Oylama durumunu al
        const votingStatus = await votingContract.methods.getVotingStatus().call();
        votingActive = votingStatus.isActive;
        
        // Admin panelini göster/gizle
        if (isOwner) {
            document.getElementById('adminPanel').classList.remove('d-none');
            updateAdminPanel(votingActive);
        }
        
        // Adayları yükle
        const candidatesCount = await votingContract.methods.candidatesCount().call();
        const candidates = [];
        
        for (let i = 1; i <= candidatesCount; i++) {
            const candidate = await votingContract.methods.getCandidate(i).call();
            candidates.push({
                id: parseInt(candidate.id),
                name: candidate.name,
                info: candidate.info,
                voteCount: parseInt(candidate.voteCount)
            });
        }
        
        // Kullanıcı oy kullanmış mı kontrol et
        const hasVoted = await votingContract.methods.voters(currentAccount).call();
        
        // UI'ı güncelle
        updateUI(votingActive, votingStatus.timeRemaining, candidates, hasVoted);
        
        document.getElementById('loadingSpinner').classList.add('d-none');
    } catch (error) {
        console.error("Error loading application data:", error);
        showError("Error loading data from blockchain: " + error.message);
        document.getElementById('loadingSpinner').classList.add('d-none');
    }
}

// Periyodik güncellemeleri başlat
function startPeriodicUpdates() {
    // Önceki interval'ı temizle
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // Her 10 saniyede bir güncelle
    updateInterval = setInterval(loadApplicationData, 10000);
}

// Admin panelini güncelle
function updateAdminPanel(isVotingActive) {
    const addCandidateForm = document.getElementById('addCandidateForm');
    const startVotingBtn = document.getElementById('startVotingBtn');
    const endVotingBtn = document.getElementById('endVotingBtn');
    
    // Oylama aktifse aday eklemeyi ve oylamayı başlatmayı devre dışı bırak
    addCandidateForm.querySelectorAll('input, textarea').forEach(input => {
        input.disabled = isVotingActive;
    });
    addCandidateForm.querySelector('button').disabled = isVotingActive;
    
    startVotingBtn.disabled = isVotingActive;
    endVotingBtn.disabled = !isVotingActive;
}

// UI'ı güncelle
function updateUI(isVotingActive, timeRemaining, candidates, hasVoted) {
    const votingPanel = document.getElementById('votingPanel');
    const resultsPanel = document.getElementById('resultsPanel');
    
    if (isVotingActive) {
        // Oylama aktif - Oylama panelini göster
        votingPanel.classList.remove('d-none');
        resultsPanel.classList.add('d-none');
        
        // Kalan süreyi göster
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        document.getElementById('timeRemaining').textContent = `Time remaining: ${minutes}m ${seconds}s`;
        
        // Kullanıcı oy kullanmış mı kontrol et
        if (hasVoted) {
            document.getElementById('alreadyVotedAlert').classList.remove('d-none');
            document.getElementById('candidatesList').classList.add('d-none');
            document.getElementById('voteBtn').classList.add('d-none');
        } else {
            document.getElementById('alreadyVotedAlert').classList.add('d-none');
            document.getElementById('candidatesList').classList.remove('d-none');
            document.getElementById('voteBtn').classList.remove('d-none');
            
            // Adayları listele
            renderCandidates(candidates, false);
        }
    } else {
        // Oylama aktif değil - Sonuçlar panelini göster
        votingPanel.classList.add('d-none');
        resultsPanel.classList.remove('d-none');
        
        // Sonuçları göster
        renderResults(candidates);
    }
}

// Adayları render et
function renderCandidates(candidates, showVotes) {
    const candidatesContainer = document.getElementById('candidatesList');
    candidatesContainer.innerHTML = '';
    
    candidates.forEach(candidate => {
        const candidateCard = document.createElement('div');
        candidateCard.className = 'col-md-4';
        candidateCard.innerHTML = `
            <div class="card candidate-card" data-id="${candidate.id}">
                <div class="card-body">
                    <h5 class="card-title">${candidate.name}</h5>
                    <p class="card-text">${candidate.info}</p>
                    ${showVotes ? `<span class="badge bg-primary vote-count-badge">${candidate.voteCount} votes</span>` : ''}
                </div>
            </div>
        `;
        
        // Karta tıklama olayı ekle (oylama sırasında)
        if (!showVotes) {
            const card = candidateCard.querySelector('.candidate-card');
            card.addEventListener('click', function() {
                // Önceki seçimi temizle
                document.querySelectorAll('.candidate-card').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // Bu kartı seçili olarak işaretle
                this.classList.add('selected');
                
                // Seçilen aday ID'sini kaydet
                selectedCandidateId = parseInt(this.dataset.id);
                
                // Oy verme düğmesini etkinleştir
                document.getElementById('voteBtn').disabled = false;
            });
        }
        
        candidatesContainer.appendChild(candidateCard);
    });
}

// Sonuçları render et
function renderResults(candidates) {
    const resultsTable = document.getElementById('resultsTable');
    const noVotesAlert = document.getElementById('noVotesAlert');
    const winnerSection = document.getElementById('winnerSection');
    
    // Toplam oy sayısını hesapla
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
    
    if (totalVotes === 0) {
        // Hiç oy yoksa
        noVotesAlert.classList.remove('d-none');
        winnerSection.classList.add('d-none');
        resultsTable.innerHTML = '';
        return;
    }
    
    noVotesAlert.classList.add('d-none');
    
    // Adayları oy sayısına göre sırala
    const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
    
    // Kazananı göster
    const winner = sortedCandidates;
    if (winner.voteCount > 0) {
        winnerSection.classList.remove('d-none');
        document.getElementById('winnerName').textContent = winner.name;
        document.getElementById('winnerVotes').textContent = winner.voteCount;
    } else {
        winnerSection.classList.add('d-none');
    }
    
    // Sonuçları tabloya ekle
    resultsTable.innerHTML = '';
    sortedCandidates.forEach((candidate, index) => {
        const percentage = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${candidate.name}</td>
            <td>${candidate.voteCount}</td>
            <td>
                ${percentage}%
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${percentage}%" 
                        aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </td>
        `;
        
        resultsTable.appendChild(row);
    });
}

// Aday ekle
async function addCandidate(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('candidateName');
    const infoInput = document.getElementById('candidateInfo');
    
    const name = nameInput.value.trim();
    const info = infoInput.value.trim();
    
    if (!name || !info) {
        showAdminMessage('danger', 'Please fill in all fields');
        return;
    }
    
    try {
        showAdminMessage('info', 'Adding candidate, please wait...');
        
        await votingContract.methods.addCandidate(name, info).send({ from: currentAccount });
        
        showAdminMessage('success', 'Candidate added successfully!');
        
        // Formu temizle
        nameInput.value = '';
        infoInput.value = '';
        
        // Verileri yeniden yükle
        await loadApplicationData();
    } catch (error) {
        console.error("Error adding candidate:", error);
        showAdminMessage('danger', 'Error adding candidate: ' + error.message);
    }
}

// Oylamayı başlat
async function startVoting() {
    const durationInput = document.getElementById('votingDuration');
    const duration = parseInt(durationInput.value);
    
    if (isNaN(duration) || duration <= 0) {
        showAdminMessage('danger', 'Please enter a valid duration');
        return;
    }
    
    try {
        showAdminMessage('info', 'Starting voting, please wait...');
        
        await votingContract.methods.startVoting(duration).send({ from: currentAccount });
        
        showAdminMessage('success', 'Voting started successfully!');
        
        // Verileri yeniden yükle
        await loadApplicationData();
    } catch (error) {
        console.error("Error starting voting:", error);
        showAdminMessage('danger', 'Error starting voting: ' + error.message);
    }
}

// Oylamayı sonlandır
async function endVoting() {
    try {
        showAdminMessage('info', 'Ending voting, please wait...');
        
        await votingContract.methods.endVoting().send({ from: currentAccount });
        
        showAdminMessage('success', 'Voting ended successfully!');
        
        // Verileri yeniden yükle
        await loadApplicationData();
    } catch (error) {
        console.error("Error ending voting:", error);
        showAdminMessage('danger', 'Error ending voting: ' + error.message);
    }
}

// Oy kullan
async function castVote() {
    if (!selectedCandidateId) {
        alert('Please select a candidate first');
        return;
    }
    
    try {
        document.getElementById('voteBtn').disabled = true;
        document.getElementById('voteBtn').textContent = 'Voting...';
        
        await votingContract.methods.vote(selectedCandidateId).send({ from: currentAccount });
        
        alert('Your vote has been cast successfully!');
        
        // Verileri yeniden yükle
        await loadApplicationData();
    } catch (error) {
        console.error("Error casting vote:", error);
        alert('Error casting vote: ' + error.message);
        document.getElementById('voteBtn').disabled = false;
        document.getElementById('voteBtn').textContent = 'Cast Your Vote';
    }
}

// Admin mesajı göster
function showAdminMessage(type, message) {
    const adminMessage = document.getElementById('adminMessage');
    adminMessage.className = `alert alert-${type} mt-3`;
    adminMessage.textContent = message;
    adminMessage.classList.remove('d-none');
    
    // 5 saniye sonra mesajı gizle
    setTimeout(() => {
        adminMessage.classList.add('d-none');
    }, 5000);
}

// Hata mesajı göster
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    errorAlert.textContent = message;
    errorAlert.classList.remove('d-none');
    document.getElementById('loadingSpinner').classList.add('d-none');
}

// Bağlı olmadığını göster
function showNotConnected() {
    document.getElementById('accountAddress').textContent = 'Not connected';
    document.getElementById('connectBtn').textContent = 'Connect Wallet';
    document.getElementById('loadingSpinner').classList.add('d-none');
}

// Ağ adını al
function getNetworkName(networkId) {
    switch (networkId) {
        case 1:
            return 'Ethereum Main Network';
        case 5:
            return 'Goerli Test Network';
        case 11155111:
            return 'Sepolia Test Network';
        case 1337:
            return 'Local Network';
        default:
            return 'Unknown Network (' + networkId + ')';
    }
}
