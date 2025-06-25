const { CosmosClient } = require('@azure/cosmos');

const endpoint = 'https://registrations.documents.azure.com:443/';
const key = 'ec22KsmfNCEDaQNoQnezKcfhiexG0P4fcNlaS1UN3VGklvUC9HgDqcX7Pd5psnZMCplywf3DQUqzACDbqZ8New==';
const databaseName = 'Registrations';
const registrationsDB = 'Items';
const eventsDB = 'Events';
const usersDB = 'Users';

const client = new CosmosClient({ endpoint, key });

module.exports = {
  client,
  databaseName,
  registrationsDB,
  usersDB,
    eventsDB
};
