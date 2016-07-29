import jackrabbit from 'jackrabbit';
import r from 'rethinkdb';
import download from 'download';
import fs from 'fs';
import statuses from './statuses.js';

// initialize db connection
var connection = null;
r.connect({
    host: 'rethinkdb',
    port: 28015
  },
  (err, conn) => {
    if (err) throw err;
    connection = conn;
  });

// intialize job queue
const queue = jackrabbit('amqp://rabbitmq');
queue.default()
  .queue({name: 'scraper'})
  .consume((data) => {
    console.log('Downloading', data.url);
    download(data.url).then((payload) => {
      r.db('test').table('jobs').get(data.primaryKey).update({
        status: statuses.COMPLETE,
        updatedAt: new Date(),
        payload: payload
      }).run(connection).then((result) => {
        console.log('Job:', data.jobId, 'Completed...');
      }).catch((err) => {
        if (err) throw err;
      });
    })
  }, {noAck: true});
