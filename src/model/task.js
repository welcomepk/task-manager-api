const { Schema, model } = require("mongoose");

const taskSchema = new Schema({
    description: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true })

module.exports = model('Task', taskSchema);