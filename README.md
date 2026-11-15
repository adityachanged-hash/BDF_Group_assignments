# 🎭 CostumeCloset Theatre — Backend API

**BDF Group Assignment · PD-CSEDS2A-G08**  
Backend Development Fundamentals · Modules 1 to 3 · 100 marks

---

## 📌 Project Overview

> *"We hire out costumes before every show. We lose track of which costume is with which actor, and returns come back late. Please build us a system that fixes this."*

A RESTful Express + SQLite backend for managing costume hires at the CostumeCloset Theatre.

---

## ⚙️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | HTTP server & routing |
| better-sqlite3 | SQLite database |

---

## 🗄️ Database Schema

Three related tables:

```
actors
  id          INTEGER PRIMARY KEY AUTOINCREMENT
  name        TEXT NOT NULL UNIQUE
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP

costumes
  id          INTEGER PRIMARY KEY AUTOINCREMENT
  name        TEXT NOT NULL UNIQUE
  era         TEXT NOT NULL
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP

hires
  id           INTEGER PRIMARY KEY AUTOINCREMENT
  actor_id     INTEGER NOT NULL → actors(id)
  costume_id   INTEGER NOT NULL → costumes(id)
  hire_date    TEXT NOT NULL (YYYY-MM-DD)
  return_date  TEXT (YYYY-MM-DD, nullable)
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
```

---

## 🚀 How to Run

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Server runs at: **http://localhost:3000**

---

## 📡 API Endpoints

### Health Check
| Method | Route | Description | Status |
|---|---|---|---|
| GET | `/` | API info & available routes | 200 |

### Actors `/actors`
| Method | Route | Description | Status |
|---|---|---|---|
| GET | `/actors` | Get all actors | 200 |
| GET | `/actors/:id` | Get one actor | 200 / 404 |
| POST | `/actors` | Add actor `{ name }` | 201 / 400 |
| PUT | `/actors/:id` | Update actor `{ name }` | 200 / 400 / 404 |
| DELETE | `/actors/:id` | Delete actor | 200 / 404 |

### Costumes `/costumes`
| Method | Route | Description | Status |
|---|---|---|---|
| GET | `/costumes` | Get all costumes | 200 |
| GET | `/costumes?era=Victorian` | Search costumes by era | 200 |
| GET | `/costumes/:id` | Get one costume | 200 / 404 |
| POST | `/costumes` | Add costume `{ name, era }` | 201 / 400 |
| PUT | `/costumes/:id` | Update costume `{ name, era }` | 200 / 400 / 404 |
| DELETE | `/costumes/:id` | Delete costume | 200 / 404 |
| **GET** | **`/costumes/top`** | **Top 3 most hired costumes (Twist)** | **200** |

### Hires `/hires`
| Method | Route | Description | Status |
|---|---|---|---|
| GET | `/hires` | Get all hires (JOIN: actor name + costume name) | 200 |
| GET | `/hires/:id` | Get one hire | 200 / 404 |
| POST | `/hires` | Create hire `{ actor_id, costume_id, hire_date? }` | 201 / 400 |
| PUT | `/hires/:id` | Update hire | 200 / 400 / 404 |
| DELETE | `/hires/:id` | Delete hire | 200 / 404 |

---

## ⭐ Twist — Top 3 Most Hired Costumes

**`GET /costumes/top`**

Returns the 3 costumes that appear in the most hire records, with their hire counts.  
Uses a **JOIN** and **GROUP BY** query. Ties are sorted alphabetically.

**Example response:**
```json
[
  { "id": 1, "name": "Knight Armour", "era": "Medieval", "hire_count": 5 },
  { "id": 2, "name": "Ball Gown",     "era": "Victorian", "hire_count": 3 },
  { "id": 3, "name": "Space Suit",    "era": "Futuristic", "hire_count": 1 }
]
```

**Test Cases:**
- ✅ **Test 1**: Create several hires → `201` each  
- ✅ **Test 2**: `GET /costumes/top` → `200`, 3 costumes, highest count first  
- ✅ **Test 3**: Only 2 costumes used → `200`, just 2 results  

---

## ✅ Validation

All `POST` and `PUT` requests are validated:

- **Actors**: `name` required (non-empty string)
- **Costumes**: `name` and `era` both required (non-empty strings)
- **Hires**: `actor_id` and `costume_id` required (valid numbers); dates must be `YYYY-MM-DD`

**Validation error example (400):**
```json
{
  "error": "Validation failed",
  "details": ["'era' is required and must be a non-empty string"]
}
```

---

## 🔍 Search

Search costumes by era using a query parameter:

```
GET /costumes?era=Victorian
GET /costumes?era=Medieval
GET /costumes?era=Futuristic
```

---

## 📮 Postman Collection

Import `CostumeCloset_Theatre.postman_collection.json` into Postman.

The collection includes:
- All CRUD endpoints for actors, costumes, hires
- Validation error test cases (400 responses)
- Search by era
- ⭐ Twist test sequence (Test 1, 2, 3)

---

## 📁 Project Structure

```
BDF_GROUP/
├── server.js                                   # Express app entry point
├── database.js                                 # SQLite setup & schema
├── routes/
│   ├── actors.js                               # Actor routes
│   ├── costumes.js                             # Costume routes (incl. /top)
│   └── hires.js                               # Hire routes (incl. join)
├── package.json
├── CostumeCloset_Theatre.postman_collection.json
└── README.md
```

---

## 👥 Who Does What (Group Parts)

| Part | Responsibility |
|---|---|
| 1 — Server & routes | Express setup, routes, status codes |
| 2 — Database | The 3 tables and the queries |
| 3 — REST endpoints | CRUD and the join endpoint |
| 4 — Validation & search | Input checks, messages, search |
| 5 — Twist rule | Make the 3 tests above pass |
| 6 — Postman & README | Test collection and how to run |

---

*Pavan D · Section CSEDS2A · Group 8 of 16 · Card 188 of 375*
