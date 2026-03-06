const express = require("express");
const Comment = require("../models/comment.model");
const SalesAgent = require("../models/salesAgent.model");
const Lead = require("../models/lead.model");
const mongoose = require("mongoose");

const router = express.Router();


/////////////////////////////////////////
// POST /leads/:id/comments
/////////////////////////////////////////

router.post("/:id/comments", async (req, res) => {
  try {
    const leadId = req.params.id;
    const { commentText } = req.body;

    // Validate Lead ID
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({
        error: "Invalid input: Lead ID must be a valid ObjectId."
      });
    }

    // Validate commentText
    if (!commentText || typeof commentText !== "string") {
      return res.status(400).json({
        error: "Invalid input: 'commentText' is required and must be a string."
      });
    }

    // Check if Lead exists
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({
        error: `Lead with ID '${leadId}' not found.`
      });
    }

    // Get SalesAgent as author (lead owner)
    const agent = await SalesAgent.findById(lead.salesAgent);

    // Create comment
    const newComment = new Comment({
      lead: leadId,
      author: agent._id,
      commentText
    });

    await newComment.save();

    return res.status(201).json({
      id: newComment._id,
      commentText: newComment.commentText,
      author: agent.name,
      createdAt: newComment.createdAt
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
      message: error.message
    });
  }
});


/////////////////////////////////////////
// GET /leads/:id/comments
/////////////////////////////////////////

router.get("/:id/comments", async (req, res) => {
  try {
    const leadId = req.params.id;

    // Validate Lead ID
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({
        error: "Invalid input: Lead ID must be a valid ObjectId."
      });
    }

    // Check if Lead exists
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({
        error: `Lead with ID '${leadId}' not found.`
      });
    }

    // Fetch comments for this lead
    const comments = await Comment.find({ lead: leadId })
      .populate("author", "name")
      .sort({ createdAt: 1 });

    // Format response
    const formattedComments = comments.map(comment => ({
      id: comment._id,
      commentText: comment.commentText,
      author: comment.author.name,
      createdAt: comment.createdAt
    }));

    return res.status(200).json(formattedComments);

  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
      message: error.message
    });
  }
});


module.exports = router;