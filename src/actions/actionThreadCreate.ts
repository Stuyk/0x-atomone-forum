import { ACTION_CODES, Forum, MemoAction } from '../types';

export function actionThreadCreate(jsonData: Forum, action: MemoAction) {
    const [_, actionCode, title, content] = action.message.split(',');
    if (actionCode != ACTION_CODES.THREAD_CREATE) {
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

    const threadIdx = jsonData.threads.findIndex((x) => x.hash === action.hash);
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
                timestamp: action.timestamp,
                upvotes: [],
            },
        ],
    });

    console.log(`Create Thread Action Invoked`);
}
