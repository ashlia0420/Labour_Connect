const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  postedBy: {
    type: String,
  },
  title: {
    type: String,
    required: true
  },
    description: {
        type: String
    },
    salary: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },  
    date:{
        type: Date,
        default: Date.now
    },
    postedOn:{
        type: Date,
        default: Date.now
    },
    filled:{
        type:Boolean,
        default:false
    }
        
})
const Job = mongoose.model('Job', JobSchema);
module.exports = Job;