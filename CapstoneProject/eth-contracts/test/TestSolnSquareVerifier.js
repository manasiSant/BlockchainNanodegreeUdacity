const SolnSquareVerifier = artifacts.require('SolnSquareVerifier');

contract('TestSolnSquareVerifier', accounts => {
    let input1 = ["0x57046c993008ea5d24b124d51ec97de6f854abe44f8c75245ad722f44913344", "0x25d7a120ed1611398c028e4dbcd69725f66dfeeba9e99359cf2390b54e8d8b2f"];
    let input1P = ["0x25f6ea15c376b1e9f9fdd315349e23c43db8029e5bbbe16d350e4dbe687dc4d0", "0x29ad557543324314477a0f5177bde6bea7d7ba3ebfa0356d2f971d2313105216"];
    let input2 = [["0xc8e93f3182f770ae8cc7bd76965367f6eecd5ac85b470416aa60a50375f537", "0x2a3923c7d0cbe11583ffbd0f7b7d5a7c64c9a6274476acaa670e9f18ecfb0c4e"], ["0xd7be41fbef5e27d03e8d7e46fd8e832fd46d295cb9e4c0c64b348b68666ac22", "0xda150c8244139aea2e74f6c1c70e8e6e5ab82a065b7293620fa87c57b7ba27d"]];
    let input2P = ["0x3cd4f718e47ba7ea730bf25601a34977495d098b5896f522b50f183c717289", "0x1739874b2c37fe56c241a05a9abc0a63a74d556cddc977e5ef8fc30c1bd6207e"];
    let input3 = ["0x2401cae8a548f00f0416c73c41bd50f425d92b4807c79170443b5d6222bf90dc", "0x21f10d4f04508e1f48072890ab654aa9c7e8eee4a1d9e1778701eba31f2597db"];
    let input3P = ["0x1b95272fab7b1973c5bbaf8d0ed90a0bce886a221c1385e50bd690b0313807c8", "0x1db768c4ccab4b25ac0f4b805e568cf80a877574d0765da7bc649f5f5f5fb539"];
    H = ["0xfb98f2115c2de86ccf168cafcd2b883d6a19f427ba57e38c5af40bfd8d8ddc7", "0x211fac325001a11fe095e60ca3f34a80a8e8af3171df840bd69bff3438205b4b"];
    K = ["0x132d85e5b9995fb0ec7d1d848b20222287419ab23d2c9ac435c7ab17262a9b09", "0x4010b22a996e0e7f5c7110ff00619b9634bb6f8ed65b3351d45f25fe863f9b7"];
    input = [1,9,1];

    describe('Test SolnSquareVerifier', function(){
        beforeEach(async function() {
            this.contract = await SolnSquareVerifier.new();
        });

        // Test if a new solution can be added for contract - SolnSquareVerifier
        it('add new solutions', async function(){
            let tx = await this.contract.mint(accounts[2], 5, input1, input1P, input2, input2P, input3, input3P, 
                H, K, input);
            
            let added_event = tx.logs[1].event;
            assert.equal(added_event, 'SolutionAdded', 'Invalid event emitted');
        });

        // Test if an ERC721 token can be minted for contract - SolnSquareVerifier
        it('should mint tokens for contract', async function(){
            await this.contract.mint(accounts[1],1,"token");
            let balance = await this.contract.balanceOf(accounts[1]);
            assert.equal(balance, 1, "expected balance 1");
        });

    });
});

