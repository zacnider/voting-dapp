// app.js - Blockchain Oylama Uygulaması

// Ethereum provider için güvenli erişim sağlayan yardımcı fonksiyon
function getEthereumProvider() {
  return new Promise((resolve, reject) => {
    // Provider zaten varsa hemen döndür
    if (window.ethereum) {
      return resolve(window.ethereum);
    }
    
    // Provider'ın yüklenmesini bekle
    let checkCount = 0;
    const checkInterval = setInterval(() => {
      checkCount++;
      
      if (window.ethereum) {
        clearInterval(checkInterval);
        return resolve(window.ethereum);
      }
      
      // 10 deneme sonrası vazgeç
      if (checkCount > 10) {
        clearInterval(checkInterval);
        reject(new Error("Ethereum provider bulunamadı"));
      }
    }, 200);
  });
}

// Kontrat ABI'si
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
      }
    ],
    "name": "UserPaid",
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
        "name": "blockchainId",
        "type": "uint256"
      }
    ],
    "name": "VoteCast",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "ENTRY_FEE",
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
    "name": "blockchainCount",
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
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "blockchains",
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
        "name": "symbol",
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
    "name": "getAllBlockchains",
    "outputs": [
      {
        "components": [
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
            "name": "symbol",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "voteCount",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasUserPaid",
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
    "name": "owner",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "payEntryFee",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_blockchainId",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Kontrat adresi (deploy edildikten sonra güncellenecek)
const contractAddress = "0x123..."; // Gerçek kontrat adresini buraya ekleyin

// Global değişkenler
let web3;
let votingContract;
let userAddress;
let hasUserPaidFee = false;
let blockchains = [];

// Sayfa yüklendiğinde çalışacak kod
document.addEventListener('DOMContentLoaded', function() {
  // Ethereum provider kontrolü için setTimeout kullanarak
  // tarayıcı eklentilerinin yüklenmesi için zaman tanıyoruz
  setTimeout(initializeWeb3Environment, 500);
});

// Web3 ortamını başlatan fonksiyon
function initializeWeb3Environment() {
  try {
    // Ethereum provider kontrolü
    getEthereumProvider()
      .then(provider => {
        console.log("Ethereum provider bulundu!");
        // Provider'ı global olarak saklayalım
        window.web3Provider = provider;
        
        // Web3 instance oluştur
        web3 = new Web3(provider);
        
        // Uygulama başlatma
        initializeApp();
        
        // Olay dinleyicilerini ekle
        setupEventListeners(provider);
      })
      .catch(error => {
        console.error("Provider bulunamadı:", error);
        showWalletWarning();
      });
  } catch (error) {
    console.error("Web3 ortamı başlatılırken hata:", error);
    showErrorMessage("Web3 ortamı başlatılırken bir hata oluştu.");
  }
}

// Ethereum hesap değişikliklerini dinleyen fonksiyon
function setupEventListeners(provider) {
  // Hesap değişikliği dinleme
  provider.on('accountsChanged', (accounts) => {
    console.log('Hesap değişti:', accounts);
    // Uygulamayı yeniden başlat
    initializeApp();
  });
  
  // Ağ değişikliği dinleme
  provider.on('chainChanged', (chainId) => {
    console.log('Ağ değişti:', chainId);
    // Sayfayı yenile
    window.location.reload();
  });
  
  // Bağlantı hatası dinleme
  provider.on('disconnect', (error) => {
    console.log('Bağlantı kesildi:', error);
    showErrorMessage("Cüzdan bağlantısı kesildi. Lütfen tekrar bağlanın.");
  });
}

// Uygulamayı başlatan ana fonksiyon
async function initializeApp() {
  try {
    // Cüzdan bağlantısını kontrol et
    const connected = await checkConnection();
    
    if (connected) {
      console.log("Cüzdan bağlı, uygulama başlatılıyor...");
      
      // Kontrat instance'ı oluştur
      votingContract = new web3.eth.Contract(contractABI, contractAddress);
      
      // Kullanıcının giriş ücreti ödeyip ödemediğini kontrol et
      await checkUserPaymentStatus();
      
      // Blockchain verilerini yükle
      await loadBlockchainData();
      
      // UI'ı güncelle
      updateUI();
    } else {
      console.log("Cüzdan bağlı değil, kullanıcıdan bağlanmasını isteyin.");
      // Bağlantı butonu göster
      showConnectButton();
    }
  } catch (error) {
    console.error("Uygulama başlatılırken hata:", error);
    showErrorMessage("Uygulama başlatılırken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.");
  }
}

// Cüzdan bağlantısını kontrol eden fonksiyon
async function checkConnection() {
  try {
    // Ethereum provider kontrolü
    const provider = window.web3Provider;
    if (!provider) {
      return false;
    }

    // Cüzdan bağlantısı kontrolü
    const accounts = await provider.request({ method: 'eth_accounts' });
    userAddress = accounts;
    
    // userAddress kontrolü
    if (userAddress && typeof userAddress === 'string') {
      console.log("Bağlandı:", userAddress);
      
      // Adresin kısaltılmış halini göster
      const shortAddress = userAddress.substring(0, 6) + "..." + userAddress.substring(userAddress.length - 4);
      
      // Eğer wallet-address ID'li bir element varsa güncelle
      const walletAddressElement = document.getElementById('wallet-address');
      if (walletAddressElement) {
        walletAddressElement.textContent = shortAddress;
      }
      
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

// Kullanıcının giriş ücreti ödeyip ödemediğini kontrol eden fonksiyon
async function checkUserPaymentStatus() {
  try {
    hasUserPaidFee = await votingContract.methods.hasUserPaid(userAddress).call();
    console.log("Kullanıcı ücret ödemiş mi:", hasUserPaidFee);
  } catch (error) {
    console.error("Ödeme durumu kontrolü sırasında hata:", error);
    hasUserPaidFee = false;
  }
}

// Cüzdan bağlantı butonunu gösteren fonksiyon
function showConnectButton() {
  const connectButton = document.getElementById('connect-wallet');
  if (connectButton) {
    connectButton.style.display = 'block';
    
    // Önceki event listener'ları temizle
    const newButton = connectButton.cloneNode(true);
    connectButton.parentNode.replaceChild(newButton, connectButton);
    
    // Yeni event listener ekle
    newButton.addEventListener('click', async () => {
      try {
        const provider = window.web3Provider;
        await provider.request({ method: 'eth_requestAccounts' });
        
        // Bağlantı başarılı ise uygulamayı başlat
        await initializeApp();
      } catch (error) {
        console.error("Cüzdan bağlantısı başarısız:", error);
        showErrorMessage("Cüzdan bağlantısı başarısız. Lütfen tekrar deneyin.");
      }
    });
  }
}

// Blockchain verilerini yükleyen fonksiyon
async function loadBlockchainData() {
  try {
    showLoading("Blockchain verileri yükleniyor...");
    
    // Blockchain zincirlerini kontrat üzerinden al
    blockchains = await votingContract.methods.getAllBlockchains().call();
    console.log("Blockchain zincirleri:", blockchains);
    
    // Sonuçları güncelle
    updateResults();
    
    hideLoading();
  } catch (error) {
    hideLoading();
    console.error("Blockchain verileri yüklenirken hata:", error);
    showErrorMessage("Blockchain verileri yüklenirken bir hata oluştu.");
  }
}

// Kullanıcı arayüzünü güncelleyen fonksiyon
function updateUI() {
  try {
    // Cüzdan bağlantı durumu
    const walletSection = document.getElementById('wallet-section');
    if (walletSection && userAddress) {
      walletSection.classList.add('connected');
      
      // Bağlantı butonunu gizle
      const connectButton = document.getElementById('connect-wallet');
      if (connectButton) {
        connectButton.style.display = 'none';
      }
    }
    
    // Giriş ücreti ve oylama bölümlerini göster/gizle
    const entrySection = document.getElementById('entry-section');
    const votingSection = document.getElementById('voting-section');
    
    if (entrySection && votingSection) {
      if (hasUserPaidFee) {
        // Kullanıcı ücret ödemiş, oylama bölümünü göster
        entrySection.style.display = 'none';
        votingSection.style.display = 'block';
        
        // Blockchain kartlarını oluştur
        createBlockchainCards();
      } else if (userAddress) {
        // Kullanıcı bağlı ama ücret ödememiş, giriş ücreti bölümünü göster
        entrySection.style.display = 'block';
        votingSection.style.display = 'none';
        
        // Giriş ücreti butonuna event
