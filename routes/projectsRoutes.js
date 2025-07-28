import express from 'express';
import Project from '../models/projects.js';
import Font from '../models/font.js';
import ApiKey from '../models/APIKey.js';

const router = express.Router();

// ✅ GET /api/projects?userId=abc123
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId in query' });

    const projects = await Project.find({ userId });
    res.json(projects);
  } catch (err) {
    console.error('❌ Error fetching projects:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET /api/projects/:id/fonts
router.get('/:id/fonts', async (req, res) => {
  try {
    const fonts = await Font.find({ projectId: req.params.id });
    res.json(fonts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fonts' });
  }
});

// ✅ GET /api/projects/:id/apikeys
router.get('/:id/apikeys', async (req, res) => {
  try {
    const keys = await ApiKey.find({ projectId: req.params.id });
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// ✅ POST /api/projects
router.post('/', async (req, res) => {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) {
      return res.status(400).json({ error: 'Project name and userId are required' });
    }

    const project = new Project({ name, userId });
    const saved = await project.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Error in POST /api/projects:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
