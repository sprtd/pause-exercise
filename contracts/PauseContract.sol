// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

contract PauseContract {

  address private owner;
  bool private operational;

  struct  UserProfile {
    bool isRegistered;
    bool isAdmin;
  }

  mapping(address => UserProfile) public userProfiles;

  modifier isOwner() {
    require(msg.sender == owner, 'caller not owner');
    _;
  }

  modifier isOperational() {
    require(operational, 'not in operational state');
    _;
  }
  


  event LogRegistered(address indexed account, bool registered);
  constructor() {
    owner = msg.sender;
    operational = true;

  }

  function setOperationalStatus(bool _status) public isOwner isOperational {
    operational = _status;
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

  function registerUser(address _account, bool _isAdmin) public isOwner isOperational {
    require(!userProfiles[_account].isRegistered, 'user already registered');
    userProfiles[_account] = UserProfile({
      isRegistered: true,
      isAdmin: _isAdmin
    });

    bool registered = isUserRegistered(_account);



    emit LogRegistered(_account, registered);

  }


  




}

