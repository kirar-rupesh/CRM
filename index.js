const initializeDatabase = require("./db/db.connect.js");
const fs = require("fs");
const path = require("path");

const leadRoutes = require("./routes/lead.routes");
const express = require("express");
const app = express();
app.use(express.json());

const {
  seedSalesAgents, seedLeads, seedTags, seedComments } = require("./seedingData");
  

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));




// Wait for DB initialization to finish before seeding.
// This ensures we don't attempt to save before a connection is established
// and avoids surprises from relative file paths when running from another cwd.


(async () => {
  try {
    await initializeDatabase();
    console.log("DB init finished, starting server...");

    
  } catch (err) {
    console.error("Failed to initialize DB or seed data:", err && err.message ? err.message : err);
    // Re-throw or exit depending on desired behavior; here we just log.
  }
})();

async function runSeed() {
  await seedSalesAgents();
  await seedLeads();
  await seedTags();
  await seedComments();
}

// runSeed();


// ✅ Use Lead Routes
app.use("/leads", leadRoutes);





// ====== START SERVER =======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
