const express = require('express');
const session = require("express-session");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./logger/logger');
const MongoStore = require('connect-mongo');
const httpLoggerMiddleware = require('./logger/httpLogger')
const { rateLimit } = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const connectToMongoDB = require('./config/db');
const methodOverride = require('method-override');
 
 
const app = express();
dotenv.config();
connectToMongoDB();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', 'views' );

// Log requests
app.use(httpLoggerMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

//Rate Limiting 
const limiter = rateLimit({
	windowMs: 5 * 60 * 1000, 
	limit: 10, 
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
})

app.use(limiter);


app.use(session({
    secret: process.env.JWT_SECRET, 
    resave: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    saveUninitialized: true,
    cookie: { secure: true,
        maxAge: 3600000
     }
})); 




// Handle 404 Not Found
app.use((req, res, next) => {
    res.status(404).json({ message: 'This Route is Not Found' });
}); 

//Global Error Handling
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;