const axios = require("axios");

const collections = require("../services/collections");
const { validator } = require("../validators");
const { converter } = require("../helpers/URI");

const BASE_URL = "https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/";

const tokens = [
  { tokenId: "0.0.1270555", name: "Hash Crabs" },
  /*{ tokenId: '0.0.1350444', name: 'HANGRY BARBOONS' },
    { tokenId: '0.0.1043046', name: 'ASHFALL' },
    { tokenId: '0.0.1006183', name: 'Hedera Monkeys' },
    { tokenId: '0.0.732556', name: 'PLANCK EPOCH COLLECTIBLES - ELECTROMAGNETIC' },
    { tokenId: '0.0.1127032', name: 'EARTH-SW' },
    { tokenId: '0.0.968134', name: 'Fugitives V1' },
    { tokenId: '0.0.1235089', name: 'HBAR SHADY\'z GEN-02' },
    { tokenId: '0.0.1003963', name: 'Hederian Dragons Gen-01 Origins' },
    { tokenId: '0.0.752616', name: 'Shibar Holder - Silver Limited Edition' },
    { tokenId: '0.0.1282534', name: 'EARTH-AIR' },
    { tokenId: '0.0.1374909', name: 'Sentient Nightmares' },
    { tokenId: '0.0.895128', name: 'METAVISION GEN2' },
    { tokenId: '0.0.1158353', name: 'Loco Lizardz' },
    { tokenId: '0.0.1064955', name: 'Hashgraph Phantoms' },
    { tokenId: '0.0.1106034', name: 'WokeFemmes' },
    { tokenId: '0.0.1124044', name: 'Golden Banana Coin' },
    { tokenId: '0.0.968220', name: 'Fugitives V1 Pets' },
    { tokenId: '0.0.1097636', name: 'Cyber Hedera Gen-02' },
    { tokenId: '0.0.946799', name: 'WOOKZ Gen. 1' },
    { tokenId: '0.0.1110968', name: 'Sentient Dreams' },
    { tokenId: '0.0.822309', name: 'Gold Trainer Pass (GTP)' },
    { tokenId: '0.0.872340', name: 'Dead Pixels Ghost Pass' },
    { tokenId: '0.0.878200', name: 'Dead Pixels Ghost Club' },
    { tokenId: '0.0.1052238', name: 'Kabila Early Supporters' },
    { tokenId: '0.0.1319909', name: 'Koala Klub Gen 2 (1 point)' },
    { tokenId: '0.0.1404861', name: 'Creamlands Silver' },
    { tokenId: '0.0.930110', name: 'Creamies Collection' },
    { tokenId: '0.0.1393115', name: 'LeemonSwap NFT Presale' }*/
];

// Update? Check if NFTID already exists or overwrite
async function main() {
  try {
    for (let i = 0; i < tokens.length; i++) {
      const tokenInfo = await axios.get(`${BASE_URL}${tokens[i].tokenId}/`);
      const maxSerial = Number(tokenInfo.data.total_supply);
      console.log(`Started: ${tokens[i].name}`)

      for (let j = 1; j <= maxSerial; j++) {
        console.log(`Serial: ${j}`);
        const nftInfo = await axios.get(
          `${BASE_URL}${tokens[i].tokenId}/nfts/${j}`
        );
        const URIObject = converter(nftInfo.data.metadata);

        if (!URIObject.success) {
          console.log(
            `Could not fetch data for: ${tokens[i].tokenId} - Name: ${tokens[i].name}`
          );
          break;
        }

        const metadata = await axios.get(URIObject.URI);

        const errors = validator(metadata.data);
        const nftId = `${tokens[i].tokenId}/${j}`;
        if (errors.length > 0) {
          collections.create(nftId, tokens[i].tokenId, j, 0, 'mainnet',
            JSON.stringify(metadata.data),
            JSON.stringify(errors)
          );
        } else {
          collections.create(
            nftId, tokens[i].tokenId, j, 1, "mainnet",
            JSON.stringify(metadata.data),
            JSON.stringify([])
          );
        }
      }

      console.log('start sleep')
      sleep(5000);
      console.log('end sleep')
      console.log(`Finished: ${tokens[i].name}`)
    }

    // copy the rest from nfts.js -> need validation logic for each project
  } catch (error) {
    console.error("Something went wrong:\n\n");
    console.error(error);
  }
}

function sleep(miliseconds) {
    var currentTime = new Date().getTime();
 
    while (currentTime + miliseconds >= new Date().getTime()) {}
}

main();
