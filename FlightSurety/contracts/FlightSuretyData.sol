pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    uint256 minimumFundAirlines = 10 ether; 
    uint256 maximumPurchase = 1 ether;
    uint256 totalAirlines = 0;

    struct Flight {
        string num;
        string from;
        string to;
        address airline;
        bool isRegistered;
    }
    mapping(bytes32 => Flight) private flights;
    bytes32[] registeredFlights;

    struct Airline {
        bool isRegistered;
        address[] responses;
        string name;
        bool isFundReceived;
    }
    mapping(address => Airline) private airlines;

    mapping(address => uint256) private authorizedContracts;

    struct Insurance {
        address airline;
        address passenger;
        uint256 amount;
        bool claimed;
    }
    mapping(bytes32 => Insurance[]) private insurances;

    mapping(address => uint256) private fundsToPay;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                    address firstAirline
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        airlines[firstAirline] = Airline({
                                        isRegistered: true,
                                        isFundReceived: false,
                                        name: 'Jet Airways',
                                        responses: new address[](0)
                                });
        
        totalAirlines = 1;
        authorizedContracts[contractOwner] = 1;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireIsCallerAuthorized()
    {
        require(authorizedContracts[msg.sender] == 1, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    function isAirlineRegistered(address airline) external view returns(bool){
        return(airlines[airline].isRegistered);
    }

    function isAirlineFunded(address airline) external view returns(bool){
        return(airlines[airline].isFundReceived);
    }

    function isFlightRegistered(bytes32 flightKey) external view returns(bool){
        require(flights[flightKey].isRegistered, "flight is not registered");
    }

    function getAirline(address airline) 
                        external view 
                        returns(bool isRegistered,
                        bool isFundReceived,
                        string name){

        isRegistered = airlines[airline].isRegistered;
        isFundReceived = airlines[airline].isFundReceived;
        name = airlines[airline].name;

        return(isRegistered, isFundReceived, name);
    }

    function authorizeContract
                            (
                                address contractAddress
                            )
                            external
                            requireContractOwner
    {
        authorizedContracts[contractAddress] = 1;
    }

    function deauthorizeContract
                            (
                                address contractAddress
                            )
                            external
                            requireContractOwner
    {
        delete authorizedContracts[contractAddress];
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/
    function getAirlinesResponses(address airline) external  view requireIsCallerAuthorized returns(address[]) {
        return airlines[airline].responses;
    }

    function getFlightAtIndex(uint256 i) external view returns(string num, string from, string to, address airline){

        if(registeredFlights.length > i) {
            bytes32 key = registeredFlights[i];
            
            num = flights[key].num;
            from = flights[key].from;
            to = flights[key].to;
            airline = flights[key].airline;
        }
        return(num, from, to, airline);
    }

    function getTotalAirlines()  external  view requireIsOperational returns(uint256){
        return totalAirlines;
    }

    function getTotalFlights() external view returns(uint256) {
        return registeredFlights.length;
    }

    function setAirlineAsRegistered(address airline)  external  requireIsOperational {
        airlines[airline].isRegistered = true;
        totalAirlines = totalAirlines.add(1);
    }

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (
                                address airlineToRegister,
                                string airlineName,
                                address callingAirline
                            )
                            external
                            returns(uint256)
    {
        address[] prevResponses = airlines[airlineToRegister].responses;
        prevResponses.push(callingAirline);
        airlines[airlineToRegister] = Airline({
                                isRegistered: false,
                                isFundReceived: false,
                                name: airlineName,
                                responses: prevResponses
                        });
        return airlines[airlineToRegister].responses.length;
    }

    function registerFlight
                            (
                                string flightNum,
                                string whereFrom,
                                string whereTo,
                                address airline
                            )
                            external
                            returns(bytes32)
    {
        bytes32 flightKey = getFlightKey(airline, flightNum, now);
        flights[flightKey] = Flight({
            num: flightNum,
            airline: airline,
            from: whereFrom,
            to: whereTo,
            isRegistered: true
        });
        registeredFlights.push(flightKey);
        return flightKey;
    }

    function processFlightStatus(address airline, string flight, uint256 timestamp, uint8 statusCode) 
                    external 
                    requireIsOperational 
    {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        if (statusCode == 20) {
            this.creditInsurees(flightKey);
        }
    }

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (  
                                string flightNum,
                                address airline                         
                            )
                            external
                            payable
    {
        require(msg.value <= maximumPurchase, "Max purchase required is 1 Ether");        
        require(airlines[airline].isRegistered , "Airline should be registered");

        // check flight validity
        bool flightValid = false;
        bytes32 flightKey;
        for(uint256 i = 0; i< registeredFlights.length; i++){
            if(compareStrings(flights[registeredFlights[i]].num, flightNum)) {
                flightValid = true;
                flightKey = registeredFlights[i];
                break;
            }
        }
        require(flightValid, "Invalid flight");

        address passenger = msg.sender;
        
        // transfer
        Insurance[] prevInsurances = insurances[flightKey];
        prevInsurances.push(Insurance({
            airline: airline,
            amount: msg.value,
            passenger: passenger,
            claimed: false
        }));
        insurances[flightKey] = prevInsurances;
        passenger.transfer(msg.value);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                    bytes32 flightKey
                                )
                                external
    {
          for (uint256 i = 0; i < insurances[flightKey].length; i++) {
            Insurance claim = insurances[flightKey][i];
            if(claim.claimed == false){
                claim.claimed = true;
            }
            uint256 amount = claim.amount.mul(3).div(2);
            fundsToPay[claim.passenger] = fundsToPay[claim.passenger].add(amount);
        }
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                                address passenger
                            )
                            external
                            returns(uint256)
    {
        uint256 amount = fundsToPay[passenger];
        require(address(this).balance >= amount, "No funds available");
        require(amount > 0, "There are no funds available for withdrawal");
        fundsToPay[passenger] = 0;
        contractOwner.transfer(amount);
        return(amount);
    }

    function getClaimAmount
                            (
                            )
                            external
                            view
                            returns(uint256)
    {
        uint256 amount = fundsToPay[msg.sender];
        return(amount);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (  
                            )
                            external
                            payable
    {
        require(airlines[msg.sender].isRegistered == true, "Airline should be registered before funding");
        require(airlines[msg.sender].isFundReceived == false, "Airline is already funded");
        require(msg.value >= minimumFundAirlines, "Minimum fund required is 10 Ether");

        airlines[msg.sender].isFundReceived = true;
        msg.sender.transfer(minimumFundAirlines);
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight));
    }

    function compareStrings(string memory a, string memory b) public view returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        //fund();
    }


}

