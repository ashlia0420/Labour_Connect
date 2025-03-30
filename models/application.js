const mongoose = require('mongoose');

const applicationShema =new mongoose.Schema({
    jobid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job",
        required:true
    },
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    location: {
        type: String,
        required: true
    },
    skills: {
        type: [String], // Array of skills
        required: true
    },
    experience: {
        type: Number,
        required: true,
        min: 0
    },
    availability: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true,
        min: 0
    },
    languages: {
        type: [String], // Array of languages
        default: []
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected','finished'],
        default: 'pending'
    }
})

const Application=mongoose.model('Application',applicationShema)
module.exports=Application;