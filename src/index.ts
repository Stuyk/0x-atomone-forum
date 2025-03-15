import { sha256 } from '@cosmjs/crypto';
import { toHex } from '@cosmjs/encoding';
import { ACTION_CODES, Config, Forum, MemoAction } from './types';
import * as Actions from './actions/index';
import * as Requests from './requests/index';

const ActionMapping = {
    [ACTION_CODES.THREAD_CREATE]: Actions.actionThreadCreate,
    [ACTION_CODES.MESSAGE_ADD]: Actions.actionMessageAdd,
    [ACTION_CODES.MESSAGE_REMOVE]: Actions.actionMessageRemove,
    [ACTION_CODES.THREAD_REMOVE]: Actions.actionThreadRemove,
    [ACTION_CODES.ADMIN_ADD]: Actions.actionAdminAdd,
    [ACTION_CODES.ADMIN_REMOVE]: Actions.actionAdminRemove,
    [ACTION_CODES.MESSAGE_UPVOTE]: Actions.actionMessageUpvote
};

async function getBlockActions(config: Config, minBlock: string, maxBlock: string) {
    const blockPromises: Promise<{ block: { data: { txs: Array<string> }; header: { time: string } } }>[] = [];

    // Get all blocks
    for (let i = parseInt(minBlock); i <= parseInt(maxBlock); i++) {
        console.log(`Fetching Block: ${i}`);
        blockPromises.push(Requests.getBlockByHeight(config, i));
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
        memoPromises.push(Requests.getMemoFromTx(config, txHash.hash, txHash.timestamp));
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

export async function parseBlocks(config: Config, data: Forum) {
    const maxBlock = await Requests.getCurrentBlockHeight(config);
    if (!maxBlock) {
      console.warn(`Failed to obtain block head`);
      return data;
    }

    if (data.lastBlock == maxBlock) {
        console.log(`Last Block is Head Block, not parsing.`);
        return data;
    }

    const actions = await getBlockActions(config, data.lastBlock, maxBlock as string);
    for (let action of actions) {
        const [_, actionCode] = action.message.split(',');
        if (!ActionMapping[actionCode]) {
            continue;
        }

        ActionMapping[actionCode](data, action);
    }

    if (!maxBlock) {
      return data;
    }

    data.lastBlock = maxBlock;
    return data;
}


