const db = require('../config/db');

// POST /api/registrations/:eventId
// Student registers for an event
async function registerForEvent(req, res) {
  try {
    const { eventId } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    // 1. Fetch event and check existence
    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = events[0];

    // Check if event is cancelled
    if (event.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register: This event has been cancelled by organizers'
      });
    }

    // 2. Check if student already has a registration record
    const [existingRegs] = await db.query(
      'SELECT id, status FROM registrations WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );

    if (existingRegs.length > 0) {
      const currentReg = existingRegs[0];
      if (currentReg.status === 'Registered' || currentReg.status === 'Attended') {
        return res.status(409).json({
          success: false,
          message: 'You are already registered for this event'
        });
      }
    }

    // 3. Check event capacity against active registrations
    const [activeCountResult] = await db.query(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != "Cancelled"',
      [eventId]
    );

    const activeCount = activeCountResult[0] ? activeCountResult[0].count : 0;

    if (activeCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: `This event is currently full (${event.capacity}/${event.capacity} seats filled). No spots remaining.`
      });
    }

    // 4. Insert or Reactivate registration
    let registrationId;
    if (existingRegs.length > 0 && existingRegs[0].status === 'Cancelled') {
      // Reactivate cancelled registration
      await db.query(
        `UPDATE registrations 
         SET status = 'Registered', notes = COALESCE(?, notes), registration_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [notes ? notes.trim() : null, existingRegs[0].id]
      );
      registrationId = existingRegs[0].id;
    } else {
      try {
        const [insertResult] = await db.query(
          `INSERT INTO registrations (user_id, event_id, status, notes)
           VALUES (?, ?, 'Registered', ?)`,
          [userId, eventId, notes ? notes.trim() : null]
        );
        registrationId = insertResult.insertId;
      } catch (dbErr) {
        // Handle database-level UNIQUE constraint violation
        if (dbErr.code === 'ER_DUP_ENTRY' || dbErr.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({
            success: false,
            message: 'You are already registered for this event (enforced by DB constraint)'
          });
        }
        throw dbErr;
      }
    }

    // Return the newly created/activated registration with event info
    const [fullReg] = await db.query(
      `SELECT r.*, e.title as event_title, e.date as event_date, e.time as event_time, e.venue as event_venue, e.category as event_category
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.id = ?`,
      [registrationId]
    );

    return res.status(201).json({
      success: true,
      message: `Successfully registered for '${event.title}'!`,
      data: {
        registration: fullReg[0]
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process registration: ' + error.message
    });
  }
}

// PUT /api/registrations/:eventId/cancel
// Student cancels their registration
async function cancelRegistration(req, res) {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const [existing] = await db.query(
      'SELECT id, status FROM registrations WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );

    if (existing.length === 0 || existing[0].status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'No active registration found to cancel for this event'
      });
    }

    await db.query(
      "UPDATE registrations SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [existing[0].id]
    );

    return res.status(200).json({
      success: true,
      message: 'Registration successfully cancelled'
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel registration'
    });
  }
}

// GET /api/registrations/my-registrations
// Current student's registrations with pagination & filters
async function getMyRegistrations(req, res) {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10, search = '' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions = ['r.user_id = ?'];
    const params = [userId];

    if (status && status !== 'All') {
      conditions.push('r.status = ?');
      params.push(status);
    }

    if (search && search.trim() !== '') {
      conditions.push('(e.title LIKE ? OR e.venue LIKE ? OR e.category LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Total count
    const [countRes] = await db.query(
      `SELECT COUNT(*) as total FROM registrations r JOIN events e ON r.event_id = e.id ${whereClause}`,
      params
    );
    const total = countRes[0] ? countRes[0].total : 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    // Fetch records
    const [registrations] = await db.query(
      `SELECT 
        r.id as registration_id,
        r.status as registration_status,
        r.registration_date,
        r.notes,
        e.id as event_id,
        e.title,
        e.description,
        e.category,
        e.date,
        e.time,
        e.venue,
        e.capacity,
        e.organizer,
        e.image_url,
        e.status as event_status
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       ${whereClause}
       ORDER BY r.registration_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        registrations,
        pagination: {
          total,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get my registrations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve registrations'
    });
  }
}

// GET /api/registrations/events/:eventId/participants (Admin Only)
// View participants for an event with pagination and status filters
async function getEventParticipants(req, res) {
  try {
    const { eventId } = req.params;
    const { status, search = '', page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Check event exists
    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const conditions = ['r.event_id = ?'];
    const params = [eventId];

    if (status && status !== 'All') {
      conditions.push('r.status = ?');
      params.push(status);
    }

    if (search && search.trim() !== '') {
      conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.student_id LIKE ? OR u.department LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Total count
    const [countRes] = await db.query(
      `SELECT COUNT(*) as total FROM registrations r JOIN users u ON r.user_id = u.id ${whereClause}`,
      params
    );
    const total = countRes[0] ? countRes[0].total : 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    // Summary counts by status for this event
    const [statusCounts] = await db.query(
      `SELECT status, COUNT(*) as count 
       FROM registrations 
       WHERE event_id = ? 
       GROUP BY status`,
      [eventId]
    );

    const summary = {
      all: 0,
      registered: 0,
      attended: 0,
      cancelled: 0
    };

    statusCounts.forEach(row => {
      summary.all += row.count;
      if (row.status === 'Registered') summary.registered = row.count;
      if (row.status === 'Attended') summary.attended = row.count;
      if (row.status === 'Cancelled') summary.cancelled = row.count;
    });

    // Fetch participants
    const [participants] = await db.query(
      `SELECT 
        r.id as registration_id,
        r.status as registration_status,
        r.registration_date,
        r.notes,
        u.id as user_id,
        u.name as student_name,
        u.email as student_email,
        u.student_id,
        u.department,
        u.phone,
        u.avatar_url
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       ${whereClause}
       ORDER BY r.registration_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        event: events[0],
        summary,
        participants,
        pagination: {
          total,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get event participants error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event participants'
    });
  }
}

// GET /api/registrations/admin/all-participants (Admin Only)
async function getAllParticipants(req, res) {
  try {
    const { status, eventId, search = '', page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (eventId && eventId !== 'All') {
      conditions.push('r.event_id = ?');
      params.push(eventId);
    }

    if (status && status !== 'All') {
      conditions.push('r.status = ?');
      params.push(status);
    }

    if (search && search.trim() !== '') {
      conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.student_id LIKE ? OR e.title LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRes] = await db.query(
      `SELECT COUNT(*) as total 
       FROM registrations r 
       JOIN users u ON r.user_id = u.id 
       JOIN events e ON r.event_id = e.id 
       ${whereClause}`,
      params
    );
    const total = countRes[0] ? countRes[0].total : 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    const [participants] = await db.query(
      `SELECT 
        r.id as registration_id,
        r.status as registration_status,
        r.registration_date,
        r.notes,
        u.id as user_id,
        u.name as student_name,
        u.email as student_email,
        u.student_id,
        u.department,
        u.phone,
        e.id as event_id,
        e.title as event_title,
        e.date as event_date,
        e.category as event_category
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       JOIN events e ON r.event_id = e.id
       ${whereClause}
       ORDER BY r.registration_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        participants,
        pagination: {
          total,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all participants error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve participants'
    });
  }
}

// PATCH /api/registrations/:id/status (Admin Only)
// Update registration status: Registered | Attended | Cancelled
async function updateRegistrationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Registered', 'Attended', 'Cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }

    const [existing] = await db.query('SELECT * FROM registrations WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found'
      });
    }

    await db.query(
      'UPDATE registrations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    const [updated] = await db.query(
      `SELECT r.*, u.name as student_name, e.title as event_title 
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       JOIN events e ON r.event_id = e.id
       WHERE r.id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: `Registration status updated to '${status}'`,
      data: {
        registration: updated[0]
      }
    });
  } catch (error) {
    console.error('Update registration status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update registration status'
    });
  }
}

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventParticipants,
  getAllParticipants,
  updateRegistrationStatus
};
