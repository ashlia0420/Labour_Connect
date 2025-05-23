const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/user');
const Job = require('./models/job');
const Application = require('./models/application');
const Review = require('./models/review');
const bcrypt=require('bcrypt')
const methodOverride = require('method-override');
const session = require('express-session');

app.use(session({
    secret: 'your_secret_key',  // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }   // Set to `true` if using HTTPS
}));
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));


mongoose.connect('mongodb://127.0.0.1:27017/LabConnect')
.then(()=>{
    console.log('connection established for mongo')
})
.catch((err)=>{
    console.log(err)
})




app.set('views' , path.join(__dirname,'views'))
app.set('view engine','ejs')

app.get('/labour',(req,res)=>res.render('labour'))
app.get('/about',(req,res)=>res.render('about'))
app.get('/contact',(req,res)=> res.render('contact')  )

app.get('/create',(req,res)=>res.render('create')   )   
app.post('/create',async(req,res)=>{
    const { email, fullname, username, password } = req.body;
    if (!password) {
        return res.status(400).send("Password is required");
    }
    const hash=await bcrypt.hash(password,12)
    // res.send(hash)
    const user=new User({
        email,
        fullname,
        username,
        password:hash
    })
    await user.save()
    res.redirect('login')
})
app.get('/login',(req,res)=> res.render('login')   )
app.post('/login/rent', async (req, res) => {
    const { username, password } = req.body;
    const u1 = await User.findOne({ username });

    if (!u1) {
        return res.send('Invalid email or password');
    }

    const validUser = await bcrypt.compare(password, u1.password);
    if (validUser) {
        // const jobs=await Job.find({})
        // res.render(`user/rent`, { u1 ,jobs}); 
        //  // ✅ Render the page with user data
        req.session.user = u1;
        res.redirect('rent')
    } else {
        res.send('Invalid user');
    }
});
app.get('/login/rent', async (req, res) => {
    // res.send('hii')
    if (!req.session.user) {

        return res.redirect('/login'); // Redirect if not logged in
    }

    const jobs = await Job.find({});
    res.render('user/rent', { u1: req.session.user, jobs });
});


    app.get('/login/rent/:id', async (req, res) => {
        const id = req.params.id;
        const u1 = await User.findById(id);
        const jobs = await Job.find({});
        
        if (!u1) {
            return res.send("User not found");
        }
        res.render('user/rent', { u1, jobs }); 
    });
    


    app.get('/login/newjob/:id', async (req, res) => {
        const { id } = req.params;
        const u1 = await User.findById(id);
        if (!u1) {
            return res.status(404).send("User not found");
        }
        res.render('user/new', { u1 });
    });
    

    app.post('/login/rent/:id', async (req, res) => {
        const { id } = req.params;
        const u1 = await User.findById(id);
        const jobs = await Job.find({});
        if (!u1) {
            return res.status(404).send("User not found");
        }
        const job = new Job({ ...req.body });
        await job.save();
        res.render('user/rent',{u1,jobs});
    });


app.get('/login/:id',async(req,res)=>{
    const {id}=req.params
    const u1=await User.findById(id)
    const reviews=await Review.find({workerUsername:u1.username})
    // console.log(u1)
    const jobs=await Job.find({postedBy:u1.username})
    // console.log(jobs)
    if(!u1.description){
        res.render('user/setup',{u1})
    }
    else if(u1.role==='worker'){
        
        res.render('user/worker',{u1,jobs,reviews})
    }
    else {
        res.render('user/profile',{u1,jobs,reviews})
    }

})
app.put('/login/:id',async(req,res)=>{
    // 
     const {id}=req.params;
     const u1=await User.findByIdAndUpdate(id,req.body,{runValidators:true,new:true})
     res.redirect(`/login/${u1._id}`)


})


// app.delete('/login/:id',async(req,res)=>{

//     const {id}=req.params
//     const u1=await User.findById(id)
//     console.log(u1)
//     const jobs=await Job.find({postedBy:u1.username})
//     console.log(jobs)
//     const jobs= await Job.findByIdAndDelete(req.params.id)
//     const campgrounds=await campground.find({})
//     res.redirect('/user/profile');
//     // res.render('campground/show',{campgrounds})
// })
app.get('/login/:id/jobs/:jobId',async(req,res)=>{
    const {id,jobId}=req.params
    const u1=await User.findById(id)
    const job=await Job.findById(jobId)
    res.render('user/job',{u1,job})
})

app.delete('/login/:id/jobs/:jobId', async (req, res) => {
    const { id, jobId } = req.params;
    

    const u1 = await User.findById(id);
    if (!u1) {
        return res.status(404).send("User not found");
    }

 
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
        return res.status(404).send("Job not found");
    }
    res.redirect(`/login/${id}`);
});


    app.get('/login/rent/viewjobs/:jobid', async (req, res) => {
        const { jobid } = req.params;
      
        const job = await Job.findById(jobid);
        console.log(job)
     res.render('user/viewjob', { job });
    
    });
    app.post('/login/rent/viewjobs/:jobid', async (req, res) => {
        
        const { jobid } = req.params;
        const job = await Job.findById(jobid);
        // const { fullname, email, location, skills, experience, availability, salary, languages } = req.body;
        const application = new Application({...req.body, jobid: job._id});
        await application.save();
        res.render('user/applsucc', { job });
    });

    app.get('/login/rent/viewjobs/apply/:jobid', async (req, res) => {
        const { jobid } = req.params;
        // console.log('set')
        const job = await Job.findById(jobid);
        res.render('user/applsucc', { job });
    });
    app.get('/rent/:id/jobs/:applid', async (req, res) => {
        const { id, applid } = req.params;
        const   u1 = await User.findById(id);   
        const application = await Application.findById(applid);
        const job = await Job.findById(application.jobid);
        res.render('user/pendingapplied', {application,job,u1});
     });
     app.put('/rent/:id/jobs/:applid', async (req, res) => {
        const { id, applid } = req.params;
        const u1 = await User.findById(id);
        const application = await Application.findByIdAndUpdate(applid, { status: req.body.status }, { new: true });
        const jobs = await Job.find({filled:false});
        res.render('user/rent', { u1, jobs });
        //    res.redirect('user/rent');
    });

    app.get('/login/:id/jobs/apply/:jobId', async (req, res) => {
        const { id, jobId } = req.params;
        const u1 = await User.findById(id);
        const job = await Job.findById(jobId);
        const applicants=await Application.find({jobid:jobId})
        res.render('user/viewapplicants', { u1, job,applicants });
    }

    );
    app.get('/login/:id/application/:Applid', async (req, res) => {
        const { id,Applid } = req.params;
        const application = await Application.findById(Applid);
        const u1=await User.findOne({username:application.username})
        const reviews=await Review.find({workerUsername:u1.username})
        const jobs=await Job.find({postedBy:u1.username});
        res.render('user/worker',{u1,jobs,reviews})
        // const u2=await User.findById(id)
        // const reviews=await Review.find({workerUsername:u1.username})
        // res.render('user/selectapplicant', { application,u1,u2 });
    });
    app.put('/login/:id/application/:Applid', async (req, res) => {
        const { id,Applid } = req.params;
        const u1=await User.findById(id)
        const applicant = await Application.findByIdAndUpdate(Applid, { status: req.body.status }, { new: true });
        const jobs=await Job.find({postedBy:u1.username})
        if (applicant.status === 'accepted') {
            const job = await Job.findById(applicant.jobid);
            job.filled = true;
            await job.save();
        }
        res.render('user/profile', { u1,jobs });
    });
    app.get('/login/myjobs/:id', async (req, res) => {
        const { id } = req.params;
        const u1 = await User.findById(id);
    
        const pending = await Application.find({ username: u1.username, status: 'pending' });
        const accepted = await Application.find({ username: u1.username, status: 'accepted' });
    
        // Fetch job details for pending applications
        const pendingJobs = await Promise.all(
            pending.map(async (app) => {
                const job = await Job.findById(app.jobid);
                return { ...app.toObject(), jobTitle: job ? job.title : "Unknown Job" };
            })
        );
    
        // Fetch job details for accepted applications
        const acceptedJobs = await Promise.all(
            accepted.map(async (app) => {
                const job = await Job.findById(app.jobid);
                return { ...app.toObject(), jobTitle: job ? job.title : "Unknown Job" };
            })
        );
    
        res.render('user/myjobs', { u1, pending: pendingJobs, accepted: acceptedJobs });
    });
    app.get('/login/pendingrequest/jobs/:applid', async (req, res) => {
        const { applid } = req.params;
        const application = await Application.findById(applid);
        const job = await Job.findById(application.jobid);
        res.render('user/pendingapplied', {application,job});
     });
     app.get('/profile/:id/working/:jobid', async (req, res) => {
        const { id, jobid } = req.params;
        const u1 = await User.findById(id);
        const job = await Job.findById(jobid);
        const applications=await Application.find({jobid:jobid,status:{ $in: ['accepted', 'finished','payed'] } });
        res.render('user/working',{u1,job,applications})
     });

    //  app.put('/update-payment/:applid', async (req, res) => {
    //     const { applid } = req.params;
    
    //     try {
    //         const application = await Application.findByIdAndUpdate(
    //             applid,
    //             { status: 'payed' },
    //             { new: true }
    //         );
    
    //         if (!application) {
    //             return res.status(404).json({ error: "Application not found" });
    //         }
    
    //         if (application.status === 'payed') {
    //             return res.render('user/reviewjob', { application });
    //         }
    
    //         const job = await Job.findById(application.jobid);
    //         if (!job) {
    //             return res.status(404).json({ error: "Job not found" });
    //         }
    
    //         // Send a success response if everything is fine
    //         res.json({ message: "Payment updated successfully", application, job });
    
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ error: "Internal server error" });
    //     }
    // });
    app.put('/update-payment/:applid', async (req, res) => {
        const { applid } = req.params;
    
        try {
            const application = await Application.findByIdAndUpdate(
                applid,
                { status: 'payed' },
                { new: true }
            );
    
            if (!application) {
                return res.status(404).json({ error: "Application not found" });
            }
    
            const job = await Job.findById(application.jobid);
            // if (!job) {
            //     return res.status(404).json({ error: "Job not found" });
            // }
    
            // ✅ Send a redirect URL in JSON response
            res.json({ 
                success: true, 
                message: "Payment updated successfully", 
                redirectUrl: `/review-job/${job._id}/of/${application._id}`
            });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
    

    
        //     res.json({ success: true, message: "Payment successful!", redirectUrl: `/review-job/${job._id}` });
        // } catch (error) {
        //     res.status(500).json({ error: "Server error" });
        // }
    
    
    
    app.get('/review-job/:jobid/of/:applid', async (req, res) => {
        const { jobid,applid } = req.params;
    
        try {
            const job = await Job.findById(jobid);
            const application = await Application.findById(applid);
            if (!job) {
                return res.status(404).send("Job not found");
            }
            if (!application) {
                return res.status(404).send("application not found");
            }
    
            res.render('user/reviewjob', { job,application }); // Ensure 'reviewjob.ejs' exists
        } catch (error) {
            res.status(500).send("Server error");
        }
    });

// POST route to handle the review submission
app.post('/submit-review/:jobId', async (req, res) => {
    try {
        // Extract data from the form submission
        const { review, rating, workerUsername, reviewerUsername } = req.body;
        let jobId = req.params.jobId;

        // Validate the data
        if (!review || !rating || !workerUsername || !reviewerUsername) {
            return res.status(400).send('All fields are required.');
        }

        // Create a new review document
        const newReview = new Review({
            jobId,
            workerUsername,
            reviewerUsername,
            reviewText: review,
            rating
        });

        // Save the review to the database
        await newReview.save();
        let jobid=jobId;
        // Find the application associated with the job and worker
        const application = await Application.findOne({
            jobid,
            username: workerUsername // Assuming workerUsername identifies the application
        });

        if (!application) {
            return res.status(404).send('Application not found.');
        }

        // Update the application status to 'reviewed'
        application.status = 'reviewed';
        await application.save();
        const user = await User.findOne({ username: reviewerUsername }); // Assuming reviewerUsername refers to the logged-in user
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Redirect to the profile page of the reviewer
        res.redirect(`/login/${user._id}`);
      
        // Or redirect: res.redirect('/job-details/' + jobId);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error submitting review or updating application status.');
    }
});

     app.get('/chating/:id',async(req,res)=>{
        const {id}=req.params
        const u1=await User.findById(id)
        const users=await User.find({})
        res.render('user/renting',{users,u1})   
     })
    //     app.get("/chat/:userId",async (req, res) => {
    //     const userId = req.params.userId;
    //     const u1= await User.findById(userId);
    //     res.render("user/chat", {u1});
        
    //      // Render chat.ejs or chat.html
    // });
    app.get("/chat/:id/:userId", async (req, res) => {
        if (!req.session.user) {
            return res.redirect('/login'); // Ensure user is logged in
        }
    
        const { id,userId } = req.params;
        const sender = await User.findById(id); // The logged-in user
        const receiver = await User.findById(userId); // The user being chatted with
        if (!receiver) {
            return res.status(404).send("User not found");
        }
    
        res.render("user/chat", { sender, receiver });
    });
    
    
app.use((req,res)=>{
    res.status(404).send("NOT FOUND")
})
app.listen(3000,()=>{
    console.log('listening on port 3000')
})

// app.use(express.urlencoded({extended:true}))
// app.use(methodOverride('_method'))




