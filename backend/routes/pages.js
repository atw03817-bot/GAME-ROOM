import express from 'express';

const router = express.Router();

// Placeholder for static pages
router.get('/', async (req, res) => {
  res.json({ success: true, pages: [] });
});

export default router;
