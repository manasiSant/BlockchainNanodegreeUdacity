var ERC721MintableComplete = artifacts.require('CustomizedTokenERC721');

contract('TestERC721Mintable', accounts => {

    const acc1 = accounts[0];
    const acc2 = accounts[1];
    const acc3 = accounts[2];

    const acc2Cnt = 10;
    const acc3Cnt = 30;

    describe('match erc721 spec', function () {
        beforeEach(async function () { 
            this.contract = await ERC721MintableComplete.new({from: acc1});

            // TODO: mint multiple tokens
            for(let i =0;i < acc2Cnt; i++){
                await this.contract.mint(acc2, i + acc2Cnt);
            }

            for(let i =0;i < acc3Cnt; i++){
                await this.contract.mint(acc3, i + acc3Cnt);
            }
        })

        it('should return total supply', async function () { 
            let total = await this.contract.totalSupply.call({from: acc1});
            let expectedTotal = acc2Cnt + acc3Cnt;
            assert.equal(total, expectedTotal, "Not matching");
        })

        it('should get token balance', async function () { 
            let b2 = await this.contract.balanceOf.call(acc2);
            let b3 = await this.contract.balanceOf.call(acc3);
            assert.equal(b2 , acc2Cnt, "Balance not matching for account 2");
            assert.equal(b3, acc3Cnt, "Balance not matching for account 3");
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () { 
            let tokenId = acc2Cnt +2; // picking some random token
            let expectedTokenUri = "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/" + tokenId;
            let tokenUri = await this.contract.tokenURI.call(tokenId, {from: acc1});
            assert.equal(
                tokenUri,
                expectedTokenUri,
                "tokenURI not matching");
        })

        it('should transfer token from one owner to another', async function () { 
            let tokenId = acc2Cnt; // picking some random token
            await this.contract.safeTransferFrom(acc2, acc3, tokenId, {from: acc2});
            let owner = await this.contract.ownerOf(tokenId);
            assert.equal(owner, acc3, "Token transfer failed");
        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () { 
            this.contract = await ERC721MintableComplete.new({from: acc1});
        })

        it('should fail when minting when address is not contract owner', async function () { 
            let success = true;
            try{
                await this.contract.mint(acc2, 6, {from: acc3});
            }
            catch(e){
                success = false;
            }
            
            assert.equal(success, false, "Exception was expected");
        })

        it('should return contract owner', async function () { 
            let actualOwner = await this.contract.getContractOwner();
            assert.equal(actualOwner, acc1, "Wrong contract owner");          
        })

    });
})