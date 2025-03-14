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

export interface Transaction {
  tx: {
    body: {
      messages: Array<{
        "@type": string;
        from_address: string;
        to_address: string;
        amount: Array<{
          denom: string;
          amount: string;
        }>;
      }>;
      memo: string;
      timeout_height: string;
      extension_options: Array<any>;
      non_critical_extension_options: Array<any>;
    };
  };
  tx_response: {
    height: string;
    txhash: string;
    codespace: string;
    code: number;
    data: string;
    raw_log: string;
    logs: Array<any>;
  };
}
