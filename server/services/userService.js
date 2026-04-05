const { pool } = require('../config/db');

const findByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
};

const create = async ({ email, passwordHash, name }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, plan, created_at`,
    [email, passwordHash, name || null],
  );
  return rows[0];
};

const updateProfile = async (id, { name, email }) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(name);
  }
  if (email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(email);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  fields.push(`updated_at = now()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, email, name, plan`,
    values,
  );
  return rows[0];
};

const updatePassword = async (id, passwordHash) => {
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2',
    [passwordHash, id],
  );
};

const updatePlan = async (id, plan, stripeCustomerId) => {
  await pool.query(
    'UPDATE users SET plan = $1, stripe_customer_id = $2, updated_at = now() WHERE id = $3',
    [plan, stripeCustomerId, id],
  );
};

const deleteUser = async (id) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};

module.exports = {
  findByEmail,
  findById,
  create,
  updateProfile,
  updatePassword,
  updatePlan,
  deleteUser,
};
