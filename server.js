const express = require("express");
const fs = require('fs').promises;


const path = require('path');
const app = express();
const PORT = 8080;

require("dotenv").config();
const SECRET_KEY = process.env.TOKEN;


const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


//Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));;



// Path to the users JSON file
const usersFilePath = path.resolve(__dirname, 'users.json');

// Function to read users data from JSON file
async function readUsersData() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users.json:', error);
    throw error;
  }
}

// Function to write users data to JSON file
async function writeUsersData(data) {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to users.json:', error);
    throw error;
  }
}


// Routes
app.get('/', (req, res) => {
  res.redirect('/LOGIN');
});

app.get('/LOGIN', (req, res) => {
  res.render('login');
});

app.post('/LOGIN', async (req, res) => {
    const { name, password } = req.body;
  
    try {
      const usersData = await readUsersData();
      const user = usersData.find(user => user.username === name);
  
      if (!user) {
        return res.render('fail'); // Render fail.ejs
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.render('fail'); // Render fail.ejs
      }
  
      const token = jwt.sign({ id: user.username }, SECRET_KEY, { expiresIn: '1h' });
      console.log(`JWT Token: ${token}`);
      res.render('start'); // Render start.ejs
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  app.get('/REGISTER', (req, res) => {
    res.render('register'); // Render register.ejs
  });
  
  app.post('/REGISTER', async (req, res) => {
    const { name, password } = req.body;
  
    try {
      const usersData = await readUsersData();
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = { username: name, password: hashedPassword };
      usersData.push(newUser);
  
      await writeUsersData(usersData);
      res.redirect('/LOGIN');
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).send('Internal Server Error');
    }
  });

app.listen(PORT, () => {
    console.log(`Server active on port: http://localhost:${PORT}/`);
});