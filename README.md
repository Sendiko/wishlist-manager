# Ulala - Wishlist Manager

A modern, feature-rich wishlist management application built with Next.js 16, featuring Material Design 3 theming, item comparison, and category-based organization.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🔐 **User Authentication** - Secure login and registration with bcrypt password hashing
- 📝 **Wishlist Management** - Add, edit, and delete items with photos, prices, and detailed information
- 🏷️ **Category Organization** - Organize items into custom categories
- ⚖️ **Item Comparison** - Compare multiple items side-by-side based on ratings
- 📊 **Category Comparison** - Compare entire categories or specific item selections
- 💰 **Rupiah Formatting** - Beautiful Indonesian Rupiah formatting with thousand separators
- 🎨 **Material Design 3** - Modern UI with automatic light/dark mode support
- 📱 **Responsive Design** - Collapsible sidebar navigation optimized for mobile and desktop
- ✅ **Purchase Tracking** - Mark items as purchased and track your progress
- 🎯 **Smart Scoring** - Rate items by necessity, wish, and interest levels

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** MySQL/MariaDB with Prisma ORM
- **Styling:** Tailwind CSS 4 with Material Design 3 theme
- **Authentication:** Custom JWT-based auth with jose
- **Fonts:** Akaya Telivigala (display), Geist Sans (body)
- **Validation:** Zod

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MySQL or MariaDB database
- (Optional) PostgreSQL database

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd wishlist-manager
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="mysql://user:password@localhost:3306/wishlist_db"
SHADOW_DATABASE_URL="mysql://user:password@localhost:3306/wishlist_shadow"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Optional: PostgreSQL alternative
# DATABASE_URL="postgresql://user:password@localhost:5432/wishlist_db"
```

**Important:** 
- Replace `user`, `password`, and database names with your actual credentials
- Generate a strong random string for `JWT_SECRET` (use `openssl rand -base64 32`)

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with sample categories
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Configure environment variables:
     - `DATABASE_URL`
     - `SHADOW_DATABASE_URL` (optional)
     - `JWT_SECRET`

3. **Set up Database**
   - Use a managed MySQL service like:
     - [PlanetScale](https://planetscale.com/) (recommended)
     - [Railway](https://railway.app/)
     - [AWS RDS](https://aws.amazon.com/rds/)
     - [DigitalOcean Managed Databases](https://www.digitalocean.com/products/managed-databases)

4. **Run Migrations**
   ```bash
   # After deployment, run migrations via Vercel CLI or your database provider
   npx prisma migrate deploy
   ```

### Deploy to Railway

1. **Create a new project on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"

2. **Add MySQL Database**
   - Click "New" → "Database" → "Add MySQL"
   - Railway will automatically set `DATABASE_URL`

3. **Configure Environment Variables**
   - Add `JWT_SECRET` in the Variables tab
   - `DATABASE_URL` is auto-configured

4. **Deploy**
   - Railway will automatically build and deploy
   - Run migrations: `npx prisma migrate deploy`

### Deploy to Docker

```dockerfile
# Dockerfile example
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t wishlist-manager .
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-jwt-secret" \
  wishlist-manager
```

## 🗄️ Database Schema

The application uses three main models:

- **User** - User accounts with authentication
- **Item** - Wishlist items with ratings, prices, and metadata
- **Category** - Item categories for organization

See `prisma/schema.prisma` for the complete schema.

## 🎨 Customization

### Theme Colors

Edit the Material Design 3 theme in:
- `app/css/light.css` - Light mode colors
- `app/css/dark.css` - Dark mode colors

### Fonts

Change fonts in `app/layout.tsx`:
```tsx
import { Your_Font } from "next/font/google"
```

## 📝 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | MySQL/PostgreSQL connection string | Yes | `mysql://user:pass@host:3306/db` |
| `SHADOW_DATABASE_URL` | Shadow database for migrations | No | `mysql://user:pass@host:3306/shadow` |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | `your-random-secret-key` |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Material Design 3 color system
- Next.js team for the amazing framework
- Prisma for the excellent ORM

---

Made with ❤️ using Next.js and Material Design 3
