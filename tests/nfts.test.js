const request = require("supertest");

const app = require("../app");
const { exec, createTableCollections, dropTableCollections } = require("../services/db");

/* Create table before each test. */
beforeEach(async () => {
    exec(createTableCollections);
});
  
/* Drop table before after test. */
afterEach(async () => {
    exec(dropTableCollections);
});

describe("GET /nfts/:id/:serial", () => {
    it("should return error for non-existing id and serial combination", async () => {
      // Act
      const res = await request(app).get("/nfts/0.0.11111/4567");
      
      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe("Unable to fetch token information for 0.0.11111/4567 (NFT ID doesn't exist)");
      expect(res.body.status).toBe(400);
      expect(res.body.data).toEqual({});
    });
});

describe("POST /nfts/metadata", () => {
    it("should return error for incorrectly formatted JSON metadata", async () => {
      // Arrange
      const metadata = `"${JSON.stringify({ testObject: "incorrect metadata"})}`; // Added a double quote before stringified JSON object

      // Act
      const res = await request(app).post("/nfts/metadata").send({ metadata });

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe("Failed to parse metadata to JSON");
      expect(res.body.status).toBe(400);
    });
});

// add test to check if encode URI helper works? bXlzdHVwaWRzdHJpbmc= = mystupidstring in base64