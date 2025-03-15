type PublicKey = string;

export const ACTION_CODES = {
    THREAD_CREATE: '0',
    MESSAGE_ADD: '1',
    MESSAGE_REMOVE: '2',
    THREAD_REMOVE: '3',
    ADMIN_ADD: '4',
    ADMIN_REMOVE: '5',
    MESSAGE_UPVOTE: '6',
}


export interface Config {
    API_URL: string;
    MEMO_PREFIX: string;
    OWNER: string;
    START_BLOCK: string;
    MINIMUM_FEE: string;
    DENOM: string;
    MODE: string;
    TIME_BETWEEN_PARSES_MS: number;
}

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
    upvotes: string[];
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
                '@type': string;
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
