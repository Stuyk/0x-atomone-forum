import { Forum, MemoAction } from '../types';

export function actionMessageAdd(jsonData: Forum, action: MemoAction) {
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

    const threadIndex = jsonData.threads.findIndex((x) => x.hash === threadHash);
    if (threadIndex <= -1) {
        console.warn(`Skipped ${action.hash}, invalid thread hash at position 1`);
        return;
    }

    const msgIdx = jsonData.threads[threadIndex].messages.findIndex((x) => x.hash === action.hash);
    if (msgIdx >= 0) {
        console.warn(`Skipped ${action.hash}, message already exists.`);
        return;
    }

    jsonData.threads[threadIndex].updated = new Date(Date.now()).toISOString();
    jsonData.threads[threadIndex].messages.push({
        author: action.author,
        hash: action.hash,
        message: action.message.replace(`${_},${actionCode},${threadHash},`, ''),
        timestamp: action.timestamp,
    });

    console.log(`Add Message Action Invoked`);
}
