const db = require('./db');

/**
 * 
 * @param {string} nftId - Uses the format "<tokenId>/<serial>" e.g. "0.0.130481/789"
 * @returns {object} NFT
 * @returns {Array<Object>} NFT.data - Array containing zero, one, or multiple collection objects from the DB.
 */
function getNFTById(nftId) {
  const data = db.query(`SELECT * FROM collections where nft_id = ?`, [nftId]);

  return { data }
}

/**
 * 
 * @param {string} nftId - Uses the format "<tokenId>/<serial>" e.g. "0.0.130481/789"
 * @param {string} tokenId
 * @param {string} serial 
 * @param {number} isConform - A '1' (true) indicates no errors against HIP412 metadata standard, a '0' (false) is not conform
 * @param {string} network - network type: mainnet or testnet
 * @param {string} metadata - Stringified metadata
 * @param {string} warnings - Stringified warnings
 * @param {string} errors - Stringified metadata errors object
 * @returns {boolean} success
 */
function create(nftId, tokenId, serial, isConform, network, metadata, warnings, errors) {
  const result = db.run('INSERT INTO collections (nft_id, token_id, serial, is_conform, network, metadata, warnings, errors) VALUES (@nft_id, @token_id, @serial, @is_conform, @network, @metadata, @warnings, @errors)', {
    "nft_id": nftId,
    "token_id": tokenId,
    serial,
    "is_conform": isConform, 
    network, metadata, warnings, errors
  });
  
  let success = false;
  if (result.changes) {
    success = true;
  }

  return success;
}


module.exports = {
  getNFTById,
  create
}