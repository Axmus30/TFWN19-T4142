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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});