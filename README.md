# Dependencies for School Evaluation System

This document outlines all dependencies required for the School Evaluation System backend.

## 1. Internal Dependencies

### Production Dependencies
- **argon2** (^0.41.1) - For password hashing
- **cookie-parser** (^1.4.7) - For parsing cookies
- **cors** (^2.8.5) - For handling Cross-Origin Resource Sharing
- **csrf-csrf** (^3.1.0) - For CSRF protection
- **dotenv** (^16.3.1) - For loading environment variables
- **express** (^4.18.2) - Web framework
- **express-rate-limit** (^7.5.0) - For API rate limiting
- **helmet** (^7.0.0) - Security middleware
- **jsonwebtoken** (^9.0.2) - For JWT authentication
- **morgan** (^1.10.0) - HTTP request logger
- **sequelize** (^6.32.1) - ORM for database
- **mysql2** (^3.6.0) - MySQL database driver
- **sqlite3** (^5.1.6) - SQLite database driver (for development/testing)
- **zod** (^3.22.2) - For validation

### Development Dependencies
- **@types/** packages - TypeScript type definitions
- **eslint** and related packages - For code linting
- **jest** (^29.7.0) - For testing
- **prettier** (^3.0.0) - For code formatting
- **supertest** (^7.0.0) - For API testing
- **ts-jest** (^29.2.5) - Jest transformer for TypeScript
- **ts-node-dev** (^2.0.0) - For running TypeScript node applications
- **typescript** (^5.1.6) - TypeScript compiler

## 2. External Dependencies

These are dependencies that need to be installed on the host system:

- **Node.js** (v16+) - JavaScript runtime
- **C/C++ compiler toolchain** - Required for native modules like sqlite3 and argon2
  - On Linux: build-essential, python
  - On Windows: Visual Studio Build Tools
  - On macOS: Xcode Command Line Tools
- **Git** - For version control and deployment
- **MySQL** (v8.0+) - Database server (when using MySQL configuration)

## 3. Service Dependencies

- **Database**: Supports both SQLite (for development) and MySQL (for production)
  - SQLite: Uses a local file for storage
  - MySQL 8.0 or higher: Connection URL format: `mysql://username:password@host:port/database`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 3000 |
| DB_TYPE | Database type (mysql/sqlite) | sqlite |
| DB_STORAGE | SQLite database file path (used when DB_TYPE=sqlite) | ./database.sqlite |
| DB_HOST | MySQL host (used when DB_TYPE=mysql) | localhost |
| DB_PORT | MySQL port (used when DB_TYPE=mysql) | 3306 |
| DB_USERNAME | MySQL username (used when DB_TYPE=mysql) | - |
| DB_PASSWORD | MySQL password (used when DB_TYPE=mysql) | - |
| DB_NAME | MySQL database name (used when DB_TYPE=mysql) | school_app |
| JWT_SECRET | Secret for JWT tokens | - |
| JWT_ACCESS_EXPIRATION | JWT access token expiration | 15m |
| JWT_REFRESH_EXPIRATION | JWT refresh token expiration | 7d |
| ARGON2_MEMORY_COST | Memory cost for Argon2 | 65536 |
| ARGON2_TIME_COST | Time cost for Argon2 | 3 |
| ARGON2_PARALLELISM | Parallelism for Argon2 | 1 |
| ALLOWED_ORIGIN | CORS allowed origin | * (in development), https://*.pfb.ecole-89.com (in production) |

## Database Configuration Notes

The application supports both SQLite and MySQL databases, allowing for flexibility in development and production environments:

### SQLite Configuration (Development/Testing)

SQLite is the default database for development and testing due to its simplicity:

1. No additional setup required
2. Set `DB_TYPE=sqlite` in your .env file
3. Specify the database file path with `DB_STORAGE=./database.sqlite`

Example `.env` configuration for SQLite:

```
DB_TYPE=sqlite
DB_STORAGE=./database.sqlite
```

### MySQL Configuration (Production)

MySQL is recommended for production environments for improved performance, scalability, and concurrent access:

1. Install MySQL 8.0 or higher
2. Create a new database: `CREATE DATABASE school_app;`
3. Create a user with appropriate permissions:
   ```sql
   CREATE USER 'admin_user'@'%' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON school_app.* TO 'admin_user'@'%';
   FLUSH PRIVILEGES;
   ```
4. Set `DB_TYPE=mysql` in your .env file
5. Update the MySQL connection parameters in your .env file
6. Run the application to generate the database schema or run migrations

Example `.env` configuration for MySQL:

```
DB_TYPE=mysql
DB_HOST=10.89.10.152
DB_PORT=3306
DB_USERNAME=admin_user
DB_PASSWORD=your_password
DB_NAME=school_app
```

### Switching Between Databases

To switch between SQLite and MySQL:

1. Update the `DB_TYPE` environment variable to either `sqlite` or `mysql`
2. Ensure the corresponding configuration parameters are set correctly
3. Restart the application

The application will automatically connect to the specified database type using the appropriate configuration parameters.
