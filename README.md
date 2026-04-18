<<<<<<< HEAD
# 🪙 Opinifi — Opinions That Pay

> Share opinions across sports, news, politics, tech & brands. Earn OP Coins. Redeem for real cash via UPI or Bank Transfer.

**10 OP Coins = ₹1 Real Money**

---

## 🗂️ Project Structure

```
opinifi/
├── server/                        # Express + Node.js backend
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── categories.js          # All categories & subcategories
│   ├── models/
│   │   ├── User.js                # User + wallet + streak + payment details
│   │   ├── Opinion.js             # Opinion/poll/survey model
│   │   ├── Vote.js                # One vote per user per opinion
│   │   ├── Transaction.js         # Full wallet ledger
│   │   └── RedemptionRequest.js   # Cash-out requests
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + role authorize
│   │   └── errorHandler.js        # Central error handler
│   ├── routes/
│   │   ├── auth.js                # Register, Login, Profile, Password
│   │   ├── opinions.js            # CRUD + Vote + News API import
│   │   ├── wallet.js              # Balance, Transactions, Redeem, Leaderboard
│   │   ├── brands.js              # Brand surveys, analytics, wallet top-up
│   │   └── admin.js               # Admin dashboard, redemption approvals
│   ├── .env                       # Environment variables (copy to configure)
│   ├── index.js                   # Main server entry + CRON jobs
│   └── package.json
│
├── client/                        # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state + JWT management
│   │   ├── hooks/
│   │   │   ├── useOpinions.js     # Opinions CRUD + voting
│   │   │   └── useWallet.js       # Wallet, transactions, redemption
│   │   ├── utils/
│   │   │   └── api.js             # Axios instance with JWT interceptors
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Navbar.jsx     # Top nav with coin balance + profile
│   │   │   │   └── Sidebar.jsx    # Category tree with streak widget
│   │   │   └── Feed/
│   │   │       └── OpinionCard.jsx # Animated poll card with voting
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx       # Login / Register (user & brand)
│   │   │   ├── FeedPage.jsx       # Main opinion feed with filters
│   │   │   ├── WalletPage.jsx     # Coins, transactions, UPI/Bank redeem
│   │   │   ├── BrandsPage.jsx     # Survey creator + why Opinifi + pricing
│   │   │   └── LeaderboardPage.jsx # Monthly rankings + prize pool
│   │   ├── App.jsx                # Router + protected routes
│   │   ├── index.js               # React entry
│   │   └── index.css              # Global design system
│   └── package.json
│
├── package.json                   # Root – concurrently dev script
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- (Optional) NewsAPI key from newsapi.org

### 1. Clone & install
```bash
git clone https://github.com/yourname/opinifi.git
cd opinifi
npm run install-all
```

### 2. Configure environment
```bash
cd server
cp .env .env.local   # edit .env with your values
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/opinifi
JWT_SECRET=your_super_secret_key_here
NEWS_API_KEY=your_newsapi_key         # optional
RAZORPAY_KEY_ID=your_razorpay_key    # optional, for payments
CLIENT_URL=http://localhost:3000
```

### 3. Run development servers
```bash
# From root directory — starts both server + client
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health check:** http://localhost:5000/api/health

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (user or brand) |
| POST | `/api/auth/login` | Login + streak update |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile + payment details |
| PUT | `/api/auth/change-password` | Change password |

### Opinions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/opinions` | Feed (filter by category/sub/sort/search) |
| GET | `/api/opinions/categories` | All categories with subcategories |
| GET | `/api/opinions/featured` | Featured opinions |
| GET | `/api/opinions/:id` | Single opinion with vote status |
| POST | `/api/opinions` | Create opinion/survey (auth) |
| POST | `/api/opinions/:id/vote` | Vote → earn OP coins |
| POST | `/api/opinions/import/news` | Import from NewsAPI (admin) |
| DELETE | `/api/opinions/:id` | Delete opinion |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet` | Balance + stats |
| GET | `/api/wallet/transactions` | Full transaction history |
| POST | `/api/wallet/redeem` | Request UPI/Bank redemption |
| GET | `/api/wallet/redemptions` | Redemption request history |
| GET | `/api/wallet/leaderboard` | Top earners (week/month/all) |

### Brands
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/brands/my-surveys` | Brand's own surveys |
| GET | `/api/brands/survey/:id/analytics` | Response analytics + trend |
| POST | `/api/brands/topup` | Top up brand wallet |
| PUT | `/api/brands/survey/:id/status` | Open/close a survey |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform overview stats |
| GET | `/api/admin/redemptions` | Pending redemption queue |
| PUT | `/api/admin/redemptions/:id` | Approve/reject redemption |
| PUT | `/api/admin/opinions/:id/approve` | Approve brand survey |
| GET | `/api/admin/users` | User management |

---

## 💰 Coin Economy

| Action | OP Coins |
|--------|----------|
| Welcome bonus | +50 |
| Regular opinion | +5 |
| Brand survey | +8–20 |
| 7-day streak bonus | +20 |
| 30-day streak bonus | +100 |
| Referral (coming) | +30 |

**Redemption rates:**
- 10 OP Coins = ₹1
- Minimum: 100 OP Coins (₹10)
- Maximum per day: ₹500
- Methods: UPI (2–4 hrs), Bank (1–2 days)

---

## 📦 Categories & Subcategories

| Category | Subcategories |
|----------|--------------|
| ⚽ Sports | Football, Cricket, Badminton, Tennis, Basketball, Wrestling, F1 |
| 📰 News | India, World, Economy, Science, Environment, Health |
| 🏛️ Politics | Parliament, State Politics, International, Elections, Policy |
| 💻 Technology | AI & ML, Startups, Gadgets, Cybersecurity, Space |
| 🎬 Entertainment | Bollywood, Hollywood, Music, OTT, Gaming |
| 🏷️ Brands | FMCG, Automobile, Food & Beverage, Fashion, Finance |
| 🌿 Lifestyle | Health & Fitness, Food, Travel, Education |

---

## 🚀 Deployment

### Backend (Railway / Render / EC2)
```bash
cd server
npm start
```

### Frontend (Vercel / Netlify)
```bash
cd client
npm run build
# Deploy the /build folder
```

### Environment variables for production
Set `NODE_ENV=production`, update `MONGO_URI` to Atlas, set `CLIENT_URL` to your frontend domain.

---

## 🔮 Roadmap

- [ ] Push notifications (FCM)
- [ ] Referral system
- [ ] Google OAuth
- [ ] Admin dashboard UI
- [ ] Opinion API integrations (more sources)
- [ ] Mobile app (React Native)
- [ ] Brand analytics dashboard
- [ ] Anti-fraud: opinion quality scoring
- [ ] Razorpay automated payouts

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Styling | Custom CSS Design System (Syne + DM Sans fonts) |
| HTTP Client | Axios |
| Toasts | react-hot-toast |
| Scheduler | node-cron |
| Rate Limiting | express-rate-limit |
| Validation | express-validator |
| News Data | NewsAPI.org |

---

## 📄 License

MIT — built with ❤️ for the Opinifi platform.
=======
# opinion-web
>>>>>>
> 361aec827e7d0b5407e5e27130128fe630ddb136
