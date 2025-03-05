const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/user');
const Job = require('./models/job');
const bcrypt=require('bcrypt')
const methodOverride = require('method-override');


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
        return res.send('Invalid username or password');
    }

    const validUser = await bcrypt.compare(password, u1.password);
    if (validUser) {
        const jobs=await Job.find({})
        res.render(`user/rent`, { u1 ,jobs});  // ✅ Render the page with user data
    } else {
        res.send('Invalid user');
    }
});


    app.get('/login/rent:id', async (req, res) => {
        const id = req.params.id;
        const u1 = await User.findById(id);
        const jobs = await Job.find({});
         // You need to determine which user to fetch (e.g., from session)
        if (!u1) {
            return res.send("User not found");
        }
        res.render('user/rent', { u1, jobs }); // ✅ Now passing u1
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
        res.render('user/rent',{u1,jobs}); // ✅ Redirect without extra data
    });










app.get('/login/:id',async(req,res)=>{
    const {id}=req.params
    const u1=await User.findById(id)
    console.log(u1)
    const jobs=await Job.find({postedBy:u1.username})
    console.log(jobs)
    if(!u1.description){
        res.render('user/setup',{u1})
    }
    else{
        res.render('user/profile',{u1,jobs})
    }

})
app.put('/login/:id',async(req,res)=>{
    // console.log(req.body)
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


app.delete('/login/:id', async (req, res) => {
    try {
        const {id}=req.params
        const u1=await User.findById(id)
        console.log(u1)
        jobs = await Job.findByIdAndDelete(req.params.id);
        res.redirect('/user/profile'); // Reload the profile page after deletion
    } catch (err) {
        res.status(500).send("Error deleting job");
    }
});



app.listen(3000,()=>{
    console.log('listening on port 3000')
})

// app.use(express.urlencoded({extended:true}))
// app.use(methodOverride('_method'))




