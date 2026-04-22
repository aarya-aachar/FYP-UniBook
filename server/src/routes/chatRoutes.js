const express = require('express');
const { getPool } = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route GET /api/chat/conversations
 * @desc Get list of all users who have an active conversation with admins (Admin only)
 */
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const { role = 'user' } = req.query;
    const pool = getPool();
    
    // Get unique users who have sent or received messages where the other party was an admin
    const [users] = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.email, u.profile_photo,
      (SELECT message FROM messages 
       WHERE (sender_id = u.id OR receiver_id = u.id) 
       ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages 
       WHERE (sender_id = u.id OR receiver_id = u.id) 
       ORDER BY created_at DESC LIMIT 1) as last_message_time,
      (SELECT COUNT(*) FROM messages 
       WHERE sender_id = u.id 
       AND receiver_id IN (SELECT id FROM users WHERE role = 'admin') 
       AND is_read = 0) as unread_count
      FROM users u
      JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
      WHERE u.role = ?
      
      ORDER BY last_message_time DESC
    `, [role]);

    res.json(users);
  } catch (error) {
    console.error('Fetch Conversations Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route GET /api/chat/unread-total
 * @desc Get total number of unread messages for the logged-in user
 */
router.get('/unread-total', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    let query, params = [];
    if (req.user.role === 'admin') {
      const { role } = req.query;
      let senderCondition = '';
      if (role) {
         senderCondition = `AND sender_id IN (SELECT id FROM users WHERE role = '${role}')`;
      }
      query = `SELECT COUNT(*) as total FROM messages 
               WHERE receiver_id IN (SELECT id FROM users WHERE role = 'admin') 
               ${senderCondition} AND is_read = 0`;
    } else {
      // For users, count messages sent to them (is_admin_sender = 1) that are unread
      query = 'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0';
      params = [req.user.id];
    }

    const [result] = await pool.query(query, params);
    res.json({ total: result[0].total || 0 });
  } catch (error) {
    console.error('Fetch Unread Total Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route GET /api/chat/history/:otherId
 * @desc Get message history between current user and another user
 */
router.get('/history/:otherId', authenticateToken, async (req, res) => {
  try {
    let { otherId } = req.params;
    const pool = getPool();

    // If a user requests history with 'admin', or if an admin is looking at a user's history
    // We want all messages between that shared entity (any admin) and the user
    
    let messages;
    if (req.user.role === 'admin') {
      // Admin looking at User 'otherId'
      // Safety: If otherId is 'admin', it's an invalid self-chat request for an admin user
      if (otherId === 'admin' || isNaN(parseInt(otherId))) {
        return res.json([]);
      }
      
      [messages] = await pool.query(`
        SELECT * FROM messages 
        WHERE (sender_id = ? AND receiver_id IN (SELECT id FROM users WHERE role = 'admin')) 
           OR (receiver_id = ? AND sender_id IN (SELECT id FROM users WHERE role = 'admin'))
        ORDER BY created_at ASC
      `, [otherId, otherId]);

      // Mark messages as read: Any message FROM this user TO any admin
      await pool.query(
        `UPDATE messages SET is_read = 1 
         WHERE sender_id = ? 
         AND is_admin_sender = 0
         AND is_read = 0`,
        [otherId]
      );
    } else {
      // User looking at Admin history
      [messages] = await pool.query(`
        SELECT * FROM messages 
        WHERE (sender_id = ? AND receiver_id IN (SELECT id FROM users WHERE role = 'admin')) 
           OR (receiver_id = ? AND is_admin_sender = 1)
        ORDER BY created_at ASC
      `, [req.user.id, req.user.id]);

      // Mark messages as read: Any message FROM any admin TO this user
      await pool.query(
        'UPDATE messages SET is_read = 1 WHERE is_admin_sender = 1 AND receiver_id = ? AND is_read = 0',
        [req.user.id]
      );
    }

    res.json(messages);
  } catch (error) {
    console.error('Fetch History Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route POST /api/chat/send
 * @desc Send a message to another user (Admin routing for standard users)
 */
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const pool = getPool();

    let targetReceiverId = receiverId;

    // If a non-admin is sending a message without a specific receiver, find the first admin
    if (req.user.role !== 'admin' && !targetReceiverId) {
      const [admins] = await pool.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
      if (admins.length === 0) {
        return res.status(404).json({ message: 'No administrators available to receive messages.' });
      }
      targetReceiverId = admins[0].id;
    }

    if (!targetReceiverId) {
      return res.status(400).json({ message: 'Receiver ID is required.' });
    }

    const isAdminSender = req.user.role === 'admin' ? 1 : 0;

    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message, is_admin_sender) VALUES (?, ?, ?, ?)',
      [req.user.id, targetReceiverId, message, isAdminSender]
    );

    res.status(201).json({
      id: result.insertId,
      sender_id: req.user.id,
      receiver_id: targetReceiverId,
      message,
      is_admin_sender: isAdminSender,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
