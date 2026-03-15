<div align="center">

# 🛒 NestCart

**A full-stack e-commerce platform built for scale**
Secure auth · Role-based control · Order management · Analytics dashboard

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React.js-61DAFB?style=flat-square&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

</div>

---

## 📦 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | NestJS | Scalable Node.js framework |
| ORM | Prisma | Efficient database queries |
| Database | MySQL | Relational data storage |
| Auth | JWT + Bcrypt | Secure token auth & password hashing |
| Frontend | React.js | Component-driven UI |
| Perf | Lazy Loading + Pagination | Optimised load & data handling |

---

## ✨ Features

### 👤 User
- Register & login securely
- Browse, search & filter products by category
- Add products to Cart and Wishlist
- Place orders and track order status
- View full order history

### 🛠️ Admin
- Add & manage products by category
- View and manage all user orders
- Update order status: `Processing` → `Shipped` → `Delivered` | `Cancelled`
- Monitor product inventory
- Access analytics dashboard

### 🔐 Security
- JWT-based stateless authentication
- Passwords hashed with Bcrypt
- RBAC — `Admin` and `User` roles
- Protected API endpoints per role

### 📊 Analytics Dashboard
- Total company revenue
- Most sold products ranking
- Low stock product alerts
- Bar chart data visualisations

### ⚡ Performance
- **React Lazy Loading** — reduced initial bundle load time
- **Pagination** — efficient handling of large product datasets
- **Prisma ORM** — optimised query execution
- **Role-scoped queries** — no over-fetching

---

## 🌐 API Modules

| Module | Description |
|--------|-------------|
| `Auth API` | Register, login, JWT token management |
| `Product API` | CRUD operations, category filtering |
| `Cart API` | Add, update, remove cart items |
| `Wishlist API` | Save and manage liked products |
| `Order API` | Place orders, track and update status |
| `Analytics API` | Revenue, top products, inventory insights |

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/nestcart.git
cd nestcart
```

### 2. Backend setup
```bash
cd server
npm install
```

Create a `.env` file:
```env
DATABASE_URL="mysql://username:password@localhost:3306/nestcart"
JWT_SECRET=your_secret_key
```

Run migrations and start:
```bash
npx prisma migrate dev
npm run start:dev
```

### 3. Frontend setup
```bash
cd client
npm install
npm run dev
```

---

## 👨‍💻 Author

**Nikesh S** — Full Stack Developer
*Building scalable web applications with modern technologies.*

---

<div align="center">

⭐ If you find NestCart useful, consider giving it a star on GitHub!

</div>
