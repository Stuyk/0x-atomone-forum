import config from '../../config.json';
import { Transaction } from '../types';
import configInfo from '../../config.json';

export async function getCurrentBlockHeight() {
    try {
        const response = await fetch(`${config.API_URL}/cosmos/base/tendermint/v1beta1/blocks/latest`);
        if (!response.ok) {
            console.log(response);
            throw new Error(`Failed to fetch block: ${response.statusText}`);
        }

        const data = (await response.json()) as { block: { header: { height: string } } };
        return data.block.header.height;
    } catch (error) {
        console.error(`Error fetching block at height`, error);
        return null;
    }
}

export async function getBlockByHeight(blockHeight: number) {
    try {
        const response = await fetch(`${config.API_URL}/cosmos/base/tendermint/v1beta1/blocks/${blockHeight}`);
        if (!response.ok) {
            console.log(response);
            throw new Error(`Failed to fetch block: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching block at height ${blockHeight}:`, error);
        return null;
    }
}

export async function getMemoFromTx(txHash: string, timestamp: string) {
    try {
        const txResponse = await fetch(`${config.API_URL}/cosmos/tx/v1beta1/txs/${txHash.toUpperCase()}`);

        if (!txResponse.ok) {
            throw new Error(`Failed to fetch transaction: ${txResponse.statusText}`);
        }

        const txData = (await txResponse.json()) as Transaction;
        if (!txData.tx.body.memo.startsWith(config.MEMO_PREFIX)) {
            return null;
        }

        if (txData.tx_response.code !== 0) {
            return null;
        }

        for (let message of txData.tx.body.messages) {
            if (message['@type'] !== '/cosmos.bank.v1beta1.MsgSend') {
                continue;
            }

            if (message.to_address !== config.OWNER) {
                continue;
            }

            let total = BigInt(0);
            for(let coin of message.amount) {
                if (coin.denom.toLowerCase() !== configInfo.DENOM) {
                    continue;
                }

                total += BigInt(coin.amount);
            }

            if (total < BigInt(configInfo.MINIMUM_FEE)) {
                console.warn(`Skipping message, minimum fee was not enough. From -> ${message.from_address}`)
                continue;
            }

            return { 
                timestamp, 
                hash: txHash, 
                author: message.from_address,
                message: txData.tx.body.memo,
                amount: total.toString(),
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching transaction memo:', error);
        throw error;
    }
}
