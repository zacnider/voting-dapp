// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // Kontrat sahibi
    address public owner;
    
    // Aday yapısı
    struct Candidate {
        uint id;
        string name;
        string info;
        uint voteCount;
    }
    
    // Adayları depolamak için mapping
    mapping(uint => Candidate) public candidates;
    
    // Toplam aday sayısı
    uint public candidatesCount = 0;
    
    // Oy kullanmış kullanıcıları takip etmek için mapping
    mapping(address => bool) public voters;
    
    // Oylama başlangıç ve bitiş zamanları
    uint public votingStart;
    uint public votingEnd;
    
    // Oylama aktif mi?
    bool public votingActive = false;
    
    // Eventler
    event CandidateAdded(uint candidateId, string name);
    event VoteCast(uint candidateId, address voter);
    event VotingStarted(uint startTime, uint endTime);
    event VotingEnded();
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // Sadece kontrat sahibinin erişebileceği fonksiyonlar için modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    // Oylama aktif mi kontrolü için modifier
    modifier isVotingActive() {
        require(votingActive, "Voting is not active");
        require(block.timestamp >= votingStart && block.timestamp <= votingEnd, "Voting period has not started or has ended");
        _;
    }
    
    // Oylama aktif değil mi kontrolü için modifier
    modifier isVotingNotActive() {
        require(!votingActive, "Voting is active");
        _;
    }
    
    // Yeni aday ekleme (sadece kontrat sahibi)
    function addCandidate(string memory _name, string memory _info) public onlyOwner isVotingNotActive {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _info, 0);
        emit CandidateAdded(candidatesCount, _name);
    }
    
    // Oylamayı başlatma (sadece kontrat sahibi)
    function startVoting(uint _durationInMinutes) public onlyOwner isVotingNotActive {
        require(candidatesCount >= 2, "Need at least 2 candidates to start voting");
        
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
        votingActive = true;
        
        emit VotingStarted(votingStart, votingEnd);
    }
    
    // Oylamayı sonlandırma (sadece kontrat sahibi)
    function endVoting() public onlyOwner {
        require(votingActive, "Voting is not active");
        
        votingActive = false;
        emit VotingEnded();
    }
    
    // Oy kullanma
    function vote(uint _candidateId) public isVotingActive {
        // Kullanıcı daha önce oy kullanmamış olmalı
        require(!voters[msg.sender], "You have already voted");
        
        // Geçerli bir aday ID'si olmalı
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        
        // Kullanıcıyı oy kullanmış olarak işaretle
        voters[msg.sender] = true;
        
        // Adayın oy sayısını artır
        candidates[_candidateId].voteCount++;
        
        // Oy kullanma olayını yayınla
        emit VoteCast(_candidateId, msg.sender);
    }
    
    // Oylama durumunu kontrol etme
    function getVotingStatus() public view returns (bool isActive, uint timeRemaining) {
        isActive = votingActive && block.timestamp >= votingStart && block.timestamp <= votingEnd;
        
        if (isActive && block.timestamp <= votingEnd) {
            timeRemaining = votingEnd - block.timestamp;
        } else {
            timeRemaining = 0;
        }
    }
    
    // Kazananı bulma
    function getWinner() public view returns (uint winnerId, string memory winnerName, uint winnerVotes) {
        require(!votingActive || block.timestamp > votingEnd, "Voting is still active");
        
        uint maxVotes = 0;
        
        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
                winnerName = candidates[i].name;
                winnerVotes = maxVotes;
            }
        }
        
        require(maxVotes > 0, "No votes have been cast");
    }
    
    // Belirli bir adayın bilgilerini alma
    function getCandidate(uint _id) public view returns (uint id, string memory name, string memory info, uint voteCount) {
        require(_id > 0 && _id <= candidatesCount, "Invalid candidate ID");
        
        Candidate memory candidate = candidates[_id];
        return (candidate.id, candidate.name, candidate.info, candidate.voteCount);
    }
}
