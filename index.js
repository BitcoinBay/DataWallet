const DataWallet = require("./src/datawallet");

const DW = new DataWallet;

async function run() {
    let masterHDNode = await DW.createWallet();
    await DW.buildRawTx(masterHDNode);
}

run();
