# QuickLeap

QuickLeap is a backend-focused full-stack web application that allows mentors and mentees to connect, publish tutorials, and communicate through a match-based messaging system.
The project focuses on authentication, relational database design, file uploads, and server-rendered application architecture.

## Features

* User authentication with session management
Landing Screen - 
<img width="669" height="490" alt="image" src="https://github.com/user-attachments/assets/7e34bab0-d281-4ecd-bc0f-14546f9a062b" />

Registration SCreen - 
<img width="1356" height="601" alt="image" src="https://github.com/user-attachments/assets/4cb26d6f-b575-4eea-8cd8-f02d6f94673f" />

Login SCreen with required warnings on wrong cradentials - 
<img width="1226" height="581" alt="image" src="https://github.com/user-attachments/assets/715b0c88-10ba-4046-ac55-1d019d4ad1b2" />

* Role-based accounts (Mentor / Mentee)
* Editable user profiles

<img width="1243" height="613" alt="image" src="https://github.com/user-attachments/assets/08010073-1108-4e90-9b10-476fcb63e785" />

* Mentor–mentee matching system
* Match-based messaging system

  <img width="1354" height="623" alt="image" src="https://github.com/user-attachments/assets/f9109111-e1a1-4a58-b909-053976881065" />

* Tutorial publishing and viewing

<img width="1348" height="635" alt="image" src="https://github.com/user-attachments/assets/64ded779-51c4-47d3-a39a-b940cb648208" />

<img width="1318" height="623" alt="image" src="https://github.com/user-attachments/assets/cacd7bca-4e4a-4864-a3b4-7b2a21b03ae1" />

<img width="1362" height="632" alt="image" src="https://github.com/user-attachments/assets/425b5495-a0e2-43ce-a2b0-84b9fea0900a" />

* PostgreSQL relational database design
* Responsive layout for desktop, tablet, and mobile
  Dashboard- 
<img width="1365" height="629" alt="image" src="https://github.com/user-attachments/assets/8990f840-3769-469b-904d-74e55f4bd155" />

<img width="1365" height="633" alt="image" src="https://github.com/user-attachments/assets/9ddb24b6-27ab-4a99-858b-f0e987c25205" />

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
