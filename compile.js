const path = require('path');
const fs = require('fs');
const solc = require('solc');

const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const source = fs.readFileSync(lotteryPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'Lottery.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};
//console.log(source)
//solc.compile((input));
//below line shows the full compiled output
//console.log(solc.compile(JSON.stringify(input)));
//below line shows the compiled output of the contracct and more specifically the .contracts['Lottery.sol'].Lottery 
//console.log(JSON.parse(solc.compile(JSON.stringify(input))).contracts['Lottery.sol'].lottery);
// below line when the compile.js file gets required will return exactly the same as above
module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts['Lottery.sol'].lottery;