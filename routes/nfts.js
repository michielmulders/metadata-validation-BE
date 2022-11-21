const express = require('express');
let router = express.Router();
const axios = require('axios');

const collections = require('../services/collections');
const { validator } = require('../validators');
const { converter, decode } = require('../helpers/URI');
const { errorFormatter } = require('../errors');
const { getSchema, defaultVersion } = require('../schemas');

router.get('/', (req, res, next) => {
  res.status(200).json({ msg: "This is the NFT router"});
});

// Route 1: Verify metadata, accept JSON string -> Return true/false and errors per category
// Route supports query parameter ?network=mainnet/testnet (default = mainnet)
// Route supports query parameter ?version=1.0.0 (default = 1.0.0)
router.post('/metadata', async (req, res, next) => {
  let metadata;
  try {
    metadata = JSON.parse(req.body.metadata);
  } catch (error) {
    return next(errorFormatter("Failed to parse metadata to JSON"));
  }

  const schema = getSchema(req.query.version);
  const errors = validator(metadata, schema);
  if (errors.length > 0) {
    return res.status(200).json({
      success: false,
      msg: "Metadata contains one or multiple errors",
      data: {
        errors,
        metadata
      }
    })
  }

  return res.status(200).json({
    success: true,
    msg: "Metadata has been verified successfully",
    data: {
      errors: {},
      metadata
    }
  })
});

// Route 2: Accept NFT ID (token id + serial) -> Return: validation status, errors, metadata
// Route supports query parameter ?network=mainnet/testnet (default = mainnet)
// Route supports query parameter ?version=1.0.0 (default = 1.0.0)
router.get('/:id/:serial', async (req, res, next) => {
  const id = req.params.id;
  const serial = req.params.serial;
  const nftId = `${id}/${serial}`;
  const network = req.query.network || "mainnet";
  
  // Check if collection exists in cache
  const cachedata = collections.getNFTById(nftId);
  if (cachedata.data.length > 0) {
    return res.status(200).json({
      success: cachedata.data[0].is_conform == 0 ? false : true,
      msg: `Retrieved metadata validatiy from cache for ${id}`,
      data: {
        errors: JSON.parse(cachedata.data[0].errors),
        metadata: JSON.parse(cachedata.data[0].metadata)
      },
      meta: {
        tokenId: id,
        serial,
        cache: true,
        version: req.query.version || defaultVersion,
        created: cachedata.data[0].created_at
      }
    })
  }

  try {
    const tokenInfoURI = network === "mainnet" 
      ? `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${id}/nfts/${serial}/`
      : `https://testnet.mirrornode.hedera.com/api/v1/tokens/${id}/nfts/${serial}/`;

    const nftInfo = await axios.get(tokenInfoURI);
    const URIObject = converter(nftInfo.data.metadata);
    if (!URIObject.success) {
      return next(errorFormatter("Unsupported metadata URI for NFT", { URI: decode(nftInfo.data.metadata) }))
    }

    const metadata = await axios.get(URIObject.URI);
    // if metadata contains schema errors (except if it only contains "additional property errors"), it won't validate attributes, localization, and SHA256 properties because these properties might not be present
    const schema = getSchema(req.query.version);
    const errors = validator(metadata.data, schema);
    if (errors.length > 0) {
      collections.create(nftId, id, serial, 0, network, JSON.stringify(metadata.data), JSON.stringify(errors));
      return res.status(200).json({
        success: false,
        msg: "Metadata contains one or multiple errors",
        data: {
          errors,
          metadata: metadata.data
        },
        meta: {
          tokenId: id,
          serial,
          cache: false,
          version: req.query.version || defaultVersion
        }
      })
    }

    collections.create(nftId, id, serial, 1, network, JSON.stringify(metadata.data), JSON.stringify([]));
    return res.status(200).json({
      success: true,
      msg: "Metadata has been verified successfully",
      data: {
        errors: {},
        metadata: metadata.data
      },
      meta: {
        tokenId: id,
        serial,
        cache: false,
        version: req.query.version || defaultVersion
      }
    })
  } catch (error) {
    let msg = "Something went wrong fetching or validating the NFT metdata";

    // If token_id + serial combination doesn't exist, 404 is returned e.g. for this link https://testnet.mirrornode.hedera.com/api/v1/tokens/0.0.1270555/nfts/575/
    if (error.response && error.response.data && error.response.data._status.messages[0].message === "Not found") {
      msg = `NFT ID doesn't exist on the Hedera ${network}`;
    }

    return next(errorFormatter(msg))
  }
});

module.exports = router;
