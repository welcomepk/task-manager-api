const { Router } = require('express');
const { isValidObjectId } = require('mongoose');
const User = require("../model/user.js");
const Task = require("../model/task.js");
const auth = require("../middlewares/auth.middleware.js");
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account.js');
const router = Router();

// middleware that is specific to this router
// router.use((req, res, next) => {
//     console.log('(middleware from user route) Time: ', Date.now())
//     next()
// })


// signup 
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        const token = await user.generateAuthToken();
        await user.save();
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({ user, token });
    } catch (err) {
        console.log(err.message);
        res.status(400).send(err.message || err)
    }

})

// login
router.post('/users/login', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).send("email and password required");
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

// logout
router.post('/users/logout', auth, async (req, res) => {
    const user = req.user;
    try {
        user.tokens = user.tokens.filter(token => req.token !== token.token)
        await user.save();
        res.send('logout successfully');
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
})

// logout all
router.post('/users/logoutAll', auth, async (req, res) => {
    const user = req.user;
    try {
        user.tokens = [];
        await user.save();
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }

    res.send('logged out from all devices successfully!');
})

// get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (err) {
        res.status(500).send(err);
    }
})

// get profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})

// get user profile/avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) throw new Error('user or avatar not found')
        res.set('Content-Type', 'image/png')
        res.send(user.avatar);
    } catch (err) {
        console.log(err);
        res.status(404).send();
    }

})

// UPLOAD A PROFILE
const multer = require('multer');
const sharp = require('sharp');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(null, 'images/avatars')
        }
        else if (file.originalname.match(/\.(doc|docx|pdf)$/)) cb(null, 'docs')
        else {
            // pass
        }
    },
    filename: (req, file, cb) => {
        const exsc = file.originalname.split('.');
        const extension = "." + exsc[exsc.length - 1];
        cb(null, file.fieldname + extension)
    }
})
const upload = multer({
    limits: {
        fileSize: 3000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|svg)$/)) {
            return cb(new Error('Upload must be of type image'))
        }
        cb(undefined, true) //(err, 👍)
    },
    // storage: storage
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file?.buffer) return res.status(400).send({ error: "plz select img for your avatar" })
        const buffer = await sharp(req.file.buffer).resize({ width: 400, height: 400 }).png().toBuffer()
        req.user.avatar = buffer
        await req.user.save();
        res.send("file uploaded")
    } catch (err) {
        console.log(err);
        res.status(400).send("something went wrong")
    }
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    try {
        await req.user.save();
        res.send('avatar deleted')
    } catch (err) {
        console.log(err);
        res.status(500).send("something went wrong")
    }
})

// // get a user by id
// router.get('/users/:id', async (req, res) => {
//     // let id = "6120216fbb75d313c4d65af4"
//     const _id = req.params.id;
//     try {
//         const user = await User.findById(_id).select({ password: 0 }).exec();
//         if (!user) return res.status(404).send("user not found")
//         res.send(user);
//     } catch (err) {
//         res.status(400).send(err);
//     }
// })

router.patch('/users/me', auth, async (req, res) => {
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation)
        return res.status(400).send({ error: "invalid updates" });
    try {

        // -- we are not using this bellow way to update, since "pre" middlware can't be hit.
        // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true }) 

        let user = req.user;

        updates.forEach(update => user[update] = req.body[update])
        user = await user.save();
        return res.status(200).send(user)

    } catch (err) {
        console.log(err);
        res.status(400).send(err)
    }
})

// delete a user
router.delete('/users/me', auth, async (req, res) => {

    const _id = req.user._id
    try {
        const user = await User.findByIdAndDelete({ _id })
        if (!user) return res.status(404).send("user not found")
        await Task.deleteMany({ owner: _id })
        sendCancellationEmail(user.email, user.name);
        res.send("user deleted successfully")

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

module.exports = router;