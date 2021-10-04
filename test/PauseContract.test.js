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
    })


    it('Should revert non-deployer attempt to register new user', async () => {
      try {
        await pauseContract.registerUser(addr2, true, {from: addr1})
        assert.fail()
        
      } catch(err) {
        assert.notEqual(err.message, "assert.fail()", "caller not owner");
      }
    })
  })

  contract('Register & deregister User', () => {
    it('Allows owner to register & deregister user', async() => {
      const userRegistrationStatusBefore = await pauseContract.isUserRegistered(addr1)
      const userAdminStatusBefore = await pauseContract.isUserAdmin(addr1)

      console.log({
        userAdminStatusBefore,
        userRegistrationStatusBefore
      })
     
      assert.isFalse(userRegistrationStatusBefore)
      assert.isFalse(userAdminStatusBefore)
      
      const registrationResult = await pauseContract.registerUser(addr1, {from: deployer})
      
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

      /**
       *********************************deregister user******************************
       
       *****************************************************************************
      */
      
      // check registration status of registered account before deregister call
      const getRegistrationStatusBefore = async(payload) => await pauseContract.isUserRegistered(payload)
      const getAdminStatusBefore = async(payload) =>  await pauseContract.isUserAdmin(payload)
      assert.isTrue(await getRegistrationStatusBefore(addr1))
      assert.isTrue(await getAdminStatusBefore(addr1))
      
      // deregister user
      const deregisterResult = await pauseContract.deregisterUser(addr1, {from: deployer})
      const getRegistrationStatusAfter = async(payload) => await pauseContract.isUserRegistered(payload)
      const getAdminStatusAfter =  async(payload) => await pauseContract.isUserAdmin(payload)

      console.log('registration status after  deregister', await getRegistrationStatusAfter(addr1))
      console.log('admin status after deregister', await getAdminStatusAfter(addr1))


      assert.isFalse(await getAdminStatusAfter(addr1))
      assert.isFalse(await getRegistrationStatusAfter(addr1))

    
      truffleAssert.eventEmitted(deregisterResult, 'LogDeregistered', (ev) => {
        console.log({evHere: ev})
        return ev.account === addr1 && ev.deregistered === false
      })
    })
  })

  contract('Set operational status', () => {
    it('Sets operational status to false only when the tri-party threshold is reached', async() => {

      const operationalStatusBefore = await pauseContract.getOperationalStatus()
      const operationalStatusAfter = !operationalStatusBefore

      const getRegistrationStatusBefore = async(payload) => await pauseContract.isUserRegistered(payload)
      const getRegistrationStatusAfter = async(payload) => await pauseContract.isUserRegistered(payload)

      
      const getAdminStatusBefore = async(payload) =>  await pauseContract.isUserAdmin(payload)
      const getAdminStatusAfter =  async(payload)=> await pauseContract.isUserAdmin(payload)


      const isAdmin = async(payload) => await pauseContract.isUserAdmin(payload)

      console.log('registration status before ', await getRegistrationStatusBefore(addr1))
      console.log('admin status before', await getAdminStatusBefore(addr1))
      
      assert.isFalse(await getRegistrationStatusBefore(addr1))
      assert.isFalse(await getRegistrationStatusBefore(addr2))
      
      
      const registrationResult1 = await pauseContract.registerUser(addr1, {from: deployer})
      const registrationResult2 = await pauseContract.registerUser(addr2, {from: deployer})
      const registrationResult3 = await pauseContract.registerUser(addr3, {from: deployer})
      const registrationResult4 = await pauseContract.registerUser(addr4, {from: deployer})



      // check if admin status is registered following account registration
      console.log('registration status after', await getRegistrationStatusAfter(addr1))
      console.log('admin status after', await getAdminStatusAfter(addr1))
      assert.isTrue(await getAdminStatusAfter(addr1))
      assert.isTrue(await getAdminStatusAfter(addr2))
      assert.isTrue(await getAdminStatusAfter(addr3))
      assert.isTrue(await getAdminStatusAfter(addr4))
      
      // setting operational status to false
      const setOperationalStatus1 = await pauseContract.setOperationalStatus(false, {from: addr1})
      const setOperationalStatus2 = await pauseContract.setOperationalStatus(false, {from: addr2})
      const setOperationalStatus3 = await pauseContract.setOperationalStatus(false, {from: addr3})
      // const setOperationalStatus4 = await pauseContract.setOperationalStatus(false, {from: addr4})
      

      // check the operational status after tir-party threshold is reached
      assert.isFalse(operationalStatusAfter)

      // check emitted registration event
      truffleAssert.eventEmitted(registrationResult1, 'LogRegistered', (ev) => {
        console.log({evHere: ev})
        return ev.account === addr1 && ev.registered === true
      })
      
      // check event emitted after admin1 set operation call is true 
      truffleAssert.eventEmitted(setOperationalStatus1, 'LogStatusChanged', (ev) => {
        console.log({statusChangedHere: ev})
        return ev.status === true
      })

      // check event emitted after admin2 set operation call is true 
      truffleAssert.eventEmitted(setOperationalStatus2, 'LogStatusChanged', (ev) => {
        console.log({statusChangedHere: ev})
        return ev.status === true
      })

      // check event emitted after admin3 set operation call is false following successful operational status change from true to false
      truffleAssert.eventEmitted(setOperationalStatus3, 'LogStatusChanged', (ev) => {
        console.log({statusChangedHere: ev})
        return ev.status === false
      })
    })
  })
});