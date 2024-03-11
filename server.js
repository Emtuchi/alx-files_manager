import express from 'express';
import router from './routes/index';

const port = parseInt(process.env.PORT, 10) || 5000;
const server = express();

// parses incoming JSON requests and puts the parsed data in req.body
server.use(express.json());
server.use('/', router);

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});

export default server;
