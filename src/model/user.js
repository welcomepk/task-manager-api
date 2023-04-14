const mongoose = require("mongoose");
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Task = require('./task.js');
const { Schema, model } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error("Invalid email address")
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 6
    },
    age: {
        type: Number,
        min: 0,
        default: 0
    },
    avatar: Buffer,
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]
}, { timestamps: true })

// ---------- 👋 IMP NOTE 👋
// this actually creates virtual "tasks" property, so that we can use
// use it like "(user.tasks)" 😃
// it will not store in db, its just for relationship among user and tasks
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password
    delete user.tokens
    delete user.avatar
    return user
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.statics.findByCredentials = async function (email, password) {
    const user = await User.findOne({ email });
    if (!user) return Promise.reject("Unabble to login")
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return Promise.reject("Unable to login");
    return user;
}

// hash the plain text password before saving
userSchema.pre('save', function (next) {
    var user = this;
    console.log("in upadate middleware");
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    console.log("hashing the password");

    // hash the password using new salt
    bcrypt.hash(user.password, 8, function (err, hash) {
        if (err) {
            console.log(err);
            return next();
        }
        // override the cleartext password with the hashed one
        user.password = hash;
        next();
    });
});

// delete all tasks before deleting the user
userSchema.pre('remove', async function (next) {
    console.log("In REMOVE MIDDLEWARW");
    const user = this;
    await Task.deleteMany({ owner: user._id })
    next();
})


const User = model('User', userSchema);

module.exports = User