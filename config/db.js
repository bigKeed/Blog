const moogoose = require('mongoose')
const dotenv = require('dotenv');
const logger = require('../logger/logger');

dotenv.config();

MONGODB_URI = process.env.MONGODB_URI

function connectToMongoDB(){

console.log('connecting to database..')
moogoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 50000,
}); 

moogoose.connection.on('connected', ()=>{
    logger.info('Connected to database successfully')

})

moogoose.connection.on('error',(err)=>{ 
    logger.info('Error connecting to database')})
};

module.exports = connectToMongoDB;