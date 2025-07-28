// routes/publicFontRoutes.js

import express from 'express';
import Project from '../models/projects.js';
import Font from '../models/font.js';

const router = express.Router();

router.get('/projects/:slug/fonts.css', async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug }).populate('fonts');
    if (!project) return res.status(404).send('Project not found');

    let css = '';
    project.fonts.forEach((font) => {
      css += `
@font-face {
  font-family: '${font.fullName || font.name}';
  src: url('${font.previewUrl}') format('truetype');
  font-weight: ${font.weight || 400};
  font-style: ${font.style || 'normal'};
}
`;
    });

    res.setHeader('Content-Type', 'text/css');
    res.send(css);
  } catch (err) {
    console.error('❌ Error generating font-face CSS:', err);
    res.status(500).send('Server error');
  }
});

export default router;
