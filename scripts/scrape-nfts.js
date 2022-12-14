require("dotenv").config();

const axios = require("axios");
const axiosInstance = axios.create({
  timeout: 5000,
  headers: {'accept-encoding': '*'}
});

const collections = require("../services/collections");
const { validator, defaultVersion } = require('@michielmulders/hip412-validator');
const { converter } = require("../helpers/URI");

const BASE_URL = "https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/";

/* Results:
 * - Total number of NFTs to be scraped: 62599 from 49 projects.
 * - Average number of NFTs per project: 1278
 */
const tokens = [
    { tokenId: '0.0.1270555', name: 'Hash Crabs', supplyType: 'FINITE', supply: '777' },
    { tokenId: '0.0.1350444', name: 'HANGRY BARBOONS', supplyType: 'FINITE', supply: '444' },
    { tokenId: '0.0.1043046', name: 'ASHFALL', supplyType: 'INFINITE', supply: '507' },
    { tokenId: '0.0.1006183', name: 'Hedera Monkeys', supplyType: 'FINITE', supply: '1243' },
    { tokenId: '0.0.732556', name: 'PLANCK EPOCH COLLECTIBLES - ELECTROMAGNETIC', supplyType: 'FINITE', supply: '1000' },
    { tokenId: '0.0.1127032', name: 'EARTH-SW', supplyType: 'FINITE', supply: '2350' },
    { tokenId: '0.0.968134', name: 'Fugitives V1', supplyType: 'FINITE', supply: '1912' },
    { tokenId: '0.0.1235089', name: 'HBAR SHADY\'z GEN-02', supplyType: 'FINITE', supply: '3113' },
    { tokenId: '0.0.1003963', name: 'Hederian Dragons Gen-01 Origins', supplyType: 'FINITE', supply: '162' },
    { tokenId: '0.0.752616', name: 'Shibar Holder - Silver Limited Edition', supplyType: 'FINITE', supply: '100' },
    { tokenId: '0.0.1282534', name: 'EARTH-AIR', supplyType: 'FINITE', supply: '1500' },
    { tokenId: '0.0.1374909', name: 'Sentient Nightmares', supplyType: 'FINITE', supply: '500' },
    { tokenId: '0.0.895128', name: 'METAVISION GEN2', supplyType: 'FINITE', supply: '400' },
    { tokenId: '0.0.1158353', name: 'Loco Lizardz', supplyType: 'FINITE', supply: '2222' },
    { tokenId: '0.0.1064955', name: 'Hashgraph Phantoms', supplyType: 'FINITE', supply: '100' },
    { tokenId: '0.0.1106034', name: 'WokeFemmes', supplyType: 'FINITE', supply: '500' },
    { tokenId: '0.0.1124044', name: 'Golden Banana Coin', supplyType: 'FINITE', supply: '400' },
    { tokenId: '0.0.968220', name: 'Fugitives V1 Pets', supplyType: 'FINITE', supply: '182' },
    { tokenId: '0.0.1097636', name: 'Cyber Hedera Gen-02', supplyType: 'FINITE', supply: '820' },
    { tokenId: '0.0.946799', name: 'WOOKZ Gen. 1', supplyType: 'FINITE', supply: '331' },
    { tokenId: '0.0.1110968', name: 'Sentient Dreams', supplyType: 'FINITE', supply: '499' },
    { tokenId: '0.0.822309', name: 'Gold Trainer Pass (GTP)', supplyType: 'FINITE', supply: '100' },
    { tokenId: '0.0.872340', name: 'Dead Pixels Ghost Pass', supplyType: 'FINITE', supply: '800' },
    { tokenId: '0.0.878200', name: 'Dead Pixels Ghost Club', supplyType: 'FINITE', supply: '1900' },
    { tokenId: '0.0.1052238', name: 'Kabila Early Supporters', supplyType: 'FINITE', supply: '200' },
    { tokenId: '0.0.1319909', name: 'Koala Klub Gen 2 (1 point)', supplyType: 'FINITE', supply: '2049' },
    { tokenId: '0.0.650778', name: 'Koala Klub Gen 1', supplyType: 'FINITE', supply: '894' },
    { tokenId: '0.0.1404861', name: 'Creamlands Silver', supplyType: 'FINITE', supply: '790' },
    { tokenId: '0.0.930110', name: 'Creamies Collection', supplyType: 'FINITE', supply: '1094' },
    { tokenId: '0.0.1393115', name: 'LeemonSwap NFT Presale', supplyType: 'INFINITE', supply: '481' },
    { tokenId: '0.0.640346', name: 'Hbar Punks', supplyType: 'FINITE', supply: '1612' },
    { tokenId: '0.0.1413405', name: 'Gangsters Paradise: Lucchese Family', supplyType: 'FINITE', supply: '1337' },
    { tokenId: '0.0.1097737', name: 'EARTH-FC', supplyType: 'FINITE', supply: '620' },
    { tokenId: '0.0.817591', name: 'HGraph Punks', supplyType: 'FINITE', supply: '1537' },
    { tokenId: '0.0.1380808', name: 'VCEEZY v2', supplyType: 'FINITE', supply: '500' },
    { tokenId: '0.0.1298985', name: 'Return Pass', supplyType: 'FINITE', supply: '111' },
    { tokenId: '0.0.1440564', name: 'Hashmons Gen 1 PFPs', supplyType: 'FINITE', supply: '402' },
    { tokenId: '0.0.1321559', name: 'Hedera Arcade', supplyType: 'FINITE', supply: '300' },
    { tokenId: '0.0.1404743', name: 'Creamlands Diamond', supplyType: 'FINITE', supply: '20' },
    { tokenId: '0.0.1236771', name: 'EARTH-PIN', supplyType: 'FINITE', supply: '2798' },
    { tokenId: '0.0.1404762', name: 'Creamlands Platinum', supplyType: 'FINITE', supply: '59' },
    { tokenId: '0.0.1404804', name: 'Creamlands Gold', supplyType: 'FINITE', supply: '133' },
    { tokenId: '0.0.1099951', name: 'Deragods', supplyType: 'FINITE', supply: '303' },
    { tokenId: '0.0.1234197', name: 'Hashgraph Name - hbar', supplyType: 'INFINITE', supply: '16029' }, // 16k records - serial 17 has -1 value for "image" field
    { tokenId: '0.0.1013815', name: 'Master Creamer', supplyType: 'FINITE', supply: '105' },
    { tokenId: '0.0.825240', name: 'Warsome Wizards', supplyType: 'FINITE', supply: '3779' },
    { tokenId: '0.0.1317440', name: 'Pixel Land - NumSkullz', supplyType: 'FINITE', supply: '1888' },
    { tokenId: '0.0.746240', name: 'Pixel Land - HBARMORY', supplyType: 'FINITE', supply: '293' },
    { tokenId: '0.0.892230', name: 'PixelRug - Limited Edition Series 2022', supplyType: 'FINITE', supply: '100' }
];

// Update code? Check if NFT ID already exists or overwrite (otherwise code crashes)
async function scrapeNFTs() {
  // Loop over all tokens
  for (let i = 0; i < tokens.length; i++) {
    // Fetch token information
    let maxSerial = 1;
    try {
      let tokenInfo;
      tokenInfo = await axiosInstance.get(`${BASE_URL}${tokens[i].tokenId}/`);

      while(!!!tokenInfo.data.total_supply) {
        console.log(`[ERR] Unable to fetch token information for ${tokens[i].name} with token ID ${tokens[i].tokenId}`);
        sleep(15000);
        console.log(`[WARN] Retry fetching token information for ${tokens[i].tokenId} and name ${tokens[i].name}`);
        tokenInfo = await axiosInstance.get(`${BASE_URL}${tokens[i].tokenId}/`);
      }

      maxSerial = Number(tokenInfo.data.total_supply);
      console.log(`[INFO] Started: ${tokens[i].name} with a supply of ${maxSerial} serials`);
    } catch (error) {
      console.log(`[ERR] Skipping token ${tokens[i].name} with token ID ${tokens[i].tokenId}`);
      continue;
    }

    // Loop over all serials
    for (let j = 1; j <= maxSerial; j++) {
      console.log(`[INFO] Serial: ${j} --> ${tokens[i].name}`);
      let nftInfo;
      let failedNFTInfoFetching = false;
      try {
        nftInfo = await axiosInstance.get(
          `${BASE_URL}${tokens[i].tokenId}/nfts/${j}`
        );
      } catch (error) {
        console.log(`[ERR] Could not fetch NFT data for: ${tokens[i].tokenId}/${j} - Name: ${tokens[i].name}`);
        failedNFTInfoFetching = true;
      }

      if (failedNFTInfoFetching) {
        while (failedNFTInfoFetching === true) {
          console.log(`[WARN] Retry fetching NFT data for ${tokens[i].tokenId}/${j} and name ${tokens[i].name}`)
          sleep(15000)
          try {
            nftInfo = await axiosInstance.get(
              `${BASE_URL}${tokens[i].tokenId}/nfts/${j}`
            );
            failedNFTInfoFetching = false;
          } catch (error) {
            console.log(`[ERR] Could not fetch NFT data for: ${tokens[i].tokenId}/${j} - Name: ${tokens[i].name}`);
            console.log(error);
          }
        }
      }

      const URIObject = converter(nftInfo.data.metadata);

      if (!URIObject.success) {
        console.log(`[ERR] Could not convert URI for: ${tokens[i].tokenId} - Name: ${tokens[i].name} - Skipping this token.`);
        continue;
      }

      let metadata;
      let failedFetching = false;
      try {
        metadata = await axiosInstance.get(URIObject.URI);
      } catch (error) {
        console.log(`[ERR] Could not fetch data for: ${tokens[i].tokenId} - Name: ${tokens[i].name}`);
        failedFetching = true;
      }

      if (failedFetching) {
        sleep(10000)

        console.log(`[WARN] Retry fetching information for token with token ID ${tokens[i].tokenId} and name ${tokens[i].name}`)
        try {
          metadata = await axiosInstance.get(URIObject.URI);
        } catch (error) {
          console.log(`[ERR] Attempt 2: Failed to fetch data for: ${tokens[i].tokenId}/${j} - Name: ${tokens[i].name} - Skipping this NFT ID`);
          continue;
        }
      }
      
      const problems = validator(metadata.data, defaultVersion);
      const nftId = `${tokens[i].tokenId}/${j}`;
      if (problems.errors.length > 0 || problems.warnings.length > 0) {
        try {
          collections.create(nftId, tokens[i].tokenId, j, 0, 'mainnet',
            JSON.stringify(metadata.data),
            JSON.stringify(problems.warnings),
            JSON.stringify(problems.errors)
          );
        } catch (error) {
          console.log(`[ERR] Could not store information in DB for NFT ID: ${tokens[i].tokenId}/${j} - Name: ${tokens[i].name}`);
          continue;
        }
      } else {
        try {
          collections.create(
            nftId, tokens[i].tokenId, j, 1, "mainnet",
            JSON.stringify(metadata.data),
            JSON.stringify([]),
            JSON.stringify([])
          );
        } catch (error) {
          console.log(`[ERR] Could not store information in DB for NFT ID: ${tokens[i].tokenId}/${j} - Name: ${tokens[i].name}`);
          continue;
        }
      }

      if (j % 1000 === 0) {
        console.log(`[INFO] Sleep at serial ${j}`);
        sleep(10000);
      }
    }

    console.log(`[INFO] Finished: ${tokens[i].name}`)
    console.log('[INFO] Sleep 10 seconds between NFTs')
    sleep(1000);
  }
}

async function countTotalNumberOfNFTs() {
  let total = 0;

  for (let i = 0; i < tokens.length; i++) {
    try {
      let tokenInfo = await axiosInstance.get(`${BASE_URL}${tokens[i].tokenId}/`);

      // When you get throttled by mirror node
      while (!!!tokenInfo.data.total_supply) {
        console.log(`[WARN] Retry fetching information for token with token ID ${tokens[i].tokenId} and name ${tokens[i].name}`)
        sleep(10000)
        tokenInfo = await axiosInstance.get(`${BASE_URL}${tokens[i].tokenId}/`);
      }
      const maxSerial = Number(tokenInfo.data.total_supply);
      // console.log(`[INFO] Project: ${tokens[i].name} --> serials: ${maxSerial}`)
      console.log(`${tokens[i].tokenId} ${maxSerial}`);
      total += maxSerial;
      sleep(2500)
    } catch (error) {
      console.log(`[ERR] Unable to fetch token information for ${tokens[i].name} with token ID ${tokens[i].tokenId}`)
      continue;
    }
  }

  console.log(`Total number of NFTs to be scraped: ${total} from ${tokens.length} projects.`)
  console.log(`Average number of NFTs per project: ${Math.floor(total / tokens.length)}`)
}

function sleep(miliseconds) {
    var currentTime = new Date().getTime();
 
    while (currentTime + miliseconds >= new Date().getTime()) {}
}

/* Main function that determines which function to execute */
async function main() {
  //await countTotalNumberOfNFTs();
  await scrapeNFTs();
}

main();