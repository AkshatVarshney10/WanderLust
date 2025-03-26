const express = require("express");
const router = express.Router({mergeParams:true});

const Listing = require("../models/listing.js")
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const {validateReview, isLogin, isReviewAuthor} = require("../middleware.js");

const listingController = require("../controllers/reviews.js");
//reviews
//add a new review
router.post("/",isLogin ,validateReview,wrapAsync(listingController.createReview));

//delete a review
router.delete("/:reviewId",isLogin, isReviewAuthor,wrapAsync(listingController.destroyReview));

module.exports = router;