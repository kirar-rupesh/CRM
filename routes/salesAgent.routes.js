const express = require("express");
const mongoose = require("mongoose");
const Leads = require("../models/lead.model");
const SalesAgent = require("../models/salesAgent.model");

const router = express.Router();


/////////////////////////////////////////
// POST /agents (Create Sales Agent)
/////////////////////////////////////////

router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate name
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        error: "Invalid input: 'name' is required and must be a string."
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid input: 'email' must be a valid email address."
      });
    }

    // Check duplicate email
    const existingAgent = await SalesAgent.findOne({ email });

    if (existingAgent) {
      return res.status(409).json({
        error: `Sales agent with email '${email}' already exists.`
      });
    }

    // Create agent
    const newAgent = new SalesAgent({
      name,
      email
    });

    await newAgent.save();

    return res.status(201).json({
      id: newAgent._id,
      name: newAgent.name,
      email: newAgent.email,
      createdAt: newAgent.createdAt
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
      message: error.message
    });
  }
});




/////////////////////////////////////////
// GET /agents (Get All Sales Agents)
/////////////////////////////////////////

router.get("/", async (req, res) => {
  try {
    const agents = await SalesAgent.find();

    const response = agents.map(agent => ({
      id: agent._id,
      name: agent.name,
      email: agent.email
    }));

    return res.status(200).json(response);

  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
      message: error.message
    });
  }
});




module.exports = router;


