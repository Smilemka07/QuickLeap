# QuickLeap

QuickLeap is a backend-focused full-stack web application that allows mentors and mentees to connect, publish tutorials, and communicate through a match-based messaging system.
The project focuses on authentication, relational database design, file uploads, and server-rendered application architecture.

## Features

* User authentication with session management
<img width="671" height="524" alt="image" src="https://github.com/user-attachments/assets/9bee2e75-8369-4686-9771-c13ba3496e87" />

* Role-based accounts (Mentor / Mentee)
* Editable user profiles
* Profile image upload using Multer
* Mentor–mentee matching system
* Match-based messaging system
* Tutorial publishing and viewing
* PostgreSQL relational database design
* Responsive layout for desktop, tablet, and mobile

## Tech Stack

**Backend:**
* Node.js
* Express.js
* PostgreSQL
* Passport.js
* Express-session
* Multer

**Frontend:**
* EJS
* Bootstrap
* Custom CSS

## Project Structure

```
QuickLeap
│
├── public
│   ├── styles
│   ├── images
│   └── uploads
│
├── views
│   ├── partials
│   └── pages
│
├── middleware
│
├── app.js
├── package.json
└── README.md

```

## Installation
Clone the repository
```
git clone https://github.com/yourusername/quickleap.git
cd quickleap
```

Install dependencies
```
npm install
```

Create a `.env` file
```
DATABASE_URL=your_postgres_connection_string
SESSION_SECRET=your_secret_key
```
## Run the Server
```
npm start
```

## Database Design
The application uses a relational PostgreSQL schema with foreign key relationships.

Key tables include:
* **cradentials –** user accounts and profile information
* **matches –** mentor–mentee relationship mapping
* **messages –** chat messages associated with matches
* **tutorials –** published tutorials and learning material
* **user_tutorials –** tutorial tracking for users

## Future Improvements
* Notification system
* Friend request workflow
* Additional UI polish
* Deployment optimizations

## Author
Muskan Aggarwal
[Git Hub](https://github.com/Smilemka07)
