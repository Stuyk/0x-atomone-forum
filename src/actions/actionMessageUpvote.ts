import { ACTION_CODES, Forum, MemoAction } from '../types';

export function actionMessageUpvote(jsonData: Forum, action: MemoAction) {
    const [_, actionCode, threadHash, content] = action.message.split(',');
    if (actionCode != ACTION_CODES.MESSAGE_UPVOTE) {
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
    if (msgIdx <= -1) {
        console.warn(`Skipped ${action.hash}, message could not be found.`);
        return;
    }

    // Create upvotes array if it does not already exist.
    if (!jsonData.threads[threadIndex].messages[msgIdx].upvotes) {
        jsonData.threads[threadIndex].messages[msgIdx].upvotes = [action.author];
        jsonData.threads[threadIndex].updated = new Date(Date.now()).toISOString();
        console.log(`Upvote Message Action Invoked`);
        return
    }

    const upvoteIndex = jsonData.threads[threadIndex].messages[msgIdx].upvotes.findIndex(x => x == action.author);
    if (upvoteIndex >= 0) {
        console.warn(`Skipped ${action.hash}, upvote already counted.`);
        return;
    }

    jsonData.threads[threadIndex].messages[msgIdx].upvotes.push(action.author);
    jsonData.threads[threadIndex].updated = new Date(Date.now()).toISOString();
    console.log(`Upvote Message Action Invoked`);
}
