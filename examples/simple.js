/**
 * @description LeagueConnector simple example
 * @author Ryan Ribeiro (Nospher#9995)
 */

const LeagueConnector = require('../lib');

const connector = new LeagueConnector();

connector.on('connect', (_credentials) => {
    console.log(`League Client has been started in ${_credentials.port} port. Total of ${connector.credentials.length} clients running at moment.`);
});

connector.on('disconnect', (_credentials) => {
    console.log(`League Client running in ${_credentials.port} port has been closed. Total of ${connector.credentials.length} clients running at moment.`);
});

console.log('Waiting to League Client start');
connector.start();