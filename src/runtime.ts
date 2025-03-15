import { Forum } from "./types";
import fs from 'fs';
import { parseBlocks } from "./index";
import config from '../config.json';

let isParsing = false;

let jsonData: Forum = {
    lastBlock: config.START_BLOCK,
    owner: config.OWNER,
    admins: [config.OWNER],
    threads: [],
};

async function start() {
    if (isParsing) {
      return;
    }

    isParsing = true;
    if (fs.existsSync('data.json')) {
        jsonData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
    }

    console.log(`Parsing Blocks`)
    jsonData = await parseBlocks(config, jsonData)
    fs.writeFileSync('data.json', JSON.stringify(jsonData));
    isParsing = false;
    console.log(`Finished Parsing Blocks`)
}

if (config.MODE === 'once') {
  start();
} else {
  start();
  setInterval(start, config.TIME_BETWEEN_PARSES_MS);
}
