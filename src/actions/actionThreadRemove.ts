import { ACTION_CODES, Forum, MemoAction } from '../types';

export function actionThreadRemove(jsonData: Forum, action: MemoAction) {
    const [_, actionCode, threadHash] = action.message.split(',');
    if (actionCode != ACTION_CODES.THREAD_REMOVE) {
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

    if (action.author !== jsonData.threads[threadIndex].messages[0].author && action.author !== jsonData.owner && !jsonData.admins.includes(action.author)) {
        console.warn(`Skipped ${action.hash}, not owner of message`);
        return;
    }

    jsonData.threads.splice(threadIndex, 1);
    console.log('Remove Thread Invoked')
}
