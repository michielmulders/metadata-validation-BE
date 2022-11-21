const HIP412_1_0_0 = require("./HIP412@1.0.0.json");

const schemaMap = new Map();
schemaMap.set('1.0.0', HIP412_1_0_0);

const defaultVersion = '1.0.0'; // HIP412@1.0.0

const getSchema = (version) => {
    const validVersion = schemaMap.has(version);
    if (validVersion) {
        return schemaMap.get(version);
    }
    
    return schemaMap.get(defaultVersion);
}

module.exports = {
    getSchema
}