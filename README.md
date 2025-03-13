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
0xForum,2,thread-hash
```
