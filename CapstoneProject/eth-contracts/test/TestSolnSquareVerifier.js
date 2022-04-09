const zokratesGeneratedProof = require("../../zokrates/code/square/proof.json");
const SolnSquareVerifier = artifacts.require('SolnSquareVerifier');
var Verifier = artifacts.require('Verifier');

contract('TestSolnSquareVerifier', accounts => {
    const acc1 = accounts[0];
    const acc2 = accounts[1];

    describe('Test SolnSquareVerifier', function(){
        beforeEach(async function() {
            let verifierContract = await Verifier.new({from: acc1})
            this.contract = await SolnSquareVerifier.new(verifierContract.address, {from: acc1})
        });

        // Test if a new solution can be added for contract - SolnSquareVerifier
        it('add new solutions', async function(){
            let to = acc2;
            let tokenId = 999;
            let proofs = Object.values(zokratesGeneratedProof.proof);
            let inputs = zokratesGeneratedProof.inputs;
            let tx = await this.contract.addSolution(to, tokenId, ...proofs, inputs, {from: acc1});
            let solutionAddedEvent = tx.logs[0].event;
            assert.equal(solutionAddedEvent, 'SolutionAdded', 'SolutionAdded event expected');
        });

        // Test if an ERC721 token can be minted for contract - SolnSquareVerifier
        it('should mint tokens for contract', async function(){
            let tx = await this.contract.mint(acc2, 1, {from: acc1});
            let tokenMintedEvent = tx.logs[0].event;
            assert.equal(tokenMintedEvent, 'Transfer', 'Transfer event expected');
        });

    });
});

