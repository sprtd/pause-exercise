const PauseContract = artifacts.require('PauseContract')

module.exports = async deployer => {
  try {
    await deployer.deploy(PauseContract)
    const pauseContract =  await PauseContract.deployed()
    console.log({ deployedAddress: pauseContract.address})

  } catch {
    console.log('deploy error: ', err)
  }

}