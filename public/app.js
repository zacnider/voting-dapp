// Global değişkenler
let web3;
let votingContract;
let userAddress = ''; // String olarak tanımlı
let candidates = []; // Adaylar listesi
const TEST_MODE = false; // Test modu kapalı

// Uygulama başlatma
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await setupWeb3();
    await initializeApp();
  } catch (error) {
    console.error("Uygulama başlatılırken hata:", error);
    showErrorMessage("Uygulama başlatılırken bir hata oluştu. Lütfen sayfayı yenileyin.");
  }
});

// Web3 kurulumu
async function setupWeb3() {
  try {
    // Modern dapp tarayıcıları
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      console.log("Modern dapp tarayıcısı tespit edildi.");
      
      // Hesap değişikliklerini dinle
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Hesap değişti:', accounts);
        userAddress = accounts ? String(accounts) : '';
        initializeApp();
      });
      
      // Ağ değişikliklerini dinle
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Ağ değişti:', chainId);
        window.location.reload(); // En iyi uygulama: sayfayı yenile
      });
      
    } 
    // Legacy dapp tarayıcıları
    else if (window.web3) {
      web3 = new Web3(window.web3.currentProvider);
      console.log("Legacy web3 tarayıcısı tespit edildi.");
    } 
    // Web3 sağlayıcısı yok
    else {
      console.log("Web3 tarayıcısı tespit edilemedi.");
      showErrorMessage("Web3 uyumlu bir tarayıcı bulunamadı. MetaMask yüklemenizi öneririz.");
      return;
    }
    
    // Kontrat ABI ve adresini ayarla
    const contractAddress = '0x6753f6B230ee795FD518426e5FE0D25Df9E16E99'; // Kontrat adresinizi buraya yazın
    const contractABI = [
      // Kontratınızın ABI'sini buraya ekleyin
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
    
    // Kontrat nesnesini oluştur
    votingContract = new web3.eth.Contract(contractABI, contractAddress);
    console.log("Kontrat başarıyla oluşturuldu.");
    
  } catch (error) {
    console.error("Web3 kurulumu sırasında hata:", error);
    showErrorMessage("Web3 kurulumu sırasında bir hata oluştu.");
  }
}

// Cüzdan bağlantısını kontrol eden fonksiyon
async function checkConnection() {
  try {
    console.log("Cüzdan bağlantısı kontrol ediliyor...");
    
    // Test modunda ise ve test için bir adres tanımlanmışsa
    if (TEST_MODE && localStorage.getItem('testWalletAddress')) {
      userAddress = String(localStorage.getItem('testWalletAddress'));
      console.log("Test modu: Kaydedilmiş test adresi kullanılıyor:", userAddress);
      return true;
    }
    
    // Web3 tanımlı değilse
    if (!web3) {
      console.log("Web3 tanımlı değil, bağlantı kurulamadı.");
      return false;
    }
    
    try {
      // Hesapları kontrol et
      const accounts = await web3.eth.getAccounts();
      console.log("eth_accounts ile alınan hesaplar:", accounts);
      
      if (accounts.length === 0) {
        console.log("Hesap bulunamadı, bağlantı kurulamadı.");
        return false;
      }
      
      // İlk hesabı kullan (string olarak)
      userAddress = String(accounts);
      console.log("Bağlandı, hesap (string):", userAddress);
      
      // localStorage'a kaydet
      localStorage.setItem('walletConnected', 'true');
      
      // Bağlı cüzdan adresini göster
      const walletAddressElement = document.getElementById('wallet-address');
      if (walletAddressElement && userAddress) {
        // Adresin ilk 6 ve son 4 karakterini göster, ortasını gizle
        const shortAddress = String(userAddress).substring(0, 6) + '...' + String(userAddress).substring(String(userAddress).length - 4);
        walletAddressElement.textContent = shortAddress;
      }
      
      // Disconnect butonunu göster
      const disconnectButton = document.getElementById('disconnect-wallet');
      if (disconnectButton) {
        disconnectButton.style.display = 'block';
      }
      
      return true;
    } catch (error) {
      console.error("Hesap kontrolü sırasında hata:", error);
      return false;
    }
  } catch (error) {
    console.error("Bağlantı kontrolü sırasında hata:", error);
    return false;
  }
}

// Kullanıcının oy kullanıp kullanmadığını kontrol eden fonksiyon
async function checkUserVoted() {
  try {
    console.log("Kullanıcının oy kullanıp kullanmadığı kontrol ediliyor...");
    
    if (TEST_MODE) {
      // Test modunda oy durumunu localStorage'dan kontrol et
      const testVoted = localStorage.getItem('testVoted');
      console.log("Test modu oy durumu:", testVoted);
      return testVoted === 'true';
    }
    
    if (!userAddress) {
      console.log("Kullanıcı adresi bulunamadı, oy kontrolü yapılamıyor.");
      return false;
    }
    
    // userAddress'in string olduğundan emin ol
    const addressStr = String(userAddress).toLowerCase();
    
    // Önce localStorage'dan kontrol et (hızlı erişim için)
    const localStorageKey = `voted_${addressStr}`;
    const localStorageValue = localStorage.getItem(localStorageKey);
    
    if (localStorageValue === 'true') {
      console.log("Oy durumu localStorage'dan alındı: true");
      return true;
    }
    
    // Kontrat üzerinden kullanıcının oy kullanıp kullanmadığını kontrol et
    console.log("Oy kontrolü için kullanılan adres:", addressStr);
    
    if (!votingContract || !votingContract.methods) {
      console.error("Kontrat tanımlı değil veya methods özelliği yok");
      return false;
    }
    
    try {
      // voters mapping'ini kontrol et
      const hasVoted = await votingContract.methods.voters(addressStr).call();
      console.log("Kontrat üzerinden oy durumu:", hasVoted);
      
      // Oy durumunu localStorage'a kaydet
      if (hasVoted) {
        localStorage.setItem(localStorageKey, 'true');
      }
      
      return hasVoted;
    } catch (contractError) {
      console.error("Kontrat çağrısı hatası:", contractError);
      return false;
    }
  } catch (error) {
    console.error("Oy durumu kontrolü sırasında hata:", error);
    return false;
  }
}

// Aday verilerini yükleyen fonksiyon
async function loadCandidateData() {
  try {
    console.log("Aday verileri yükleniyor...");
    
    if (TEST_MODE) {
      // Test verileri
      candidates = [
        { id: 1, name: "Ethereum", info: "ETH", voteCount: 0 },
        { id: 2, name: "Binance Smart Chain", info: "BSC", voteCount: 0 },
        { id: 3, name: "Polygon", info: "MATIC", voteCount: 0 },
        { id: 4, name: "Solana", info: "SOL", voteCount: 0 },
        { id: 5, name: "Avalanche", info: "AVAX", voteCount: 0 }
      ];
      return;
    }
    
    try {
      // Kontrat nesnesinin varlığını kontrol et
      if (!votingContract || !votingContract.methods) {
        console.error("Kontrat tanımlı değil veya methods özelliği yok");
        return;
      }
      
      // Toplam aday sayısını al
      const candidatesCount = await votingContract.methods.candidatesCount().call();
      console.log("Aday sayısı:", candidatesCount);
      
      // Adayları yükle
      candidates = [];
      for (let i = 1; i <= candidatesCount; i++) {
        const candidate = await votingContract.methods.getCandidate(i).call();
        candidates.push({
          id: candidate.id,
          name: candidate.name,
          info: candidate.info,
          voteCount: candidate.voteCount
        });
      }
      
      console.log("Yüklenen adaylar:", candidates);
      
    } catch (error) {
      console.error("Aday verilerini yükleme hatası:", error);
    }
  } catch (error) {
    console.error("Aday verilerini yükleme hatası:", error);
    showErrorMessage("Aday verilerini yüklerken bir hata oluştu. Lütfen sayfayı yenileyin ve tekrar deneyin.");
  }
}

// Oy verme fonksiyonu
async function voteForCandidate(candidateId) {
  try {
    showLoading("Oy veriliyor...");
    
    if (TEST_MODE) {
      console.log("TEST MODU: Oy verme işlemi simüle ediliyor", candidateId);
      // Simüle edilmiş oy verme
      setTimeout(() => {
        // Seçilen aday için oy sayısını artır
        candidates = candidates.map(c => {
          if (c.id == candidateId) {
            return {...c, voteCount: parseInt(c.voteCount) + 1};
          }
          return c;
        });
        
        // Test için localStorage'a kaydet
        localStorage.setItem('testVoted', 'true');
        
        updateResults();
        createCandidateCards();
        showSuccessMessage("Test modu: Oyunuz başarıyla kaydedildi!");
        hideLoading();
      }, 1000);
      return;
    }
    
    // userAddress'in string olduğunu garanti et
    const addressStr = String(userAddress);
    console.log("Oy veren adres (tipi):", typeof addressStr, addressStr);
    
    // vote fonksiyonunu çağır
    await votingContract.methods.vote(candidateId).send({
      from: addressStr
    });
    
    // localStorage'a oy kullanıldığını kaydet
    localStorage.setItem(`voted_${addressStr.toLowerCase()}`, 'true');
    
    await loadCandidateData();
    
    showSuccessMessage("Oyunuz başarıyla kaydedildi!");
    hideLoading();
  } catch (error) {
    hideLoading();
    console.error("Oy verme işlemi sırasında hata:", error);
    
    // Kullanıcıya daha detaylı hata mesajı göster
    if (error.message && error.message.includes("already voted")) {
      showErrorMessage("Daha önce oy kullanmışsınız.");
    } else if (error.message && error.message.includes("Voting is not active")) {
      showErrorMessage("Oylama şu anda aktif değil.");
    } else if (error.message && error.message.includes("User denied")) {
      showErrorMessage("İşlem kullanıcı tarafından reddedildi.");
    } else {
      showErrorMessage("Oy verme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  }
}

// Oylama durumunu UI'da gösteren fonksiyon
function updateVotingStatus(isActive, timeRemaining) {
  const statusElement = document.getElementById('voting-status');
  const timeElement = document.getElementById('time-remaining');
  
  if (!statusElement || !timeElement) return;
  
  if (isActive) {
    statusElement.textContent = "Oylama aktif";
    statusElement.classList.add('active');
    statusElement.classList.remove('inactive');
    
    // Kalan süreyi göster
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    timeElement.textContent = `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    // Süreyi her saniye güncelle
    if (window.countdownInterval) {
      clearInterval(window.countdownInterval);
    }
    
    let remainingTime = timeRemaining;
    window.countdownInterval = setInterval(() => {
      remainingTime--;
      
      if (remainingTime <= 0) {
        clearInterval(window.countdownInterval);
        updateVotingStatus(false, 0);
        return;
      }
      
      const h = Math.floor(remainingTime / 3600);
      const m = Math.floor((remainingTime % 3600) / 60);
      const s = remainingTime % 60;
      
      timeElement.textContent = `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }, 1000);
    
  } else {
    statusElement.textContent = "Oylama kapalı";
    statusElement.classList.add('inactive');
    statusElement.classList.remove('active');
    timeElement.textContent = "-";
    
    if (window.countdownInterval) {
      clearInterval(window.countdownInterval);
    }
  }
}

// Oy durumuna göre UI'ı güncelleyen fonksiyon
function updateVotingUI(hasVoted) {
  const voteButtons = document.querySelectorAll('.vote-button');
  const votedMessage = document.getElementById('voted-message');
  
  if (hasVoted) {
    // Kullanıcı oy kullanmışsa
    voteButtons.forEach(button => {
      button.disabled = true;
      button.textContent = "Oy verildi";
    });
    
    if (votedMessage) {
      votedMessage.style.display = 'block';
    }
  } else {
    // Kullanıcı henüz oy kullanmamışsa
    voteButtons.forEach(button => {
      button.disabled = false;
      button.textContent = "Oy ver";
    });
    
    if (votedMessage) {
      votedMessage.style.display = 'none';
    }
  }
}

// Genel UI güncellemesi
function updateUI() {
  console.log("UI güncelleniyor...");
  
  // Aday kartlarını oluştur
  createCandidateCards();
  
  // Sonuçları güncelle
  updateResults();
}

// Aday kartlarını oluşturan fonksiyon
function createCandidateCards() {
  const candidateContainer = document.getElementById('candidate-container');
  if (!candidateContainer) return;
  
  // Önce mevcut kartları temizle
  candidateContainer.innerHTML = '';
  
  // Adayları sırala (oy sayısına göre azalan sırada)
  const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  
  // Her aday için kart oluştur
  sortedCandidates.forEach(candidate => {
    const card = document.createElement('div');
    card.className = 'candidate-card';
    
    const name = document.createElement('h3');
    name.textContent = candidate.name;
    card.appendChild(name);
    
    const info = document.createElement('p');
    info.textContent = candidate.info;
    card.appendChild(info);
    
    const votes = document.createElement('p');
    votes.textContent = `Oy sayısı: ${candidate.voteCount}`;
    votes.className = 'vote-count';
    card.appendChild(votes);
    
    // Oy verme butonu
    const voteButton = document.createElement('button');
    voteButton.textContent = "Oy ver";
    voteButton.className = 'vote-button';
    voteButton.onclick = () => voteForCandidate(candidate.id);
    
    // Kullanıcı oy kullanmışsa butonu devre dışı bırak
    if (localStorage.getItem(`voted_${String(userAddress).toLowerCase()}`) === 'true') {
      voteButton.disabled = true;
      voteButton.textContent = "Oy verildi";
    }
    
    card.appendChild(voteButton);
    
    candidateContainer.appendChild(card);
  });
}

// Sonuçları güncelleyen fonksiyon
function updateResults() {
  const resultsContainer = document.getElementById('results-container');
  if (!resultsContainer) return;
  
  // Önce mevcut sonuçları temizle
  resultsContainer.innerHTML = '';
  
  // Toplam oy sayısını hesapla
  const totalVotes = candidates.reduce((sum, candidate) => sum + parseInt(candidate.voteCount), 0);
  
  // Adayları sırala (oy sayısına göre azalan sırada)
  const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  
  // Sonuç başlığı
  const heading = document.createElement('h2');
  heading.textContent = `Sonuçlar (Toplam: ${totalVotes} oy)`;
  resultsContainer.appendChild(heading);
  
  // Her aday için sonuç satırı oluştur
  sortedCandidates.forEach((candidate, index) => {
    const resultRow = document.createElement('div');
    resultRow.className = 'result-row';
    
    // Sıra numarası
    const rank = document.createElement('span');
    rank.textContent = `${index + 1}.`;
    rank.className = 'rank';
    resultRow.appendChild(rank);
    
    // Aday adı
    const name = document.createElement('span');
    name.textContent = candidate.name;
    name.className = 'candidate-name';
    resultRow.appendChild(name);
    
    // Oy sayısı ve yüzdesi
    const votes = document.createElement('span');
    const percentage = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0;
    votes.textContent = `${candidate.voteCount} oy (${percentage}%)`;
    votes.className = 'vote-info';
    resultRow.appendChild(votes);
    
    // İlerleme çubuğu
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    const progress = document.createElement('div');
    progress.className = 'progress';
    progress.style.width = `${percentage}%`;
    progressBar.appendChild(progress);
    
    resultRow.appendChild(progressBar);
    
    resultsContainer.appendChild(resultRow);
  });
}

// Uygulamayı başlatan fonksiyon
async function initializeApp() {
  try {
    console.log("Uygulama başlatılıyor...");
    
    // Disconnect butonunu ayarla
    setupDisconnectButton();
    
    // Cüzdan bağlantısını kontrol et
    const isConnected = await checkConnection();
    if (!isConnected) {
      console.log("Cüzdan bağlı değil, kullanıcıdan bağlanmasını isteyin.");
      showConnectButton();
      return;
    }
    
    console.log("Cüzdan bağlı, uygulama başlatılıyor...");
    
    // Oylama durumunu kontrol et
    try {
      const votingStatus = await votingContract.methods.getVotingStatus().call();
      const isActive = votingStatus.isActive;
      const timeRemaining = votingStatus.timeRemaining;
      
      console.log("Oylama durumu:", isActive ? "Aktif" : "Aktif değil");
      console.log("Kalan süre:", timeRemaining, "saniye");
      
      // Oylama durumunu UI'da göster
      updateVotingStatus(isActive, timeRemaining);
    } catch (error) {
      console.error("Oylama durumu kontrolü sırasında hata:", error);
    }
    
    // Kullanıcının oy kullanıp kullanmadığını kontrol et
    try {
      const hasVoted = await checkUserVoted();
      console.log("Kullanıcı oy kullanmış mı:", hasVoted);
      
      // Oy durumunu UI'da göster
      updateVotingUI(hasVoted);
    } catch (error) {
      console.error("Oy durumu kontrolü sırasında hata:", error);
    }
    
    // Aday verilerini yükle
    await loadCandidateData();
    
    // UI güncelle
    updateUI();
  } catch (error) {
    console.error("Uygulama başlatma hatası:", error);
    showErrorMessage("Uygulama başlatılırken bir hata oluştu. Lütfen sayfayı yenileyin ve tekrar deneyin.");
  }
}

// Disconnect butonunu ayarlayan fonksiyon
function setupDisconnectButton() {
  const disconnectButton = document.getElementById('disconnect-wallet');
  if (disconnectButton) {
    // Önceki event listener'ları temizle
    const newButton = disconnectButton.cloneNode(true);
    disconnectButton.parentNode.replaceChild(newButton, disconnectButton);
    
    // Yeni event listener ekle
    newButton.addEventListener('click', async () => {
      await disconnectWallet();
    });
  }
}

// Cüzdanı ayıran fonksiyon
async function disconnectWallet() {
  try {
    // localStorage'dan bağlantı bilgisini temizle
    localStorage.removeItem('walletConnected');
    localStorage.removeItem(`voted_${String(userAddress).toLowerCase()}`);
    
    // Global değişkenleri sıfırla
    userAddress = '';
    
    // UI'ı güncelle
    const walletAddressElement = document.getElementById('wallet-address');
    if (walletAddressElement) {
      walletAddressElement.textContent = '';
    }
    
    // Disconnect butonunu gizle
    const disconnectButton = document.getElementById('disconnect-wallet');
    if (disconnectButton) {
      disconnectButton.style.display = 'none';
    }
    
    // Bağlantı butonunu göster
    showConnectButton();
    
    // Aday kartlarını temizle
    const candidateContainer = document.getElementById('candidate-container');
    if (candidateContainer) {
      candidateContainer.innerHTML = '';
    }
    
    // Sonuçları temizle
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
    }
    
    showSuccessMessage("Cüzdan başarıyla ayrıldı.");
  } catch (error) {
    console.error("Cüzdan ayrılırken hata:", error);
    showErrorMessage("Cüzdan ayrılırken bir hata oluştu.");
  }
}

// Bağlantı butonunu gösteren fonksiyon
function showConnectButton() {
  const connectSection = document.getElementById('connect-section');
  const appSection = document.getElementById('app-section');
  
  if (connectSection) {
    connectSection.style.display = 'flex';
  }
  
  if (appSection) {
    appSection.style.display = 'none';
  }
  
  // Bağlantı butonuna event listener ekle
  const connectButton = document.getElementById('connect-wallet');
  if (connectButton) {
    // Önceki event listener'ları temizle
    const newButton = connectButton.cloneNode(true);
    connectButton.parentNode.replaceChild(newButton, connectButton);
    
    // Yeni event listener ekle
    newButton.addEventListener('click', async () => {
      await connectWallet();
    });
  }
}

// Cüzdanı bağlayan fonksiyon
async function connectWallet() {
  try {
    showLoading("Cüzdan bağlanıyor...");
    
    if (TEST_MODE) {
      // Test modu için rastgele bir adres oluştur
      const testAddress = '0x' + Math.random().toString(16).substring(2, 42);
      localStorage.setItem('testWalletAddress', testAddress);
      userAddress = testAddress;
      
      console.log("TEST MODU: Test adresi oluşturuldu:", testAddress);
      hideLoading();
      
      // Test modu için uygulamayı başlat
      await initializeApp();
      return;
    }
    
    // Modern dapp tarayıcıları için
    if (window.ethereum) {
      try {
        // Kullanıcıdan hesap erişimi iste
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts.length === 0) {
          hideLoading();
          showErrorMessage("Hesap erişimi reddedildi.");
          return;
        }
        
        // İlk hesabı kullan
        userAddress = String(accounts);
        console.log("Bağlandı, hesap:", userAddress);
        
        hideLoading();
        
        // Uygulamayı başlat
        await initializeApp();
      } catch (error) {
        hideLoading();
        console.error("Ethereum hesap erişimi hatası:", error);
        
        if (error.code === 4001) {
          showErrorMessage("Hesap erişimi reddedildi.");
        } else {
          showErrorMessage("Cüzdan bağlantısı sırasında bir hata oluştu.");
        }
      }
    }
    // Legacy dapp tarayıcıları için
    else if (window.web3) {
      try {
        const accounts = await web3.eth.getAccounts();
        
        if (accounts.length === 0) {
          hideLoading();
          showErrorMessage("Hesap erişimi reddedildi.");
          return;
        }
        
        userAddress = String(accounts);
        console.log("Legacy bağlantı, hesap:", userAddress);
        
        hideLoading();
        
        // Uygulamayı başlat
        await initializeApp();
      } catch (error) {
        hideLoading();
        console.error("Legacy web3 hesap erişimi hatası:", error);
        showErrorMessage("Cüzdan bağlantısı sırasında bir hata oluştu.");
      }
    }
    // Web3 sağlayıcısı yok
    else {
      hideLoading();
      showErrorMessage("Web3 uyumlu bir tarayıcı bulunamadı. MetaMask yüklemenizi öneririz.");
    }
  } catch (error) {
    hideLoading();
    console.error("Cüzdan bağlantısı sırasında hata:", error);
    showErrorMessage("Cüzdan bağlantısı sırasında bir hata oluştu.");
  }
}

// Yükleme göstergesini gösteren fonksiyon
function showLoading(message = "Yükleniyor...") {
  const loadingElement = document.getElementById('loading');
  const loadingMessageElement = document.getElementById('loading-message');
  
  if (loadingElement) {
    loadingElement.style.display = 'flex';
  }
  
  if (loadingMessageElement) {
    loadingMessageElement.textContent = message;
  }
}

// Yükleme göstergesini gizleyen fonksiyon
function hideLoading() {
  const loadingElement = document.getElementById('loading');
  
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
}

// Başarı mesajı gösteren fonksiyon
function showSuccessMessage(message) {
  const messageElement = document.getElementById('message');
  
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = 'message success';
    messageElement.style.display = 'block';
    
    // 5 saniye sonra mesajı gizle
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
  }
}

// Hata mesajı gösteren fonksiyon
function showErrorMessage(message) {
  const messageElement = document.getElementById('message');
  
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = 'message error';
    messageElement.style.display = 'block';
    
    // 5 saniye sonra mesajı gizle
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
  }
}

// Sayfa yüklendiğinde uygulamayı başlat
window.addEventListener('load', async () => {
  try {
    await setupWeb3();
    
    // localStorage'dan bağlantı durumunu kontrol et
    if (localStorage.getItem('walletConnected') === 'true') {
      // Otomatik olarak bağlanmayı dene
      const isConnected = await checkConnection();
      
      if (isConnected) {
        await initializeApp();
      } else {
        showConnectButton();
      }
    } else {
      showConnectButton();
    }
  } catch (error) {
    console.error("Sayfa yüklenirken hata:", error);
    showErrorMessage("Uygulama başlatılırken bir hata oluştu. Lütfen sayfayı yenileyin.");
    showConnectButton();
  }
});
  
