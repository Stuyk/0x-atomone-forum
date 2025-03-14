import * as fs from 'node:fs';
import { sha256 } from '@cosmjs/crypto';
import { toHex } from '@cosmjs/encoding';
import { Forum, MemoAction } from './types';
import * as Actions from './actions/index';
import * as Requests from './requests/index';

import config from '../config.json';

const ActionMapping = {
    0: Actions.actionThreadCreate,
    1: Actions.actionMessageAdd,
    2: Actions.actionMessageRemove,
    3: Actions.actionThreadRemove,
};

let jsonData: Forum = {
    owner: 'atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep',
    admins: ['atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep'],
    threads: [],
    lastBlock: config.DEFAULT_MIN_BLOCK,
};

let isParsing = false;

async function getBlockActions(minBlock: string, maxBlock: string) {
    const blockPromises: Promise<{ block: { data: { txs: Array<string> }; header: { time: string } } }>[] = [];

    // Get all blocks
    for (let i = parseInt(minBlock); i <= parseInt(maxBlock); i++) {
        console.log(`Fetching Block: ${i}`);
        blockPromises.push(Requests.getBlockByHeight(i));
    }

    // Get all transactions
    const blocks = await Promise.all(blockPromises);
    const hexTxHashes: { hash: string; timestamp: string }[] = [];

    for (let blockData of blocks) {
        const txHashes = blockData.block.data.txs;
        const timestamp = blockData.block.header.time;

        for (let encodedTxHash of txHashes) {
            hexTxHashes.push({ hash: toHex(sha256(Buffer.from(encodedTxHash, 'base64'))), timestamp });
        }
    }

    const memoPromises: Promise<Awaited<ReturnType<typeof Requests.getMemoFromTx>>>[] = [];

    // Get all memos for a transaction
    for (let txHash of hexTxHashes) {
        memoPromises.push(Requests.getMemoFromTx(txHash.hash, txHash.timestamp));
    }

    const messages = await Promise.all(memoPromises);

    const validMessages: MemoAction[] = [];
    for (let message of messages) {
        if (!message) {
            continue;
        }

        validMessages.push(message);
    }

    return validMessages;
}

async function start() {
    if (isParsing) {
      return;
    }

    isParsing = true;
    console.log(`Parsing Blocks`)
    const maxBlock = await Requests.getCurrentBlockHeight();
    if (!maxBlock) {
      console.warn(`Failed to obtain block head`);
      isParsing = false;
      return;
    }

    if (fs.existsSync('data.json')) {
        jsonData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
    }

    if (jsonData.lastBlock == maxBlock) {
        console.log(`Last Block is Head Block, not parsing.`);
        isParsing = false;
        return;
    }

    const actions = await getBlockActions(jsonData.lastBlock, maxBlock as string);

    for (let action of actions) {
        const [_, actionCode] = action.message.split(',');
        if (!ActionMapping[actionCode]) {
            continue;
        }

        ActionMapping[actionCode](jsonData, action);
    }

    if (!maxBlock) {
      isParsing = false;
      return;
    }

    jsonData.lastBlock = maxBlock;
    fs.writeFileSync('data.json', JSON.stringify(jsonData));
    console.log(`Finished Parsing Blocks`)

    isParsing = false;
}

if (config.MODE === 'once') {
  start();
} else {
  start();
  setInterval(start, config.TIME_BETWEEN_PARSES_MS);
}

