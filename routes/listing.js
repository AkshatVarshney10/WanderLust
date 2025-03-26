const express = require("express");
const router = express.Router();

const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({storage})

const Listing = require("../models/listing.js")
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const {isLogin, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");

router.route("/") 
.get(wrapAsync(listingController.index))
.post(isLogin,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));


//to add a new 
router.get("/new",isLogin,listingController.renderNewForm);


router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLogin,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
.delete(isLogin,isOwner, wrapAsync(listingController.destroyListing));

//to edit a listing
router.get("/:id/edit",isLogin,isOwner,wrapAsync(listingController.renderEditForm));

module.exports = router;