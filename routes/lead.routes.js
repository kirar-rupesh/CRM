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




    // ✅ Validate status
const allowedStatuses = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Closed"
];


// ✅ Validate source
const allowedSources = [
  "Website",
  "Referral",
  "Cold Call",
  "Advertisement",
  "Email",
  "Other"
];





    // ✅ Validate salesAgent (ObjectId)
    if (salesAgent) {
      if (!mongoose.Types.ObjectId.isValid(salesAgent)) {
        return res.status(400).json({
          error: "Invalid input: 'salesAgent' must be a valid ObjectId."
        });
      }
      filter.salesAgent = salesAgent;
    }


    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error:
            "Invalid input: 'status' must be one of ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed']."
        });
      }
      filter.status = status;
    }


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



/////////////////////////////////////////
// POST /leads  (Create New Lead)
/////////////////////////////////////////

router.post("/", async (req, res) => {
  try {
    const {
      name,
      source,
      salesAgent,
      status,
      tags,
      timeToClose,
      priority
    } = req.body;

    // ✅ Allowed Values
    const allowedStatuses = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Closed"
    ];

    const allowedSources = [
      "Website",
      "Referral",
      "Cold Call",
      "Advertisement",
      "Email",
      "Other"
    ];

    const allowedPriorities = ["High", "Medium", "Low"];

    // ✅ Validations

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        error: "Invalid input: 'name' is required and must be a string."
      });
    }

    if (!source || !allowedSources.includes(source)) {
      return res.status(400).json({
        error: "Invalid input: 'source' must match predefined values."
      });
    }

    if (!salesAgent || !mongoose.Types.ObjectId.isValid(salesAgent)) {
      return res.status(400).json({
        error: "Invalid input: 'salesAgent' must be a valid ObjectId."
      });
    }

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error:
          "Invalid input: 'status' must be one of ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed']."
      });
    }

    if (
      timeToClose === undefined ||
      typeof timeToClose !== "number" ||
      timeToClose <= 0
    ) {
      return res.status(400).json({
        error: "Invalid input: 'timeToClose' must be a positive number."
      });
    }

    if (!priority || !allowedPriorities.includes(priority)) {
      return res.status(400).json({
        error: "Invalid input: 'priority' must be one of ['High', 'Medium', 'Low']."
      });
    }

    // ✅ Check if SalesAgent Exists
    const existingAgent = await SalesAgents.findById(salesAgent);

    if (!existingAgent) {
      return res.status(404).json({
        error: `Sales agent with ID '${salesAgent}' not found.`
      });
    }

    // ✅ Create Lead
    const newLead = new Leads({
      name,
      source,
      salesAgent,
      status,
      tags: tags || [],
      timeToClose,
      priority
    });

    await newLead.save();

    // Populate salesAgent for response
    await newLead.populate("salesAgent", "name");

    return res.status(201).json({
      id: newLead._id,
      name: newLead.name,
      source: newLead.source,
      salesAgent: {
        id: newLead.salesAgent._id,
        name: newLead.salesAgent.name
      },
      status: newLead.status,
      tags: newLead.tags,
      timeToClose: newLead.timeToClose,
      priority: newLead.priority,
      createdAt: newLead.createdAt,
      updatedAt: newLead.updatedAt
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
      message: error.message
    });
  }
});




/////////////////////////////////////////
// PUT /leads/:id  (Update Lead)
/////////////////////////////////////////

router.put("/:id", async (req, res) => {
  try {
    const leadId = req.params.id;

    // ✅ Validate Lead ID
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({
        error: "Invalid input: Lead ID must be a valid ObjectId."
      });
    }

    const {
      name,
      source,
      salesAgent,
      status,
      tags,
      timeToClose,
      priority
    } = req.body;

    // ✅ Allowed values
    const allowedStatuses = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Closed"
    ];

    const allowedSources = [
      "Website",
      "Referral",
      "Cold Call",
      "Advertisement",
      "Email",
      "Other"
    ];

    const allowedPriorities = ["High", "Medium", "Low"];

    // ✅ Required field validations (ALL required)
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        error: "Invalid input: 'name' is required and must be a string."
      });
    }

    if (!source || !allowedSources.includes(source)) {
      return res.status(400).json({
        error: "Invalid input: 'source' must match predefined values."
      });
    }

    if (!salesAgent || !mongoose.Types.ObjectId.isValid(salesAgent)) {
      return res.status(400).json({
        error: "Invalid input: 'salesAgent' must be a valid ObjectId."
      });
    }

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error:
          "Invalid input: 'status' must be one of ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed']."
      });
    }

    if (
      timeToClose === undefined ||
      typeof timeToClose !== "number" ||
      timeToClose <= 0
    ) {
      return res.status(400).json({
        error: "Invalid input: 'timeToClose' must be a positive number."
      });
    }

    if (!priority || !allowedPriorities.includes(priority)) {
      return res.status(400).json({
        error:
          "Invalid input: 'priority' must be one of ['High', 'Medium', 'Low']."
      });
    }

    // ✅ Check if Lead exists
    const existingLead = await Leads.findById(leadId);
    if (!existingLead) {
      return res.status(404).json({
        error: `Lead with ID '${leadId}' not found.`
      });
    }

    // ✅ Check if SalesAgent exists
    const existingAgent = await SalesAgents.findById(salesAgent);
    if (!existingAgent) {
      return res.status(404).json({
        error: `Sales agent with ID '${salesAgent}' not found.`
      });
    }

    // ✅ Update lead
    existingLead.name = name;
    existingLead.source = source;
    existingLead.salesAgent = salesAgent;
    existingLead.status = status;
    existingLead.tags = tags || [];
    existingLead.timeToClose = timeToClose;
    existingLead.priority = priority;
    existingLead.updatedAt = new Date();

    await existingLead.save();

    await existingLead.populate("salesAgent", "name");

    return res.status(200).json({
      id: existingLead._id,
      name: existingLead.name,
      source: existingLead.source,
      salesAgent: {
        id: existingLead.salesAgent._id,
        name: existingLead.salesAgent.name
      },
      status: existingLead.status,
      tags: existingLead.tags,
      timeToClose: existingLead.timeToClose,
      priority: existingLead.priority,
      updatedAt: existingLead.updatedAt
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
      message: error.message
    });
  }
});



module.exports = router;
