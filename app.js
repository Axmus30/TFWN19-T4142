const express = require('express') 
const { engine } = require('express-handlebars'); 
const path = require('path');

const session = require('express-session');
const fs = require('fs');

const port = 3000 

const app = express() 

const Model = require('./model');
const model = new Model();
model.init().catch(console.error);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static('public'))
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));


fs.readFile('stores.json', 'utf-8', (err, jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    model.setup(data).catch(console.error);
  } catch (parseErr) {
    consdle.error('Error parsing JSON:', parseErr);
  }
});


app.get('/', async function(request, response){
  try {
   let stores = await model.getAllStores(); 
   response.render('home', {stores: stores});
    
  } catch (error) {
    console.error(error);
    response.status(500).send('Internal Server Error');
  }
})

app.post('/auth', async function(request, response) {
	let username = request.body.username;
	let password = request.body.password;
	if (username && password) {
    let valid = model.validAuth(username)
    if (valid) {
      request.session.loggedin = true;
      request.session.username = username;
      response.redirect('/admin');
    }else {
      response.send('Incorrect Username and/or Password!');
    }			
    response.end();
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/login', function(request, response){
  response.render('login');
})

app.post('/update', function(request, response){
  if(request.session.loggedin){
    let name = request.body.editName;
    let district = request.body.editDistrict;
    let url = request.body.editUrl;
    let id = request.body.storeId
    model.update(name, url,district, id)
    response.redirect('/admin');
  } else{
    response.redirect('/login');
  }
})

app.get('/admin', async function(request, response){
  if (request.session.loggedin) {
    let stores = await model.getAllStores();
		response.render('admin', {stores: stores})
	} else {
		response.redirect('/login');
	}
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});