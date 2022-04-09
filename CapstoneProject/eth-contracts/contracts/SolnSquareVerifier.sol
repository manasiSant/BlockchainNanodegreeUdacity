pragma solidity >=0.4.21 <0.6.0;

// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
import "./ERC721Mintable.sol";
import "./verifier.sol";

// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is Verifier, CustomizedTokenERC721{

    // TODO define a solutions struct that can hold an index & an address
    struct Solution {
        address addr;
        uint256 index;
    }

    // TODO define an array of the above struct (tokenId => Solution)
    mapping(uint256 => Solution) solutions;

    // TODO define a mapping to store unique solutions submitted
    mapping(bytes32 => bool) uniqueSolutions;


    // TODO Create an event to emit when a solution is added
    event SolutionAdded(uint256 index, address addr);

    // TODO Create a function to add the solutions to the array and emit the event
    function addSolution(address _addr, uint256 _index, uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[2] memory input) public{
        bytes32 _key = keccak256(abi.encodePacked(a, b, c, input));
        require(!uniqueSolutions[_key], "Solution already exists");
        uniqueSolutions[_key] = true;
        solutions[_index] = Solution({
            index: _index,
            addr: _addr
        });

        emit SolutionAdded(_index, _addr);
    }

    // TODO Create a function to mint new NFT only after the solution has been verified
    //  - make sure the solution is unique (has not been used before)
    //  - make sure you handle metadata as well as tokenSuplly
    function mint(address to, uint256 tokenId, uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[2] memory input)
    public returns(bool) {
        require(solutions[tokenId].index != tokenId,"solution already exist");
        require(verifyTx(a, b, c, input), "proof is not valid");
        addSolution(to, tokenId, a, b, c, input);
        return super.mint(to, tokenId);
    }
} 
