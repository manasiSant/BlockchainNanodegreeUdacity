
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // get all flights
        async function getAllFlights() {
            let flights = await contract.getAllFlights();
            let flightsDiv = DOM.elid('flights');
            while (flightsDiv.hasChildNodes()) {
                flightsDiv.removeChild(flightsDiv.firstChild);
            }
            if (flights.length > 0) {
                flights.forEach(function(flight) {
                    flightsDiv.appendChild(flight);
                });
            }
        }
        getAllFlights();

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    
        // register and fund all airlines
        async function registerAndFundAllAirlines() {
            await contract.registerAndFundAllAirlines((error, result) => {
                console.log(error,result);
                display('All airlines are registered and funded');
            });
        }
        registerAndFundAllAirlines();

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        // Register flight
        DOM.elid('registerFlight').addEventListener('click', async() => {
            let num = DOM.elid('flightNo').value;
            let from = DOM.elid('from').value;
            let to = DOM.elid('to').value;
            console.log("calling flight register - " + num + " " + from + " "+ to);
            contract.registerFlight(num, from, to, (error, result) => {
                console.log("flight register done");
                alert("Fligth registered");
            });
        });

        // get all flights
        DOM.elid('allFlights').addEventListener('click', async() => {
            contract.getAllFlights((error, result) => {
                console.log(result);
            });
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







