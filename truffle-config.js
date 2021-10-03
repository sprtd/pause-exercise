require('dotenv').config({path: './config/config.env'})

// const path = require('path')


// const HDWalletProvider = require('@truffle/hdwallet-provider');


module.exports = {
  // contracts_build_directory: path.join(__dirname, '/client/src/abi'),
  networks: {

    dev: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 7545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
    ganache: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
   
    // rinkeby: {
    // provider: () => new HDWalletProvider({
    //   mnemonic: process.env.MNEMONIC,
    //   providerOrUrl: process.env.RINKEBY_ENDPOINT
    // }),
    // network_id: 4,   
    // networkCheckTimeout: 999999,
    // },
   
  },

  mocha: {
    // timeout: 100000
  },

  compilers: {
    solc: {
      version: ">=0.5.0",  
    }
  }
};
