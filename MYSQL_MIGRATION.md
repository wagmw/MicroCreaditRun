# Migration from PostgreSQL to MySQL

This document outlines the steps to migrate your MicroCreditRun application from PostgreSQL to MySQL.

## Changes Made

### 1. Updated Files

- ✅ `backend/prisma/schema.prisma` - Changed provider from `postgresql` to `mysql`
- ✅ `backend/package.json` - Replaced `pg` package with `mysql2`
- ✅ `backend/.env` - Updated DATABASE_URL to MySQL connection string format
- ✅ `backend/prisma/schema.prisma` - Changed UUID generation from `uuid()` to `cuid()` for MySQL compatibility

### 2. Database Configuration

The `.env` file has been updated with MySQL connection format:

```
DATABASE_URL="mysql://root:password@localhost:3306/microcredit"
```

**You need to update this with your actual MySQL credentials:**

- `root` - your MySQL username
- `password` - your MySQL password
- `localhost` - your MySQL host (use IP or hostname if remote)
- `3306` - MySQL port (default is 3306)
- `microcredit` - your database name

## Migration Steps

### Step 1: Install MySQL

If you don't have MySQL installed:

- **Windows**: Download from https://dev.mysql.com/downloads/installer/
- **Mac**: `brew install mysql`
- **Linux**: `sudo apt-get install mysql-server`

### Step 2: Create MySQL Database

```sql
mysql -u root -p
CREATE DATABASE microcredit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 3: Update Dependencies

Navigate to the backend folder and install the new MySQL package:

```bash
cd backend
npm install
```

This will install `mysql2` and remove the old `pg` package.

### Step 4: Update DATABASE_URL

Edit `backend/.env` and set your MySQL connection details:

```
DATABASE_URL="mysql://YOUR_USERNAME:YOUR_PASSWORD@YOUR_HOST:3306/microcredit"
```

### Step 5: Reset Migrations

Since you're switching database systems, you need to reset the migrations:

```bash
cd backend

# Remove the existing migrations directory
Remove-Item -Recurse -Force .\prisma\migrations

# Create a fresh migration for MySQL
npx prisma migrate dev --name init
```

This will:

- Create a new migrations folder
- Generate the initial migration for MySQL
- Apply it to your new MySQL database
- Generate the Prisma Client

### Step 6: Seed the Database (Optional)

If you have seed data, run:

```bash
npm run seed
```

### Step 7: Test the Connection

Start your backend server to verify the connection:

```bash
npm run dev
```

You should see: `✅ Database connected successfully`

## Important Notes

### Data Migration

⚠️ **The above steps create a fresh database.** If you need to migrate existing data from PostgreSQL to MySQL:

1. **Export data from PostgreSQL:**

   ```bash
   pg_dump -U username -d neondb -F c -f backup.dump
   ```

2. **Convert and import** - You'll need to:
   - Export tables as CSV from PostgreSQL
   - Import CSVs into MySQL
   - Or use a tool like `pgloader` to automate the process

### Key Differences

**PostgreSQL → MySQL changes:**

- `uuid()` → `cuid()` for auto-generated IDs
- Connection string format changed
- Driver changed from `pg` to `mysql2`
- Prisma will handle most SQL differences automatically

### Troubleshooting

**Connection Error:**

- Verify MySQL is running: `mysql -u root -p`
- Check firewall/port 3306 access
- Ensure DATABASE_URL format is correct

**Migration Errors:**

- Delete `prisma/migrations` and try again
- Check MySQL user has proper permissions: `GRANT ALL PRIVILEGES ON microcredit.* TO 'user'@'localhost';`

**Character Set Issues:**

- Ensure database uses UTF8MB4: `ALTER DATABASE microcredit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

## Production Deployment

For production MySQL hosting, consider:

- **AWS RDS MySQL**
- **Google Cloud SQL**
- **Azure Database for MySQL**
- **PlanetScale** (serverless MySQL with branching)
- **DigitalOcean Managed MySQL**

Update your production DATABASE_URL accordingly.

## Rollback Plan

If you need to rollback to PostgreSQL:

1. Restore `pg` package in package.json
2. Change provider back to `postgresql` in schema.prisma
3. Restore original DATABASE_URL
4. Run `npm install` and `npx prisma generate`

---

**Note**: Keep backups of your data before performing any migration!
