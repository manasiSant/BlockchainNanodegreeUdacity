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
    uint256 totalAirlines = 0;

    struct Airline {
        bool isRegistered;
        address[] responses;
        string name;
        bool isFundReceived;
    }
    mapping(address => Airline) private airlines;

    mapping(address => uint256) private authorizedContracts;
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

    function getTotalAirlines()  external  view requireIsOperational returns(uint256){
        return totalAirlines;
    }

    function setAirlineAsRegistered(address airline)  external  requireIsOperational requireIsCallerAuthorized {
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
                                string airlineName
                            )
                            external
                            requireIsCallerAuthorized
                            returns(uint256)
    {
        address[] prevResponses = airlines[airlineToRegister].responses;
        /*if(prevResponses.length == 0){
            prevResponses = new address[](0);
        }*/
        airlines[airlineToRegister] = Airline({
                                isRegistered: false,
                                isFundReceived: false,
                                name: airlineName,
                                responses: prevResponses
                        });

        airlines[airlineToRegister].responses.push(msg.sender);
        //airlines[airlineToRegister].responses[airlines[airlineToRegister].responses.length++] = msg.sender;
        return airlines[airlineToRegister].responses.length;
    }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
    {
        require(airlines[msg.sender].isRegistered == true, "Airline should be registered before funding");
        require(airlines[msg.sender].isFundReceived == false, "Airline is already funded");
        require(msg.value >= minimumFundAirlines, "Minimum fund required is 10 Ether");

        msg.sender.transfer(minimumFundAirlines);
        airlines[msg.sender].isFundReceived = true;
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
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}

