const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
// the below is not capital as it is the instance of the class created above. The provider is the connection
// between the web3 instance and the respective blockchain. in this case the ganache.provider connects us to ganache
const web3 = new Web3(ganache.provider());
// const {a,b} = object assigns the properties of object a and b directly to a and b. so require('../compile')
// returns an object that has bytecode and interface and we pass thaem to these 2 values
const { abi, evm } = require('../compile')

// define outside the beforeEach so that we can pass it again in the it statements. accounts is the accounts on ganache that
// are unlucked and can be used for testing
let accounts;
// lottery is the contract so that we use it for viewing the contract with console.log etc.  this is also the interaction 
//with the contract so we can write interact directly with functions on the contract and test them
let lottery;

// the async keyword denotes that the () function is asynccronous in nature so that we can use await inside it
beforeEach(async ()=>{
  // get a list of all the accounts
  // web3.eth.getAccounts() produces a promise, the awai waits for the async reply and passes it to accounts
  accounts = await web3.eth.getAccounts();
  // use one of the accounts to deploy the contract. To do this we need the interface - the abi and the bytecode
  lottery = await new web3.eth.Contract(abi)
    .deploy({data: evm.bytecode.object })
    .send({ from: accounts[0], gas: '1000000' });
});


describe('lottery tests', () => {
  // check inside the contract.options.address property that an address has been given
  // the assert.ok checks if the value inside is defined and passes
  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  // try to send money from one account and check that this money was sent and that the array stores the correct values
  it( 'Allows one account to enter', async ()=> {
    //the before each has deployed the contract so here we send from the same account that 
    // created the contract 0.02 eth
    await lottery.methods.enter().send({
      from: accounts[0],
      //web3.utils.toWei converts 0.02 ether to wei that our contract expects
      value : web3.utils.toWei('0.02','ether')
    })
    // once the account has sent the eth the players array must have one value and that value must be accounts[0]
    // to assert both of these we need to retrieve the array of players first and then do the asserts
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    })
    assert.equal(accounts[0], players[0])
    assert.equal(1, players.length)
  });

  // try to send money from multuple accounts
  it( 'Allows multiple account to enter', async ()=> {
   // as above but multiple accounts
    await lottery.methods.enter().send({
      from: accounts[0],
      value : web3.utils.toWei('0.02','ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value : web3.utils.toWei('0.02','ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value : web3.utils.toWei('0.02','ether')
    });
    // once the account has sent the eth the players array must have one value and that value must be accounts[0]
    // to assert both of these we need to retrieve the array of players first and then do the asserts
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    })
    assert.equal(accounts[0], players[0])
    assert.equal(accounts[1], players[1])
    assert.equal(accounts[2], players[2])
    assert.equal(3, players.length)
  });
  
  //try and send less than 0.01 eth so that the contract fails and see if it actually does
  it('enter fails < 0.01 et' , async ()=>{
    
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value : web3.utils.toWei('0.0001','ether')
      });
      //if it passes the try catch then we want the test to fail so we pass the below assert(false) to throw an error 
      assert(false)
    }
    catch (err) {
      //this will be reached if the above try fails which is what we want. in this case we assert(err) and because 
      // err has a value this will return true so the test will pass
      assert(err)
    }
  });

  // check the restricted modifier of winner
  it('Only manager can pickWinner' , async ()=>{
    
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      //if it passes the try catch then we want the test to fail so we pass the below assert(false) to throw an error 
      assert(false)
    }
    catch (err) {
      //this will be reached if the above try fails which is what we want. in this case we assert(err) and because 
      // err has a value this will return true so the test will pass
      assert(err)
    }
  });

  // enter one sigle player, pick a winner check everything
  it('full test', async () => {

    await lottery.methods.enter().send({
      from: accounts[0],
      value : web3.utils.toWei('2','ether')
    });

    // check accounts[0] how much money it has before entering the contract
    const initialBalance = await web3.eth.getBalance(accounts[0]);

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    // check accounts[0] how much money it has after winning the contract
    const finalBalance = await web3.eth.getBalance(accounts[0]);

    //the difference will not be 2 ether because money was spent on gas so we put something around 1.8
    const difference = finalBalance - initialBalance 
    assert(difference > web3.utils.toWei('1.8', 'ether') )

    //to see the amount of gas used we can writethe below
    //console.log(finalBalance - initialBalance)


  });

});