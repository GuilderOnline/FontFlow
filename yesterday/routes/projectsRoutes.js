// routes/projects.js

import express from 'express';
import Project from '../models/projects.js';
import Font from '../models/font.js';
import ApiKey from '../models/APIKey.js';
import slugify from 'slugify';
import { jwtAuth } from '../middleware/jwtAuth.js';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ GET /api/projects
router.get('/', jwtAuth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).populate('fonts');
    res.json(projects);
  } catch (err) {
    console.error('❌ Error fetching projects:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET /api/projects/:slug
router.get('/:slug', jwtAuth, async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, userId: req.user.id }).populate('fonts');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET /api/projects/:id/apikeys
router.get('/:id/apikeys', jwtAuth, async (req, res) => {
  try {
    const keys = await ApiKey.find({ projectId: req.params.id, userId: req.user.id });
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// ✅ POST /api/projects
router.post('/', jwtAuth, async (req, res) => {
  try {
    const { name, url, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const slug = slugify(name, { lower: true, strict: true });

    const project = new Project({
      name,
      slug,
      url,
      description,
      userId: req.user.id,
      fonts: [],
    });

    const saved = await project.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Error in POST /api/projects:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ POST /api/projects/:id/fonts
router.post('/:id/fonts', jwtAuth, async (req, res) => {
  try {
    const { fontId } = req.body;
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (!project.fonts.includes(fontId)) {
      project.fonts.push(fontId);
      await project.save();
    }

    res.json(project);
  } catch (err) {
    console.error('❌ Error adding font to project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ DELETE /api/projects/:id/fonts/:fontId
router.delete('/:id/fonts/:fontId', jwtAuth, async (req, res) => {
  try {
    const { id, fontId } = req.params;
    const project = await Project.findOne({ _id: id, userId: req.user.id });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    project.fonts = project.fonts.filter(f => f.toString() !== fontId);
    await project.save();

    res.json(project);
  } catch (err) {
    console.error('❌ Error removing font from project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET /api/projects/:slug/embed — Get font metadata + signed URLs
router.get('/:slug/embed', async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug }).populate('fonts');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const fontsWithUrls = await Promise.all(project.fonts.map(async (font) => {
      const signedUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: font.originalFile,
        }),
        { expiresIn: 3600 }
      );

      return {
        _id: font._id,
        name: font.name,
        fullName: font.fullName || font.name,
        style: font.style,
        weight: font.weight,
        license: font.license,
        url: signedUrl,
      };
    }));

    res.json(fontsWithUrls);
  } catch (err) {
    console.error('❌ Error in GET /:slug/embed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET /api/projects/:slug/css — Return @font-face rules for embed
router.get('/:slug/css', async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug }).populate('fonts');
    if (!project) return res.status(404).send('/* Project not found */');

    const cssRules = await Promise.all(project.fonts.map(async (font) => {
      const signedUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: font.originalFile,
        }),
        { expiresIn: 3600 }
      );

      const fontFamily = font.fullName || font.name || 'CustomFont';
      return `
@font-face {
  font-family: '${fontFamily}';
  src: url('${signedUrl}') format('truetype');
  font-weight: ${font.weight || 'normal'};
  font-style: ${font.style || 'normal'};
}
`;
    }));

    res.set('Content-Type', 'text/css');
    res.send(cssRules.join('\n'));
  } catch (err) {
    console.error('❌ Error generating CSS:', err);
    res.status(500).send('/* Error generating CSS */');
  }
});

export default router;
