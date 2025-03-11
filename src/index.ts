import * as fs from 'node:fs';
import { sha256 } from '@cosmjs/crypto';
import { toHex } from '@cosmjs/encoding';
import { Forum, MemoAction } from './types';

const ATOM_ONE_API_URL = "https://atomone-api.allinbits.com";
const MSG_PREFIX = "0xForum";
const TO_ADDRESS = "atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep";
const DEFAULT_MIN_BLOCK = `2168218`;

const ActionMapping = {
  0: actionThreadCreate,
  1: actionMessageAdd,
  2: actionMessageRemove
}

let jsonData: Forum = { admins: ['atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep'], owner: 'atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep', threads: [], lastBlock: DEFAULT_MIN_BLOCK };

async function getCurrentBlockHeight() {
  try {
    const response = await fetch(
      `${ATOM_ONE_API_URL}/cosmos/base/tendermint/v1beta1/blocks/latest`
    );
    if (!response.ok) {
      console.log(response);
      throw new Error(`Failed to fetch block: ${response.statusText}`);
    }

    const data = await response.json() as { block: { header: { height: string }}};
    return data.block.header.height;
  } catch (error) {
    console.error(`Error fetching block at height`, error);
    process.exit(1);
  }
}


async function getBlockByHeight(blockHeight: number) {
  try {
    const response = await fetch(
      `${ATOM_ONE_API_URL}/cosmos/base/tendermint/v1beta1/blocks/${blockHeight}`
    );
    if (!response.ok) {
      console.log(response);
      throw new Error(`Failed to fetch block: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching block at height ${blockHeight}:`, error);
    process.exit(1);
  }
}

async function getMemoFromTx(txHash: string, timestamp: string) {
  try {
    const txResponse = await fetch(
      `${ATOM_ONE_API_URL}/cosmos/tx/v1beta1/txs/${txHash.toUpperCase()}`
    );

    if (!txResponse.ok) {
      throw new Error(`Failed to fetch transaction: ${txResponse.statusText}`);
    }

    const txData = await txResponse.json() as { tx: { body: { memo: string, messages: Array<{ '@type': string, from_address: string, to_address: string }> }}};
    if (!txData.tx.body.memo.startsWith(MSG_PREFIX)) {
      return null;
    }

    for (let message of txData.tx.body.messages) {
      if (message['@type'] !== '/cosmos.bank.v1beta1.MsgSend') {
        continue;
      }

      if (message.to_address !== TO_ADDRESS) {
        continue;
      }

      return { message: txData.tx.body.memo, hash: txHash, timestamp, author: message.from_address };
    }

    return null;
  } catch (error) {
    console.error("Error fetching transaction memo:", error);
    throw error;
  }
}

async function getBlockActions(minBlock: string, maxBlock: string) {
  const blockPromises: Promise<{ block: { data: { txs: Array<string> }, header: { time: string }}}>[] = [];

  // Get all blocks
  for(let i = parseInt(minBlock); i <= parseInt(maxBlock); i++) {
    console.log(`Fetching Block: ${i}`);
    blockPromises.push(getBlockByHeight(i));
  }

  // Get all transactions
  const blocks = await Promise.all(blockPromises);
  const hexTxHashes: { hash: string, timestamp: string }[] = [];

  for(let blockData of blocks) {
    const txHashes = blockData.block.data.txs;
    const timestamp = blockData.block.header.time;

    for(let encodedTxHash of txHashes) {
      hexTxHashes.push({ hash: toHex(sha256(Buffer.from(encodedTxHash, 'base64'))), timestamp })
    }
  }

  const memoPromises: Promise<Awaited<ReturnType<typeof getMemoFromTx>>>[] = [];

  // Get all memos for a transaction
  for(let txHash of hexTxHashes) {
    memoPromises.push(getMemoFromTx(txHash.hash, txHash.timestamp))
  }

  const messages = await Promise.all(memoPromises);

  const validMessages: MemoAction[] = [];
  for(let message of messages) {
    if (!message) {
      continue;
    }

    validMessages.push(message);
  }

  return validMessages;
}

function actionThreadCreate(action: MemoAction) {
  //
  console.log(`Create Thread Action Called`)
  console.log(JSON.stringify(action));

  const [_, actionCode, title, content] = action.message.split(',');
  if (actionCode != '0') {
    console.warn(`Skipped ${action.hash}, action code was not valid.`);
    return;
  }

  if (!title) {
    console.warn(`Skipped ${action.hash}, missing title at position 1`);
    return;
  }

  if (!content) {
    console.warn(`Skipped ${action.hash}, missing content at position 2`);
    return;
  }

  const threadIdx = jsonData.threads.findIndex(x => x.hash === action.hash);
  if (threadIdx >= 0) {
    console.warn(`Skipped ${action.hash}, thread already exists.`);
    return;
  }

  jsonData.threads.push({ 
    title, 
    hash: action.hash, 
    updated: new Date(Date.now()).toISOString(),
    messages: [
      {
        author: action.author, 
        hash: action.hash, 
        message: content, 
        timestamp: action.timestamp
      }
    ], 
  });
}

function actionMessageAdd(action: MemoAction) {
  //
  console.log(`Add Message Action Called`)

  const [_, actionCode, threadHash, content] = action.message.split(',');
  if (actionCode != '1') {
    console.warn(`Skipped ${action.hash}, action code was not valid.`);
    return;
  }

  if (!threadHash) {
    console.warn(`Skipped ${action.hash}, missing ThreadHash at position 1`);
    return;
  }

  if (!content) {
    console.warn(`Skipped ${action.hash}, missing Content at position 2`);
    return;
  }

  const threadIndex = jsonData.threads.findIndex(x => x.hash === threadHash);
  if (threadIndex <= -1) {
    console.warn(`Skipped ${action.hash}, invalid thread hash at position 1`);
    return;
  }

  const msgIdx = jsonData.threads[threadIndex].messages.findIndex(x => x.hash === action.hash);
  if (msgIdx >= 0) {
    console.warn(`Skipped ${action.hash}, message already exists.`);
    return;
  }

  jsonData.threads[threadIndex].updated = new Date(Date.now()).toISOString()
  jsonData.threads[threadIndex].messages.push({
    author: action.author,
    hash: action.hash,
    message: action.message.replace(`${_},${actionCode},${threadHash},`, ''),
    timestamp: action.timestamp
  })
}

function actionMessageRemove(action: MemoAction) {
  //
  console.log(`Remove Message Action Called`)

  const [_, actionCode, threadHash, msgHash] = action.message.split(',');
  if (actionCode != '1') {
    console.warn(`Skipped ${action.hash}, action code was not valid.`);
    return;
  }

  if (!threadHash) {
    console.warn(`Skipped ${action.hash}, missing ThreadHash at position 1`);
    return;
  }

  if (!msgHash) {
    console.warn(`Skipped ${action.hash}, missing MessageHash at position 2`);
    return;
  }

  const threadIndex = jsonData.threads.findIndex(x => x.hash === threadHash);
  if (threadIndex <= -1) {
    console.warn(`Skipped ${action.hash}, invalid thread hash at position 1`);
    return;
  }

  const msgIndex = jsonData.threads[threadIndex].messages.findIndex(x => x.hash === msgHash);
  if (msgIndex <= -1) {
    console.warn(`Skipped ${action.hash}, invalid msg hash at position 2`);
    return;
  }

  const msg = jsonData.threads[threadIndex].messages[msgIndex]
  if (action.author !== msg.author && action.author !== jsonData.owner && !jsonData.admins.includes(action.author) ) {
    console.warn(`Skipped ${action.hash}, not owner of message`);
    return;
  }

  jsonData.threads[threadIndex].updated = new Date(Date.now()).toISOString()
  jsonData.threads[threadIndex].messages.splice(msgIndex, 1)
}

async function start() {
  const maxBlock = await getCurrentBlockHeight();
  
  if (fs.existsSync('data.json')) {
    jsonData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
  }
  
  if (jsonData.lastBlock == maxBlock) {
    console.log(`Last Block is Head Block, not parsing.`);
    process.exit(1);
  }

  const actions = await getBlockActions(jsonData.lastBlock, maxBlock);

  for(let action of actions) {
    const [_, actionCode] = action.message.split(',');
    if (!ActionMapping[actionCode]) {
      continue;
    }

    ActionMapping[actionCode](action);
  }

  jsonData.lastBlock = maxBlock;
  fs.writeFileSync('data.json', JSON.stringify(jsonData, null, '\t'))
}

start();