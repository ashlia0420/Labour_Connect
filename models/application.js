const mongoose = require('mongoose');

const applicationShema =new mongoose.Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job",
        required:true
    },
    postedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    applicants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
})

const Application=mongoose.model('Application',applicationShema)
module.exports=Application;