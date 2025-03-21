> [!IMPORTANT]  
> This repository was archived in favor of the `@allinbits/chronostate` library.
> The individual library can be viewed [here](https://www.npmjs.com/package/@atomone/chronostate)

# 0x AtomOne Forum 🌐

Welcome to **0x AtomOne Forum** – a decentralized forum powered entirely by **GitHub Actions** and the **AtomOne** blockchain.

This forum scans the chain for specific memos at regular intervals, updating content based on the transactions it finds. The GitHub Action runs every 5-10 minutes to ensure the forum stays current. As this is a limitation of GitHub actions specifically.

Yes, it's incredibly slow when it comes to updating, but the concept allows for faster iterations to exist on other server infrastructure.

Even if this repository goes down, the data is on chain for as long as memos exist.

## Usage ⚙️

To interact with the forum, you'll need a wallet compatible with the **AtomOne** network, such as **Keplr** or **Leapwallet**.

## Memo Actions 📝

All actions must be sent through a memo and there's a specific messaging format to make it happen.

### Create Thread

To create a new thread, send a memo in the following format:

```
0xForum,0,title,content
```

### Add Reply

To add a reply to an existing thread, use this format:

```
0xForum,1,thread-hash,message
```

### Delete Reply

To delete a reply, send a memo in the following format:

```
0xForum,2,thread-hash,message-hash
```

### Delete Thread

To delete a thread and all of its messages, send a memo in the following format:

```
0xForum,3,thread-hash
```

### Add Admin

Requires ownership of the board to add an admin.

```
0xForum,4,address
```

### Remove Admin

Requires ownership of the board to remove an admin.

```
0xForum,5,address
```

### Upvote Message

Upvote a message as a user.

```
0xForum,6,thread-hash,message-hash
```

## Config

If you wish to change the configuration, the code block below tells you what each setting does.

```ts
{
    // Where the pull the blocks, transactions, and block heights from
    "API_URL": "https://atomone-api.allinbits.com",
    // What prefix is required in a message in order to consider it as a Forum Message
    "MEMO_PREFIX": "0xForum",
    // Where the transfer must be sent in order to parse posts, threads, etc.
    "OWNER": "atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep",
    // The minimum block where to start parsing data from
    "START_BLOCK": "2168218",
    // There are two formats, 'once' and 'runtime'
    // runtime - Creates an interval that parses blocks every 15 seconds.
    // once - Runs the program once, and then exits.
    "MODE": "once",
    // Parses blocks every 15 seconds, only applies when in runtime mode
    "TIME_BETWEEN_PARSES_MS": 15000,
    // The minimum tokens required to parse the message. This is 0.000001 ATONE
    "MINIMUM_FEE": "1",
    // The required denom of the tokens to parse the message.
    "DENOM": "uatone",
}
```

## Endpoint

`jsdelivr` provides a free CDN for data, when it updates is unknown. However, it works to pull data from this repository outright.

```
https://cdn.jsdelivr.net/gh/stuyk/0x-atomone-forum/data.json
```
