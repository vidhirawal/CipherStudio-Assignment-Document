const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// Save or update a project
router.post("/save", async (req, res) => {
  try {
    const { projectId, name, files } = req.body;
    if (!projectId || !files) return res.status(400).json({ error: "projectId and files required" });

    const existing = await Project.findOne({ projectId });
    if (existing) {
      existing.name = name || existing.name;
      existing.files = files;
      await existing.save();
      return res.json({ ok: true, message: "Project updated", projectId });
    }

    const p = new Project({ projectId, name, files });
    await p.save();
    return res.json({ ok: true, message: "Project saved", projectId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Load a project
router.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });
    return res.json({ ok: true, project: { projectId: project.projectId, name: project.name, files: project.files } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
