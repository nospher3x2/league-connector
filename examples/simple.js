/**
 * @description LeagueConnector simple example
 * @author Ryan Ribeiro (Nospher#9995)
 */

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