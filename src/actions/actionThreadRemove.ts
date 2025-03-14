import { Forum, MemoAction } from '../types';

export function actionThreadRemove(jsonData: Forum, action: MemoAction) {
    const [_, actionCode, threadHash] = action.message.split(',');
    if (actionCode != '3') {
        console.warn(`Skipped ${action.hash}, action code was not valid.`);
        return;
    }

    if (!threadHash) {
        console.warn(`Skipped ${action.hash}, missing ThreadHash at position 1`);
        return;
    }

    const threadIndex = jsonData.threads.findIndex((x) => x.hash === threadHash);
    if (threadIndex <= -1) {
        console.warn(`Skipped ${action.hash}, invalid thread hash at position 1`);
        return;
    }

    jsonData.threads.splice(threadIndex, 1);
}
