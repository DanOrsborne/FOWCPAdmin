const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key =  process.env.COSMOS_DB_KEY;
const databaseName = 'Registrations';
const registrationsDB = 'Items';
const eventsDB = 'Events';
const usersDB = 'Users';

const client = new CosmosClient({ endpoint, key });

const eventsContainer = client.database(databaseName).container(eventsDB);
const usersContainer = client.database(databaseName).container(usersDB);
const registrationsContainer = client.database(databaseName).container(registrationsDB);

module.exports = {
  client,
  databaseName,
  registrationsDB,
  usersDB,
    eventsDB, 
    eventsContainer, 
    usersContainer, 
    registrationsContainer
};
