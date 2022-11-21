const express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).json({ msg: "Use this API to verify your NFT against the HIP412 standard"});
});

module.exports = router;
