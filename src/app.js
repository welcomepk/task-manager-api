const express = require('express');
require('./db/db_conn').connectDB();
const userRouter = require('./routes/userRouter.js');
const taskRouter = require("./routes/taskRouter.js");

const app = express();
app.use(express.json())

//         📓  Note about middlware  📓
// Wothout middleware: new request => run router handler
// With middleware: new request => do something => run router handler
// 
// app.use((req, res, next) => {
//     res.status(503).send('service is temp unavailable... 🥲')
// })
//


// routes

app.get('', (req, res) => {
    res.send('💁 Welcome to my Task-manager-app 📓')
})
app.use(userRouter); // user routes
app.use(taskRouter); // task routes

module.exports = app;








/* ---------------------
    file uploading      |
/ ---------------------*/

/*
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '.jpg')
    }
})

const upload = multer({
    dest: 'docs',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(pdf|xlsx)$/)) {
            return cb(new Error('File must be of type pdf'))
        }
        cb(undefined, true)
    },
    storage: storage
})

*/
