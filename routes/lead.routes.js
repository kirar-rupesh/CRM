const express = require("express");
const mongoose = require("mongoose");
const Leads = require("../models/lead.model");
const SalesAgents = require("../models/salesAgent.model");

const router = express.Router();

/////////////////////////////////////////
// GET /leads  (With Optional Filtering)
/////////////////////////////////////////

router.get("/", async (req, res) => {
  try {
    const { salesAgent, status, tags, source } = req.query;

    const filter = {};

    // ✅ Validate salesAgent (ObjectId)
    if (salesAgent) {
      if (!mongoose.Types.ObjectId.isValid(salesAgent)) {
        return res.status(400).json({
          error: "Invalid input: 'salesAgent' must be a valid ObjectId."
        });
      }
      filter.salesAgent = salesAgent;
    }

    // ✅ Validate status
    const allowedStatuses = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Closed"
    ];

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error:
            "Invalid input: 'status' must be one of ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed']."
        });
      }
      filter.status = status;
    }

    // ✅ Validate source
    const allowedSources = [
      "Website",
      "Referral",
      "Cold Call",
      "Advertisement",
      "Email",
      "Other"
    ];

    if (source) {
      if (!allowedSources.includes(source)) {
        return res.status(400).json({
          error:
            "Invalid input: 'source' must match predefined values."
        });
      }
      filter.source = source;
    }

    // ✅ Tags filter (supports single tag)
    if (tags) {
      filter.tags = tags;
    }

    // 🔥 Fetch leads with populated salesAgent
    const leads = await Leads.find(filter)
      .populate("salesAgent", "name")
      .select("-updatedAt -__v");

    // Format response
    const formattedLeads = leads.map((lead) => ({
      id: lead._id,
      name: lead.name,
      source: lead.source,
      salesAgent: {
        id: lead.salesAgent?._id,
        name: lead.salesAgent?.name
      },
      status: lead.status,
      tags: lead.tags,
      timeToClose: lead.timeToClose,
      priority: lead.priority,
      createdAt: lead.createdAt
    }));

    return res.status(200).json(formattedLeads);

  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
      message: error.message
    });
  }
});

module.exports = router;
