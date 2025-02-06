const moogoose = require('mongoose')
const dotenv = require('dotenv');

dotenv.config();

MONGODB_URI = process.env.MONGODB_URI

function connectToMongoDB(){

console.log('connecting to database..')
moogoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 50000,
});

moogoose.connection.on('connected', ()=>{
    console.log('Connected to database successfully')

})

moogoose.connection.on('error',(err)=>{ 
    console.log('Error connecting to database')})
};

module.exports = connectToMongoDB;