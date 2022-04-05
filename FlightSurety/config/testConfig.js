
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');
const { config } = require('webpack');

var Config = async function(accounts) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0x8da08f73cf6da7a772ac245dd3f059ea32fa971f",
        "0xac9eb8d04249844d65a78ab3ef539c0cbb5beb22",
        "0x3e7a783b924c2b50521bb0f53ccfcf05ca8e9385",
        "0x1fd83d18302af8bea4ac3cac10c17e952e41c342",
        "0x803b24e5763578dba908b3315c06128122cc644c",
        "0x2f6554106fee6e45ce3b2dbe621bb810c0f7ae3c",
        "0x5d2cc4c764be3a760d4ff4c8157938b1bc6828a3",
        "0xb0b7b4f537f8577975bc9b2b82c2274c481f1d30",
        "0xa10c37149db83791ed5eb81256d3f76ff522bd78",
        "0x5e086a08939e02612c77790f32217be736d16e01"
    ];


    let owner = accounts[0];
    const firstAirline = accounts[1];

    let flightSuretyData = await FlightSuretyData.new(firstAirline);
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);
    
    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};