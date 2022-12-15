![GitHub CI](https://github.com/michielmulders/metadata-validation-BE/actions/workflows/main.yml/badge.svg)


# Metadata Schema Validation (Backend)

**Goal:** Verify metadata (user input or on-chain data) against the [HIP412@1.0.0](https://bafkreid2hxgyhhwtgkrzouwx4tk7kczhs6riydhpvisqq7pxofrllyftku.ipfs.nftstorage.link/) standard defined in [HIP412](https://hips.hedera.com/hip/hip-412). The tool caches responses for each new NFT ID.

**Tooling:** Node.js app using Express.js for routing, Jest and Supertest for testing, Sqlite3 for database storage (caching results and metadata), and jsonschema for metadata validation against the HIP412 JSON schema.

## Database schema for NFT metadata

The Express app uses Sqlite3 as the database. It's recommend to install Sqlite on your machine (e.g. on a [Debian 11 machine](https://linuxhint.com/install-sqlite-on-debian-11/)) to quickly manage the database. 

To create the database, use the below command in the root of the project. 

```bash
sqlite3 nfts.db
```

This command opens an SQLite CLI. Now, create the `collections` table to store all metadata.

```sql
CREATE TABLE collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nft_id VARCHAR(30) NOT NULL UNIQUE,
  token_id VARCHAR(15) NOT NULL,
  serial VARCHAR(7) NOT NULL,
  is_conform NUMBER(1) NOT NULL,
  network VARCHAR(7),
  metadata text NOT NULL,
  warnings text NOT NULL,
  errors text NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

To verify the schema has been created, use the `.tables` command.

```sql
.tables

# Output
collections
```

To exit the CLI, use `CMD+D`.


### Open source metadata database (64,000 records)

At the root level of the project, you find the `nfts.db` and `nfts-copy.db` databases. The `nfts-copy.db` contains almost **64,000 records containing metadata but also verification data against HIP-412**. The data has been scraped from IPFS using the Pinata Gateway service. 

The `scripts/scrape-nfts.js` script has performed the scraping and contains the list of `token_id`'s used to populate the database. We've selected the most popular/high-volume projects on Hedera using zuse.market analytics. You can use this sqlite3 database however you want. 

Sample queries to perform on the data:

```sql
# Query: Print token ID with its total number of serials
select token_id, count(*) from collections group by token_id;

# Output
0.0.1003963|162
0.0.1006183|1243
0.0.1013815|105
0.0.1043046|507
...

# -> Query: Total number of records
select count(*) from collections;

# Output
63275

# -> Query: Total number of unique token IDs
select count(DISTINCT token_id) from collections;

# Output
50

# -> Query: Select record by NFT ID
select * from collections where nft_id like "0.0.1270555/5";

# Output: One warning and no errors -> with unique ID = 5
5|0.0.1270555/5|0.0.1270555|5.0|0|mainnet|{"name":"Hashcrab","description":"Hashcrabs is one of the earliest NFT projects on Hedera Hashgraph. Generation 2.0 is designed in a 2D, pixelated, generative art style with various rarity traits. The etymology of Hashcrabs stems from the Hedera Hashgraph community and the native token $HBAR being commonly referred to as a “crab coin”. This is due to the “crabbing” market trend of $HBAR fluctuating around the same price over a long period of time, neither entering a bull nor bear market. As such, its movement mimics that of a crab moving side-to-side.","creator":"Hashcrabs","category":"Collectible","image":"ipfs://QmeS3UVvFMipTE16CZUVGLkfQ3vLRAozQqaXZcFAz6Sxt2","type":"image/png","attributes":[{"trait_type":"7 Background","value":"Hex #9cdb43"},{"trait_type":"6 Base","value":"Crab 10"},{"trait_type":"2 Eyewear","value":"Lennons"},{"trait_type":"1 Message Bubble","value":"Lfg"}]}|[{"type":"schema","msg":"is not allowed to have the additional property 'category'","path":"instance"}]|[]|2022-12-13 11:58:56
```

### Database Size

```
Last update: 15 December, 2022
Metadata records: 63275
Unique NFT projects: 50
```

## How to run this project

Install dependencies:

```bash
npm install
```

Create a `.env` file and add `ENVIRONMENT=dev`. By setting the `.env` to `test`, you will use a different sqlite database file called `testnfts.db`. When you run `npm run test`, it will automatically set the `ENVIRONMENT=test` value. When you want to use it in production, just set the value to `ENVIRONMENT=prod` to use the `nfts.db` database file. 

You can also change the port by setting the `PORT=5000` variable in the `.env` file. By default, the app runs on port `4000`.

More, you can also set the allowed origin (CORS) by changing the address for the ENV var `ORIGIN=http://localhost3000` allowing the frontend to make requests to our backend.

Lastly, set the `PINATA_API_TOKEN` because we are using the Pinata gateway to scrape metadata from IPFS and make sure to set the `IPFS_GATEWAY` to the correct address. If you want to use a public (free - not recommended due to throttling issues) gateway, change line 22 at `/helpers/URI.js`.

Start the backend with:

```bash
npm start
```

If you want to use `nodemon` when you are developing, use:

```bash
npm run dev
```

If you want to run the end-to-end tests, use:

```bash
npm test
```

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
- \<version\> (optional): Change the schema version against which you want to validate the NFT's metadata. `1.0.0` is the default value and validates against HIP412@1.0.0 version.

**Example requests:**
- http://localhost:4000/nfts/0.0.1043046/507
- http://localhost:4000/nfts/0.0.1350444/2343?network=testnet
- http://localhost:4000/nfts/0.0.1350444/2343?network=testnet&version=1.0.0
- http://localhost:4000/nfts/0.0.1350444/2343?version=1.0.0


**Response:**
Success response for an NFT that complies with HIP412 standard (e.g. `http://localhost:4000/nfts/0.0.1350444/2343`):

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
    "version": "1.0.0",
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
        "msg": "is not allowed to have the additional property 'imagePreview'",
        "path": "instance.imagePreview"
      },
      {
        "type": "schema",
        "msg": "is not allowed to have the additional property 'traitType'",
        "path": "instance.attributes[0]"
      },
      { 
        "type": "schema",
        "msg": "requires property 'type'",
        "path": "instance"
      }
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
    "version": "1.0.0",
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

**Options:**
- \<version\> (optional): Change the schema version against which you want to validate the NFT's metadata. `1.0.0` is the default value and validates against HIP412@1.0.0 version.

**Response:**

Response format:

```json
{
  "success": "true/false -> validation successful?",
  "msg": "Extra information for the frontend",
  "data": {
    "errors": "Array of all metadata errors",
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

## Questions or Improvement Proposals?

Please create an issue or PR on [this repository](https://github.com/michielmulders/metadata-validation-BE). Make sure to join the [Hedera Discord server](https://hedera.com/discord) to ask questions or discuss improvement suggestions.