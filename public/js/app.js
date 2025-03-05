// app.js - Ethereum Blockchain Voting Dapp için güncellenmiş versiyon

// Ethereum provider için güvenli erişim sağlayan yardımcı fonksiyon
function getEthereumProvider() {
  return new Promise((resolve, reject) => {
    // Provider zaten varsa hemen döndür
    if (window.ethereum) {
      return resolve(window.ethereum);
    } else if (window.pocketUniverse) {
      return resolve(window.pocketUniverse);
    }
    
    // Provider'ın yüklenmesini bekle
    let checkCount = 0;
    const checkInterval = setInterval(() => {
      checkCount++;
      
      if (window.ethereum) {
        clearInterval(checkInterval);
        return resolve(window.ethereum);
      } else if (window.pocketUniverse) {
        clearInterval(checkInterval);
        return resolve(window.pocketUniverse);
      }
      
      // 10 deneme sonrası vazgeç
      if (checkCount > 10) {
        clearInterval(checkInterval);
        reject(new Error("Ethereum provider bulunamadı"));
      }
    }, 200);
  });
}

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
    const currentAccount = accounts;
    
    // currentAccount kontrolü
    if (currentAccount && typeof currentAccount === 'string') {
      console.log("Bağlandı:", currentAccount);
      
      // Adresin kısaltılmış halini göster
      const shortAddress = currentAccount.substring(0, 6) + "..." + currentAccount.substring(currentAccount.length - 4);
      
      // Eğer wallet-address ID'li bir element varsa güncelle
      const walletAddressElement = document.getElementById('wallet-address');
      if (walletAddressElement) {
        walletAddressElement.textContent = shortAddress;
      }
      
      // Kullanıcı adresini global değişkene kaydet
      window.userAddress = currentAccount;
      
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
    const provider = window.web3Provider;
    
    // Web3 instance oluştur
    const web3 = new Web3(provider);
    window.web3 = web3;
    
    // Ağ ID'sini al
    const networkId = await web3.eth.net.getId();
    console.log("Ağ ID:", networkId);
    
    // Kontrat ABI ve adresini yükle
    // Bu kısım sizin kontratınıza göre değişecektir
    const contractABI = []; // Kontrat ABI'nizi buraya ekleyin
    const contractAddress = "0x..."; // Kontrat adresinizi buraya ekleyin
    
    // Kontrat instance'ı oluştur
    if (contractAddress) {
      const votingContract = new web3.eth.Contract(contractABI, contractAddress);
      window.votingContract = votingContract;
      console.log("Kontrat yüklendi:", votingContract);
      
      // Kontrat verilerini yükle
      // Örnek: const candidates = await votingContract.methods.getCandidates().call();
    } else {
      console.error("Bu ağ için kontrat adresi bulunamadı");
      showErrorMessage("Bu ağ için kontrat adresi bulunamadı. Lütfen doğru ağa bağlandığınızdan emin olun.");
    }
  } catch (error) {
    console.error("Blockchain verileri yüklenirken hata:", error);
    showErrorMessage("Blockchain verileri yüklenirken bir hata oluştu.");
  }
}

// Kullanıcı arayüzünü güncelleyen fonksiyon
function updateUI() {
  try {
    // Cüzdan bağlantı durumu
    const walletSection = document.getElementById('wallet-section');
    if (walletSection) {
      if (window.userAddress) {
        walletSection.classList.add('connected');
        
        // Bağlantı butonunu gizle
        const connectButton = document.getElementById('connect-wallet');
        if (connectButton) {
          connectButton.style.display = 'none';
        }
      } else {
        walletSection.classList.remove('connected');
      }
    }
    
    // Voting UI'ı göster
    const votingSection = document.getElementById('voting-section');
    if (votingSection && window.userAddress) {
      votingSection.style.display = 'block';
      
      // Adayları yükle
      // loadCandidates();
    }
    
    // Sonuçlar UI'ı güncelle
    // updateResults();
    
    console.log("UI güncellendi");
  } catch (error) {
    console.error("UI güncellenirken hata:", error);
  }
}

// Metamask veya uyumlu cüzdan bulunamadığında uyarı gösteren fonksiyon
function showWalletWarning() {
  const metamaskWarning = document.createElement('div');
  metamaskWarning.classList.add('wallet-warning');
  metamaskWarning.innerHTML = `
    <div style="background-color: #ffebee; color: #c62828; padding: 10px; margin: 10px 0; border-radius: 5px; text-align: center;">
      <p>Bu uygulama için MetaMask gereklidir. Lütfen <a href="https://metamask.io/" target="_blank" style="color: #c62828; text-decoration: underline;">MetaMask'i yükleyin</a> ve sayfayı yenileyin.</p>
    </div>
  `;
  
  // Önceki uyarıyı kaldır
  const existingWarning = document.querySelector('.wallet-warning');
  if (existingWarning) {
    existingWarning.remove();
  }
  
  // Yeni uyarıyı ekle
  document.body.insertBefore(metamaskWarning, document.body.firstChild);
}

// Hata mesajı gösteren fonksiyon
function showErrorMessage(message) {
  const errorElement = document.createElement('div');
  errorElement.classList.add('error-message');
  errorElement.style.cssText = 'background-color: #ffebee; color: #c62828; padding: 10px; margin: 10px 0; border-radius: 5px; text-align: center;';
  errorElement.textContent = message;
  
  // Eğer varsa, önceki hata mesajını kaldır
  const existingError = document.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Yeni hata mesajını ekle
  document.body.insertBefore(errorElement, document.body.firstChild);
  
  // 5 saniye sonra hata mesajını kaldır
  setTimeout(() => {
    if (document.body.contains(errorElement)) {
      errorElement.remove();
    }
  }, 5000);
}

// Oy verme işlemini gerçekleştiren fonksiyon
async function castVote(candidateId) {
  try {
    // Kullanıcı bağlı mı kontrol et
    if (!window.userAddress) {
      showErrorMessage("Oy vermek için cüzdanınızı bağlamanız gerekmektedir.");
      return;
    }
    
    // Kontrat yüklenmiş mi kontrol et
    if (!window.votingContract) {
      showErrorMessage("Kontrat yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.");
      return;
    }
    
    // Oy verme işlemi başladı bildirimi
    showMessage("Oy verme işlemi başlatılıyor...", "info");
    
    // Kontrat üzerinden oy ver
    await window.votingContract.methods.vote(candidateId).send({ from: window.userAddress });
    
    // Başarılı bildirimi
    showMessage("Oyunuz başarıyla kaydedildi!", "success");
    
    // UI'ı güncelle
    await loadBlockchainData();
    updateUI();
  } catch (error) {
    console.error("Oy verme sırasında hata:", error);
    showErrorMessage("Oy verme işlemi başarısız oldu. Lütfen tekrar deneyin.");
  }
}

// Bilgi mesajı gösteren fonksiyon
function showMessage(message, type = "info") {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', type);
  
  let backgroundColor = '#e3f2fd'; // info için mavi
  let textColor = '#0d47a1';
  
  if (type === 'success') {
    backgroundColor = '#e8f5e9'; // success için yeşil
    textColor = '#1b5e20';
  } else if (type === 'warning') {
    backgroundColor = '#fff8e1'; // warning için sarı
    textColor = '#ff6f00';
  }
  
  messageElement.style.cssText = `background-color: ${backgroundColor}; color: ${textColor}; padding: 10px; margin: 10px 0; border-radius: 5px; text-align: center;`;
  messageElement.textContent = message;
  
  // Eğer varsa, önceki mesajı kaldır
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Yeni mesajı ekle
  document.body.insertBefore(messageElement, document.body.firstChild);
  
  // 3 saniye sonra mesajı kaldır
  setTimeout(() => {
    if (document.body.contains(messageElement)) {
      messageElement.remove();
    }
  }, 3000);
}

// Sayfada "Oy Ver" butonlarına event listener ekleyen fonksiyon
function setupVoteButtons() {
  const voteButtons = document.querySelectorAll('.vote-button');
  voteButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      const candidateId = event.target.getAttribute('data-candidate-id');
      if (candidateId) {
        await castVote(candidateId);
      }
    });
  });
}

// Sayfa tamamen yüklendiğinde vote butonlarını ayarla
window.addEventListener('load', function() {
  // Sayfa tamamen yüklendiğinde vote butonlarını ayarla
  setupVoteButtons();
});
