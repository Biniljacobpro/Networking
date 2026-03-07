const pool = require("../config/db");

exports.syncUser = async (req, res) => {
  const { uid, email, name } = req.body;

  try {
    // First, check if user exists by firebase_uid (for users who already have it)
    const userByUid = await pool.query(
      "SELECT * FROM users WHERE firebase_uid = $1",
      [uid]
    );

    if (userByUid.rows.length > 0) {
      // User exists with firebase_uid, update their info
      const result = await pool.query(
        `UPDATE users 
         SET email = $1, name = $2, updated_at = NOW()
         WHERE firebase_uid = $3
         RETURNING *`,
        [email, name, uid]
      );
      return res.json({ 
        message: "User synced successfully",
        user: result.rows[0]
      });
    }

    // Check if user exists by email (for existing users without firebase_uid)
    const userByEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userByEmail.rows.length > 0) {
      // Existing user found by email - update their firebase_uid
      const result = await pool.query(
        `UPDATE users 
         SET firebase_uid = $1, name = $2, updated_at = NOW()
         WHERE email = $3
         RETURNING *`,
        [uid, name, email]
      );
      return res.json({ 
        message: "User migrated to Firebase UID successfully",
        user: result.rows[0]
      });
    }

    // No existing user - create new one with firebase_uid
    const result = await pool.query(
      `INSERT INTO users (firebase_uid, email, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [uid, email, name, "PARTICIPANT"]
    );
    return res.status(201).json({ 
      message: "User created successfully",
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Error syncing user:", err);
    res.status(500).json({ error: err.message });
  }
};