const BB = require("bitbox-sdk/lib/bitbox-sdk").default;

class DataWallet {
    async createWallet() {
        let BITBOX = new BB({ restURL: "https://trest.bitcoin.com/v1/" });

        try {
            // create 128 bit, 12 word BIP39 mnemonic
            const mnemonic = BITBOX.Mnemonic.generate(
              128,
              BITBOX.Mnemonic.wordLists().english
            );

            // root seed buffer
            const rootSeed = BITBOX.Mnemonic.toSeed(mnemonic);

            // master HDNode
            const masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, "testnet");

            // derivation derivation path
            const path = "m/44'/145'/0'";

            // HDNode of BIP44 account
            const account = BITBOX.HDNode.derivePath(masterHDNode, path);

            const external = BITBOX.HDNode.derivePath(account, "0/0");
            const ext_address = BITBOX.HDNode.toCashAddress(external);
            const change = BITBOX.HDNode.derivePath(account, "1/0");
            const cha_address = BITBOX.HDNode.toCashAddress(change);
            const data = BITBOX.HDNode.derivePath(account, "2/0");
            const dat_address = BITBOX.HDNode.toCashAddress(data);

            console.log(path + "/0/0: " + ext_address);
            console.log(path + "/1/0: " + cha_address);
            console.log(path + "/2/0: " + dat_address);
        } catch (err) {
            console.log(err);
        }
    }

    async buildData() {
        let BITBOX = new BB({ restURL: "https://trest.bitcoin.com/v1/" });
        let script = [BITBOX.Script.opcodes.OP_RETURN, Buffer.from("6d69", "hex"), Buffer.from("QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz")];
        let encodedData = BITBOX.Script.encode(script);
        console.log(encodedData);
    }
}

module.exports = DataWallet;
