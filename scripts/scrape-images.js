require("dotenv").config();
const fs = require('fs');

const axios = require("axios");
const axiosInstance = axios.create({
  timeout: 5000,
  headers: {'accept-encoding': '*'}
});

const collections = require("../services/collections");
const { converter } = require("../helpers/URI");

/* Vars */
const tokens = [
    { tokenId: '0.0.1404743', name: 'Creamlands Diamond', ext: 'jpg' } // 20 NFTs in this collection

    /*
    { tokenId: '0.0.1270555', name: 'Hash Crabs', ext: 'jpg' },
    { tokenId: '0.0.1350444', name: 'HANGRY BARBOONS', ext: 'jpg' },
    { tokenId: '0.0.1043046', name: 'ASHFALL', ext: 'jpg' },
    { tokenId: '0.0.1006183', name: 'Hedera Monkeys', ext: 'jpg' },
    { tokenId: '0.0.732556', name: 'PLANCK EPOCH COLLECTIBLES - ELECTROMAGNETIC', ext: 'jpg' },
    { tokenId: '0.0.1127032', name: 'EARTH-SW', ext: 'jpg' },
    { tokenId: '0.0.1235089', name: 'HBAR SHADY\'z GEN-02', ext: 'jpg' },
    { tokenId: '0.0.1003963', name: 'Hederian Dragons Gen-01 Origins', ext: 'jpg' },
    { tokenId: '0.0.895128', name: 'METAVISION GEN2', ext: 'jpg' },
    { tokenId: '0.0.1158353', name: 'Loco Lizardz', ext: 'jpg' },
    { tokenId: '0.0.1282534', name: 'EARTH-AIR', ext: 'mp4'},
    { tokenId: '0.0.1374909', name: 'Sentient Nightmares', ext: 'jpeg' },
    { tokenId: '0.0.1064955', name: 'Hashgraph Phantoms', ext: 'png' },
    { tokenId: '0.0.1106034', name: 'WokeFemmes', ext: 'png' },
    { tokenId: '0.0.1124044', name: 'Golden Banana Coin', ext: 'png' },
    { tokenId: '0.0.1097636', name: 'Cyber Hedera Gen-02', ext: 'jpg' },
    { tokenId: '0.0.946799', name: 'WOOKZ Gen. 1', ext: 'mp4' },
    { tokenId: '0.0.1110968', name: 'Sentient Dreams', ext: 'jpg' },
    { tokenId: '0.0.822309', name: 'Gold Trainer Pass (GTP)', ext: 'png' },
    { tokenId: '0.0.872340', name: 'Dead Pixels Ghost Pass', ext: 'png' },
    { tokenId: '0.0.878200', name: 'Dead Pixels Ghost Club', ext: 'png' },
    { tokenId: '0.0.1052238', name: 'Kabila Early Supporters', ext: 'jpg' },
    { tokenId: '0.0.1319909', name: 'Koala Klub Gen 2 (1 point)', ext: 'png' },
    { tokenId: '0.0.650778', name: 'Koala Klub Gen 1', ext: 'jpg' },
    { tokenId: '0.0.1404861', name: 'Creamlands Silver', ext: 'png' },
    { tokenId: '0.0.930110', name: 'Creamies Collection', ext: 'png' },
    { tokenId: '0.0.1393115', name: 'LeemonSwap NFT Presale', ext: 'png' },
    { tokenId: '0.0.1413405', name: 'Gangsters Paradise: Lucchese Family', ext: 'png' },
    { tokenId: '0.0.1097737', name: 'EARTH-FC', ext: 'jpg' },
    { tokenId: '0.0.817591', name: 'HGraph Punks', ext: 'png' },
    { tokenId: '0.0.1380808', name: 'VCEEZY v2', ext: 'png' },
    { tokenId: '0.0.1440564', name: 'Hashmons Gen 1 PFPs', ext: 'png' },
    { tokenId: '0.0.1321559', name: 'Hedera Arcade', ext: 'png' },
    { tokenId: '0.0.1236771', name: 'EARTH-PIN', ext: 'jpg' },
    { tokenId: '0.0.1404762', name: 'Creamlands Platinum', ext: 'png' },
    { tokenId: '0.0.1404804', name: 'Creamlands Gold', ext: 'png' },
    { tokenId: '0.0.1099951', name: 'Deragods', ext: 'png' },
    { tokenId: '0.0.1234197', name: 'Hashgraph Name - hbar', ext: 'jpeg' },
    { tokenId: '0.0.1013815', name: 'Master Creamer', ext: 'png' },
    { tokenId: '0.0.1317440', name: 'Pixel Land - NumSkullz', ext: 'png' },
    { tokenId: '0.0.746240', name: 'Pixel Land - HBARMORY', ext: 'png' },
    { tokenId: '0.0.892230', name: 'PixelRug - Limited Edition Series 2022', ext: 'png' }

    // SKIP: data:image/png;base64 (JSON.photo)
    // Exception: image: { type: 'string', description: 'https://cloudflare-ipfs.com/ipfs/bafkreidwvc62jt5eo2vhwpxnhuknf4gz6ntqym6knagwf65yfajkbnrbkm' }
    //{ tokenId: '0.0.968134', name: 'Fugitives V1', ext: 'png' },

    // // SKIP: data:image/png;base64 (JSON.photo)
    // Exception: image: { type: 'string', description: 'https://cloudflare-ipfs.com/ipfs/bafkreihulfsxtw2gfnokgawys3slono66lnmbncbmtwak3ehb26srncdhu' }
    //{ tokenId: '0.0.968220', name: 'Fugitives V1 Pets', ext: 'png' },

    // Exception: no image: { name: 'Shibar Holder - Silver Limited Edition #1', description: 'Buy this NFT to enter the 500 thousand $SHIBR lottery! The winner will be selected live at the end of Round 2.', creator: 'Shibar_Network', CID: 'https://bafkreigs4b3czi5lgbojaziasiyuwssoj43qqtlkv6ibf274qyhafznre4.ipfs.dweb.link/' }
    { tokenId: '0.0.752616', name: 'Shibar Holder - Silver Limited Edition', ext: 'png' },

    // Exception: no image: { name: 'Hbar Punks ', description: 'The Hbar Punks are 10,000 uniquely generated characters. No two are exactly alike, and each one of them can be officially owned by a single person on the Hedera Token Service (HTS). HTS reduces the total cost of issuance and management, improves transaction settlement time from hours to seconds.', creator: 'hbarpunks', CID: 'https://bafkreid7ktpwlg3y6xbchlwhlhsdd5oer7urm6nk5seygducd2b6ghm36m.ipfs.dweb.link/' }
    { tokenId: '0.0.640346', name: 'Hbar Punks', ext: 'jpg' },

    // SKIP: GLB file extension -> 3D render - doens't contain any other files
    //{ tokenId: '0.0.1298985', name: 'Return Pass', ext: 'glb' },

    // Exception: image: https://cloudflare-ipfs.com/ipfs/bafybeihhxccfozxsx477pli2ihoyxcbyocp4ybevnwzgabb4kd2cuvjkmm
    { tokenId: '0.0.825240', name: 'Warsome Wizards', ext: 'jpg' },
    */
];

/* Logic */
async function scrapeImages() {
    if (!fs.existsSync('./data')){
        fs.mkdirSync('./data');
    }

    for (let i = 0; i < tokens.length; i++) {
        const nftData = collections.getAllNFTsByTokenId(tokens[i].tokenId);

        if (!fs.existsSync(`./data/${tokens[i].tokenId}`)){
            fs.mkdirSync(`./data/${tokens[i].tokenId}`);
        }

        //for (let j = 0; j < nftData.data.length; j++) {
        for (let j = 0; j < 1; j++) {
            const nftObject = JSON.parse(nftData.data[j].metadata);

            const imageURI = handleImageFormatExceptions(tokens[i].tokenId, nftObject);
            const URIObject = converter(imageURI, false);

            if (!URIObject.success) {
                console.log(`[ERR] Could not convert URI for: ${tokens[i].tokenId} - Name: ${tokens[i].name} - Skipping this token.`);
                continue;
            }

            let failedFetching = false;
            try {
                let imageResponse = await axiosInstance({
                    method: 'get',
                    url: URIObject.URI,
                    responseType: 'stream'
                });

                imageResponse.data.pipe(fs.createWriteStream(`./data/${tokens[i].tokenId}/img-${tokens[i].tokenId}-${j}.${tokens[i].ext}`));
                console.log(`[INFO] Image downloaded: img-${tokens[i].tokenId}-${j}.${tokens[i].ext}`);
            } catch (error) {
                console.log(`[ERR] Could not fetch data for: ${tokens[i].tokenId} - Name: ${tokens[i].name} - Serial: ${j}`);
                failedFetching = true;
            }

            if (failedFetching) {
                while (failedFetching === true) {
                    console.log(`[WARN] Failed downloading image for ${tokens[i].tokenId}/${j} and name ${tokens[i].name}`);
                    sleep(15000);

                    try {
                        let imageResponse = await axiosInstance({
                            method: 'get',
                            url: URIObject.URI,
                            responseType: 'stream'
                        });
        
                        imageResponse.data.pipe(fs.createWriteStream(`./data/${tokens[i].tokenId}/img-${tokens[i].tokenId}-${j}.${tokens[i].ext}`));
                        console.log(`[INFO] Image downloaded: img-${tokens[i].tokenId}-${j}.${tokens[i].ext}`);
                        failedFetching = false;
                    } catch (error) {
                        console.log(`[ERR] Could not fetch data for: ${tokens[i].tokenId} - Name: ${tokens[i].name} - Serial: ${j}`);
                        failedFetching = true;
                    }
                }
            }
        }
    }
}

/**
 * Handle exceptions for image property URIs
 * @param {*} nftObject 
 * @returns image URI
 */
function handleImageFormatExceptions(tokenId, nftObject) {
    let imageURI = nftObject.image;

    if (tokenId === "0.0.968134" || tokenId === "0.0.968220") {
        imageURI = nftObject.image.description.replace('https://cloudflare-ipfs.com/ipfs/', '');
    }

    if (tokenId === "0.0.752616" || tokenId === "0.0.640346") {
        imageURI = nftObject.CID;
    }

    if (tokenId === "0.0.825240") {
        imageURI = nftObject.image.replace('https://cloudflare-ipfs.com/ipfs/', '');
    }

    return imageURI;
}

function sleep(miliseconds) {
    var currentTime = new Date().getTime();
 
    while (currentTime + miliseconds >= new Date().getTime()) {}
}

scrapeImages();