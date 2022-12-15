const express = require('express');
let router = express.Router();
const axios = require('axios');

const collections = require('../services/collections');
const { converter, decode } = require('../helpers/URI');
const { errorFormatter } = require('../errors');
const { validator, defaultVersion } = require('@michielmulders/hip412-validator');

const axiosInstance = axios.create({
  timeout: 5000,
  headers: {'accept-encoding': '*'}
});

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

  const problems = validator(metadata, req.query.version);
  if (problems.errors.length > 0 || problems.warnings.length > 0) {
    return res.status(200).json({
      success: false,
      msg: "Metadata contains one or multiple errors",
      data: {
        errors: problems.errors,
        warnings: problems.warnings,
        metadata
      }
    })
  }

  return res.status(200).json({
    success: true,
    msg: "Metadata has been verified successfully",
    data: {
      errors: {},
      warnings: {},
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
        warnings: JSON.parse(cachedata.data[0].warnings),
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

  const tokenInfoURI = network === "mainnet" 
    ? `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${id}/nfts/${serial}/`
    : `https://testnet.mirrornode.hedera.com/api/v1/tokens/${id}/nfts/${serial}/`;

  let nftInfo;
  try {
    nftInfo = await axiosInstance.get(tokenInfoURI);
  } catch (error) {
    return next(errorFormatter(`Unable to fetch token information for ${nftId} (NFT ID might not exist or could not fetch information from IPFS)`));
  }
  
  const URIObject = converter(nftInfo.data.metadata);
  if (!URIObject.success) {
    return next(errorFormatter("Unsupported metadata URI for NFT", { URI: decode(nftInfo.data.metadata) }))
  }

  let metadata;
  try {
    metadata = await axiosInstance.get(URIObject.URI);
  } catch (error) {
    return next(errorFormatter(`Unable to fetch metadata for ${nftId} using URI ${URIObject.URI}`));
  }

  // if metadata contains schema errors (except if it only contains "additional property errors"), it won't validate attributes, localization, and SHA256 properties because these properties might not be present
  const problems = validator(metadata.data, req.query.version);
  if (problems.errors.length > 0 || problems.warnings.length > 0) {
    try {
      collections.create(nftId, id, serial, 0, network, JSON.stringify(metadata.data), JSON.stringify(problems.warnings), JSON.stringify(problems.errors));
    } catch (error) {
      return next(errorFormatter(`Unable to store metadata validation information for ${nftId}`));
    }

    return res.status(200).json({
      success: false,
      msg: "Metadata contains warnings or errors",
      data: {
        errors: problems.errors,
        warnings: problems.warnings,
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

  try {
    collections.create(nftId, id, serial, 1, network, JSON.stringify(metadata.data), JSON.stringify([]), JSON.stringify([]));
  } catch (error) {
    return next(errorFormatter(`Unable to store metadata validation information for ${nftId}`));
  }

  return res.status(200).json({
    success: true,
    msg: "Metadata has been verified successfully",
    data: {
      errors: {},
      warnings: {},
      metadata: metadata.data
    },
    meta: {
      tokenId: id,
      serial,
      cache: false,
      version: req.query.version || defaultVersion
    }
  })
});

module.exports = router;
