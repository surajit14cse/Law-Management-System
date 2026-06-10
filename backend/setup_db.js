const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  console.log('Connected to MySQL server.');

  try {
    // 1. Create Database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'law_management_system'}\``);
    console.log(`Database "${process.env.DB_NAME || 'law_management_system'}" ensured.`);

    await connection.query(`USE \`${process.env.DB_NAME || 'law_management_system'}\``);

    // 2. Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        role ENUM('Admin', 'Junior', 'Clerk') DEFAULT 'Junior',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "users" ensured.');

    // 3. Create Clients Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "clients" ensured.');

    // 4. Create Cases Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        client_id INT NOT NULL,
        case_number VARCHAR(100) NOT NULL UNIQUE,
        case_year INT,
        court_type VARCHAR(100),
        court_name VARCHAR(255),
        presiding_judge VARCHAR(255),
        police_station VARCHAR(255),
        opposite_party VARCHAR(255),
        opposing_counsel VARCHAR(255),
        case_status ENUM('Active', 'Closed', 'Pending') DEFAULT 'Active',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "cases" ensured.');

    // 5. Create Hearings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hearings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        case_id INT NOT NULL,
        hearing_date DATE NOT NULL,
        hearing_time TIME,
        stage VARCHAR(255),
        outcome TEXT,
        notes TEXT,
        next_hearing_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "hearings" ensured.');

    // 6. Create Tasks Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        case_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        due_date DATE,
        status ENUM('Pending', 'Completed') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "tasks" ensured.');

    // 7. Create Client Documents Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS client_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_type VARCHAR(50),
        file_size INT,
        category VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "client_documents" ensured.');

    // 8. Comprehensive Migration/Repair checks for existing databases
    console.log('Running migration checks...');

    // users.phone
    const [userCols] = await connection.query('SHOW COLUMNS FROM users');
    if (!userCols.some(c => c.Field === 'phone')) {
      await connection.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email');
      console.log('Added column "phone" to "users".');
    }

    // clients.user_id
    const [clientCols] = await connection.query('SHOW COLUMNS FROM clients');
    if (!clientCols.some(c => c.Field === 'user_id')) {
      await connection.query('ALTER TABLE clients ADD COLUMN user_id INT AFTER id');
      await connection.query('ALTER TABLE clients ADD CONSTRAINT fk_client_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
      console.log('Added column "user_id" to "clients".');
    }

    // cases.user_id
    const [caseCols] = await connection.query('SHOW COLUMNS FROM cases');
    if (!caseCols.some(c => c.Field === 'user_id')) {
      await connection.query('ALTER TABLE cases ADD COLUMN user_id INT AFTER id');
      await connection.query('ALTER TABLE cases ADD CONSTRAINT fk_case_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
      console.log('Added column "user_id" to "cases".');
    }

    // tasks.user_id
    const [taskCols] = await connection.query('SHOW COLUMNS FROM tasks');
    if (!taskCols.some(c => c.Field === 'user_id')) {
      await connection.query('ALTER TABLE tasks ADD COLUMN user_id INT AFTER id');
      await connection.query('ALTER TABLE tasks ADD CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
      console.log('Added column "user_id" to "tasks".');
    }

    // client_documents.category and description
    const [docCols] = await connection.query('SHOW COLUMNS FROM client_documents');
    if (!docCols.some(c => c.Field === 'category')) {
      await connection.query('ALTER TABLE client_documents ADD COLUMN category VARCHAR(100) AFTER file_size');
      console.log('Added column "category" to "client_documents".');
    }
    if (!docCols.some(c => c.Field === 'description')) {
      await connection.query('ALTER TABLE client_documents ADD COLUMN description TEXT AFTER category');
      console.log('Added column "description" to "client_documents".');
    }

    console.log('Database setup/repair completed successfully.');
  } catch (error) {
    console.error('Error during database setup:', error);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

setupDatabase();
