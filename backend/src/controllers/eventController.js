const db = require('../config/db');

// GET /api/events
// Query params: search, category, dateFilter (all, upcoming, today, past), startDate, endDate, page, limit
async function getAllEvents(req, res) {
  try {
    const {
      search = '',
      category = '',
      dateFilter = 'all',
      startDate,
      endDate,
      status,
      page = 1,
      limit = 9,
      sortBy = 'date',
      sortOrder = 'ASC'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    // Search condition
    if (search && search.trim() !== '') {
      conditions.push('(e.title LIKE ? OR e.description LIKE ? OR e.venue LIKE ? OR e.organizer LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Category filter
    if (category && category !== 'All' && category.trim() !== '') {
      conditions.push('e.category = ?');
      params.push(category.trim());
    }

    // Status filter
    if (status && status !== 'All' && status.trim() !== '') {
      conditions.push('e.status = ?');
      params.push(status.trim());
    }

    // Date filters
    const today = new Date().toISOString().split('T')[0];
    if (dateFilter === 'upcoming') {
      conditions.push('e.date >= ?');
      params.push(today);
    } else if (dateFilter === 'today') {
      conditions.push('e.date = ?');
      params.push(today);
    } else if (dateFilter === 'past') {
      conditions.push('e.date < ?');
      params.push(today);
    }

    if (startDate) {
      conditions.push('e.date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('e.date <= ?');
      params.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total query
    const countSql = `SELECT COUNT(*) as total FROM events e ${whereClause}`;
    const [countResult] = await db.query(countSql, params);
    const total = countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    // Allowed sort columns
    const allowedSorts = ['date', 'title', 'created_at', 'capacity'];
    const validSortBy = allowedSorts.includes(sortBy) ? sortBy : 'date';
    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Current user id for registration check
    const currentUserId = req.user ? req.user.id : null;

    // Fetch paginated events with registered count and user registration status
    const eventsSql = `
      SELECT 
        e.*,
        COALESCE(r.active_registrations, 0) as registered_count,
        (e.capacity - COALESCE(r.active_registrations, 0)) as spots_left,
        CASE WHEN COALESCE(r.active_registrations, 0) >= e.capacity THEN 1 ELSE 0 END as is_full,
        ur.status as user_registration_status
      FROM events e
      LEFT JOIN (
        SELECT event_id, COUNT(*) as active_registrations 
        FROM registrations 
        WHERE status != 'Cancelled'
        GROUP BY event_id
      ) r ON e.id = r.event_id
      LEFT JOIN registrations ur ON (e.id = ur.event_id AND ur.user_id = ? AND ur.status != 'Cancelled')
      ${whereClause}
      ORDER BY e.${validSortBy} ${validSortOrder}
      LIMIT ? OFFSET ?
    `;

    const queryParams = [currentUserId, ...params, limitNum, offset];
    const [events] = await db.query(eventsSql, queryParams);

    return res.status(200).json({
      success: true,
      data: {
        events,
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
    console.error('Get all events error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve events: ' + error.message
    });
  }
}

// GET /api/events/:id
async function getEventById(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const sql = `
      SELECT 
        e.*,
        u.name as creator_name,
        COALESCE(r.active_registrations, 0) as registered_count,
        (e.capacity - COALESCE(r.active_registrations, 0)) as spots_left,
        CASE WHEN COALESCE(r.active_registrations, 0) >= e.capacity THEN 1 ELSE 0 END as is_full,
        ur.status as user_registration_status,
        ur.registration_date as user_registered_at
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN (
        SELECT event_id, COUNT(*) as active_registrations 
        FROM registrations 
        WHERE status != 'Cancelled'
        GROUP BY event_id
      ) r ON e.id = r.event_id
      LEFT JOIN registrations ur ON (e.id = ur.event_id AND ur.user_id = ? AND ur.status != 'Cancelled')
      WHERE e.id = ?
    `;

    const [events] = await db.query(sql, [currentUserId, id]);

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        event: events[0]
      }
    });
  } catch (error) {
    console.error('Get event by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event details'
    });
  }
}

// POST /api/events (Admin Only)
async function createEvent(req, res) {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      venue,
      capacity,
      organizer,
      image_url,
      status = 'Upcoming'
    } = req.body;

    // Validation
    if (!title || !description || !category || !date || !time || !venue || !capacity || !organizer) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required event fields (title, description, category, date, time, venue, capacity, organizer)'
      });
    }

    const numCapacity = parseInt(capacity, 10);
    if (isNaN(numCapacity) || numCapacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be a positive integer greater than 0'
      });
    }

    const defaultImage = image_url && image_url.trim() !== '' 
      ? image_url.trim() 
      : 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80';

    const [result] = await db.query(
      `INSERT INTO events (title, description, category, date, time, venue, capacity, organizer, image_url, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        category,
        date,
        time.trim(),
        venue.trim(),
        numCapacity,
        organizer.trim(),
        defaultImage,
        status,
        req.user.id
      ]
    );

    const newEventId = result.insertId;
    const [newEvents] = await db.query('SELECT * FROM events WHERE id = ?', [newEventId]);

    return res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      data: {
        event: newEvents[0]
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create event: ' + error.message
    });
  }
}

// PUT /api/events/:id (Admin Only)
async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      date,
      time,
      venue,
      capacity,
      organizer,
      image_url,
      status
    } = req.body;

    const [existing] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const numCapacity = capacity ? parseInt(capacity, 10) : existing[0].capacity;
    if (numCapacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be greater than 0'
      });
    }

    await db.query(
      `UPDATE events
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           category = COALESCE(?, category),
           date = COALESCE(?, date),
           time = COALESCE(?, time),
           venue = COALESCE(?, venue),
           capacity = COALESCE(?, capacity),
           organizer = COALESCE(?, organizer),
           image_url = COALESCE(?, image_url),
           status = COALESCE(?, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title ? title.trim() : null,
        description ? description.trim() : null,
        category || null,
        date || null,
        time ? time.trim() : null,
        venue ? venue.trim() : null,
        numCapacity,
        organizer ? organizer.trim() : null,
        image_url || null,
        status || null,
        id
      ]
    );

    const [updatedEvents] = await db.query('SELECT * FROM events WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully!',
      data: {
        event: updatedEvents[0]
      }
    });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update event: ' + error.message
    });
  }
}

// DELETE /api/events/:id (Admin Only)
async function deleteEvent(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Delete event (foreign keys cascade will remove registrations)
    await db.query('DELETE FROM events WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: `Event '${existing[0].title}' was successfully deleted`
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete event: ' + error.message
    });
  }
}

// GET /api/events/admin/stats (Admin Only)
async function getAdminStats(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Total Events
    const [eventsCount] = await db.query('SELECT COUNT(*) as total_events FROM events');
    
    // Total Students
    const [studentsCount] = await db.query('SELECT COUNT(*) as total_students FROM users WHERE role = "student"');

    // Total Active Registrations
    const [regCount] = await db.query('SELECT COUNT(*) as total_registrations FROM registrations WHERE status != "Cancelled"');

    // Total Attended
    const [attendedCount] = await db.query('SELECT COUNT(*) as total_attended FROM registrations WHERE status = "Attended"');

    // Upcoming Events Count
    const [upcomingCount] = await db.query('SELECT COUNT(*) as upcoming_events FROM events WHERE date >= ?', [today]);

    // Categories Distribution
    const [categoryStats] = await db.query(`
      SELECT category, COUNT(*) as count 
      FROM events 
      GROUP BY category
    `);

    // Recent Registrations
    const [recentRegistrations] = await db.query(`
      SELECT 
        r.id as registration_id,
        r.status,
        r.registration_date,
        u.name as student_name,
        u.email as student_email,
        u.student_id,
        e.id as event_id,
        e.title as event_title,
        e.date as event_date,
        e.category as event_category
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN events e ON r.event_id = e.id
      ORDER BY r.registration_date DESC
      LIMIT 6
    `);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEvents: eventsCount[0] ? eventsCount[0].total_events : 0,
          totalStudents: studentsCount[0] ? studentsCount[0].total_students : 0,
          totalRegistrations: regCount[0] ? regCount[0].total_registrations : 0,
          totalAttended: attendedCount[0] ? attendedCount[0].total_attended : 0,
          upcomingEvents: upcomingCount[0] ? upcomingCount[0].upcoming_events : 0
        },
        categoryStats,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard stats'
    });
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAdminStats
};
