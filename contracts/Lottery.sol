// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract lottery {
    address public manager;
    address payable []  public players;

// no need to use the address of the address sending the transaction as a parameter of the constructor
    constructor() {
        //msg available both in transaction and call
        manager = msg.sender;
    }

// The _; in the modifier is where the internal code of a function that uses this modifier is placed
// in order to be modied with the require as its top command as shown below 
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function enter() public payable {
        require(msg.value >= .001 ether);
        players.push(payable(msg.sender));        
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

// restricted is the modifier created above so that duplicate code not wrtittem. In case we want another
// function to also be restrictes we just add it as a modifier.  
    function pickWinner() public restricted {
        uint index = random() % players.length;
        players[index].transfer(address(this).balance);
        //(0) initiate size of array to 0 with (0)
        players=new address payable [](0);
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

        function getManager() public view returns (address) {
        return manager;
    }
}