// app.js - Blockchain Oylama Uygulaması

// Test modu - gerçek kontrat bağlantısı olmadan test etmek için
const TEST_MODE = false; // Gerçek kontrat entegrasyonu için false yapın

// Ethereum provider için güvenli erişim sağlayan yardımcı fonksiyon
let ethereumProviderChecks = 0;
function getCompatibleEthereumProvider() {
  return new Promise((resolve, reject) => {
    const checkProvider = () => {
      ethereumProviderChecks++;
      console.log(`Provider kontrolü #${ethereumProviderChecks}`);
      
      // Önce window.ethereum'ı kontrol et (MetaMask, Coinbase Wallet vb.)
      if (window.ethereum) {
        console.log("Standard window.ethereum provider found:", window.ethereum);
        return resolve(window.ethereum);
      }
      
      // Pocket Universe'in özel provider'ını kontrol et
      if (window.pocketUniverseProvider) {
        console.log("Pocket Universe provider found:", window.pocketUniverseProvider);
        return resolve(window.pocketUniverseProvider);
      }
      
      // Web3Modal provider kontrolü
      if (window.web3Modal && window.web3Modal.cachedProvider) {
        console.log("Web3Modal cached provider found");
        try {
          window.web3Modal.connect().then(provider => {
            return resolve(provider);
          }).catch(err => {
            console.error("Web3Modal connection error:", err);
          });
          return;
        } catch (e) {
          console.error("Web3Modal error:", e);
        }
      }
      
      // MetaMask'in eski provider'ını kontrol et
      if (window.web3 && window.web3.currentProvider) {
        console.log("Legacy web3 provider found:", window.web3.currentProvider);
        return resolve(window.web3.currentProvider);
      }
      
      // 30 deneme sonrası vazgeç (6 saniye)
      if (ethereumProviderChecks > 30) {
        console.log("Provider bulunamadı, vazgeçiliyor");
        return reject(new Error("No Ethereum provider found after multiple attempts"));
      }
      
      // 200ms sonra tekrar dene
      console.log("Provider bulunamadı, tekrar deneniyor...");
      setTimeout(checkProvider, 200);
    };
    
    // İlk kontrolü başlat
    checkProvider();
  });
}

function getEthereumProvider() {
  return getCompatibleEthereumProvider();
}

// Kontrat ABI'si
const contractABI = [
	{
		"inputs": [],
		"name": "payEntryFee",
		"outputs": [],
		"stateMutability": "payable",
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
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
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
	}
];

// Kontrat adresi (deploy edildikten sonra güncellenecek)
const contractAddress = "0x6753f6B230ee795FD518426e5FE0D25Df9E16E99"; // Gerçek kontrat adresini buraya ekleyin

// Global değişkenler
let web3;
let votingContract;
let userAddress = ''; // String olarak tanımla
let blockchains = [];
let hasUserPaidFee = true;



// Sayfa yüklendiğinde çalışacak kod
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM yüklendi, uygulama başlatılıyor...");
  console.log("Test modu:", TEST_MODE ? "AÇIK" : "KAPALI");
  
  // localStorage'dan userAddress'i yükle
  const savedAddress = localStorage.getItem('userAddress');
  if (savedAddress) {
    console.log("Kaydedilmiş adres bulundu:", savedAddress);
    userAddress = savedAddress;
  }
  
  // Tarayıcı ve cihaz bilgilerini logla
  console.log("User Agent:", navigator.userAgent);
  console.log("Platform:", navigator.platform);
  
  // Hata ayıklama bilgisi
  console.log("window.ethereum:", window.ethereum);
  console.log("window.pocketUniverseProvider:", window.pocketUniverseProvider);
  console.log("window.web3:", window.web3);
  
  // Ethereum provider kontrolü için setTimeout kullanarak
  // tarayıcı eklentilerinin yüklenmesi için zaman tanıyoruz
  setTimeout(initializeWeb3Environment, 1000);
});

// Web3 ortamını başlatan fonksiyon
// Web3 ortamını başlatan fonksiyon
function initializeWeb3Environment() {
  try {
    console.log("Web3 ortamı başlatılıyor...");
    
    if (TEST_MODE) {
      console.log("TEST MODU: Web3 başlatma işlemi atlanıyor");
      // Test modunda, direkt olarak uygulama başlatma
      showConnectButton();
      return;
    }
    
    // Ethereum provider kontrolü
    getCompatibleEthereumProvider()
      .then(provider => {
        console.log("Ethereum provider bulundu!", provider);
        
        // Provider'ı global olarak saklayalım
        window.web3Provider = provider;
        
        // Web3 instance oluştur
        try {
          web3 = new Web3(provider);
          console.log("Web3 başarıyla başlatıldı", web3);
          
          // Eğer localStorage'da userAddress varsa, hemen initializeApp'i çağır
          if (userAddress) {
            console.log("Kaydedilmiş adres ile uygulamayı başlatma deneniyor");
            initializeApp();
          } else {
            // Adres yoksa, bağlantı butonunu göster
            showConnectButton();
          }
        } catch (web3Error) {
          console.error("Web3 başlatma hatası:", web3Error);
          
          // Fallback olarak HTTP provider dene
          try {
            web3 = new Web3('https://testnet-rpc.monad.xyz'); // Monad RPC URL
            console.log("Web3 HTTP provider ile başlatıldı");
            showConnectButton();
          } catch (fallbackError) {
            console.error("Fallback Web3 başlatma hatası:", fallbackError);
            showErrorMessage("Web3 başlatılamadı. Lütfen cüzdan eklentinizi kontrol edin.");
          }
        }
        
        // Olay dinleyicilerini ekle
        setupEventListeners(provider);
      })
      .catch(error => {
        console.error("Provider bulunamadı:", error);
        showWalletWarning();
      });
  } catch (error) {
    console.error("Web3 ortamı başlatılırken hata:", error);
    showErrorMessage("Web3 ortamı başlatılırken bir hata oluştu: " + error.message);
  }
}

// Ethereum hesap değişikliklerini dinleyen fonksiyon
function setupEventListeners(provider) {
  if (TEST_MODE) return; // Test modunda event listener'ları atla
  
  try {
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
  } catch (error) {
    console.error("Event listener kurulumu sırasında hata:", error);
  }
}

// Uygulamayı başlatan ana fonksiyon
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
    
    // Eğer ödeme kontrolünü kaldırmak istiyorsanız, bu satırı kaldırın veya yorum satırı yapın
    // hasUserPaidFee = await checkUserPaymentStatus();
    
    // Blockchain verilerini yükle
    await loadBlockchainData();
    
    // UI güncelle
    updateUI();
  } catch (error) {
    console.error("Uygulama başlatma hatası:", error);
    showErrorMessage("Uygulama başlatılırken bir hata oluştu. Lütfen sayfayı yenileyin ve tekrar deneyin.");
  }
}

// Cüzdan bağlantısını kontrol eden fonksiyon
async function checkConnection() {
  try {
    console.log("Cüzdan bağlantısı kontrol ediliyor...");
    
    // Test modunda ise ve test için bir adres tanımlanmışsa
    if (TEST_MODE && localStorage.getItem('testWalletAddress')) {
      userAddress = localStorage.getItem('testWalletAddress');
      console.log("Test modu: Kaydedilmiş test adresi kullanılıyor:", userAddress);
      return true;
    }
    
    // Web3 tanımlı değilse
    if (!web3) {
      console.log("Web3 tanımlı değil, bağlantı kurulamadı.");
      return false;
    }
    
    // Hesapları kontrol et
    const accounts = await web3.eth.getAccounts();
    console.log("eth_accounts ile alınan hesaplar:", accounts);
    
    if (accounts.length === 0) {
      console.log("Hesap bulunamadı, bağlantı kurulamadı.");
      return false;
    }
    
    // İlk hesabı kullan
    userAddress = accounts;
    console.log("Bağlandı, hesap (string):", userAddress);
    
    // localStorage'a kaydet
    localStorage.setItem('walletConnected', 'true');
    
    // Ödeme durumunu kontrol et
    try {
      hasUserPaidFee = await checkUserPaymentStatus();
      console.log("Bağlantı kontrolünde ödeme durumu güncellendi:", hasUserPaidFee);
    } catch (error) {
      console.error("Ödeme durumu kontrolü sırasında hata:", error);
    }
    
    // Bağlı cüzdan adresini göster
    const walletAddressElement = document.getElementById('wallet-address');
    if (walletAddressElement) {
      // Adresin ilk 6 ve son 4 karakterini göster, ortasını gizle
      const shortAddress = userAddress.substring(0, 6) + '...' + userAddress.substring(userAddress.length - 4);
      walletAddressElement.textContent = shortAddress;
    }
    
    // Disconnect butonunu göster
    document.getElementById('disconnect-wallet').style.display = 'block';
    
    return true;
  } catch (error) {
    console.error("Bağlantı kontrolü sırasında hata:", error);
    return false;
  }
}

// Kullanıcının giriş ücreti ödeyip ödemediğini kontrol eden fonksiyon
async function checkUserPaymentStatus() {
  try {
    console.log("Kullanıcı ödeme durumu kontrol ediliyor...");
    
    if (TEST_MODE) {
      // Test modunda ödeme durumunu localStorage'dan kontrol et
      const testPaid = localStorage.getItem('testPaidFee');
      console.log("Test modu ödeme durumu:", testPaid);
      return testPaid === 'true';
    }
    
    if (!userAddress) {
      console.log("Kullanıcı adresi bulunamadı, ödeme kontrolü yapılamıyor.");
      return false;
    }
    
    // Önce localStorage'dan kontrol et (hızlı erişim için)
    const localStorageKey = `paidFee_${userAddress.toLowerCase()}`;
    const localStorageValue = localStorage.getItem(localStorageKey);
    
    if (localStorageValue === 'true') {
      console.log("Ödeme durumu localStorage'dan alındı: true");
      return true;
    }
    
    // Kontrat üzerinden kullanıcının ödeme yapıp yapmadığını kontrol et
    console.log("Ödeme kontrolü için kullanılan adres:", userAddress);
    
    // hasUserPaid fonksiyonunu kullan
    const hasPaid = await votingContract.methods.hasUserPaid(userAddress).call();
    console.log("Kontrat üzerinden ödeme durumu:", hasPaid);
    
    // Ödeme durumunu localStorage'a kaydet
    if (hasPaid) {
      localStorage.setItem(localStorageKey, 'true');
    }
    
    return hasPaid;
  } catch (error) {
    console.error("Ödeme durumu kontrolü sırasında hata:", error);
    
    // Hata durumunda localStorage'dan kontrol et
    const localPaid = localStorage.getItem(`paidFee_${userAddress.toLowerCase()}`);
    console.log("Hata durumunda localStorage'dan ödeme durumu:", localPaid);
    return localPaid === 'true';
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
        console.log("Cüzdan bağlantısı isteniyor...");
        
        if (TEST_MODE) {
          console.log("TEST MODU: Cüzdan bağlantısı simüle ediliyor");
          // Test için sahte bir adres
          userAddress = "0x1234567890123456789012345678901234567890";
          
          try {
            // Adresin kısaltılmış halini göster
            const shortAddress = userAddress.substring(0, 6) + "..." + userAddress.substring(userAddress.length - 4);
            const walletAddressElement = document.getElementById('wallet-address');
            if (walletAddressElement) {
              walletAddressElement.textContent = shortAddress;
            }
          } catch (error) {
            console.error("Adres kısaltma hatası:", error);
          }
          
          // Bağlantı başarılı ise uygulamayı başlat
          await initializeApp();
          return;
        }
        
        // Ethereum provider kontrolü
        const provider = window.web3Provider;
        if (!provider) {
          throw new Error("Provider bulunamadı");
        }
        
        // Cüzdan bağlantısı iste
        let accounts = await provider.request({ method: 'eth_requestAccounts' });
        
        if (accounts && accounts.length > 0) {
          // String olarak kaydet
          userAddress = String(accounts);
          console.log("Bağlandı, hesap (string):", userAddress);
          
          try {
            // Adresin kısaltılmış halini göster
            const shortAddress = userAddress.substring(0, 6) + "..." + userAddress.substring(userAddress.length - 4);
            const walletAddressElement = document.getElementById('wallet-address');
            if (walletAddressElement) {
              walletAddressElement.textContent = shortAddress;
            }
          } catch (error) {
            console.error("Adres kısaltma hatası:", error);
          }
          
          // Bağlantı başarılı ise uygulamayı başlat
          await initializeApp();
        } else {
          showErrorMessage("Cüzdan bağlantısı başarısız. Hesap bulunamadı.");
        }
      } catch (error) {
        console.error("Cüzdan erişim isteği hatası:", error);
        
        if (error.code === 4001) {
          showErrorMessage("Cüzdan bağlantısı kullanıcı tarafından reddedildi.");
        } else {
          showErrorMessage("Cüzdan bağlantısı sırasında bir hata oluştu: " + error.message);
        }
      }
    });
  }
}
 
// Doğru ağa bağlı olduğunu kontrol eden fonksiyon
async function checkNetwork() {
  if (TEST_MODE) return true;
  
  try {
    const chainId = await web3.eth.getChainId();
    console.log("Bağlı olduğunuz ağ ID'si:", chainId);
    
    // Monad ağı için chain ID'yi kontrol edin (doğru ID'yi kullanın)
    const requiredChainId = 10143; // Monad chain ID - doğru ID'yi kullanın
    
    if (chainId !== requiredChainId) {
      showErrorMessage(`Lütfen cüzdanınızı Monad ağına (Chain ID: ${requiredChainId}) bağlayın. Şu anda Chain ID: ${chainId} ağındasınız.`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Ağ kontrolü sırasında hata:", error);
    showErrorMessage("Ağ kontrolü yapılırken bir hata oluştu.");
    return false;
  }
}

async function disconnectWallet() {
  try {
    console.log("Cüzdan bağlantısı kesiliyor...");
    
    // Eski adres bilgisini saklayalım (localStorage temizleme için)
    const oldAddress = userAddress ? userAddress.toLowerCase() : '';
    
    // userAddress'i sıfırla
    userAddress = '';
    
    // Kullanıcı durumunu sıfırla
    hasUserPaidFee = false;
    
    // localStorage'dan bağlantı bilgilerini temizle
    localStorage.removeItem('walletConnected');
    
    // Eski adrese ait ödeme bilgisini temizleme
    if (oldAddress) {
      localStorage.removeItem(`paidFee_${oldAddress}`);
    }
    
    // UI'ı güncelle
    updateUI();
    
    // Bağlantı kesme başarılı mesajını göster
    showSuccessMessage("Cüzdan bağlantısı başarıyla kesildi.");
    
    // Bağlantı butonunu göster
    showConnectButton();
    
    // Disconnect butonunu gizle
    document.getElementById('disconnect-wallet').style.display = 'none';
    
    // Cüzdan adresini temizle
    const walletAddressElement = document.getElementById('wallet-address');
    if (walletAddressElement) {
      walletAddressElement.textContent = '';
    }
    
    return true;
  } catch (error) {
    console.error("Cüzdan bağlantısını kesme hatası:", error);
    showErrorMessage("Cüzdan bağlantısını keserken bir hata oluştu.");
    return false;
  }
}


// Blockchain verilerini yükleyen fonksiyon
async function loadBlockchainData() {
  try {
    console.log("Blockchain verileri yükleniyor...");
    
    if (TEST_MODE) {
      // Test verileri...
      return;
    }
    
    // ABI'ye göre tüm blockchain'leri yüklemek için iki yöntem var:
    // 1. getAllBlockchains() fonksiyonunu kullan
    // 2. blockchainCount() ve blockchains(i) fonksiyonlarını kullan
    
    try {
      // Yöntem 1: getAllBlockchains() fonksiyonunu kullan
      blockchains = await votingContract.methods.getAllBlockchains().call();
      console.log("getAllBlockchains() ile yüklenen blockchain'ler:", blockchains);
    } catch (error) {
      console.error("getAllBlockchains() fonksiyonu çağrılamadı:", error);
      
      // Yöntem 2: blockchainCount() ve blockchains(i) fonksiyonlarını kullan
      const blockchainCount = await votingContract.methods.blockchainCount().call();
      console.log("Blockchain sayısı:", blockchainCount);
      
      blockchains = [];
      for (let i = 0; i < blockchainCount; i++) {
        const blockchain = await votingContract.methods.blockchains(i).call();
        blockchains.push({
          id: blockchain.id,
          name: blockchain.name,
          symbol: blockchain.symbol,
          voteCount: blockchain.voteCount
        });
      }
      console.log("blockchains(i) ile yüklenen blockchain'ler:", blockchains);
    }
    
    // Kullanıcı ödeme durumunu kontrol et
    hasUserPaidFee = await checkUserPaymentStatus();
    console.log("Kullanıcı ödeme durumu güncellendi:", hasUserPaidFee);
    
  } catch (error) {
    console.error("Blockchain verilerini yükleme hatası:", error);
    showErrorMessage("Blockchain verilerini yüklerken bir hata oluştu. Lütfen sayfayı yenileyin ve tekrar deneyin.");
  }
}
// Kullanıcı arayüzünü güncelleyen fonksiyon
function updateUI() {
  console.log("UI güncelleniyor...");
  
  const walletSection = document.getElementById('wallet-section');
  const voteSection = document.getElementById('vote-section');
  const paymentSection = document.getElementById('payment-section'); // Bu bölümü gizleyeceğiz
  const resultsSection = document.getElementById('results-section');
  
  // Cüzdan bağlı değilse
  if (!userAddress) {
    if (walletSection) walletSection.style.display = 'block';
    if (voteSection) voteSection.style.display = 'none';
    if (paymentSection) paymentSection.style.display = 'none'; // Ödeme bölümünü her zaman gizle
    if (resultsSection) resultsSection.style.display = 'none';
    return;
  }
  
  // Cüzdan bağlı ise (ödeme kontrolü olmadan)
  if (walletSection) walletSection.style.display = 'none';
  if (voteSection) voteSection.style.display = 'block'; // Her zaman oy verme bölümünü göster
  if (paymentSection) paymentSection.style.display = 'none'; // Ödeme bölümünü her zaman gizle
  if (resultsSection) resultsSection.style.display = 'block';
  
  // Blockchain kartlarını oluştur
  createBlockchainCards();
  
  // Sonuçları güncelle
  updateResults();
}

// Giriş ücreti butonuna event listener ekleyen fonksiyon
function setupEntryFeeButton() {
  const entryFeeButton = document.getElementById('pay-entry-fee');
  if (entryFeeButton) {
    // Önceki event listener'ları temizle
    const newButton = entryFeeButton.cloneNode(true);
    entryFeeButton.parentNode.replaceChild(newButton, entryFeeButton);
    
    // Yeni event listener ekle
    newButton.addEventListener('click', async () => {
      try {
        showLoading("Ödeme işlemi yapılıyor...");
        
        if (TEST_MODE) {
          console.log("TEST MODU: Ödeme işlemi simüle ediliyor");
          // Simüle edilmiş ödeme
          setTimeout(() => {
            // Test modu için localStorage'a kaydet
            localStorage.setItem('testPaidFee', 'true');
            hasUserPaidFee = true;
            updateUI();
            showSuccessMessage("Test modu: Giriş ücreti başarıyla ödendi! Artık oy kullanabilirsiniz.");
            hideLoading();
          }, 1500);
          return;
        }
        
        // Önce kullanıcının zaten ödeme yapıp yapmadığını kontrol et
        const alreadyPaid = await checkUserPaymentStatus();
        if (alreadyPaid) {
          console.log("Kullanıcı zaten ödeme yapmış.");
          hasUserPaidFee = true;
          updateUI();
          showSuccessMessage("Zaten giriş ücreti ödenmiş! Oy kullanabilirsiniz.");
          hideLoading();
          return;
        }
        
        // Gerçek ödeme kodu...
        const entryFee = await votingContract.methods.ENTRY_FEE().call();
        console.log("Giriş ücreti:", entryFee);
        
        // userAddress'in string olduğunu kontrol et
        console.log("Ödeme yapan adres (tipi):", typeof userAddress, userAddress);
        
        // payEntryFee fonksiyonunu çağır
        await votingContract.methods.payEntryFee().send({
          from: userAddress,
          value: entryFee
        });
        
        // Ödeme durumunu güncelle ve localStorage'a kaydet
        hasUserPaidFee = true;
        localStorage.setItem(`paidFee_${userAddress.toLowerCase()}`, 'true');
        
        updateUI();
        
        showSuccessMessage("Giriş ücreti başarıyla ödendi! Artık oy kullanabilirsiniz.");
        hideLoading();
      } catch (error) {
        hideLoading();
        console.error("Ödeme işlemi sırasında hata:", error);
        
        // Hata mesajını daha detaylı analiz et
        if (error.message && error.message.includes("already paid")) {
          // Zaten ödeme yapılmış
          hasUserPaidFee = true;
          localStorage.setItem(`paidFee_${userAddress.toLowerCase()}`, 'true');
          updateUI();
          showSuccessMessage("Zaten giriş ücreti ödenmiş! Oy kullanabilirsiniz.");
        } else if (error.message && error.message.includes("User denied")) {
          showErrorMessage("İşlem kullanıcı tarafından reddedildi.");
        } else {
          showErrorMessage("Ödeme işlemi sırasında bir hata oluştu: " + error.message);
        }
      }
    });
  }
}
// Blockchain kartlarını oluşturan fonksiyon
function createBlockchainCards() {
  const container = document.getElementById('blockchains-container');
  if (!container) return;
  
  // Önceki içeriği temizle
  container.innerHTML = '';
  
  // Her blockchain için kart oluştur
  blockchains.forEach(blockchain => {
    const card = document.createElement('div');
    card.className = `blockchain-card ${blockchain.name === 'Monad' ? 'monad' : ''}`;
    
    card.innerHTML = `
      <h3>${blockchain.name}</h3>
      <span class="blockchain-symbol">${blockchain.symbol}</span>
      <p class="vote-count">${blockchain.voteCount} oy</p>
      <button class="vote-btn" data-id="${blockchain.id}">Oy Ver</button>
    `;
    
    container.appendChild(card);
    
    // Oy verme butonuna event listener ekle
    const voteButton = card.querySelector('.vote-btn');
    voteButton.addEventListener('click', () => voteForBlockchain(blockchain.id));
  });
}

// Blockchain'e oy verme fonksiyonu
async function voteForBlockchain(blockchainId) {
  try {
    showLoading("Oy veriliyor...");
    
    if (TEST_MODE) {
      console.log("TEST MODU: Oy verme işlemi simüle ediliyor", blockchainId);
      // Simüle edilmiş oy verme
      setTimeout(() => {
        // Seçilen blockchain için oy sayısını artır
        blockchains = blockchains.map(bc => {
          if (bc.id == blockchainId) {
            return {...bc, voteCount: parseInt(bc.voteCount) + 1};
          }
          return bc;
        });
        
        updateResults();
        createBlockchainCards();
        showSuccessMessage("Test modu: Oyunuz başarıyla kaydedildi!");
        hideLoading();
      }, 1000);
      return;
    }
    
    // userAddress'in string olduğunu kontrol et
    console.log("Oy veren adres (tipi):", typeof userAddress, userAddress);
    
    // vote fonksiyonunu çağır
    await votingContract.methods.vote(blockchainId).send({
      from: userAddress
    });
    
    await loadBlockchainData();
    
    showSuccessMessage("Oyunuz başarıyla kaydedildi!");
    hideLoading();
  } catch (error) {
    hideLoading();
    console.error("Oy verme işlemi sırasında hata:", error);
    
    // Kullanıcıya daha detaylı hata mesajı göster
    if (error.message && error.message.includes("already voted")) {
      showErrorMessage("Bu blockchain için daha önce oy kullanmışsınız.");
    } else if (error.message && error.message.includes("Must pay entry fee first")) {
      showErrorMessage("Oy vermek için önce giriş ücretini ödemelisiniz.");
    } else if (error.message && error.message.includes("User denied")) {
      showErrorMessage("İşlem kullanıcı tarafından reddedildi.");
    } else {
      showErrorMessage("Oy verme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  }
}
// Sonuçları güncelleyen fonksiyon
function updateResults() {
  const resultsContainer = document.getElementById('results-container');
  if (!resultsContainer) return;
  
  // Önceki içeriği temizle
  resultsContainer.innerHTML = '';
  
  // Oy sayısına göre sırala
  const sortedBlockchains = [...blockchains].sort((a, b) => b.voteCount - a.voteCount);
  
  // Toplam oy sayısını hesapla
  const totalVotes = sortedBlockchains.reduce((sum, blockchain) => sum + parseInt(blockchain.voteCount), 0);
  
  // Her blockchain için sonuç öğesi oluştur
  sortedBlockchains.forEach((blockchain, index) => {
    const percentage = totalVotes > 0 ? (blockchain.voteCount / totalVotes * 100).toFixed(1) : 0;
    
    const resultItem = document.createElement('div');
    resultItem.className = `result-item ${blockchain.name === 'Monad' ? 'monad' : ''}`;
    
    resultItem.innerHTML = `
      <span class="rank">#${index + 1}</span>
      <div class="blockchain-name">
        <strong>${blockchain.name}</strong>
        <span class="blockchain-symbol">${blockchain.symbol}</span>
      </div>
      <div class="votes">
        <div>${blockchain.voteCount} oy (${percentage}%)</div>
        <div class="vote-bar" style="width: ${percentage}%"></div>
      </div>
    `;
    
    resultsContainer.appendChild(resultItem);
  });
}

// Yükleme göstergesini görüntüleyen fonksiyon
function showLoading(message = "İşlem yapılıyor...") {
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingMessage = document.getElementById('loading-message');
  
  if (loadingOverlay && loadingMessage) {
    loadingMessage.textContent = message;
    loadingOverlay.style.display = 'flex';
  }
}

// Yükleme göstergesini gizleyen fonksiyon
function hideLoading() {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}

// Mesajları temizleyen fonksiyon
function clearMessages() {
  const messages = document.querySelectorAll('.error-message, .success-message');
  messages.forEach(message => message.remove());
}

// Hata mesajı gösteren fonksiyon
function showErrorMessage(message) {
  // Önceki hata mesajlarını temizle
  clearMessages();
  
  const main = document.querySelector('main');
  if (main) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    // Main'in başına ekle
    main.insertBefore(errorElement, main.firstChild);
    
    // 5 saniye sonra mesajı kaldır
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }
}

// Başarı mesajı gösteren fonksiyon
function showSuccessMessage(message) {
  // Önceki mesajları temizle
  clearMessages();
  
  const main = document.querySelector('main');
  if (main) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    
    // Main'in başına ekle
    main.insertBefore(successElement, main.firstChild);
    
    // 5 saniye sonra mesajı kaldır
    setTimeout(() => {
      successElement.remove();
    }, 5000);
  }
}

// Cüzdan uyarısı gösteren fonksiyon
function showWalletWarning() {
  const main = document.querySelector('main');
  if (main) {
    const warningElement = document.createElement('div');
    warningElement.className = 'wallet-warning';
    warningElement.innerHTML = `
      <h3>Cüzdan Bulunamadı</h3>
      <p>Bu uygulamayı kullanmak için bir Ethereum cüzdanı gereklidir.</p>
      <p>Lütfen <a href="https://metamask.io/" target="_blank">MetaMask</a> kurarak tekrar deneyin.</p>
    `;
    
    // Main'in başına ekle
    main.insertBefore(warningElement, main.firstChild);
  }
}
