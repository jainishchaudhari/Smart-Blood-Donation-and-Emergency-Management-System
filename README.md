# LifeFlow – Smart Blood Donation and Emergency Management System

LifeFlow connects patients, blood donors and hospitals. A requester posts an emergency blood request with the hospital location on a map. LifeFlow finds compatible, available donors nearby, sorted by distance, and lets the requester contact them one by one until a donor accepts.

Built with the MERN stack: **MongoDB, Express, React (Vite), Node.js**, with **Leaflet + OpenStreetMap** for maps.

## Features

- **Accounts and roles:** register and log in as User, Donor or Hospital (JWT authentication). Admin accounts are created manually (see below).
- **Donor profile:** name, phone, blood group, date of birth, city, address, availability and a location picked on a map or with browser GPS.
- **Emergency request:** patient details, blood group, units, required-by time, hospital details, urgency, notes and the hospital location on the map.
- **Requests list and map:** filter by urgency, see all requests on one map, open a full details page with directions.
- **Nearby compatible donors:** uses real blood-group compatibility (for example an O- patient can only receive O-), shows only available donors with a complete profile, filters by 5 / 10 / 25 / 50 km and sorts nearest first (MongoDB `2dsphere` geospatial query).
- **Contact donors:** send the request to the nearest donor(s). Donors see it under "Requests for you" and can accept or decline. A donor is never contacted twice for the same emergency.
- **Escalation:** if a donor declines or does not reply in time, the requester can contact the next nearest donor. The first donor to accept wins; no double assignment.
- **Progress tracking:** Pending, Accepted, In progress, Completed or Cancelled, with each donor's response (pending, accepted, rejected, expired, withdrawn).
- **Privacy:** donors appear on maps only as an approximate area. Patient contact details are shown only to the requester, the donor who accepted, and admins. The accepted donor's phone is shown to the requester only after acceptance.

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router, Leaflet, react-leaflet, lucide-react |
| Backend | Node.js, Express 5, Mongoose 9, JSON Web Tokens, bcryptjs |
| Database | MongoDB (local or Atlas) |
| Maps | Leaflet with OpenStreetMap tiles |

## Project structure

```
.
├── client/                  React + Vite frontend
│   └── src/
│       ├── components/      Navbar, MapPicker, RequestsMap, NearbyDonors, RequestProgress, ...
│       ├── pages/           Home, Login, Register, dashboards, EmergencyRequest,
│       │                    ShowRequests, RequestDetails, DonorProfile, DonorInvitations, ...
│       └── lib/             Blood group helpers
└── server/                  Express backend
    ├── config/              Database connection
    ├── controllers/         Request, donor, invitation, auth, user, hospital logic
    ├── middleware/          JWT auth and role checks
    ├── models/              User, BloodRequest, DonorInvitation, Donation
    ├── routes/              API routes
    ├── utils/               Blood compatibility, nearby donor search, request privacy
    └── server.js
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- MongoDB running locally, or a free MongoDB Atlas cluster

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Smart-Blood-Donation-and-Emergency-Management-System-main
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a file named `.env` inside the `server` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lifeflow
JWT_SECRET=replace_this_with_a_long_random_secret
INVITATION_EXPIRY_MINUTES=30
```

| Variable | Meaning |
|---|---|
| `PORT` | Port of the API server. The frontend expects `5000`. |
| `MONGO_URI` | MongoDB connection string (local or Atlas). |
| `JWT_SECRET` | Secret used to sign login tokens. Keep it private. |
| `INVITATION_EXPIRY_MINUTES` | How long a donor has to reply before the request counts as "expired". Default 30. |

Start the server:

```bash
npm run dev     # with auto-restart (nodemon)
# or
npm start
```

You should see `MongoDB connected` in the terminal.

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the address shown by Vite (usually `http://localhost:5173`).

> The frontend currently calls the API at `http://localhost:5000`. Change these URLs (or move them to an environment variable) before deploying.

### 4. Create an admin account (optional)

Public registration cannot create admins. Register a normal user, then change its `role` to `admin` in the `users` collection (for example with MongoDB Compass).

## Try the full flow

1. Register two or three **donor** accounts. For each, open **My profile**, pick a location on the map, set availability and save.
2. Register a **user** account (the requester).
3. As the requester, open **Emergency request**, fill the form and select the hospital location on the map.
4. Open the request from **Show requests → View details and map**. Check nearby donors, then press **Contact nearest donor**.
5. As a donor, open **Requests for you** and accept or decline.
6. If declined, the requester presses **Contact next nearest donor**. When a donor accepts, the requester sees the donor's details and can mark the request completed.

## API overview

All endpoints except auth require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | Register and log in |
| GET / PUT | `/api/donors/profile` | Donor's own profile and location |
| GET | `/api/donors` | Search registered donors |
| POST | `/api/requests` | Create an emergency request |
| GET | `/api/requests`, `/api/requests/:id` | List requests, request details |
| GET | `/api/requests/:id/nearby-donors?radius=10` | Compatible donors near the request |
| POST / GET | `/api/requests/:id/invitations` | Send the request to donors / see who was contacted |
| PATCH | `/api/requests/:id/status` | Mark `in_progress`, `completed` or `cancelled` |
| GET | `/api/invitations/my` | Requests sent to the logged-in donor |
| PATCH | `/api/invitations/:id/accept`, `/reject`, `/withdraw` | Donor answers a request |

## Notes and limitations

- Browser GPS ("Use My Current Location") works only on HTTPS or `localhost`.
- There are no email, SMS or push notifications yet; donors see new requests on the "Requests for you" page, which refreshes automatically.
- `GET /api/donors` (used by Find Blood) still returns donor phone numbers to any logged-in user.
- Rate limiting is not implemented yet.
- Map tiles come from the public OpenStreetMap servers. Heavy production use needs a tile provider that allows it.

## Contributing

Pull requests are welcome. For larger changes, please open an issue first to discuss what you would like to change.

## License

No license has been added yet. Add a `LICENSE` file (for example MIT) if you want others to reuse the project.