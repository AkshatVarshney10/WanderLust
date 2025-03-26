if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

//to start with
const express = require("express");
const app = express();
const port = 8080;

//when we make a views folder and want to render an ejs file
const path = require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

//whenever we use req.params so to get the correct data we will write this
app.use(express.urlencoded({extended:true}));

//to use put and delete requests in form we use method override so after installing it we can start it using the following command
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

//to require and use ejs-mate
const ejsMate = require("ejs-mate");
app.engine("ejs",ejsMate);

//to apply styling
app.use(express.static(path.join(__dirname,"/public")));

const Listing = require("./models/listing.js")
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js")
const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js")
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js")
const dburl = process.env.ATLASDB_URL;


const mongoose = require("mongoose");
const review = require("./models/review.js");
main()
.then(()=>{console.log("connetion successful")})
.catch(err => console.log(err));
async function main() {
    await mongoose.connect(dburl);
}

// app.get("/",(req,res)=>{
//     res.send("working");
// })


const store = MongoStore.create({
    mongoUrl: dburl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*60*60,
})

store.on("error",()=>{
    console.log("error in mongo session store ", error);
})

const sessionOptions = {
    store:store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000),
        maxAge:  (7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }
}




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser",async (req,res)=>{
//     let fakeUser = new User({
//         email:"abc@gmail.com",
//         username:"abc"
//     })
//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// app.get("/testListing",async (req,res)=>{
//     let sampleList = new Listing({
//         title:"my new villa",
//         description:"by the beach",
//         price:12000,
//         location:"calangute, goa",
//         country:"india"
//     })
//     await sampleList.save();
//     console.log(sampleList);
//     res.send(sampleList);
// })

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500, message="Something went wrong"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{message});
});

app.listen(port,()=>{
    console.log(`listening on port ${port}`);
})