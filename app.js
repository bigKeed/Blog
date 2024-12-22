const express = require('express');
const session = require("express-session");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const connectToMongoDB = require('./config/db');
const methodOverride = require('method-override');


const app = express();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', 'views' );

app.use(session({
    secret: process.env.JWT_SECRET, 
    resave: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    saveUninitialized: true,
    cookie: { secure: true }
})); 

dotenv.config();
connectToMongoDB();

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);


// Handle 404 Not Found
// app.use((req, res, next) => {
//     res.status(404).json({ message: 'This Route is Not Found' });
// });

//Global Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;