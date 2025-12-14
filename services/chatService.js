import dotenv from "dotenv";
dotenv.config();
import pg from "pg";

// database
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

async function getChatList (userId) {
  const listQuery = `
    SELECT 
     m.id AS match_id,  

    CASE
     WHEN m.mentor_id = $1 THEN mentee.id
     ELSE mentor.id
    END AS friend_id,

    CASE
     WHEN m.mentor_id = $1 THEN mentee.user_name
     ELSE mentor.user_name
    END AS friend_name,

    CASE
     WHEN m.mentor_id = $1 THEN mentee.profile_photo
     ELSE mentor.profile_photo
    END AS friend_pfp,

    CASE
     WHEN m.mentor_id = $1 THEN mentee.skills
     ELSE mentor.skills
    END AS friend_skills,

     msg.content AS last_message,
     msg.sent_at AS last_message_time,
     msg.sender_id AS last_message_sender

    FROM matches m 
     JOIN cradentials mentor ON m.mentor_id = mentor.id
     JOIN cradentials mentee ON m.mentee_id = mentee.id 

     LEFT JOIN LATERAL (
     SELECT content, sent_at, sender_id
     FROM messages
     WHERE match_id = m.id
     ORDER BY sent_at DESC
     LIMIT 1
     ) msg ON true

    WHERE m.mentor_id = $1 or m.mentee_id = $1

    ORDER BY last_message_time DESC NULLS LAST;
    `
  const listResult = await db.query(listQuery, [userId]);
  return listResult.rows;
}

export {getChatList}