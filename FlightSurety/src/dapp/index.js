
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        // register and fund all airlines
        async function fundFirstAirline() {
                let res = await contract.fundFirstAirline((error, result) => {
                console.log(error,result);
            });
            display('Airline', '',[{label: 'details', value: res.address + ' ' +res.name}]);
        }
        fundFirstAirline();

        // Hardcoded flights
        function getAllFlights() {
            
            let flightsDropDown = DOM.elid('flightsList');
            let flightsDropDown2 = DOM.elid('flightsList2');
            let flights = []

            // 1st flight
            let flight = {num: "J123", from: "Pune", to: "London"};
            flights.push(flight);
            var option = document.createElement("option");
            option.text = flight.num + " " + flight.from + " " + flight.to;
            var option2 = document.createElement("option");
            option2.text = flight.num + " " + flight.from + " " + flight.to;
            flightsDropDown.add(option);
            flightsDropDown2.add(option2);
            contract.registerFlight(flight.num, flight.from, flight.to, (error, result) => {
                console.log("flight register done");
                alert("Fligth registered");
            });

            // 2nd flight
            flight = {num: "J456", from: "Delhi", to: "London"};
            flights.push(flight);
            option = document.createElement("option");
            option.text = flight.num + " " + flight.from + " " + flight.to;
            option2 = document.createElement("option");
            option2.text = flight.num + " " + flight.from + " " + flight.to;
            flightsDropDown.add(option);
            flightsDropDown2.add(option2);
            contract.registerFlight(flight.num, flight.from, flight.to, (error, result) => {
                console.log("flight register done");
                alert("Fligth registered");
            });
            
            //3rd flight
            flight = {num: "J7890", from: "Pune", to: "Bangalore"};
            flights.push(flight);
            option = document.createElement("option");
            option.text = flight.num + " " + flight.from + " " + flight.to;
            option2 = document.createElement("option");
            option2.text = flight.num + " " + flight.from + " " + flight.to;
            flightsDropDown.add(option);
            flightsDropDown2.add(option2);
            contract.registerFlight(flight.num, flight.from, flight.to, (error, result) => {
                console.log("flight register done");
                alert("Fligth registered");
            });
            
            //4th flight
            flight = {num: "J678", from: "Mumbai", to: "Chennai"};
            flights.push(flight);
            option = document.createElement("option");
            option.text = flight.num + " " + flight.from + " " + flight.to;
            option2 = document.createElement("option");
            option2.text = flight.num + " " + flight.from + " " + flight.to;
            flightsDropDown.add(option);
            flightsDropDown2.add(option2);
            contract.registerFlight(flight.num, flight.from, flight.to, (error, result) => {
                console.log("flight register done");
                alert("Fligth registered");
            });
            
            //5th flight
            flight = {num: "J4532", from: "London", to: "New york"};
            flights.push(flight);
            option = document.createElement("option");
            option.text = flight.num + " " + flight.from + " " + flight.to;
            option2 = document.createElement("option");
            option2.text = flight.num + " " + flight.from + " " + flight.to;
            flightsDropDown.add(option);
            flightsDropDown2.add(option2);
            contract.registerFlight(flight.num, flight.from, flight.to, (error, result) => {
                console.log("flight register done");
                alert("Fligth registered");
            });

            let flightsDiv = DOM.elid('flights');
            
            while (flightsDiv.hasChildNodes()) {
                flightsDiv.removeChild(flightsDiv.firstChild);
            }
            let str = "<br/>";
            if (flights && flights.length > 0) {
                flights.forEach(function(flight) {
                    str += flight.num + " " + flight.from + " "  + flight.to;
                    str += "<br/><br/>"
                });
                flightsDiv.innerHTML = str;
            }
        }
        getAllFlights();

        async function purchaseInsurance() {   
            // purchase insurance
            DOM.elid('purchase').addEventListener('click', async() => {
                let flight = DOM.elid('flightsList').value;
                flight = flight.split(" ")[0];
                let amt = DOM.elid('amount').value;
                console.log(flight);
                console.log(amt);
                contract.purchaseInsurance(flight, amt);
            });
        }
        purchaseInsurance();

        async function paymentInsurance() {   
            // purchase insurance
            DOM.elid('payment').addEventListener('click', async() => {
                contract.paymentInsurance();
            });
        }
        paymentInsurance();

        async function getClaimAmount() {   
            // purchase insurance
            DOM.elid('getAmount').addEventListener('click', async() => {
                contract.getClaimAmount();
            });
        }
        getClaimAmount();

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flightsList2').value;
            flight = flight.split(" ")[0];
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
        
        contract.flightSuretyApp.events.FlightStatusInfo({
            fromBlock: 0
          }, function (error, result) {
            if (error) console.log(error)
            else{
                console.log(result);
                console.log(result.args);
                display('Oracles', 'Trigger oracles', [ { label: 'Flight Status Info', error: error, value: result + ' ' + result.args.flight + ' ' + result.args.timestamp} ]);
            }
        });
    });
})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}
