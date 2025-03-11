const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const Trip = require("./models/trip.js");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const methodOverride = require("method-override");
const morgan = require("morgan");

// config
dotenv.config();
const app = express();

// connection to mongoDb
mongoose.connect(process.env.MONGODB_URI);
// logging connection
mongoose.connection.on("connected", () => {
  console.log(`Connectedto MongoDB ${mongoose.connection.name}`);
});
mongoose.connection.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(morgan("dev"));
// static
app.use(express.static("public"));

// index page
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Show form to create a new trip
app.get("/trips/new", (req, res) => {
  res.render("trips/new.ejs");
});

// Create  a new trip
app.post("/trips", upload.single("image"), async (req, res) => {
  console.log("Received data:", req.body);
  req.body.isBookedTicket = !!req.body.isBookedTicket;

  // Convert uploaded image to buffer
  if (req.file) {
    req.body.image = req.file.buffer;
    req.body.imageType = req.file.mimetype;
  }

  await Trip.create(req.body);
  res.redirect("/trips");
});

// Read -  shows all of the trips
app.get("/trips", async (req, res) => {
  const allTrips = await Trip.find({});
  console.log(allTrips);
  res.render("trips/index.ejs", { trips: allTrips });
});

// Read shows a specific trip

app.get("/trips/:tripId", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId);

  res.setHeader("Cache-Control", "no-store"); //cache-prevent

  res.render("trips/show.ejs", { trip: foundTrip });
});

// view for edit

app.get("/trips/:tripId/edit", async (req, res) => {
  const foundTrip = await Trip.findById(req.params.tripId);

  //prepoulate date
  console.log("Original Date: ", foundTrip.date);
  const formattedDate = foundTrip.date.toISOString().slice(0, 10);
  console.log("Formatted date: ", formattedDate);

  res.render("trips/edit.ejs", { trip: foundTrip, tripDate: formattedDate });
});

// upadte
app.put("/trips/:tripId", upload.single("image"), async (req, res) => {
  req.body.isBookedTicket = !!req.body.isBookedTicket;

  if (req.body.date) {
    req.body.date = new Date(req.body.date);
  }

  // Handle image update
  if (req.file) {
    req.body.image = req.file.buffer;
    req.body.imageType = req.file.mimetype;
  }

  updatedTrip = await Trip.findByIdAndUpdate(req.params.tripId, req.body);
  console.log("updated trip: ", updatedTrip);
  res.redirect(`/trips/${req.params.tripId}`);
});

// delete
app.delete("/trips/:tripId", async(req, res) => {
    await Trip.findByIdAndDelete(req.params.tripId);
    res.redirect("/trips");
});


app.listen("3000", () => {
  console.log("listening on port 3000");
});
