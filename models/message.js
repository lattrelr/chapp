const { Schema, model } = require('mongoose')

const PostSchema = new Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
    attachment: {
        type: String,
        required: false,
    },
});

const Message = model('message', PostSchema);

module.exports = Message
