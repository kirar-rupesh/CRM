const express = require("express");
const router = express.Router();
const Lead = require("../models/lead.model");

/////////////////////////////////////////
// GET /report/last-week
/////////////////////////////////////////

router.get("/last-week", async (req, res) => {
  try {

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch closed leads within last 7 days
    const leads = await Lead.find({
      status: "Closed",
      closedAt: { $gte: sevenDaysAgo }
    }).populate("salesAgent", "name");

    const response = leads.map(lead => ({
      id: lead._id,
      name: lead.name,
      salesAgent: lead.salesAgent ? lead.salesAgent.name : null,
      closedAt: lead.closedAt
    }));

    return res.status(200).json(response);

  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
      message: error.message
    });
  }
});



/////////////////////////////////////////
// GET /report/pipeline
/////////////////////////////////////////

router.get("/pipeline", async (req, res) => {
  try {

    // Count leads not closed
    const totalLeads = await Lead.countDocuments({
      status: { $ne: "Closed" }
    });

    return res.status(200).json({
      totalLeadsInPipeline: totalLeads
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
      message: error.message
    });
  }
});



module.exports = router;