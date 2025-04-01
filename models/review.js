const mongoose = require('mongoose');

// Define the schema for the Review model
const reviewSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Job', // Reference to the Job model
        required: true
    },
    workerUsername:{
        type:String,
        required:true,
        trim:true
    },
    reviewerUsername: {
        type:String, // Reference to the User model (who's submitting the review)
        required: true
    },

    rating: {
        type: Number, 
        min: 1, 
        max: 5, 
        required: true
    },
    reviewText: {
        type: String, 
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the Review model
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
