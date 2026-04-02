import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

const JWT_SECRET = process.env.JWT_SECRET || 'quantum-secret-change-me';

app.use(cors());
app.use(express.json());

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// ─── Auth Middleware ───────────────────────────────────────────
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Auth Routes ─────────────────────────────────────────────
// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });

    res.status(201).json({ message: 'User created', userId: user.id });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── Public Routes ─────────────────────────────────────────────
app.get('/api/stories', async (_req, res) => {
  try {
    const stories = await prisma.story.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tags: true },
    });
    res.json(stories);
  } catch {
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

app.get('/api/stories/:id', async (req, res) => {
  try {
    const story = await prisma.story.findUnique({
      where: { id: req.params.id },
      include: { tags: true, authorRef: { select: { name: true } } },
    });
    if (!story) { res.status(404).json({ error: 'Story not found' }); return; }
    res.json(story);
  } catch {
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

// ─── Protected Story Routes ────────────────────────────────────────
// GET all stories (Admin sees all, User sees only theirs)
app.get('/api/admin/stories', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const filter = role === 'ADMIN' ? {} : { userId };
    
    const stories = await prisma.story.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: { tags: true },
    });
    res.json(stories);
  } catch {
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// POST create story
app.post('/api/admin/stories', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;
  const { title, content, author, coverUrl, tags } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const story = await prisma.story.create({
      data: {
        title,
        content,
        author: author || user.name, // Defaults to registered name
        coverUrl: coverUrl || null,
        userId,
        tags: tags?.length ? {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        } : undefined,
      },
      include: { tags: true },
    });
    res.status(201).json(story);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// PUT update story
app.put('/api/admin/stories/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { userId, role } = req.user!;
  const id = String(req.params.id);
  const { title, content, author, coverUrl, tags } = req.body;

  try {
    // Check ownership
    const existing = await prisma.story.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    if (role !== 'ADMIN' && existing.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.story.update({
      where: { id },
      data: { tags: { set: [] } },
    });

    const story = await prisma.story.update({
      where: { id },
      data: {
        title,
        content,
        author: author || existing.author,
        coverUrl: coverUrl || null,
        tags: tags?.length ? {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        } : undefined,
      },
      include: { tags: true },
    });
    res.json(story);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update story' });
  }
});

// DELETE story
app.delete('/api/admin/stories/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { userId, role } = req.user!;
  const id = String(req.params.id);
  try {
    const existing = await prisma.story.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    if (role !== 'ADMIN' && existing.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.story.update({ where: { id }, data: { tags: { set: [] } } });
    await prisma.story.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

// ─── Initialization ───────────────────────────────────────────
async function initAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@thequantumtales.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'quantum2026';

  try {
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin) {
      console.log('👤 No admin found. Creating default admin...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Administrator',
          role: 'ADMIN',
        },
      });
      console.log('✅ Default admin created successfully.');
    } else if (admin.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: admin.id },
        data: { role: 'ADMIN' },
      });
      console.log('🆙 Existing user promoted to ADMIN role.');
    }
  } catch (err) {
    console.error('❌ Failed to initialize admin:', err);
  }
}

initAdmin().then(() => {
  app.listen(port, () => {
    console.log(`[server]: Running at http://localhost:${port}`);
  });
});
