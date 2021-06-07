const cp = require('child_process');
const EventEmitter = require('events');
const WebSocket = require('ws');
const https = require('https');

class LeagueConnector extends EventEmitter {

    watching;
    connections = [];
    
    constructor() {
        super();

        this.watching = setInterval(async()=> {
            const connections = await LeagueConnector.getLCUConnectionsFromProcess();
            if(!connections) return;

            for(var i = 0; i < connections.length; i++) {
                const connection = connections[i];
                const hasConnection = this.connections.find((_connection)=> _connection.port === connection.port);
                if(!hasConnection) {
                    return this.watchLeagueClient(connection);
                }
            }
        }, 1000) 
    }

    start() {
        this.watching
    }

    stop() {
        this.watching.unref();
    }

    watchLeagueClient(connection) {
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });

        const ws = new WebSocket(`wss://${connection.username}:${connection.password}@127.0.0.1:${connection.port}`, 'wamp', { agent: agent })
        ws.onerror = ()=> undefined;
        if(!ws) return;

        ws.on('message', ()=> {
            const _connection = this.findConnection(connection.port);
            if(!_connection) {
                this.connections.push(connection)
                this.emit('connect', (connection))
            }
        });

        ws.on('open', () => { ws.send('[5,"OnJsonApiEvent"]') })

        ws.on('close', ()=> {
            const _connection = this.findConnection(connection.port);
            if(_connection) {
                const index = this.findConnectionIndex(connection.port);
                this.connections.splice(index, 1)
                this.emit('disconnect', (connection));
            } 
        }); 
    }

    findConnection = (port)=> this.connections.find((connection)=> connection.port === port);
    findConnectionIndex = (port)=> this.connections.findIndex((connection)=> connection.port === port)

    static getLCUConnectionsFromProcess = ()=> {
        return new Promise(resolve => {
            const command = `WMIC PROCESS WHERE name='LeagueClientUx.exe' GET commandline`;
    
            cp.exec(command, (err, stdout, stderr) => {
                if (err || !stdout || stderr) {
                    resolve();
                    return;
                }
    
                const connections = [];
                const args = []

                stdout.split('\n').forEach((arg)=> arg.includes("--remoting-auth-token") ? args.push(arg) : null);
                
                for(var i = 0; i < args.length; i++) {
                    const process = args[i];
                    if(!process) return;
    
                    const password = process.match(/--remoting-auth-token=(.*?)"/)[1];
                    const port = process.match(/--app-port=(.*?)"/)[1]
                    const authorization = Buffer.from(`riot:${password}`).toString("base64")
    
                    const _connection = {
                        protocol: 'https',
                        address: '127.0.0.1',
                        port: port,
                        username: 'riot',
                        password,
                        authorization
                    }
    
                    connections.push(_connection);
                }
    
                resolve(connections);
            });
        });
    }
}

module.exports = LeagueConnector;