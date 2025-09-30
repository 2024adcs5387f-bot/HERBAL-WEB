import express from 'express';

const router = express.Router();

// GET /api/proxy/image?url=<encodedURL>
router.get('/image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'Missing url' });

    let target;
    try {
      target = new URL(url);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid url' });
    }
    if (!['http:', 'https:'].includes(target.protocol)) {
      return res.status(400).json({ success: false, message: 'Unsupported protocol' });
    }

    const resp = await fetch(target.href, {
      // Avoid credentials; we just fetch a public resource
      redirect: 'follow',
      headers: {
        'User-Agent': 'HERBAL-WEB/1.0 (+https://example.com)'
      }
    });

    if (!resp.ok) {
      return res.status(resp.status).json({ success: false, message: 'Upstream error' });
    }

    const ctype = resp.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', ctype);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    // Allow same-origin use
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    const buf = Buffer.from(await resp.arrayBuffer());
    return res.status(200).end(buf);
  } catch (e) {
    console.error('Proxy error:', e.message);
    return res.status(500).json({ success: false, message: 'Proxy error' });
  }
});

export default router;
