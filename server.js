import Hapi from 'hapi';
import {getJob, createJob} from './handlers.js';

// Initialize Server
const server = new Hapi.Server();
server.connection({port: 8888});

// Define Routes
server.route({
  method: 'GET',
  path: '/createJob/{url?}',
  handler: (req, res) => res(createJob(req.params.url, req.info.remoteAddress))
});

server.route({
  method: 'GET',
  path: '/getJob/{id?}',
  handler: (req, res) => res(getJob(req.params.id, req.info.rempteAddress))
});

// Start Server
server.start((err) => {
  if (err) {
    throw new Error(err);
  }
  console.log('Server started on:', server.info.uri);
});
