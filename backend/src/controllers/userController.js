const pool = require("../config/db");

// Request Organizer Role
exports.requestOrganizer = async (req, res) => {
  try {
    await pool.query(
      `UPDATE users SET role='ORGANIZER_PENDING', updated_at=NOW() WHERE id=$1`,
      [req.user.id]
    );

    res.json({ message: "Organizer request submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Super Admin: Approve Organizer
exports.approveOrganizer = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE users SET role='ORGANIZER', updated_at=NOW() WHERE id=$1 RETURNING *`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "Organizer approved successfully",
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Super Admin: Update User Role
exports.updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  try {
    // Validate role
    const validRoles = ['SUPER_ADMIN', 'ORGANIZER', 'ORGANIZER_PENDING', 'PARTICIPANT'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ 
        message: "Invalid role. Must be one of: SUPER_ADMIN, ORGANIZER, ORGANIZER_PENDING, PARTICIPANT" 
      });
    }

    const result = await pool.query(
      `UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: `User role updated to ${role} successfully`,
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Super Admin: Get Pending Organizer Requests
exports.getPendingOrganizers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, company, designation, created_at 
       FROM users 
       WHERE role='ORGANIZER_PENDING'
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Current User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, linkedin_url, company, designation, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
  const { name, linkedin_url, company, designation } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           linkedin_url = COALESCE($2, linkedin_url),
           company = COALESCE($3, company),
           designation = COALESCE($4, designation),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, role, linkedin_url, company, designation`,
      [name, linkedin_url, company, designation, req.user.id]
    );

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get User's Joined Events
exports.getMyJoinedEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, ep.joined_at, ep.join_method,
       u.name as organizer_name,
       (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count
       FROM event_participants ep
       JOIN events e ON ep.event_id = e.id
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE ep.user_id = $1 AND e.status = 'APPROVED'
       ORDER BY ep.joined_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Public User Profile by ID
exports.getPublicUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, name, email, linkedin_url, company, designation, role
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};