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

// Route to add a task
app.post('/task/add', async function(req, res) {
  const task = req.body.task;

  try {
    // Use the new 'rPush' method with 'await'
    await client.rPush('tasks', task);
    console.log('Task Added...');
    res.redirect('/');
  } catch (err) {
    console.error('Error adding task:', err);
    res.status(500).send('Error adding task');
  }
});

app.post('/task/delete', async function(req, res) {
  const tasksToDel = req.body.tasks || [];

  try {
    // Retrieve all tasks
    const tasks = await client.lRange('tasks', 0, -1);
    console.log('Current tasks:', tasks); // Debugging: Print current tasks

    // If tasksToDel is not an array, convert it to one
    const tasksArray = Array.isArray(tasksToDel) ? tasksToDel : [tasksToDel];

    // Remove each task in tasksToDel
    for (const task of tasksArray) {
      // Remove all occurrences of the task from the list
      const removalResult = await client.lRem('tasks', 0, task);
      console.log(`Removing task: "${task}", Result: ${removalResult}`); // Debugging: Print removal result
    }

    console.log('Tasks Deleted...');
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting tasks:', err);
    res.status(500).send('Error deleting tasks');
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server Started On Port 3000');
});

module.exports = app;