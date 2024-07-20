const { Router } = require("express");
const Task = require("../model/task.js");
const auth = require("../middlewares/auth.middleware.js");
const { isValidObjectId } = require('mongoose')
const router = Router();

// this middleware spacific to this entire router
// router.use((req, res, next) => {
//     console.log('(middleware from task route) Time: ', Date.now())
//     next();
// })


// study this carefully 😅
// get all tasks
// GET /tasks?completed=true||false
// GET /tasks?limit=4&skip=0
// GET /tasks?sortBy=createdAt:desc || /tasks?sortBy=createdAt:asc

router.get('/all-tasks', async (req, res) => {
    try {
        const tasks = await Task.find({})
        return res.send(tasks)
    } catch (error) {
        res.status(500).send('something went wrong')
    }
})
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed === 'true' || req.query.completed === 'false') {
        match['completed'] = req.query.completed
    }
    if (req.query.sortBy) {
        const [key, value] = req.query.sortBy.split(':')
        sort[key] = value === 'desc' ? -1 : 1;
        console.log(key, value);
    }
    console.log(match);
    try {
        await req.user.populate({
            path: 'tasks',
            match, // matching query (completed tasks or not)
            options: {
                limit: req.query.limit,     // for pagination
                skip: req.query.skip,
                sort: sort
            },

        });
        const tasks = req.user.tasks;
        res.send(tasks);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

// get a task
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {

        const task = await Task.findOne({ _id, owner: req.user.id })
        task ? res.send(task) : res.status(404).send("task not found")

    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
})


// create a task
router.post('/tasks', auth, async (req, res) => {
    try {
        const task = await Task.create({ ...req.body, owner: req.user._id });
        res.status(201).send(task);
    } catch (err) {
        res.status(400).send(err);
    }
})

// update the task
router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }
    try {

        const task = await Task.findOne({ _id, owner: req.user._id });

        if (!task) return res.status(404).send("task not found");

        updates.forEach(update => task[update] = req.body[update])
        console.log(task);
        await task.save();
        res.send(task);

    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
})

// delete a task
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    if (!isValidObjectId(_id)) {
        return res.status(404).send("task not found");
    }
    try {
        await Task.findOneAndDelete({ _id, owner: req.user._id })
            ? res.status(200).send("task deleted successfully")
            : res.status(404).send("task not found")

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

module.exports = router