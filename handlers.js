import r from 'rethinkdb';
import jackrabbit from 'jackrabbit';
import uuid from 'uuid';
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

// intialize jobs table
r.db('test').tableCreate('jobs');

// Initialize job queue
const queue = jackrabbit('amqp://rabbitmq').default();

// getJob Handler
export function getJob(id) {
  console.log('Fetching Job:', id + '...');
  return r.table('jobs').filter(r.row('jobId').eq(id))
    .run(connection)
    .then((cursor) => {
      return cursor.toArray();
    }).then((results) => {
      console.log(results);
      return results;
    }).catch((err) => {
      if (err) throw err;
    })
}

// createJob Handler
export function createJob(url, requestor) {
  // generate unique id for job
  let id = uuid.v1();

  // insert job in db
  r.table('jobs').insert({
    createdAt: new Date(),
    jobId: id,
    url: url,
    requestor: requestor,
    status: statuses.PENDING
  }).run(connection).then((result) => {
    // enqueue scraper job
    queue.publish({
      primaryKey: result.generated_keys[0],
      jobId: id,
      url: url
    }, {key: 'scraper'})
  }).catch((err) => {
    if (err) throw err;
  });
  // return jobId and status
  return JSON.stringify({
    url: url,
    status: statuses.PENDING,
    jobId: id
  });
}
