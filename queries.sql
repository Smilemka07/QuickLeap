-- users table

CREATE TABLE cradentials (
 id SERIAL PRIMARY KEY,
 user_name TEXT NOT NULL,
 email TEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL,
 role TEXT CHECK (role IN ('Mentor', 'Mentee')) NOT NULL,
 bio TEXT,
 skills TEXT[], 
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE cradentials
ADD COLUMN profile_photo TEXT;


-- requests

CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  requester_id INT REFERENCES cradentials(id) ON DELETE CASCADE,
  receiver_id INT REFERENCES cradentials(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('Pending', 'Accepted', 'Rejected')) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--matches

CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  mentor_id INT REFERENCES cradentials(id) ON DELETE CASCADE,
  mentee_id INT REFERENCES cradentials(id) ON DELETE CASCADE,
  match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--messages

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  match_id INT REFERENCES matches(id) ON DELETE CASCADE,
  sender_id INT REFERENCES cradentials(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;


CREATE TABLE tutorials (
  id SERIAL PRIMARY KEY,
  creator_id INT REFERENCES cradentials(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(10) CHECK (content_type IN ('video','notes')),
  video_url TEXT,
  notes TEXT,
  thumbnail TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- watched tutorials 

CREATE TABLE user_tutorials (
  id SERIAL PRIMARY KEY,
  watcher_id INT REFERENCES cradentials(id) ON DELETE CASCADE,
  watched_tutorial_id INT REFERENCES tutorials(id) ON DELETE CASCADE,
  watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);