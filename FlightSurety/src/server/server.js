import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
//import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';

import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

let STATUS_CODE_UNKNOWN = 0;
let STATUS_CODE_ON_TIME = 10;
let STATUS_CODE_LATE_AIRLINE = 20;
let STATUS_CODE_LATE_WEATHER = 30;
let STATUS_CODE_LATE_TECHNICAL = 40;
let STATUS_CODE_LATE_OTHER = 50;

let defaultStatus = STATUS_CODE_ON_TIME;


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
//let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
let  oraclesCount = 20;


var oracles = [];
var oracleIndices = new Map();
async function initOracles(accounts) {
  let fee = await flightSuretyApp.methods.REGISTRATION_FEE().call();
  
  for(let a=0; a<oraclesCount; a++) {
    await flightSuretyApp.methods.registerOracle().send({ 
      "from": accounts[a], 
      "value": fee,
      "gas": 5000000,
      "gasPrice": 546345155 });
      let indices = await flightSuretyApp.methods.getMyIndexes().call({from: accounts[a]});
      oracleIndices.set(accounts[a], indices);
      console.log("registered oracle " + accounts[a] + " - with indices - " + oracleIndices.get(accounts[a]));
  }
}

async function getOracleAccounts() {
  let accountList = await web3.eth.getAccounts();
  if(accountList.length < oraclesCount){
    oraclesCount = accountList.length;
    oracles = accountList;
  }
  else {
    oracles = accountList.slice(20, 20+oraclesCount);
  }
  return oracles;
}

getOracleAccounts().then(accounts => {
  initOracles(accounts)
});

flightSuretyApp.events.OracleRequest({
    fromBlock: 'latest'
  }, function (error, event) {
    if (error) {
      console.log(error)
    }
    console.log(event);
    let index = event.returnValues.index;
    
    for(let i=0;i < oracles.length; i++){   
      let indices = oracleIndices.get(oracles[i]);
      indices.forEach((currIndex) => {
        if(index == currIndex) {
          console.log(`Oracle: ${oracles[i]} invoked. Index: ${index}.`);
          submitOracleResponse(oracles[i], index, event.returnValues.airline, event.returnValues.flight, event.returnValues.timestamp);
        }
      });
    }
});

function submitOracleResponse (oracle, index, airline, flight, timestamp) {
  var statusCode = (Math.floor(Math.random() * Math.floor(4)) + 1) * 10 + 10;
  flightSuretyApp.methods
  .submitOracleResponse(index, airline, flight, timestamp, statusCode)
  .send({ from: oracle,
    gas: 500000,
    gasPrice: 20000000}, (error, result) => {
    if(error){
      console.log(error, flight);
    }
  });
}

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;