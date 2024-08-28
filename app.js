const redis = require('redis');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

// Create a new Redis client
const client = redis.createClient();

client.on('connect', () => {
  console.log('Redis Server Connected...');
});

// Connect to the Redis server
client.connect().catch(console.error);

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Route to get tasks
app.get('/', async function (req, res) {
  const title = 'Task List';

  try {
    // Use the new 'lRange' method with 'await'
    const tasks = await client.lRange('tasks', 0, -1);
    res.render('index', {
      title: title,
      tasks: tasks,
    });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).send('Error fetching tasks');
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server Started On Port 3000');
});

module.exports = app;