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

            this.flightSuretyData.methods.authorizeContract(this.flightSuretyApp._address).send({from: this.owner});
            this.flightSuretyData.methods.authorizeContract(this.owner).send({from: this.owner});

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

    
    isOperational(callback) {
        let self = this;
        self.flightSuretyApp.methods
             .isOperational()
             .call({ from: self.owner}, callback);
    }

    async fundFirstAirline() {
            let self = this;
            // registering and funding all airlines. Not providing UI for this. Testing has been done by truffle tests.
            // fund first airline
            let res = await self.flightSuretyData.methods.getAirline(self.airlines[0]).call();
            
            await self.flightSuretyData.methods
                .fund()
                .send({from: self.airlines[0], value:self.web3.utils.toWei('10', 'ether'), gas: 5000000,
                gasPrice: 406726626})
                .then(console.log);
            console.log("Funding done for first airline ");
            
            res = await self.flightSuretyData.methods.getAirline(self.airlines[0]).call();
            return {address: self.airlines[0], name: res.name}; 
    }

    async registerFlight(num, from, to, callback) {
        let self = this;
        let res = await self.flightSuretyApp.methods
            .registerFlight(num, from, to)
            .send({from: self.airlines[0], gas: 5000000, gasPrice: 65608032})
                .then(console.log);
        console.log(res);
    }

    async getAllFlights() {
        let self = this;
        let total = parseInt(await self.flightSuretyApp.methods.getTotalFlights().call());
        console.log("total flights - " + total);
        self.flights = [];
        for (let i = 0; i < total; i++) {
            let res = await self.flightSuretyData.methods.getFlightAtIndex(i).call();
            let flight = {
                num: res[0],
                from: res[1],
                to: res[2]
            }
            self.flights.push(flight)
        }
        return self.flights;
    }

    async purchaseInsurance(InsuranceForflight, val) {
        let self = this;
        
        console.log("Purchasing insurance");
        console.log(val);
        console.log(InsuranceForflight);
        let res = await self.flightSuretyData.methods.buy(InsuranceForflight, self.airlines[0])
            .send({from: self.passengers[0], value:self.web3.utils.toWei(val.toString(), 'ether'),
            gas: 500000, gasPrice: 80876286});
        console.log(res);
    }
    
    async getClaimAmount() {
        let self = this;
        let res = await self.flightSuretyData.methods.getClaimAmount()
            .call({from: self.passengers[0], gas: 500000, gasPrice: 80876286});
        console.log(res);
        return res;
    }

    async paymentInsurance(){
        let self = this;
        let res = await self.flightSuretyData.methods.pay(self.passengers[0])
            .send({from: self.passengers[0], gas: 500000, gasPrice: 3597550});
        console.log(res);
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
}