import express from 'express';
import { addEggProduction, getAllEggProduction, updateEggProduction, deleteEggProduction } from '../utils/eggProductionExcel.js';
import { logEggProductionAudit } from '../utils/eggProductionAudit.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.post('/', async (req, res) => {
  const { date, egg_count, feed_consumed } = req.body;
  if (!date || egg_count == null) {
    return res.status(400).json({ error: 'Date and egg_count are required' });
  }
  try {
    const timestamp = new Date().toISOString();
    await addEggProduction({ date, egg_count, feed_consumed });
    // Audit log
    try {
      await logEggProductionAudit({
        userId: req.user?.id,
        action: 'create',
        eggProductionId: `${date}_${timestamp}`,
        details: { date, egg_count, feed_consumed, timestamp }
      });
    } catch (e) {
      console.error('Egg production audit log error (create):', e);
    }
    res.json({ message: 'Egg production recorded' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record egg production' });
  }
});

// Update egg production record
router.put('/:date/:timestamp', async (req, res) => {
  const { date, timestamp } = req.params;
  const { egg_count, feed_consumed } = req.body;
  if (!date || !timestamp) {
    return res.status(400).json({ error: 'Date and timestamp are required' });
  }
  try {
    const updated = await updateEggProduction({ date, timestamp, egg_count, feed_consumed });
    if (!updated) {
      return res.status(404).json({ error: 'Egg production record not found' });
    }
    // Audit log
    try {
      await logEggProductionAudit({
        userId: req.user?.id,
        action: 'update',
        eggProductionId: `${date}_${timestamp}`,
        details: { date, timestamp, egg_count, feed_consumed }
      });
    } catch (e) {
      console.error('Egg production audit log error (update):', e);
    }
    res.json({ message: 'Egg production updated' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update egg production' });
  }
});

// Delete egg production record
router.delete('/:date/:timestamp', async (req, res) => {
  const { date, timestamp } = req.params;
  if (!date || !timestamp) {
    return res.status(400).json({ error: 'Date and timestamp are required' });
  }
  try {
    const deleted = await deleteEggProduction({ date, timestamp });
    if (!deleted) {
      return res.status(404).json({ error: 'Egg production record not found' });
    }
    // Audit log
    try {
      await logEggProductionAudit({
        userId: req.user?.id,
        action: 'delete',
        eggProductionId: `${date}_${timestamp}`,
        details: { date, timestamp, deleted: true }
      });
    } catch (e) {
      console.error('Egg production audit log error (delete):', e);
    }
    res.json({ message: 'Egg production deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete egg production' });
  }
});

router.get('/', async (req, res) => {
  try {
    const records = await getAllEggProduction();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch egg production records' });
  }
});

export default router; 