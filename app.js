const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const todos = require('./api/routes/todos');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(cors());
app.use('/api/', todos)

app.listen(3000, () => console.log('All good, we are on port 3000'));