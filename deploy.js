const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const { abi, evm } = require('./compile');

provider = new HDWalletProvider(
  'hd mnemonic',
  'infura'
);

const web3 = new Web3(provider);

// the only reason for making this function is in order to use the async and await functionality
const deploy = async () => {
  // this gets all the accounts associated to the above mnemonic
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: '1000000', from: accounts[0] });

    // below are the 2 things we need for our dapp. the abi that is the interface of web3 and the address it was deployed
  
  
    // initially used below to export the abi but it returnd outputs probelmatic
    // it returned as [ [Object] ] instead of the actual object inside
  //  console.log(abi);
  
  // so ended up using the below
   var util = require('util');    
   console.log(util.inspect(abi,false,null,true));
  // or this :console.log(JSON.stringify(abi));
  console.log('Contract deployed to', result.options.address);
  
  // below is added to prevent a hanging deployment.
  provider.engine.stop();
};
deploy();
