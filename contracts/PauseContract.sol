// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

contract PauseContract {

  address private owner;
  bool private operational;

  // address[5] public admins;

  address[] multiCalls = new address[](0);
  
  uint constant M = 3;

  struct  UserProfile {
    bool isRegistered;
    bool isAdmin;
  }
  
  mapping(address => bool) public checkDuplicate;

  mapping(address => UserProfile) public userProfiles;

  modifier isOwner() {
    require(msg.sender == owner, 'caller not owner');
    _;
  }

  modifier isAdmin() {
    require(userProfiles[msg.sender].isAdmin, 'caller not admin');
    _;
  }

  modifier isOperational() {
    require(operational, 'not in operational state');
    _;
  }

  modifier notZero(address _account) {
    require(_account != address(0), 'cannot be zero address');
    _;
  }

  
  


  event LogRegistered(address indexed account, bool registered);
  event LogDeregistered(address indexed account, bool deregistered);
  event LogStatusChanged(bool status);
  constructor() {
    owner = msg.sender;
    operational = true;
    userProfiles[msg.sender].isAdmin = true;
  }

  function registerUser(address _account) public isOwner isOperational {
    require(!userProfiles[_account].isRegistered, 'user already registered');
    
    userProfiles[_account] = UserProfile({
      isRegistered: true,
      isAdmin: true
    });

    bool registered = isUserRegistered(_account);
    emit LogRegistered(_account, registered);
  }


  function deregisterUser(address _account) public isOwner isOperational {
    require(userProfiles[_account].isRegistered, 'user must be registered');
    
    userProfiles[_account] = UserProfile({
      isRegistered: false,
      isAdmin: false
    });
    bool deregistered = isUserRegistered(_account);
    emit LogDeregistered(_account, deregistered);

  }

  function setOperationalStatus(bool _status) public  isAdmin {
    // operational = _status;
    require(_status != operational, 'status must be different from existing status');

    bool isDuplicate  = false;
    
    for(uint i = 0; i < multiCalls.length; i++ ) {
      if(multiCalls[i] == msg.sender) {
        isDuplicate = true;
        break;
      }
    }

    require(!isDuplicate, 'caller already called the function');
    
    multiCalls.push(msg.sender);
    if(multiCalls.length == M) {
        operational = _status;
        multiCalls = new address[](0);
    }
    emit LogStatusChanged(operational);
  } 
  

  function getOperationalStatus() public view returns(bool) {
    return operational;
  }

  function getOwner() public view returns(address) {
    return owner;
  }


  function isUserRegistered(address _account) public view returns(bool) {
    require(_account != address(0), 'check account cannot be black hole');
    return userProfiles[_account].isRegistered;
  }

  function isUserAdmin(address _account) public view returns(bool) {
    require(_account != address(0), 'check account cannot be black hole');
    return userProfiles[_account].isAdmin;
  }
  

  


}

