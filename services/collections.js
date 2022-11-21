const db = require('./db');

function getNFTById(nftId) {
  const data = db.query(`SELECT * FROM collections where nft_id = ?`, [nftId]);

  return { data }
}

function create(nftId, tokenId, serial, isConform, network, metadata, errors) {
  const result = db.run('INSERT INTO collections (nft_id, token_id, serial, is_conform, network, metadata, errors) VALUES (@nft_id, @token_id, @serial, @is_conform, @network, @metadata, @errors)', {
    "nft_id": nftId,
    "token_id": tokenId,
    serial,
    "is_conform": isConform, 
    network, metadata, errors
  });
  
  let success = false;
  if (result.changes) {
    success = true;
  }

  return { success };
}


module.exports = {
  getNFTById,
  create
}