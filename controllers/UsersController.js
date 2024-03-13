/* eslint-disable import/no-named-as-default */
import sha1 from 'sha1';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const { ObjectId } = require('mongodb');

const userQueue = new Queue('userQueue');

export default class UsersController {
  static postNew(req, res) {
    /** checks if req.body exists, if yes, assigns the value of req.body.email
     *  to the variable email, else':' assign null
     */
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) {
      res.status(400).json({ email: 'Missing email' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    const user = dbClient.usersCollection().findOne({ email });

    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }
    const insertionInfo = dbClient.usersCollection()
      .insertOne({ email, password: sha1(password) });
    const userId = insertionInfo.insertedId.toString();

    userQueue.add({ userId });
    res.status(201).json({ email, id: userId });
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (userId) {
      const users = dbClient.db.collection('users');
      const idObject = new ObjectId(userId);
      users.findOne({ _id: idObject }, (err, user) => {
        if (user) {
          res.status(200).json({ id: userId, email: user.email });
        } else {
          res.status(401).json({ error: 'Unauthorized' });
        }
      });
    } else {
      console.log('Hupatikani!');
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}
