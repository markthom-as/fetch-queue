# fetch-queue

### Overview:
fetch-queue is a no-frills backend for fetching HTML over http. fetch-queue consists of four services running in Docker containers orchestrated with Docker Compose.

The main API service runs on a Node.js box running [hapi](http://hapijs.com/) to manage HTTP requests. This service has two endpoints: `createJob` and `getJob`. Each takes an argument that define the URL to be fetched, and the `jobId` to be returned respectively.

`createJob` creates a record in a [RethinkDB](https://www.rethinkdb.com/) database before sending a job enqueue request to a [RabbitMQ](https://www.rabbitmq.com/) instance. The worker node, which listens to a shared RabbitMQ topic, is then assigned the job from the queue and fetches the HTML, updating the database record accordingly.

`getJob` queries the database for jobs that match the input `jobID` before returning the results to the requestor.

### Caveat Emptor:
This implementation is most definitely closer to an MVP than a fully fleshed out system. There is little input validation, no authentication, and in an effort to keep the tooling simple, the project runs using `babel-node` instead of transpiling before running. That being said, this project is architected to be scaleable (with Nginx + node replicas) and utilizes tooling and technologies that allowed me to create a microservice-based infrastructure in the space of an afternoon.

### Tech Stack:
- Node 6
- [Hapi](http://hapijs.com/)
- ES6/7 (Babel)
- Docker / Docker Compose
- RabbitMQ ([jackrabbit](https://github.com/hunterloftis/jackrabbit))
- RethinkDB
 

### To Run:
1. Install [Docker for Mac](https://www.docker.com/products/docker#/mac)
2. Run `npm i` from the root directory to install the required node modules.
3. Run `docker-compose up` from the root directory to turn up the local cluster.
4. Wait for a the `server_1 | Server started on: http://d59aa24b940b:8888` message to appear in your console.


### To Fetch a URL:
Visit `http://localhost:8888/createJob/www.google.com` in your web browser, substituting the final part of the URL for your desired web address and take note of the `jobId` field.
### To Check The Status of A Fetch Job
Visit `http://localhost:8888/getJob/12592060-5559-11e6-8351-d104e42110a8` in your web browser, substituting the final part of the URL with the `jobID` value you collected earlier.

