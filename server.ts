import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface StoredUser {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  styleNote: string;
  createdAt: string;
}

interface ClothingRecord {
  id: string;
  userId: string;
  name: string;
  brand: string;
  category: string;
  color: string;
  colorHex: string;
  fabric: string;
  season: string;
  purchasePrice: number;
  imageKey: string;
  customImageUrl?: string;
  wearCount: number;
  lastWornDate: string | null;
  isFavorite: boolean;
  notes?: string;
  createdAt: string;
}

interface OutfitRecord {
  id: string;
  userId: string;
  name: string;
  occasion: string;
  season: string;
  itemIds: string[];
  isFavorite: boolean;
  wearCount: number;
  lastWornDate: string | null;
  notes: string;
  createdAt: string;
}

interface CalendarRecord {
  id: string;
  userId: string;
  date: string;
  outfitId: string;
  occasionNote: string;
  isCompleted: boolean;
  createdAt: string;
}

interface WearLogRecord {
  id: string;
  userId: string;
  date: string;
  outfitId: string | null;
  outfitName: string;
  itemIds: string[];
  occasion: string;
  weatherNote: string;
  notes: string;
  createdAt: string;
}

interface UserDatabaseSlice {
  wardrobe: ClothingRecord[];
  outfits: OutfitRecord[];
  calendar: CalendarRecord[];
  wearLogs: WearLogRecord[];
}

const usersByEmail = new Map<string, StoredUser>();
const usersById = new Map<string, StoredUser>();
const sessions = new Map<string, string>(); // token -> uid
const userStore = new Map<string, UserDatabaseSlice>();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`outdrobe_salt_${password}`).digest('hex');
}

function getTodayIso(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createInitialCapsuleForUser(uid: string): UserDatabaseSlice {
  const today = getTodayIso(0);
  const tomorrow = getTodayIso(1);
  const inThreeDays = getTodayIso(3);
  const twoDaysAgo = getTodayIso(-2);
  const fiveDaysAgo = getTodayIso(-5);
  const nineDaysAgo = getTodayIso(-9);

  const wardrobe: ClothingRecord[] = [
    {
      id: `item_${uid}_1`,
      userId: uid,
      name: 'Tailored Linen-Wool Blazer',
      brand: 'Atelier Nord',
      category: 'Outerwear',
      color: 'Soft Sage',
      colorHex: '#7A8F7C',
      fabric: '55% Linen, 45% Virgin Wool',
      season: 'Spring',
      purchasePrice: 280,
      imageKey: 'sage_blazer',
      wearCount: 11,
      lastWornDate: twoDaysAgo,
      isFavorite: true,
      notes: 'Unstructured shoulder, breathable half-canvas lining.',
      createdAt: '2026-09-02T09:00:00Z',
    },
    {
      id: `item_${uid}_2`,
      userId: uid,
      name: 'Fine-Gauge Merino Crewneck',
      brand: 'Knitwerk Studio',
      category: 'Tops',
      color: 'Warm Ivory',
      colorHex: '#EFECE4',
      fabric: '100% Extra-Fine Merino',
      season: 'Autumn',
      purchasePrice: 145,
      imageKey: 'ivory_knit',
      wearCount: 16,
      lastWornDate: twoDaysAgo,
      isFavorite: true,
      notes: 'Layers cleanly underneath tailored jackets without bulk.',
      createdAt: '2026-09-04T10:15:00Z',
    },
    {
      id: `item_${uid}_3`,
      userId: uid,
      name: 'Wide-Leg Pleated Wool Trousers',
      brand: 'Studio Arketype',
      category: 'Bottoms',
      color: 'Deep Charcoal',
      colorHex: '#2C2E2B',
      fabric: '100% Cold-Weather Wool',
      season: 'All Seasons',
      purchasePrice: 195,
      imageKey: 'charcoal_trousers',
      wearCount: 19,
      lastWornDate: twoDaysAgo,
      isFavorite: true,
      notes: 'Double front pleat with relaxed straight drape.',
      createdAt: '2026-09-05T11:30:00Z',
    },
    {
      id: `item_${uid}_4`,
      userId: uid,
      name: 'Belted Cotton Gabardine Trench',
      brand: 'Maison Pluie',
      category: 'Outerwear',
      color: 'Warm Oat',
      colorHex: '#CBB799',
      fabric: 'Water-Repellent Organic Cotton',
      season: 'Autumn',
      purchasePrice: 360,
      imageKey: 'camel_trench',
      wearCount: 8,
      lastWornDate: fiveDaysAgo,
      isFavorite: true,
      notes: 'Storm flap, horn buttons, ideal for transitional weather.',
      createdAt: '2026-09-10T14:00:00Z',
    },
    {
      id: `item_${uid}_5`,
      userId: uid,
      name: 'Calfskin Penny Loafers',
      brand: 'Solovair & Co.',
      category: 'Footwear',
      color: 'Espresso',
      colorHex: '#3B2820',
      fabric: 'Full-Grain Italian Calfskin',
      season: 'All Seasons',
      purchasePrice: 240,
      imageKey: 'leather_loafers',
      wearCount: 24,
      lastWornDate: twoDaysAgo,
      isFavorite: true,
      notes: 'Goodyear welted leather sole with rubber heel tap.',
      createdAt: '2026-09-12T08:45:00Z',
    },
    {
      id: `item_${uid}_6`,
      userId: uid,
      name: 'Crisp Organic Poplin Shirt',
      brand: 'Copenhagen Mill',
      category: 'Tops',
      color: 'Chalk White',
      colorHex: '#F7F6F2',
      fabric: '100% Organic Cotton Poplin',
      season: 'All Seasons',
      purchasePrice: 110,
      imageKey: 'poplin_shirt',
      wearCount: 14,
      lastWornDate: fiveDaysAgo,
      isFavorite: false,
      notes: 'Mother-of-pearl buttons, relaxed architectural cuff.',
      createdAt: '2026-09-15T16:20:00Z',
    },
    {
      id: `item_${uid}_7`,
      userId: uid,
      name: 'Selvedge Straight Ecru Denim',
      brand: 'Loomworks',
      category: 'Bottoms',
      color: 'Natural Ecru',
      colorHex: '#E5DEC9',
      fabric: '13.5oz Japanese Selvedge Cotton',
      season: 'Spring',
      purchasePrice: 165,
      imageKey: 'ecru_denim',
      wearCount: 6,
      lastWornDate: nineDaysAgo,
      isFavorite: false,
      notes: 'High-rise vintage straight cut.',
      createdAt: '2026-09-19T12:10:00Z',
    },
    {
      id: `item_${uid}_8`,
      userId: uid,
      name: 'Architectural Leather Tote',
      brand: 'Forma Objects',
      category: 'Accessories',
      color: 'Olive Umber',
      colorHex: '#4A4F41',
      fabric: 'Vegetable-Tanned Bridle Leather',
      season: 'All Seasons',
      purchasePrice: 210,
      imageKey: 'leather_tote',
      wearCount: 18,
      lastWornDate: fiveDaysAgo,
      isFavorite: true,
      notes: 'Fits 14-inch laptop and daily sketchbook.',
      createdAt: '2026-09-24T09:30:00Z',
    },
    {
      id: `item_${uid}_9`,
      userId: uid,
      name: 'Ribbed Mock-Neck Knit Tee',
      brand: 'Atelier Nord',
      category: 'Tops',
      color: 'Muted Moss',
      colorHex: '#596A5B',
      fabric: '70% Tencel, 30% Silk',
      season: 'Summer',
      purchasePrice: 95,
      imageKey: 'moss_tee',
      wearCount: 0,
      lastWornDate: null,
      isFavorite: false,
      notes: 'Unworn closet gem — breathable silk-blend drape.',
      createdAt: '2026-10-14T15:00:00Z',
    },
  ];

  const outfits: OutfitRecord[] = [
    {
      id: `outfit_${uid}_1`,
      userId: uid,
      name: 'Architectural Studio Uniform',
      occasion: 'Professional',
      season: 'Spring',
      itemIds: [`item_${uid}_1`, `item_${uid}_2`, `item_${uid}_3`, `item_${uid}_5`],
      isFavorite: true,
      wearCount: 7,
      lastWornDate: twoDaysAgo,
      notes: 'Balanced sage and ivory tonal contrast grounded by charcoal wool.',
      createdAt: '2026-09-25T10:00:00Z',
    },
    {
      id: `outfit_${uid}_2`,
      userId: uid,
      name: 'Rainy Morning Commute',
      occasion: 'Daily Studio',
      season: 'Autumn',
      itemIds: [`item_${uid}_4`, `item_${uid}_6`, `item_${uid}_3`, `item_${uid}_5`, `item_${uid}_8`],
      isFavorite: true,
      wearCount: 5,
      lastWornDate: fiveDaysAgo,
      notes: 'Weather-protected gabardine trench over crisp poplin and leather tote.',
      createdAt: '2026-09-28T08:15:00Z',
    },
    {
      id: `outfit_${uid}_3`,
      userId: uid,
      name: 'Weekend Gallery Walk',
      occasion: 'Weekend',
      season: 'Spring',
      itemIds: [`item_${uid}_1`, `item_${uid}_9`, `item_${uid}_7`, `item_${uid}_5`],
      isFavorite: false,
      wearCount: 1,
      lastWornDate: nineDaysAgo,
      notes: 'Monochromatic sage & moss pairing against light ecru denim.',
      createdAt: '2026-10-16T11:20:00Z',
    },
  ];

  const calendar: CalendarRecord[] = [
    {
      id: `cal_${uid}_1`,
      userId: uid,
      date: today,
      outfitId: `outfit_${uid}_1`,
      occasionNote: 'Product Design Critique & Client Review',
      isCompleted: false,
      createdAt: '2026-10-27T18:00:00Z',
    },
    {
      id: `cal_${uid}_2`,
      userId: uid,
      date: tomorrow,
      outfitId: `outfit_${uid}_2`,
      occasionNote: 'Morning Lecture & Downtown Coffee',
      isCompleted: false,
      createdAt: '2026-10-28T09:00:00Z',
    },
    {
      id: `cal_${uid}_3`,
      userId: uid,
      date: inThreeDays,
      outfitId: `outfit_${uid}_3`,
      occasionNote: 'Modern Art Bookshop & Brunch',
      isCompleted: false,
      createdAt: '2026-10-28T09:05:00Z',
    },
  ];

  const wearLogs: WearLogRecord[] = [
    {
      id: `wear_${uid}_1`,
      userId: uid,
      date: twoDaysAgo,
      outfitId: `outfit_${uid}_1`,
      outfitName: 'Architectural Studio Uniform',
      itemIds: [`item_${uid}_1`, `item_${uid}_2`, `item_${uid}_3`, `item_${uid}_5`],
      occasion: 'Professional',
      weatherNote: '16°C · Crisp Overcast',
      notes: 'Comfortable all day from morning standup through evening dinner.',
      createdAt: `${twoDaysAgo}T08:30:00Z`,
    },
    {
      id: `wear_${uid}_2`,
      userId: uid,
      date: fiveDaysAgo,
      outfitId: `outfit_${uid}_2`,
      outfitName: 'Rainy Morning Commute',
      itemIds: [`item_${uid}_4`, `item_${uid}_6`, `item_${uid}_3`, `item_${uid}_5`, `item_${uid}_8`],
      occasion: 'Daily Studio',
      weatherNote: '13°C · Light Rain',
      notes: 'Gabardine trench kept poplin shirt spotless during transit.',
      createdAt: `${fiveDaysAgo}T08:15:00Z`,
    },
    {
      id: `wear_${uid}_3`,
      userId: uid,
      date: nineDaysAgo,
      outfitId: `outfit_${uid}_3`,
      outfitName: 'Weekend Gallery Walk',
      itemIds: [`item_${uid}_1`, `item_${uid}_6`, `item_${uid}_7`, `item_${uid}_5`],
      occasion: 'Weekend',
      weatherNote: '19°C · Clear Sun',
      notes: 'Relaxed ecru denim worked effortlessly with espresso loafers.',
      createdAt: `${nineDaysAgo}T11:00:00Z`,
    },
  ];

  return { wardrobe, outfits, calendar, wearLogs };
}

// Seed default demo user so instant demo sign-in works immediately
const demoUid = 'usr_claire_demo';
const demoUser: StoredUser = {
  uid: demoUid,
  email: 'claire.vance@outdrobe.studio',
  displayName: 'Claire Vance',
  passwordHash: hashPassword('demo1234'),
  styleNote: 'Minimalist architectural tailoring · Warm neutrals & sage accents',
  createdAt: '2026-09-01T08:00:00Z',
};
usersByEmail.set(demoUser.email.toLowerCase(), demoUser);
usersById.set(demoUid, demoUser);
userStore.set(demoUid, createInitialCapsuleForUser(demoUid));

interface AuthenticatedRequest extends Request {
  uid?: string;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  const token = authHeader.slice(7).trim();
  const uid = sessions.get(token);
  if (!uid || !usersById.has(uid)) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
    return;
  }
  req.uid = uid;
  next();
}

function getSlice(uid: string): UserDatabaseSlice {
  let slice = userStore.get(uid);
  if (!slice) {
    slice = createInitialCapsuleForUser(uid);
    userStore.set(uid, slice);
  }
  return slice;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '6mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'outdrobe-api' });
  });

  // --- AUTHENTICATION ROUTES ---
  app.post('/api/auth/demo', (_req: Request, res: Response) => {
    const token = `tok_${crypto.randomBytes(18).toString('hex')}`;
    sessions.set(token, demoUid);
    const { passwordHash: _pw, ...safeUser } = demoUser;
    res.json({ token, user: safeUser });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { email, password, displayName, startWithSampleCapsule } = req.body as {
      email?: string;
      password?: string;
      displayName?: string;
      startWithSampleCapsule?: boolean;
    };

    if (!email || !password || !displayName) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (usersByEmail.has(normalizedEmail)) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const uid = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const newUser: StoredUser = {
      uid,
      email: normalizedEmail,
      displayName: displayName.trim(),
      passwordHash: hashPassword(password),
      styleNote: 'Personal Digital Wardrobe',
      createdAt: new Date().toISOString(),
    };

    usersByEmail.set(normalizedEmail, newUser);
    usersById.set(uid, newUser);

    if (startWithSampleCapsule !== false) {
      userStore.set(uid, createInitialCapsuleForUser(uid));
    } else {
      userStore.set(uid, { wardrobe: [], outfits: [], calendar: [], wearLogs: [] });
    }

    const token = `tok_${crypto.randomBytes(18).toString('hex')}`;
    sessions.set(token, uid);

    const { passwordHash: _pw, ...safeUser } = newUser;
    res.status(201).json({ token, user: safeUser });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const existing = usersByEmail.get(email.trim().toLowerCase());
    if (!existing || existing.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }
    const token = `tok_${crypto.randomBytes(18).toString('hex')}`;
    sessions.set(token, existing.uid);
    const { passwordHash: _pw, ...safeUser } = existing;
    res.json({ token, user: safeUser });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = usersById.get(req.uid!);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const { passwordHash: _pw, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      sessions.delete(authHeader.slice(7).trim());
    }
    res.json({ ok: true });
  });

  // --- FULL WORKSPACE SNAPSHOT ---
  app.get('/api/workspace', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const slice = getSlice(req.uid!);
    res.json(slice);
  });

  // --- WARDROBE CRUD ---
  app.post('/api/wardrobe', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const uid = req.uid!;
    const slice = getSlice(uid);
    const body = req.body as Partial<ClothingRecord>;

    if (!body.name || !body.category) {
      res.status(400).json({ error: 'Garment name and category are required.' });
      return;
    }

    const item: ClothingRecord = {
      id: `item_${crypto.randomBytes(6).toString('hex')}`,
      userId: uid,
      name: String(body.name).trim(),
      brand: String(body.brand || 'Personal Archive').trim(),
      category: String(body.category),
      color: String(body.color || 'Neutral').trim(),
      colorHex: String(body.colorHex || '#8C8A82'),
      fabric: String(body.fabric || 'Natural Fiber').trim(),
      season: String(body.season || 'All Seasons'),
      purchasePrice: Math.max(0, Number(body.purchasePrice) || 0),
      imageKey: String(body.imageKey || 'sage_blazer'),
      customImageUrl: body.customImageUrl ? String(body.customImageUrl) : undefined,
      wearCount: Math.max(0, Number(body.wearCount) || 0),
      lastWornDate: body.lastWornDate || null,
      isFavorite: Boolean(body.isFavorite),
      notes: body.notes ? String(body.notes).trim() : '',
      createdAt: new Date().toISOString(),
    };

    slice.wardrobe.unshift(item);
    res.status(201).json({ item });
  });

  app.put('/api/wardrobe/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const uid = req.uid!;
    const slice = getSlice(uid);
    const idx = slice.wardrobe.findIndex((g) => g.id === req.params.id && g.userId === uid);
    if (idx === -1) {
      res.status(404).json({ error: 'Garment not found in your wardrobe.' });
      return;
    }
    const existing = slice.wardrobe[idx];
    const updates = req.body as Partial<ClothingRecord>;
    const updated: ClothingRecord = {
      ...existing,
      name: updates.name !== undefined ? String(updates.name).trim() : existing.name,
      brand: updates.brand !== undefined ? String(updates.brand).trim() : existing.brand,
      category: updates.category !== undefined ? String(updates.category) : existing.category,
      color: updates.color !== undefined ? String(updates.color).trim() : existing.color,
      colorHex: updates.colorHex !== undefined ? String(updates.colorHex) : existing.colorHex,
      fabric: updates.fabric !== undefined ? String(updates.fabric).trim() : existing.fabric,
      season: updates.season !== undefined ? String(updates.season) : existing.season,
      purchasePrice:
        updates.purchasePrice !== undefined
          ? Math.max(0, Number(updates.purchasePrice) || 0)
          : existing.purchasePrice,
      imageKey: updates.imageKey !== undefined ? String(updates.imageKey) : existing.imageKey,
      customImageUrl:
        updates.customImageUrl !== undefined ? updates.customImageUrl : existing.customImageUrl,
      isFavorite:
        updates.isFavorite !== undefined ? Boolean(updates.isFavorite) : existing.isFavorite,
      notes: updates.notes !== undefined ? String(updates.notes) : existing.notes,
    };
    slice.wardrobe[idx] = updated;
    res.json({ item: updated });
  });

  app.delete('/api/wardrobe/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const uid = req.uid!;
    const slice = getSlice(uid);
    const itemId = req.params.id;
    slice.wardrobe = slice.wardrobe.filter((g) => !(g.id === itemId && g.userId === uid));
    slice.outfits = slice.outfits.map((o) => ({
      ...o,
      itemIds: o.itemIds.filter((id) => id !== itemId),
    }));
    res.json({ ok: true });
  });

  // --- OUTFITS CRUD ---
  app.post('/api/outfits', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const uid = req.uid!;
    const slice = getSlice(uid);
    const body = req.body as Partial<OutfitRecord>;

    if (!body.name || !Array.isArray(body.itemIds) || body.itemIds.length === 0) {
      res.status(400).json({ error: 'Outfit name and at least one clothing item are required.' });
      return;
    }

    // Verify ownership of referenced clothing items
    const ownedIds = new Set(slice.wardrobe.map((g) => g.id));
    const validItemIds = body.itemIds.filter((id) => ownedIds.has(id));
    if (validItemIds.length === 0) {
      res.status(400).json({ error: 'Selected garments do not belong to current user.' });
      return;
    }

    const outfit: OutfitRecord = {
      id: `outfit_${crypto.randomBytes(6).toString('hex')}`,
      userId: uid,
      name: String(body.name).trim(),
      occasion: String(body.occasion || 'Daily Studio'),
      season: String(body.season || 'All Seasons'),
      itemIds: validItemIds,
      isFavorite: Boolean(body.isFavorite),
      wearCount: 0,
      lastWornDate: null,
      notes: body.notes ? String(body.notes).trim() : '',
      createdAt: new Date().toISOString(),
    };

    slice.outfits.unshift(outfit);
    res.status(201).json({ outfit });
  });

  app.put('/api/outfits/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const uid = req.uid!;
    const slice = getSlice(uid);
    const idx = slice.outfits.findIndex((o) => o.id === req.params.id && o.userId === uid);
    if (idx === -1) {
      res.status(404).json({ error: 'Outfit not found.' });
      return;
    }
    const existing = slice.outfits[idx];
    const updates = req.body as Partial<OutfitRecord>;
    const updated: OutfitRecord = {
      ...existing,
      name: updates.name !== undefined ? String(updates.name).trim() : existing.name,
      occasion: updates.occasion !== undefined ? String(updates.occasion) : existing.occasion,
      season: updates.season !== undefined ? String(updates.season) : existing.season,
      itemIds: Array.isArray(updates.itemIds) ? updates.itemIds : existing.itemIds,
      isFavorite:
        updates.isFavorite !== undefined ? Boolean(updates.isFavorite) : existing.isFavorite,
      notes: updates.notes !== undefined ? String(updates.notes) : existing.notes,
    };
    slice.outfits[idx] = updated;
    res.json({ outfit: updated });
  });

  app.delete('/api/outfits/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const uid = req.uid!;
    const slice = getSlice(uid);
    const outfitId = req.params.id;
    slice.outfits = slice.outfits.filter((o) => !(o.id === outfitId && o.userId === uid));
    slice.calendar = slice.calendar.filter((c) => c.outfitId !== outfitId);
    res.json({ ok: true });
  });

  // --- CALENDAR ROUTES ---
  app.post('/api/calendar', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const uid = req.uid!;
    const slice = getSlice(uid);
    const { date, outfitId, occasionNote } = req.body as {
      date?: string;
      outfitId?: string;
      occasionNote?: string;
    };

    if (!date || !outfitId) {
      res.status(400).json({ error: 'Date and outfitId are required.' });
      return;
    }

    const outfitExists = slice.outfits.some((o) => o.id === outfitId && o.userId === uid);
    if (!outfitExists) {
      res.status(404).json({ error: 'Outfit not found in user wardrobe.' });
      return;
    }

    // Replace existing plan on same date if present
    const existingIdx = slice.calendar.findIndex((c) => c.date === date && c.userId === uid);
    const record: CalendarRecord = {
      id: existingIdx >= 0 ? slice.calendar[existingIdx].id : `cal_${crypto.randomBytes(6).toString('hex')}`,
      userId: uid,
      date,
      outfitId,
      occasionNote: occasionNote ? String(occasionNote).trim() : 'Planned Look',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      slice.calendar[existingIdx] = record;
    } else {
      slice.calendar.push(record);
    }

    res.status(201).json({ plan: record });
  });

  app.delete('/api/calendar/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const uid = req.uid!;
    const slice = getSlice(uid);
    slice.calendar = slice.calendar.filter((c) => !(c.id === req.params.id && c.userId === uid));
    res.json({ ok: true });
  });

  // --- WEAR HISTORY LOGGING (Updates Outfit + Garment Wear Counts Atomically) ---
  app.post('/api/wear-logs', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const uid = req.uid!;
    const slice = getSlice(uid);
    const { date, outfitId, itemIds, occasion, weatherNote, notes, calendarPlanId } = req.body as {
      date?: string;
      outfitId?: string | null;
      itemIds?: string[];
      occasion?: string;
      weatherNote?: string;
      notes?: string;
      calendarPlanId?: string;
    };

    const wearDate = date || getTodayIso(0);
    let resolvedItemIds: string[] = Array.isArray(itemIds) ? itemIds : [];
    let resolvedOutfitName = 'Custom Garment Pairing';

    if (outfitId) {
      const outfit = slice.outfits.find((o) => o.id === outfitId && o.userId === uid);
      if (outfit) {
        resolvedOutfitName = outfit.name;
        if (resolvedItemIds.length === 0) {
          resolvedItemIds = [...outfit.itemIds];
        }
        outfit.wearCount += 1;
        if (!outfit.lastWornDate || wearDate >= outfit.lastWornDate) {
          outfit.lastWornDate = wearDate;
        }
      }
    }

    if (resolvedItemIds.length === 0) {
      res.status(400).json({ error: 'Select an outfit or at least one clothing item to log wear.' });
      return;
    }

    // Increment wearCount on each worn garment
    const wornSet = new Set(resolvedItemIds);
    slice.wardrobe = slice.wardrobe.map((g) => {
      if (wornSet.has(g.id) && g.userId === uid) {
        return {
          ...g,
          wearCount: g.wearCount + 1,
          lastWornDate: !g.lastWornDate || wearDate >= g.lastWornDate ? wearDate : g.lastWornDate,
        };
      }
      return g;
    });

    if (calendarPlanId) {
      slice.calendar = slice.calendar.map((c) =>
        c.id === calendarPlanId && c.userId === uid ? { ...c, isCompleted: true } : c
      );
    }

    const entry: WearLogRecord = {
      id: `wear_${crypto.randomBytes(6).toString('hex')}`,
      userId: uid,
      date: wearDate,
      outfitId: outfitId || null,
      outfitName: resolvedOutfitName,
      itemIds: resolvedItemIds,
      occasion: occasion || 'Daily Studio',
      weatherNote: weatherNote || '17°C · Mild',
      notes: notes ? String(notes).trim() : '',
      createdAt: new Date().toISOString(),
    };

    slice.wearLogs.unshift(entry);
    res.status(201).json({
      entry,
      wardrobe: slice.wardrobe,
      outfits: slice.outfits,
      calendar: slice.calendar,
    });
  });

  // --- ALGORITHMIC OUTFIT SUGGESTIONS (Rule-based Color & Rotation Stylist) ---
  app.get('/api/suggestions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const uid = req.uid!;
    const slice = getSlice(uid);
    const occasionFilter = String(req.query.occasion || 'All');
    const climate = String(req.query.climate || 'Mild (14–20°C)');

    const tops = slice.wardrobe
      .filter((g) => g.category === 'Tops')
      .sort((a, b) => a.wearCount - b.wearCount);
    const bottoms = slice.wardrobe
      .filter((g) => g.category === 'Bottoms')
      .sort((a, b) => a.wearCount - b.wearCount);
    const outerwear = slice.wardrobe
      .filter((g) => g.category === 'Outerwear')
      .sort((a, b) => a.wearCount - b.wearCount);
    const footwear = slice.wardrobe
      .filter((g) => g.category === 'Footwear')
      .sort((a, b) => a.wearCount - b.wearCount);
    const accessories = slice.wardrobe
      .filter((g) => g.category === 'Accessories')
      .sort((a, b) => a.wearCount - b.wearCount);

    const suggestions = [];
    const needOuterwear = !climate.includes('Warm');

    if (tops.length > 0 && bottoms.length > 0) {
      // Suggestion 1: Prioritize least-worn pieces (Closet Rotation Optimizer)
      const top1 = tops[0];
      const bot1 = bottoms[0];
      const out1 = needOuterwear && outerwear.length > 0 ? outerwear[0] : null;
      const shoe1 = footwear[0] || null;
      const items1 = [out1?.id, top1.id, bot1.id, shoe1?.id].filter(Boolean) as string[];

      suggestions.push({
        id: 'sug_rotation_focus',
        title: 'Under-Rotated Capsule Revival',
        rationale: `Pairs ${top1.name} (${top1.wearCount} wears) with ${bot1.name} to bring fresh circulation into your weekly rotation while keeping neutral balance.`,
        occasion: occasionFilter !== 'All' ? occasionFilter : 'Daily Studio',
        season: needOuterwear ? 'Spring' : 'Summer',
        temperatureLabel: climate,
        itemIds: items1,
        harmonyLabel: `${top1.color} + ${bot1.color}`,
        rotationBenefit: `Lowers cost-per-wear on ${top1.name}`,
      });

      // Suggestion 2: Elevated Tailored / Smart Pairing
      const top2 = tops[Math.min(1, tops.length - 1)];
      const bot2 = bottoms[Math.min(1, bottoms.length - 1)];
      const out2 =
        outerwear.length > 1
          ? outerwear[1]
          : outerwear.length === 1
          ? outerwear[0]
          : null;
      const shoe2 = footwear[0] || null;
      const acc2 = accessories[0] || null;
      const items2 = [out2?.id, top2.id, bot2.id, shoe2?.id, acc2?.id].filter(Boolean) as string[];

      suggestions.push({
        id: 'sug_tailored_harmony',
        title: 'Tonal Architectural Layering',
        rationale: `Combines crisp structure from ${top2.name} and ${bot2.name}${
          out2 ? ` anchored by ${out2.name}` : ''
        } for effortless desk-to-evening versatility.`,
        occasion: occasionFilter !== 'All' ? occasionFilter : 'Professional',
        season: 'Autumn',
        temperatureLabel: climate,
        itemIds: items2,
        harmonyLabel: `${out2 ? `${out2.color} · ` : ''}${top2.color} · ${bot2.color}`,
        rotationBenefit: 'High versatility staple pairing',
      });

      // Suggestion 3: Minimalist Off-Duty Combination
      const top3 = tops[tops.length - 1];
      const bot3 = bottoms[0];
      const shoe3 = footwear[footwear.length - 1] || null;
      const items3 = [top3.id, bot3.id, shoe3?.id].filter(Boolean) as string[];

      suggestions.push({
        id: 'sug_minimal_ease',
        title: 'Relaxed Minimalist Study',
        rationale: `Clean two-layer silhouette centering ${top3.name} over ${bot3.name} with zero visual clutter.`,
        occasion: occasionFilter !== 'All' ? occasionFilter : 'Weekend',
        season: 'All Seasons',
        temperatureLabel: climate,
        itemIds: items3,
        harmonyLabel: `${top3.color} + ${bot3.color}`,
        rotationBenefit: 'Zero-decision morning formula',
      });
    }

    res.json({ suggestions });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OutDrobe server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
