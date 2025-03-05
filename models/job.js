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

})
const Job = mongoose.model('Job', JobSchema);
module.exports = Job;