const cp = require('child_process');
const EventEmitter = require('events');
const WebSocket = require('ws');
const https = require('https');

class LeagueConnector extends EventEmitter {

    watching;
    credentials = [];
    
    constructor() {
        super();

        this.watching = setInterval(async()=> {
            const lcuCredentials = await LeagueConnector.getLCUCredentialsFromProcess();
            if(!lcuCredentials) return;

            lcuCredentials.forEach((credentials)=> {
                const findCredentials = this.credentials.find((_credentials)=> _credentials.port === credentials.port);
                if(!findCredentials) {
                    return this.watchLeagueClient(credentials);
                }
            });
        }, 1000)
    }

    start() {
        this.watching
    }

    stop() {
        this.credentials = [];
        this.watching.unref();
    }

    watchLeagueClient(credentials) {
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });

        const ws = new WebSocket(`wss://${credentials.username}:${credentials.password}@127.0.0.1:${credentials.port}`, 'wamp', { agent: agent })
        ws.onerror = ()=> undefined;
        if(!ws) return;

        ws.on('message', ()=> {
            const existCredentials = this.credentials.find((_credentials)=> _credentials.port === credentials.port)
            if(!existCredentials) {
                this.credentials.push(credentials)
                this.emit('connect', (credentials))
            }
        });

        ws.on('open', () => { ws.send('[5,"OnJsonApiEvent"]') })

        ws.on('close', ()=> {
            const existCredentials = this.credentials.find((_credentials)=> _credentials.port === credentials.port)
            if(existCredentials) {
                const index = this.credentials.findIndex((_credentials)=> _credentials.port === credentials.port)
                this.credentials.splice(index, 1)
                this.emit('disconnect', (credentials));
            } 
        }); 
    }

    static getLCUCredentialsFromProcess = ()=> {
        return new Promise(resolve => {
            const command = `WMIC PROCESS WHERE name='LeagueClientUx.exe' GET commandline`;
    
            cp.exec(command, (err, stdout, stderr) => {
                if (err || !stdout || stderr) {
                    resolve();
                    return;
                }
    
                const credentials = [];
                const args = []

                stdout.split('\n').forEach((arg)=> arg.includes("--remoting-auth-token") ? args.push(arg) : null);
                
                for(var i = 0; i < args.length; i++) {
                    const process = args[i];
                    if(!process) return;
    
                    const password = process.match(/--remoting-auth-token=(.*?)"/)[1];
                    const port = process.match(/--app-port=(.*?)"/)[1]
                    const authorization = Buffer.from(`riot:${password}`).toString("base64")
    
                    const _credentials = {
                        protocol: 'https',
                        address: '127.0.0.1',
                        port: port,
                        username: 'riot',
                        password,
                        authorization
                    }
    
                    credentials.push(_credentials);
                }
    
                resolve(credentials);
            });
        });
    }
}

module.exports = LeagueConnector;