import { Forum, MemoAction } from '../types';

export function actionAdminAdd(jsonData: Forum, action: MemoAction) {
    const [_, actionCode, address] = action.message.split(',');
    if (actionCode != '4') {
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

    const idx = jsonData.admins.findIndex((x) => x == address);
    if (idx >= 0) {
        console.warn(`Skipped ${action.hash}, admin already added`);
        return;
    }

    jsonData.admins.push(address);
    console.log(`Add Admin Invoked`);
}
