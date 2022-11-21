![GitHub CI](https://github.com/michielmulders/metadata-validation-BE/actions/workflows/main.yml/badge.svg)


# Metadata Schema Validation (Backend)

**Goal:** Verify metadata (user input or on-chain data) against the [HIP412@1.0.0](https://bafkreid2hxgyhhwtgkrzouwx4tk7kczhs6riydhpvisqq7pxofrllyftku.ipfs.nftstorage.link/) standard defined in [HIP412](https://hips.hedera.com/hip/hip-412). The tool caches responses for each new NFT ID.

**Tooling:** Node.js app using Express.js for routing, Jest and Supertest for testing, Sqlite3 for database storage (caching results and metadata), and jsonschema for metadata validation against the HIP412 JSON schema.

## How does the tool validate JSON metadata?
Each metadata object goes through four validation steps:

1. **Schema validation using [jsonschema package](https://www.npmjs.com/package/jsonschema)** (`Error type: schema`)
--> Use the `jsonschema` package to verify the metadata against [HIP412@1.0.0](https://bafkreid2hxgyhhwtgkrzouwx4tk7kczhs6riydhpvisqq7pxofrllyftku.ipfs.nftstorage.link/) standard.


2. **Attribute validation** (`Error type: attribute`)
--> Specific validator for attributes object that describe an NFT. Supports all [display types](https://github.com/hashgraph/hedera-improvement-proposal/blob/main/HIP/hip-412.md#attributesdisplay_type) such as `text`, `boolean`, `percentage`, `boost`, `datetime` or `date`, and `color`.


3. **Localization validation** (`Error type: localization`)
--> Specific validator for [localization object](https://github.com/hashgraph/hedera-improvement-proposal/blob/main/HIP/hip-412.md#localization). Checks for two-letter language codes, default locale should not appear in the `locales` array, and the `localization.uri` URI format.


4. **SHA256 validation** (`Error type: SHA256`)
--> Specific validator to verify [`checksum` properties](https://github.com/hashgraph/hedera-improvement-proposal/blob/main/HIP/hip-412.md#checksum) which contain a SHA256 hash. 


**Important exception: The validation of the metadata stops when the metadata contains one or multiple schema errors. It doesn't make sense to continue validating other properties because they may not be present in the metadata. However, if the metadata has all the required properties the metadata validation continues. The code ignores "additional property errors" because those don't affect the HIP412 validation. This behaviour has been implemented to provide NFT creators with all information they need to make their NFT compliant with the HIP412 standard.**

## Routes

### GET /nfts/\<tokenId\>/\<serial\>?network=\<mainnet|testnet\>

**Purpose:** Retrieve a validation report for a specific NFT ID on mainnet or testnet, validated against HIP412. 

**Parameters:**
- \<tokenId\>: Token ID in the format of "0.0.XXXXXX"
- \<serial\>: Serial number of NFT you want to look up (number)

**Options:**
- \<network\> (optional): Change the network for the request. You can either pass `mainnet` or `testnet`. `mainnet` is the default value, so you can omit this option.

**Example requests:**
- http://localhost:3000/nfts/0.0.1043046/507
- http://localhost:3000/nfts/0.0.1350444/2343?network=testnet

**Response:**
Success response for an NFT that complies with HIP412 standard (e.g. `http://localhost:3000/nfts/0.0.1350444/2343`):

```json
{
  "success": true,
  "msg": "Retrieved metadata validatiy from cache for 0.0.1350444",
  "data": {
    "errors": [],
    "metadata": {
      "creator": "HANGRY BARBOONS",
      "description": "HANGRY BARBOONS are 4,444 unique citizens from the United Hashgraph of Planet Earth. Designed and illustrated by President HANGRY.",
      "format": "none",
      "name": "HANGRY BARBOON #2343",
      "image": "ipfs://QmaHVnnp7qAmGADa3tQfWVNxxZDRmTL5r6jKrAo16mSd5y/2343.png",
      "type": "image/png",
      "properties": { "edition": 2343 },
      "attributes": [
        { "trait_type": "Background", "value": "Yellow" },
        { "trait_type": "Fur", "value": "Gold" },
        { "trait_type": "Clothing", "value": "Floral Jacket" },
        { "trait_type": "Mouth", "value": "Tongue" }
      ]
    }
  },
  "meta": {
    "tokenId": "0.0.1350444",
    "serial": "2343",
    "cache": true,
    "created": "2022-11-18 11:16:27"
  }
}
```

Failure response for an NFT that doesn't comply with HIP412 standard: 

```json
{
  "success": false,
  "msg": "Retrieved metadata validatiy from cache for 0.0.1043046",
  "data": {
    "errors": [
      {
        "type": "schema",
        "msg": "is not allowed to have the additional property \"imagePreview\""
      },
      {
        "type": "schema",
        "msg": "is not allowed to have the additional property \"traitType\""
      },
      { "type": "schema", "msg": "requires property \"type\"" }
    ],
    "metadata": {
      "name": "Ashfall Founders' Token",
      "description": "From impossible to inevitable.",
      "image": "ipfs://bafybeigwnmlfnvr25cpuejagxczhdgsyxfnipgywmqquilkcxrspekwy7e",
      "imagePreview": "ipfs://bafybeigwnmlfnvr25cpuejagxczhdgsyxfnipgywmqquilkcxrspekwy7e",
      "attributes": [
        {
          "type": "property",
          "name": "Creator",
          "value": "John Garvin",
          "traitType": "Creator",
          "trait_type": "Creator"
        }
      ],
      "properties": [
        {
          "type": "property",
          "name": "Creator",
          "value": "John Garvin",
          "traitType": "Creator",
          "trait_type": "Creator"
        }
      ]
    }
  },
  "meta": {
    "tokenId": "0.0.1043046",
    "serial": "507",
    "cache": true,
    "created": "2022-11-18 11:35:30"
  }
}
```


### POST /nfts/metadata

**Purpose:** Retrieve a validation report for metadata submitted by a user, validated against HIP412.

**Request:** 

```json
{
  "metadata": "Stringified JSON metadata object"
}
```

For example:

```json
{
    "metadata": "{\"creator\":\"HANGRY BARBOONS\",\"description\":\"HANGRY BARBOONS are 4,444 unique citizens from the United Hashgraph of Planet Earth. Designed and illustrated by President HANGRY.\",\"format\":\"none\",\"name\":\"HANGRY BARBOON #9\",\"image\":\"ipfs://QmZMbVWp8wAZZW12tnd9L1CbwU6xQc8zMeeyTcDWBjZ6zz/9.png\",\"type\":\"image/png\",\"properties\":{\"edition\":9,\"extras\":\"Clown\"},\"files\":[{\"uri\":\"ipfs://QmaHVnnp7qAmGADa3tQfWVNxxZDRmTL5r6jKrAo16mSd5y/9.png\",\"type\":\"image/png\",\"metadata\":{\"name\":\"444\",\"creator\":\"HANGRY BARBOONS\"}}],\"attributes\":[{\"trait_type\":\"Background\",\"value\":\"Holographic\"},{\"trait_type\":\"Arm\",\"value\":\"Clown Hamster\"}]}"
}
```


**Options:** /

**Response:**

Response format:

```json
{
  "success": "true/false -> validation successful?",
  "msg": "Extra information for the frontend",
  "data": {
    "errors": "Contains all metadata errors",
    "metadata": "Returned user-submitted metadata for reference"
  }
}
```

Here's a success response:

```json
{
  "success": true,
  "msg": "Metadata has been verified successfully",
  "data": {
    "errors": {},
    "metadata": {
      "creator": "HANGRY BARBOONS",
      "description": "HANGRY BARBOONS are 4,444 unique citizens from the United Hashgraph of Planet Earth. Designed and illustrated by President HANGRY.",
      "format": "none",
      "name": "HANGRY BARBOON #9",
      "image": "ipfs://QmZMbVWp8wAZZW12tnd9L1CbwU6xQc8zMeeyTcDWBjZ6zz/9.png",
      "type": "image/png",
      "properties": {
        "edition": 9,
        "extras": "Clown"
      },
      "files": [
        {
          "uri": "ipfs://QmaHVnnp7qAmGADa3tQfWVNxxZDRmTL5r6jKrAo16mSd5y/9.png",
          "type": "image/png",
          "metadata": {
            "name": "444",
            "creator": "HANGRY BARBOONS"
          }
        }
      ],
      "attributes": [
        {
          "trait_type": "Background",
          "value": "Holographic"
        }
      ]
    }
  }
}
```

Here's a failure response:

```json
{
  "success": false,
  "msg": "Metadata contains one or multiple errors",
  "data": {
    "errors": [
      {
        "type": "schema",
        "msg": "is not allowed to have the additional property \"category\""
      }
    ],
    "metadata": {
      "name": "Hashcrab",
      "description": "Hashcrabs is one of the earliest NFT projects on Hedera Hashgraph. Generation 2.0 is designed in a 2D, pixelated, generative art style with various rarity traits. The etymology of Hashcrabs stems from the Hedera Hashgraph community and the native token $HBAR being commonly referred to as a “crab coin”. This is due to the “crabbing” market trend of $HBAR fluctuating around the same price over a long period of time, neither entering a bull nor bear market. As such, its movement mimics that of a crab moving side-to-side.",
      "creator": "Hashcrabs",
      "category": "Collectible",
      "image": "ipfs://QmPLGM9xt5fXKYSah3guxeXQUHH1UM6RqNdtGRa6LsES7t",
      "type": "image/png",
      "attributes": [
        {
          "trait_type": "7 Background",
          "value": "Hex #20d6c7"
        }
      ]
    }
  }
}

```

## Add custom schema versions

You can add custom JSON schemas to the `/schemas` folder. 

You can then add the version to the `schemaMap` in `/schema/index.js` using the following code:

```js
const HIP412_1_0_0 = require("./HIP412@1.0.0.json");
const myCustomSchema = require("./myschema.json"); // import your schema

const schemaMap = new Map();
schemaMap.set('1.0.0', HIP412_1_0_0);
schemaMap.set('<version>', myCustomSchema); // Add your schema to the map
```

When you've added your schema to the map, you can validate against your schema version by sending a request to the API with the `?version=<version>` query. Replace `<version>` with the version you've set in the `schemaMap` map. 