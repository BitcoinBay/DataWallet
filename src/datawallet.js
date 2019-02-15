const BITBOXSDK = require("bitbox-sdk/lib/bitbox-sdk").default;

class DataWallet {

    async createWallet() {
        let BITBOX = new BITBOXSDK({ restURL: "https://trest.bitcoin.com/v2/"});

        try {
            // create 128 bit, 12 word BIP39 mnemonic
/*
            const mnemonic = BITBOX.Mnemonic.generate(
              128,
              BITBOX.Mnemonic.wordLists().english
            );
*/
            // root seed buffer
            const rootSeed = BITBOX.Mnemonic.toSeed("talk story visual hidden behind wasp evil abandon bus brand circle sketch");


            // master HDNode
            const masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, "testnet");

            // derivation derivation path
            const path = "m/44'/1'/0'";

            // HDNode of BIP44 account
            const account = BITBOX.HDNode.derivePath(masterHDNode, path);

            const external = BITBOX.HDNode.derivePath(account, "0/0");
            const ext_address = BITBOX.HDNode.toCashAddress(external);
            const change = BITBOX.HDNode.derivePath(account, "1/0");
            const cha_address = BITBOX.HDNode.toCashAddress(change);
            const data = BITBOX.HDNode.derivePath(account, "2/0");
            const dat_address = BITBOX.HDNode.toCashAddress(data);

            console.log(rootSeed);
            console.log(path + "/0/0: " + ext_address);
            console.log(path + "/1/0: " + cha_address);
            console.log(path + "/2/0: " + dat_address);
            return masterHDNode;
        } catch (err) {
            console.log(err);
        }
    }

    async buildRawTx(masterHDNode) {
        let BITBOX = new BITBOXSDK({ restURL: "https://trest.bitcoin.com/v2/"});
        const path = "m/44'/1'/0'";

        const account = BITBOX.HDNode.derivePath(masterHDNode, path);

        const external = BITBOX.HDNode.derivePath(account, "0/0");
        const ext_address = BITBOX.HDNode.toCashAddress(external);
        const change = BITBOX.HDNode.derivePath(account, "1/0");
        const cha_address = BITBOX.HDNode.toCashAddress(change);
        const data = BITBOX.HDNode.derivePath(account, "2/0");
        const dat_address = BITBOX.HDNode.toCashAddress(data);

        let utxos = await BITBOX.Address.utxo(ext_address)
            .then(result => {
                console.log(result);
                let transactionBuilder = new BITBOX.TransactionBuilder('testnet');

                let originalAmount = result.utxos[0].satoshis;
                let vout = result.utxos[0].vout;
                let txid = result.utxos[0].txid;
                transactionBuilder.addInput(txid, vout);

                let byteCount = BITBOX.BitcoinCash.getByteCount(
                    { P2PKH: 1 },
                    { P2PKH: 1 }
                );
                let sendAmount = originalAmount - byteCount;
                transactionBuilder.addOutput(cha_address, sendAmount);

                let script = [
                    BITBOX.Script.opcodes.OP_RETURN,
                    Buffer.from("ff", "hex"),
                    Buffer.from("QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz")
                ];
                let encodedData = BITBOX.Script.encode(script);
                transactionBuilder.addOutput(encodedData, 0);

                let keyPair = BITBOX.HDNode.toKeyPair(change);
                let redeemScript;
                transactionBuilder.sign(
                    0,
                    keyPair,
                    redeemScript,
                    transactionBuilder.hashTypes.SIGHASH_ALL,
                    originalAmount
                );

                let tx = transactionBuilder.build();
                let hex = tx.toHex();
                console.log(tx);
                console.log(hex);
/*
                BITBOX.RawTransactions.sendRawTransaction(hex).then(
                result => {
                    console.log(result)
                }, err => {
                    console.log(err)
                });
*/
            }, err => {
                console.log(err);
            });
    }
}

module.exports = DataWallet;
