/**
 * Convert a base64 metadata string to an ASCII URI
 * This function supports both IPFS URIs as HTTPS URIS. It doesn't support Arweave.
 * 
 * @param {string} URI - base64 string
 * @returns {Object} conversion
 * @returns {string} conversion.success - Indicates if the URI conversion was successful
 * @returns {string} conversion.URI - Converted URI to IPFS or HTTPS string. Empty if URI is unsupported.
 * 
 * @example aXBmczovL1FtVmh4aFVpZXgzSzNVUzl4Z2M4VndpYjN2NmllUng2dTRpWHBMVm5Rd0x5SjE= converts to ipfs://QmVhxhUiex3K3US9xgc8Vwib3v6ieRx6u4iXpLVnQwLyJ1
 */
const converter = (URI) => {
    // 1. Decode the base64 to UTF8 (Hedera's default encoding)
    const decodedURI = decode(URI);

    // 2. Check URI type (HTTPS or IPFS) - if it's not supported, throw error)
    let result;

    // A. Check for IPFS
    if (decodedURI.indexOf("ipfs://") === 0) {
        const CID = decodedURI.replace('ipfs://', '');
        result = `https://ipfs.io/ipfs/${CID}`;
    }

    // B. Check for HTTPS
    if (decodedURI.indexOf("https://") === 0) {
        result = decodedURI;
    }

    // Does not support Arweave or other protocols
    if (result == undefined) {
        return { success: false, URI: "" }
    }

    return { success: true, URI: result }
}

/**
 * Convert a base64 URI string to ASCII string
 * 
 * @param {string} URI - URI to convert in base64 format
 * @returns {string}
 */
const decode = (URI) => {
    return Buffer.from(URI.toString('utf8'), 'base64').toString('ascii');
}

module.exports = {
    converter,
    decode
}