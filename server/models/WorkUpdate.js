// server/models/WorkUpdate.js
import mongoose from 'mongoose';

const workUpdateSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Task'
    },
    user: { // The employee who submitted the update
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    updateText: {
        type: String,
        required: [true, 'Please provide an update description.']
    },
    percentageComplete: {
        type: Number,
        required: [true, 'Please provide the completion percentage.'],
        min: 0,
        max: 100
    },
    intensity: {
        type: String,
        required: [true, 'Please specify the work intensity.'],
        enum: ['Low', 'Medium', 'High']
    },
    managerRemark: {
        type: String,
        default: ''
    },
    isAcknowledged: { // Employee acknowledges the manager's remark
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Tracks when the update was created
});

const WorkUpdate = mongoose.model('WorkUpdate', workUpdateSchema);
export default WorkUpdate;