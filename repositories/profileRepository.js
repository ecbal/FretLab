async function createProfile(client, { id, username }) {
  const result = await client.query(
    `INSERT INTO public.profiles (id, username)
     VALUES ($1, $2)
     RETURNING id, username, role, status`,
    [id, username],
  );

  return result.rows[0];
}

module.exports = {
  createProfile,
};
