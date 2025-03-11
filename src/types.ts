type PublicKey = string;

export interface Forum {
  owner: PublicKey;
  admins: PublicKey[];
  threads: Thread[];
  lastBlock: string;
}

export interface Thread {
  updated: string;
  hash: string;
  title: string;
  messages: Message[];
}

export interface Message {
  timestamp: string;
  hash: string;
  message: string;
  author: string;
}

export interface MemoAction {
  message: string;
  hash: string;
  timestamp: string;
  author: string;
}
