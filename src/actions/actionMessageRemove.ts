import { Forum, MemoAction } from "../types";

export function actionMessageRemove(jsonData: Forum, action: MemoAction) {
  //
  console.log(`Remove Message Action Called`)

  const [_, actionCode, threadHash, msgHash] = action.message.split(',');
  if (actionCode != '2') {
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