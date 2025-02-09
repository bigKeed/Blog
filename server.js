const logger = require('./logger/logger');
const app = require('./app');


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});    