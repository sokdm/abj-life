# ABJ Life Style

A phase-one multiplayer-ready Nigerian life simulation game prototype built with Next.js, MongoDB, Mongoose and a premium dark game interface.

## Implemented in this phase

- Landing page
- Email, username and password registration
- Login and HTTP-only JWT session cookie
- Character creation
- Player dashboard
- Player profile
- Wallet with deposit and withdrawal
- Basic Abuja map with locked districts
- Basic job system
- Phase 2 living world dashboard
- 2.5D ABJ Starter Apartment scene
- Socket.IO location rooms, presence and local chat
- Travel system with district requirements
- ABJ ONE phone interface
- Bank transfers with idempotency protection
- Notifications, direct-message and friendship foundations
- MongoDB connection, Mongoose models and service layer
- Admin action-log foundation

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and set:

```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
COOKIE_NAME=abj_session
```

3. Run the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

`npm run dev` starts `server.js`, which runs Next.js and Socket.IO on the same port.

## Testing From A Phone On The Same Wi-Fi

Run:

```bash
npm run dev:network
```

The server prints both:

- `Local: http://localhost:3000`
- `Network: http://YOUR_LAN_IP:3000`

Connect your phone to the same Wi-Fi and open the printed Network URL. Do not expose `.env.local` or create a public tunnel for local testing.

## Development Seed

Run this only when you explicitly want to check seed/catalog wiring:

```bash
npm run seed:dev
```

The current economy catalog is code-defined in `lib/economy.js`; the seed command does not overwrite production data.

Currency changes are handled by API routes and persisted server-side. Do not hardcode secrets or MongoDB credentials.
