
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirlineRegistered.call(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  it('(airline) Funding airline', async () => {
    
    // ARRANGE
    let fundAmount = web3.utils.toWei('10', 'ether');
    const firstAirline = config.firstAirline;

    // fund first airline
    await config.flightSuretyData.fund({from: firstAirline, value: fundAmount});
    
    let airline = await config.flightSuretyData.getAirline(firstAirline);
    
    // ASSERT
    assert.equal(airline[1], true, "First airline should be funded");
  });

  it('(airline) Add first 4 airlines', async () => {
    
    // ARRANGE
    let fundAmount = web3.utils.toWei('10', 'ether');
    const secondAirline = config.testAddresses[2];
    let name2 = "Air India";
    const thirdAirline = config.testAddresses[3];
    let name3 = "Air Asia";
    const fourthAirline = config.testAddresses[4];
    let name4 = "Air UK";

    const firstAirline = config.firstAirline;
    
    // ACT
    let votes2 = await config.flightSuretyApp.registerAirline(secondAirline, name2, {from: firstAirline});
    await config.flightSuretyApp.registerAirline(thirdAirline, name3, {from: firstAirline});
    await config.flightSuretyApp.registerAirline(fourthAirline, name4, {from: firstAirline});

    let result2 = await config.flightSuretyData.isAirlineRegistered.call(secondAirline); 
    let result3 = await config.flightSuretyData.isAirlineRegistered.call(thirdAirline); 
    let result4 = await config.flightSuretyData.isAirlineRegistered.call(fourthAirline); 
    
    await config.flightSuretyData.fund({from: secondAirline, value: fundAmount});
    await config.flightSuretyData.fund({from: thirdAirline, value: fundAmount});
    await config.flightSuretyData.fund({from: fourthAirline, value: fundAmount});

    let result5 = await config.flightSuretyData.isAirlineFunded.call(secondAirline); 
    let result6 = await config.flightSuretyData.isAirlineFunded.call(thirdAirline); 
    let result7 = await config.flightSuretyData.isAirlineFunded.call(fourthAirline); 
    
    // ASSERT
    assert.equal(result2, true, "Second airline should be registered and funded");
    assert.equal(result2 && result5, true, "Second airline should be registered and funded");
    assert.equal(result3 && result6, true, "Third airline should be registered and funded");
    assert.equal(result4 && result7, true, "Fourth airline should be registered and funded");
  });

  it('(airline) Add 5th airline', async () => {
    
    // ARRANGE
    let fundAmount = web3.utils.toWei('10', 'ether');
    const fifthAirline = config.testAddresses[5];
    const secondAirline = config.testAddresses[2];
    let name5 = "Air USA";
    
    // ACT
    await config.flightSuretyApp.registerAirline(fifthAirline, name5, {from: config.firstAirline});
    let res1 =  await config.flightSuretyData.isAirlineRegistered.call(fifthAirline);
    
    await config.flightSuretyApp.registerAirline(fifthAirline, name5, {from: secondAirline});
    let res2 =  await config.flightSuretyData.isAirlineRegistered.call(fifthAirline);
    
    // ASSERT
    assert.equal(res1, false, "Fifth airline should NOT be registered");
    assert.equal(res2, true, "Fifth airline should be registered now");
  });

  it('(flight) Register Flights', async () => {
    // ARRANGE
    const airline = config.firstAirline;
    
    // ACT
    await config.flightSuretyApp.registerFlight("123", "abc", "xyz", {from: airline});
    await config.flightSuretyApp.registerFlight("456", "lmn", "pqr", {from: config.testAddresses[2]});
    await config.flightSuretyApp.registerFlight("789", "zxcv", "asdf", {from: config.testAddresses[3]});

    let res1 = await config.flightSuretyData.getFlightAtIndex(0);
    let res2 = await config.flightSuretyData.getFlightAtIndex(1);
    let res3 = await config.flightSuretyData.getFlightAtIndex(2);

    assert.equal(res1[0], "123", "id not matching");
    assert.equal(res2[0], "456", "id not matching");
    assert.equal(res3[0], "789", "id not matching");
  });


  it('(passenger) Buy insurance', async () => {
    // ARRANGE
    const airline = config.firstAirline;
    const passenger = config.testAddresses[5];
    let res1 = await config.flightSuretyData.getFlightAtIndex(0);
    let insuranceAmount = web3.utils.toWei('1', 'ether');
    let flight = res1[0];
    // ACT
    await config.flightSuretyData.buy(flight, airline, {from: passenger, value: insuranceAmount});    
  });

});
