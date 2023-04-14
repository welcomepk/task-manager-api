const mongoose = require('mongoose');
const MONGO_CONN_URL = process.env.MONGO_CONN_KEY || "mongodb://127.0.0.1:27017/task-manager-api"
mongoose.connect(MONGO_CONN_URL)
    .then((res) => console.log(`db conn : ${res.connection.host}:${res.connection.port} (${res.connection.name})`))
    .catch(err => console.log(err))

