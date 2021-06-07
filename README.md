
# league-connector
## INSTALLATION

### NPM

```sh
$ npm install league-connector
```

### Git

```git
$ git clone https://github.com/nosphery/league-connector.git
```

## Usage examples

```javascript
const LeagueConnector = require('../lib');
const connector = new LeagueConnector();

connector.on('connect', (connection) => {
    console.log(`League Client has been started in ${connection.port} port. Total of ${connector.connections.length} clients running at moment.`);
});

connector.on('disconnect', (connection) => {
    console.log(`League Client running in ${connection.port} port has been closed. Total of ${connector.connections.length} clients running at moment.`);
});

console.log('Waiting to League Client start');
connector.start();
```
