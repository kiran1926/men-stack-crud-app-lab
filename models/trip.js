
const mongoose = require("mongoose");

const tripSchema = new mongoose .Schema({
    destination: String,
    date: Date,
    budget: Number,
    isBookedTicket: Boolean,
    duration: Number,
    image: Buffer,
    imageType: String,
});

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;