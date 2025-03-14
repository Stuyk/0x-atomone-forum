import config from '../../config.json';
import { Transaction } from '../types';

export async function getCurrentBlockHeight() {
    try {
        const response = await fetch(`${config.ATOM_ONE_API_URL}/cosmos/base/tendermint/v1beta1/blocks/latest`);
        if (!response.ok) {
            console.log(response);
            throw new Error(`Failed to fetch block: ${response.statusText}`);
        }

        const data = (await response.json()) as { block: { header: { height: string } } };
        return data.block.header.height;
    } catch (error) {
        console.error(`Error fetching block at height`, error);
        process.exit(1);
    }
}

export async function getBlockByHeight(blockHeight: number) {
    try {
        const response = await fetch(`${config.ATOM_ONE_API_URL}/cosmos/base/tendermint/v1beta1/blocks/${blockHeight}`);
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

export async function getMemoFromTx(txHash: string, timestamp: string) {
    try {
        const txResponse = await fetch(`${config.ATOM_ONE_API_URL}/cosmos/tx/v1beta1/txs/${txHash.toUpperCase()}`);

        if (!txResponse.ok) {
            throw new Error(`Failed to fetch transaction: ${txResponse.statusText}`);
        }

        const txData = (await txResponse.json()) as Transaction;
        if (!txData.tx.body.memo.startsWith(config.MSG_PREFIX)) {
            return null;
        }

        if (txData.tx_response.code !== 0) {
            return null;
        }

        for (let message of txData.tx.body.messages) {
            if (message['@type'] !== '/cosmos.bank.v1beta1.MsgSend') {
                continue;
            }

            if (message.to_address !== config.TO_ADDRESS) {
                continue;
            }

            return { message: txData.tx.body.memo, hash: txHash, timestamp, author: message.from_address };
        }

        return null;
    } catch (error) {
        console.error('Error fetching transaction memo:', error);
        throw error;
    }
}
