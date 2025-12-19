import express from "express";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import dotenv from "dotenv";
dotenv.config();
import pg from "pg";
import { getChatList } from "./services/chatService.js";
import flash from "connect-flash";

const app = express();
const port = 3000;
const saltRounds = 10;

//express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

//order is imp
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// database
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

//routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login", {
    error: req.flash("error"),
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// dashboard

const quickTips = [
  "Add your top 3 skills to get better matches.",
  "Profiles with photos get more replies.",
  "Be specific in your bio to build trust.",
  "Replying quickly improves match quality.",
];

const didYouKnow = [
  "Mentors who list skills get 2× more views.",
  "Short bios perform better than long ones.",
  "Consistent activity improves recommendations.",
];

app.get("/dashboard", async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query(
      `SELECT COUNT(*) AS total
       FROM matches 
       WHERE mentor_id = $1 OR mentee_id = $1`,
      [req.user.id]
    );

    const reqResult = await db.query(
      `SELECT COUNT(*) AS total FROM requests WHERE receiver_id = $1 AND status = 'Pending'`,
      [req.user.id]
    );

    const messageResult = await db.query(
      `SELECT COUNT(*) AS total FROM messages WHERE match_id IN (
         SELECT id FROM matches WHERE match_id = $1 OR sender_id = $1 )
       AND sender_id != $1
       AND is_read = false`,
      [req.user.id]
    );

    const matchesQuery = ` 
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
    END AS friend_skills

    FROM matches m 
     JOIN cradentials mentor ON m.mentor_id = mentor.id
     JOIN cradentials mentee ON m.mentee_id = mentee.id 
    WHERE m.mentor_id = $1 or m.mentee_id = $1
    `;

    const matchesResult = await db.query(matchesQuery, [req.user.id]);

    const randomTip = quickTips[Math.floor(Math.random() * quickTips.length)];
    const randomFacts =
      didYouKnow[Math.floor(Math.random() * didYouKnow.length)];

    const watchedQuery = `
      SELECT DISTINCT ON (t.id)
       t.*, ut.watched_at
      FROM tutorials t
      JOIN user_tutorials ut
       ON t.id = ut.watched_tutorial_id
      WHERE ut.watcher_id = $1
      ORDER BY t.id, ut.watched_at DESC;
      `;

    const watchedResult = await db.query(watchedQuery, [req.user.id]);

    req.session.userId = req.user.id;

    const matchesCount = result.rows[0].total;
    const reqCount = reqResult.rows[0].total;
    const messageCount = messageResult.rows[0].total;

    const matchesList = matchesResult.rows;
    const watchedTutorials = watchedResult.rows;
    
    const newMatchesCount = `SELECT COUNT(*) 
FROM matches
WHERE (mentor_id = $1 OR mentee_id = $1)
AND created_at >= NOW() - INTERVAL '7 days';
`;

const unreadMessages = `SELECT COUNT(*)
FROM messages msg
JOIN matches m ON msg.match_id = m.id
WHERE (m.mentor_id = $1 OR m.mentee_id = $1)
AND msg.sender_id != $1
AND msg.sent_at >= NOW() - INTERVAL '3 days';
`;
    let highlight = null;
     
    if (newMatchesCount > 0) {
      highlight = `You have ${newMatchesCount} new matches`;
    } else if (unreadMessages > 0) {
      highlight = `You have ${unreadMessages} unread messages`;
    } else {
      highlight = "You're all caught up 🎉";
    }

    res.render("dashboard", {
      user: req.user,
      currentPage: "dashboard",
      stats: {
        matches: matchesCount,
        requests: reqCount,
        messages: messageCount,
      },
      matches: matchesList,
      tutorials: watchedTutorials,
      quickTip: randomTip,
      didYouKnow: randomFacts,
      highlight,
    });
  } else {
    res.redirect("/login");
  }
});

//create tutorials and create tutorials tab
app.get("/tutorials", (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  res.render("tutorials", { currentPage: "tutorials" });
});

app.post("/createTutorial", async (req, res) => {
  const { title, description, content_type, video_url, notes, thumbnail } =
    req.body;

  const creator_id = req.session.userId;

  try {
    const query = `
      INSERT INTO tutorials 
       (creator_id, title, description, content_type, video_url, notes, thumbnail)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [
      creator_id,
      title,
      description,
      content_type,
      content_type === "video" ? video_url : null,
      content_type === "notes" ? notes : null,
      thumbnail || "/images/rabit.jpg",
    ];

    const result = await db.query(query, values);

    res.redirect("/profile");
  } catch (err) {
    console.error("Error creating tutorial:", err);
    res.status(500).send("Something went wrong while creating the tutorial.");
  }
});

//messages tab

app.post("/messages", async (req, res) => {
  const { content, match_id } = req.body;
  const sender_id = req.user.id;

  try {
    const query = `
      INSERT INTO messages (match_id, sender_id, content)
      VALUES ($1, $2, $3)
    `;

    await db.query(query, [match_id, sender_id, content]);

    res.redirect(`/messages/${match_id}`);
  } catch (err) {
    console.error("Messages Error", err);
    res.status(500).send("Error sending message");
  }
});

app.get("/messages", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const list = await getChatList(req.user.id);

    res.render("messages", { currentPage: "messages", matches: list });
  } catch (err) {
    console.error("List error", err);
    res.status(500).send("Error loading matches list");
  }
});

app.get("/messages/:matchId", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const list = await getChatList(req.user.id);
    const messagesQuery = `SELECT
    msg.id,
    msg.sender_id,
    c.user_name AS sender_name,
    c.profile_photo AS sender_pfp,
    msg.content,
    msg.sent_at
   FROM messages msg
   JOIN cradentials c ON msg.sender_id = c.id
   WHERE msg.match_id = $1
   ORDER BY msg.sent_at ASC;`;

    const matchId = req.params.matchId;
    const messagesResult = await db.query(messagesQuery, [matchId]);
    const messages = messagesResult.rows;

    console.table(messagesResult.rows);

    const activeMatch = list.find((item) => item.match_id == matchId);

    res.render("messages", {
      currentPage: "messages",
      matchId: matchId,
      messages: messages,
      matches: list,
      user: req.user,
      name: activeMatch ? activeMatch.friend_name : null,
    });
  } catch (err) {
    console.log("Chat error", err);
    res.status(500).send("Error loading the conversation..");
  }
});

//search tab
app.get("/search", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  const searchTerm = req.query.query?.toLowerCase() || "";

  try {
    let users = [];
    let tutorials = [];

    if (searchTerm) {
      // Search in users
      const userResult = await db.query(
        `SELECT id, user_name, profile_photo, skills 
        FROM cradentials 
         WHERE LOWER(user_name) LIKE $1 
          OR LOWER(skills::text) LIKE $1`,
        [`%${searchTerm}%`]
      );

      users = userResult.rows;

      // Search in tutorials
      const tutResult = await db.query(
        `SELECT id, title, description, thumbnail 
         FROM tutorials 
         WHERE LOWER(title) LIKE $1 
          OR LOWER(description) LIKE $1`,
        [`%${searchTerm}%`]
      );

      tutorials = tutResult.rows;
    }

    res.render("search", {
      currentPage: "search",
      users,
      tutorials,
      searchTerm,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.send(500).status("Error performing search");
  }
});

//profile tab
app.get("/profile", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/login");
    }

    const creator_id = req.session.userId;
    const result = await db.query(
      "SELECT * FROM tutorials WHERE creator_id = $1",
      [creator_id]
    );

    res.render("profile", {
      user: req.user,
      tutorials: result.rows,
      isOwnProfile: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading profile");
  }
});

// other users profile tab

app.get("/profile/view/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.user) {
      return res.redirect("/login");
    }

    const userResult = await db.query(
      "SELECT * FROM cradentials WHERE id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const profileUser = userResult.rows[0];

    const tutorialResult = await db.query(
      "SELECT * FROM tutorials WHERE creator_id = $1",
      [id]
    );

    const isOwnProfile = req.session.userId === profileUser.id;

    res.render("profile", {
      user: profileUser,
      tutorials: tutorialResult.rows,
      isOwnProfile,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error Loading Profile!");
  }
});

//view tutorial
app.get("/tutorial/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tutorialResult = await db.query(
      "SELECT * FROM tutorials WHERE id = $1",
      [id]
    );

    if (tutorialResult.rows.length === 0) {
      return res.status(404).send("Tutorial not found");
    }

    const tutorial = tutorialResult.rows[0];

    // Log watch (optional for now if table is empty)
    if (req.user) {
      await db.query(
        "INSERT INTO user_tutorials (watcher_id, watched_tutorial_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [req.user.id, id]
      );
    }

    res.render("view", { user: req.user, tutorial });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading tutorial");
  }
});

// login and register post routes
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: "Wrong credentials, please try again",
  })
);

app.post("/register", async (req, res) => {
  const userName = req.body.name;
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userRole = req.body.role;
  const userBio = req.body.bio;
  const userPfp = req.body.pfp;
  const userSkills = req.body.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (userBio.length > 200) {
    return res.status(400).send("Bio too long");
  }

  try {
    const checkResult = await db.query(
      "SELECT * FROM cradentials WHERE email = $1",
      [userEmail]
    );

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      //password hashing
      bcrypt.hash(userPassword, saltRounds, async (err, hash) => {
        if (err) {
          console.log("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO cradentials (user_name, email, password_hash, role, bio, skills, profile_photo) VALUES ($1,$2,$3,$4,$5,$6,$7)",
            [userName, userEmail, hash, userRole, userBio, userSkills, userPfp]
          );

          console.log(result);
          res.redirect("/login");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

passport.use(
  new Strategy({ usernameField: "email" }, async function verify(
    email,
    password,
    done
  ) {
    try {
      const result = await db.query(
        "SELECT * FROM cradentials WHERE email = $1",
        [email]
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password_hash;

        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            //Error with password check
            console.error("Error comparing passwords:", err);
            return done(err);
          } else {
            if (valid) {
              //Passed password check
              return done(null, user);
            } else {
              //Did not pass password check
              return done(null, false);
            }
          }
        });
      } else {
        return done(null, false, {
          message: "Wrong credentials, please try again",
        });
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}`);
});
