const truffleAssert = require('truffle-assertions')
const PauseContract = artifacts.require('PauseContract');


let pauseContract, deployer, addr1, addr2, addr3, addr4

contract('PauseContract', async (accountsPayload) => {
  /* create named accountsPayload for contract roles */
  deployer = accountsPayload[0];
  addr1 = accountsPayload[1];
  addr2 = accountsPayload[2];
  addr3 = accountsPayload[3];
  addr4 = accountsPayload[4]
 
  beforeEach(async () => {
    /* before tests */
    pauseContract = await PauseContract.deployed()
  })
     
    
  
  contract('Deployment', () => {
    it('Sets operational bool to true and deployer address as owner following successful contract deployment', async() => {
      const state = await pauseContract.getOperationalStatus()
      const deployerAccount = await pauseContract.getOwner()
      assert.isTrue(state)
      assert.equal(deployerAccount, deployer)
    })
  })

  contract('Revert Non-Owner', () => {
    it('Should revert non-deployer attempt to set operational status', async () => {
      try {
        await pauseContract.setOperationalStatus(true, {from: addr1})
        assert.fail()
        
      } catch(err) {
        assert.notEqual(err.message, "assert.fail()", "caller not owner");
      }
    });
    it('should revert non-deployer attempt to register new user', async () => {
      try {
        await pauseContract.registerUser(addr2, true, {from: addr1})
        assert.fail()
        
      } catch(err) {
        assert.notEqual(err.message, "assert.fail()", "caller not owner");
      }
    });
  })

  contract('Register User', () => {
    it('Allows owner to register new user', async() => {
      const userRegistrationStatusBefore = await pauseContract.isUserRegistered(addr1)
      const userAdminStatusBefore = await pauseContract.isUserAdmin(addr1)

      console.log({
        userAdminStatusBefore,
        userRegistrationStatusBefore
      })
     
      assert.isFalse(userRegistrationStatusBefore)
      assert.isFalse(userAdminStatusBefore)
      
      const registrationResult = await pauseContract.registerUser(addr1, true, {from: deployer})
      
      const userRegistrationStatusAfter = await pauseContract.isUserRegistered(addr1)
      const userAdminStatusAfter = await pauseContract.isUserAdmin(addr1)

      console.log({
        userRegistrationStatusAfter,
        userAdminStatusAfter
      })
      assert.isTrue(userRegistrationStatusAfter)
      assert.isTrue(userAdminStatusAfter)

      truffleAssert.eventEmitted(registrationResult, 'LogRegistered', (ev) => {
        console.log({evHere: ev})
        return ev.account === addr1 && ev.registered === true
      })
    })
  })
});
 