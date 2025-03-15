import { ACTION_CODES, Forum, MemoAction } from '../types';

export function actionAdminRemove(jsonData: Forum, action: MemoAction) {
    const [_, actionCode, address] = action.message.split(',');
    if (actionCode != ACTION_CODES.ADMIN_REMOVE) {
        console.warn(`Skipped ${action.hash}, action code was not valid.`);
        return;
    }

    if (!address) {
        console.warn(`Skipped ${action.hash}, missing Address at position 1`);
        return;
    }

    if (action.author !== jsonData.owner) {
        console.warn(`Skipped ${action.hash}, not owner of board`);
        return;
    }

    const idx = jsonData.admins.findIndex(x => x == address);
    if (idx <= -1) {
        console.warn(`Skipped ${action.hash}, admin does not exist`);
        return;
    }

    jsonData.admins.splice(idx, 1);
    console.log(`Remove Admin Invoked`)
}
