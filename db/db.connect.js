const mongoose = require("mongoose")
require("dotenv").config();;

const MONGO_URI = process.env.MONGODB

const initializeDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("DataBase is Connected");
    } catch (error) {
        console.error("Error connecting Database:", error && error.message ? error.message : error);
        // Rethrow so callers know initialization failed
        throw error;
    }
};

module.exports = initializeDatabase;