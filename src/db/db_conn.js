const mongoose = require('mongoose');
const MONGO_CONN_URL = process.env.MONGO_CONN_KEY;

const connectDB = () => {
    mongoose.connect(MONGO_CONN_URL)
        .then((res) => console.log(`db conn : ${res.connection.host}:${res.connection.port} (${res.connection.name})`))
        .catch(err => console.log(err))
}
const disconnectDb = () => {
    mongoose.connection.close();
}

module.exports = {
    connectDB,
    disconnectDb
}