const HDWalletProvider = require("truffle-hdwallet-provider")
const web3 = require('web3')
const config = require('./config');
/* const MNEMONIC = process.env.MNEMONIC
const INFURA_KEY = process.env.INFURA_KEY
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS
const OWNER_ADDRESS = process.env.OWNER_ADDRESS
const NETWORK = process.env.NETWORK */
const MNEMONIC = config.MNEMONIC;
const INFURA_KEY = config.INFURA_KEY;
let NFT_CONTRACT_ADDRESS = config.NFT_CONTRACT_ADDRESS;
let OWNER_ADDRESS = config.OWNER_ADDRESS.;
const NETWORK = config.NETWORK;
const NUM_TOKENS = config.NUM_TOKENS;
const proof = [
    require('./proof1'),
    require('./proof2'),
    require('./proof3'),
    require('./proof4'),
    require('./proof5'),
    ];
const CONTRACT_FILE = require('../build/contracts/SolnSquareVerifier');
const NFT_ABI = CONTRACT_FILE.abi;

async function main() {
    console.log(MNEMONIC);
    if (!MNEMONIC || !INFURA_KEY || !OWNER_ADDRESS || !NETWORK) {
        console.error("Please set a mnemonic, infura key, owner, network, and contract address.")
        return;
    }
    const provider = new HDWalletProvider(MNEMONIC, `https://${NETWORK}.infura.io/v3/${INFURA_KEY}`)
    const web3Instance = new web3(
        provider
    )

    if (NFT_CONTRACT_ADDRESS) {
        const customizedERC721 = new web3Instance.eth.Contract(NFT_ABI, NFT_CONTRACT_ADDRESS, { gasLimit: "1000000" })
        // tokens issued directly to the owner.
        for (let i = 0; i < NUM_TOKENS ; i++) {
            try {
                let proofs = Object.values(proof[i].proof);
                let inputs = proof[i].inputs;
                console.log("OWNER_ADDRESS "+ OWNER_ADDRESS + "\n");
                console.log("i "+i+ "\n");
                console.log("proofs "+ proofs+ "\n");
                console.log("inputs "+ inputs+ "\n");
                //let tx = await customizedERC721.methods.addSolution(OWNER_ADDRESS, i, ...proofs, inputs).send({ from: OWNER_ADDRESS });
                //console.log("Solution added. Transaction: " + tx.transactionHash);
                let tx = await customizedERC721.methods.mint(OWNER_ADDRESS, i, ...proofs, inputs).send({ from: OWNER_ADDRESS });
                console.log("Minted item. Transaction: " + tx.transactionHash);
            } catch (e) {
                console.log(e);
            }
        }
    }
}

main()