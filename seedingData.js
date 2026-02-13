const fs = require("fs");
const path = require("path");
const SalesAgents = require("./models/salesAgent.model"); // adjust path if needed
const Leads = require("./models/lead.model");
const Comments = require("./models/comment.model");
const Tags = require("./models/tag.model");




async function seedSalesAgents() {
  try {
    const agentsPath = path.join(__dirname, "salesAgents.json");
    console.log("Reading sales agents file at:", agentsPath);
    console.log("Exists:", fs.existsSync(agentsPath));

    if (fs.existsSync(agentsPath)) {
      try {
        const stats = fs.statSync(agentsPath);
        console.log("SalesAgents file stat size:", stats.size);
      } catch (sErr) {
        console.error("SalesAgents stat error:", sErr?.message || sErr);
      }
    }

    const rawAgents = fs.readFileSync(agentsPath);
    console.log("SalesAgents raw buffer length:", rawAgents.length);

    const jsonData = rawAgents.toString("utf8");

    if (!jsonData || !jsonData.trim()) {
      console.error(`SalesAgents file is empty or unreadable: ${agentsPath}`);
      return;
    }

    let agentData;

    try {
      agentData = JSON.parse(jsonData);
    } catch (parseErr) {
      console.error(`Failed to parse SalesAgents JSON (${agentsPath})`);
      console.error("SalesAgents JSON snippet:", jsonData.slice(0, 200));
      throw parseErr;
    }

     for (const agent of agentData) {
      try {
        const newAgent = new SalesAgents({
          name: agent.name,
          email: agent.email,
          createdAt: agent.createdAt
        });

        await newAgent.save();
        console.log("SalesAgent saved:", newAgent.name);
      } catch (err) {
        console.error("Error saving agent:", agent.email, err.message);
      }
    }

  } catch (error) {
    console.log("Error while seeding SalesAgents:", error);
  }
}

  

//////////////////////////////////


//////////////////////////////////////////



async function seedLeads() {
  try {
    const leadsPath = path.join(__dirname, "leads.json");

    console.log("Reading leads file at:", leadsPath);

    if (!fs.existsSync(leadsPath)) {
      console.error("Leads file not found.");
      return;
    }

    const jsonData = fs.readFileSync(leadsPath, "utf8");

    if (!jsonData.trim()) {
      console.error("Leads file is empty.");
      return;
    }

    const leadData = JSON.parse(jsonData);

    // Optional: Clear old data before inserting
    // await Lead.deleteMany();

    const insertedLeads = await Leads.insertMany(leadData);

    console.log(`Successfully seeded ${insertedLeads.length} leads.`);
  } catch (error) {
    console.error("Error while seeding leads:", error.message);
  }
}








/////////////////////////////////////




async function seedTags() {
  try {
    const tagsPath = path.join(__dirname, "tags.json");
    const jsonData = fs.readFileSync(tagsPath, "utf8");

    const tagData = JSON.parse(jsonData);

    for (const tag of tagData) {
      const newTag = new Tags(tag);
      await newTag.save();
      console.log("Tag saved:", tag.name);
    }

  } catch (error) {
    console.log("Error seeding tags:", error.message);
  }
}

////////////////////////////////////////

async function seedComments() {
  try {
    const leads = await Leads.find();  
    const agents = await SalesAgents.find();

    if (!leads.length || !agents.length) {
      console.log("Leads or SalesAgents not found.");  
      return;
    }  

    for (const lead of leads) {
      const randomAgent =  
        agents[Math.floor(Math.random() * agents.length)];

      const newComment = new Comments({
        lead: lead._id,  
        author: randomAgent._id,
        commentText: `Initial discussion done with ${lead.name}. Client interested.`,
        createdAt: new Date()
      });  

      await newComment.save();
      console.log("Comment saved for:", lead.name);
    }  

  } catch (error) {
    console.log("Error seeding comments:", error.message);  
  }  
}  


//////////////////////////////////////////









module.exports = {
    seedSalesAgents,
    seedLeads,
    seedTags,
    seedComments
};


