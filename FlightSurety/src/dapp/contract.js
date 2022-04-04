import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        
        this.web3.eth.getAccounts((error, accts) => {
            this.owner = accts[0];

            this.flightSuretyData.methods.authorizeContract(this.flightSuretyApp._address).call({from: this.owner});

            let counter = 1;
            

            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }
            callback();
        });
    }

    async registerAndFundAllAirlines() {
            let self = this;
            // registering and funding all airlines. Not providing UI for this. Testing has been done by truffle tests.
            // fund first airline
            // await self.flightSuretyData.methods
            //     .fund()
            //     .call({from: self.airlines[0], value:self.web3.utils.toWei('10', 'ether')})
            //     .then(console.log);

            // let cnt = 1;
            // while(cnt < 5) {
            //     let name = "Airline-"+cnt;
            //     await self.flightSuretyApp.methods
            //         .registerAirline(self.airlines[cnt], name)
            //         .call({from: self.airlines[0]});

            //     await self.flightSuretyData.methods
            //         .fund()
            //         .call({from: self.airlines[0], value:self.web3.utils.toWei('10', 'ether')});
            //     cnt++;
            // }
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    async registerFlight(num, from, to, callback) {
        let self = this;
        console.log( self.airlines[0]);
        await self.flightSuretyApp.methods
            .registerFlight(num, from, to)
            .call({from: self.airlines[0], gas: 3000000})
                .then(console.log);
    }

    async getAllFlights() {
        let self = this;
        let total = parseInt(await self.flightSuretyApp.methods.getTotalFlights().call());
        console.log("total flights - " + total);
        //self.flights = [];
        for (let i = 0; i < total; i++) {
            let res = await this.flightSuretyData.getFlightAtIndex(i).send().then(console.log);
            //self.flights.push(flight)
            //console.log(flight)
        }
        return self.flights;
    }
}