// Decode IPFS URI from e.g. aXBmczovL1FtVmh4aFVpZXgzSzNVUzl4Z2M4VndpYjN2NmllUng2dTRpWHBMVm5Rd0x5SjE= to ipfs://QmVhxhUiex3K3US9xgc8Vwib3v6ieRx6u4iXpLVnQwLyJ1
// But also support HTTPS
const converter = (URI) => {
    // 1. Decode the base64 to UTF8 (by default encoded by Hedera)
    const decodedURI = Buffer.from(URI.toString('utf8'), 'base64').toString('ascii');

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

    if (result == undefined) {
        return { success: false, URI: "" }
    }

    return { success: true, URI: result }
}

const decode = (URI) => {
    return Buffer.from(URI.toString('utf8'), 'base64').toString('ascii');
}

module.exports = {
    converter,
    decode
}