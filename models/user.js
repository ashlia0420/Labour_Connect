const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique: true,
        required:true
    },
    username:{
        type:String,
        unique: true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    role: { 
        type: String,
        enum: ['worker', 'employer'] 
    },
    job:{
        type: String
    },
    location:{
        type: String
    },
    skills: [String],
    availability: String,
})
const User = mongoose.model('User', UserSchema);
module.exports = User;
