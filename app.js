const ticket = require('./routes/ticket');
const author = require('./routes/author')
const auth = require('./routes/auth')
const project = require('./routes/project')
const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const cors = require('cors');


const port = process.env.PORT || '8080';
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

const urlDB =  process.env.NODE_ENV === 'dev' ? 'mongodb://localhost:27017/arz' :'mongodb+srv://tommStark:LCIZvTNIPkJlM3BN@cluster0.5rpp7.mongodb.net/arz-ticket'

// DB connection
main()
.then (console.log('DB connected... '))
.catch(err => console.log(err));
async function main() {
    await mongoose.connect(urlDB);
};

const app = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
app.use(cors({
    origin: '*'
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api/auth',auth);
app.use('/api/ticket',ticket);
app.use('/api/author',author);
app.use('/api/project',project);


// const port = config.get('PORT') || 8080;

app.listen(port, () => { console.log ("API OK, running:", port)});