import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("platform.db");

// Initialize Database
db.exec(`
  DROP TABLE IF EXISTS users;
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    password TEXT,
    role TEXT DEFAULT 'client',
    is_verified INTEGER DEFAULT 0,
    department TEXT
  );

  CREATE TABLE IF NOT EXISTS packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    description TEXT,
    price REAL,
    old_price REAL,
    rating REAL,
    reviews_count INTEGER,
    delivery_days INTEGER,
    features TEXT -- JSON string
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    package_id INTEGER,
    status TEXT, -- 'pending', 'in_progress', 'review', 'completed'
    progress INTEGER DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    files TEXT -- JSON string
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    amount REAL,
    status TEXT, -- 'paid', 'unpaid'
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    amount REAL,
    method TEXT,
    status TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS point_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount INTEGER, -- positive for earn, negative for spend
    description TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    quality_rating INTEGER,
    speed_rating INTEGER,
    comm_rating INTEGER,
    commitment_rating INTEGER,
    comment TEXT,
    recommend INTEGER -- 0 or 1
  );
`);

// Seed initial users
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
const clientPasswordHash = bcrypt.hashSync("client", 10);
const adminPasswordHash = bcrypt.hashSync("admin", 10);
const designPasswordHash = bcrypt.hashSync("design", 10);
const devPasswordHash = bcrypt.hashSync("dev", 10);
const marketingPasswordHash = bcrypt.hashSync("marketing", 10);

if (userCount.count === 0) {
  db.prepare(`
    INSERT INTO users (first_name, last_name, email, phone, password, role, is_verified)
    VALUES (?, ?, ?, ?, ?, 'client', 1)
  `).run("Abdullah", "Muthanna", "client@apptech.com", "+966534664592", clientPasswordHash);

  db.prepare(`
    INSERT INTO users (first_name, last_name, email, phone, password, role, is_verified)
    VALUES (?, ?, ?, ?, ?, 'admin', 1)
  `).run("Abdullah", "Muthanna", "admin@apptech.com", "+966500000000", adminPasswordHash);

  db.prepare(`
    INSERT INTO users (first_name, last_name, email, phone, password, role, is_verified, department)
    VALUES (?, ?, ?, ?, ?, 'tech', 1, 'design')
  `).run("فريق", "التصميم", "design@apptech.com", "+966500000001", designPasswordHash);

  db.prepare(`
    INSERT INTO users (first_name, last_name, email, phone, password, role, is_verified, department)
    VALUES (?, ?, ?, ?, ?, 'tech', 1, 'dev')
  `).run("فريق", "البرمجة", "dev@apptech.com", "+966500000002", devPasswordHash);

  db.prepare(`
    INSERT INTO users (first_name, last_name, email, phone, password, role, is_verified, department)
    VALUES (?, ?, ?, ?, ?, 'tech', 1, 'marketing')
  `).run("فريق", "التسويق", "marketing@apptech.com", "+966500000003", marketingPasswordHash);
} else {
  // Ensure existing seed accounts are updated to the requested name and password
  db.prepare(`
    UPDATE users SET first_name = ?, last_name = ?, password = ? WHERE email = ?
  `).run("Abdullah", "Muthanna", clientPasswordHash, "client@apptech.com");
  
  db.prepare(`
    UPDATE users SET first_name = ?, last_name = ?, password = ? WHERE email = ?
  `).run("Abdullah", "Muthanna", adminPasswordHash, "admin@apptech.com");

  // Delete old tech accounts if they exist to avoid confusion
  db.prepare("DELETE FROM users WHERE email IN ('design_tech@apptech.com', 'dev_tech@apptech.com', 'marketing_tech@apptech.com')").run();

  // Make sure new tech accounts exist or are updated
  const insertOrReplaceTech = (firstName: string, lastName: string, email: string, phone: string, hash: string, dept: string) => {
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: number } | undefined;
    if (existing) {
      db.prepare("UPDATE users SET first_name = ?, last_name = ?, password = ?, role = 'tech', department = ? WHERE email = ?")
        .run(firstName, lastName, hash, dept, email);
    } else {
      db.prepare("INSERT INTO users (first_name, last_name, email, phone, password, role, is_verified, department) VALUES (?, ?, ?, ?, ?, 'tech', 1, ?)")
        .run(firstName, lastName, email, phone, hash, dept);
    }
  };

  insertOrReplaceTech("فريق", "التصميم", "design@apptech.com", "+966500000001", designPasswordHash, "design");
  insertOrReplaceTech("فريق", "البرمجة", "dev@apptech.com", "+966500000002", devPasswordHash, "dev");
  insertOrReplaceTech("فريق", "التسويق", "marketing@apptech.com", "+966500000003", marketingPasswordHash, "marketing");
}

// Seed initial data if empty
const packageCount = db.prepare("SELECT COUNT(*) as count FROM packages").get() as { count: number };
if (packageCount.count === 0) {
  const insertPackage = db.prepare(`
    INSERT INTO packages (name, category, description, price, old_price, rating, reviews_count, delivery_days, features)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPackage.run("باقة التصميم الأساسية", "design", "تصميم هوية بصرية متكاملة للمشاريع الناشئة", 250, 350, 4.8, 120, 7, JSON.stringify(["شعار واحد", "3 تعديلات", "ملفات المصدر"]));
  insertPackage.run("باقة البرمجة المتقدمة", "dev", "تطوير متجر إلكتروني متكامل مع لوحة تحكم", 1500, 2000, 4.9, 85, 21, JSON.stringify(["متجر متكامل", "دعم فني 3 أشهر", "تكامل مع بوابات الدفع"]));
  insertPackage.run("باقة التسويق الشاملة", "marketing", "إدارة حسابات التواصل الاجتماعي وحملات إعلانية", 500, 700, 4.7, 210, 30, JSON.stringify(["إدارة 3 منصات", "12 منشور شهرياً", "تقارير أداء"]));

  // Seed initial payment for stats
  db.prepare(`
    INSERT INTO payments (amount, method, status, date)
    VALUES (?, ?, ?, ?)
  `).run(3500, "Credit Card", "success", new Date().toISOString());
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 4000;

  // API Routes
  app.get("/api/packages", (req, res) => {
    const packages = db.prepare("SELECT * FROM packages").all();
    res.json(packages.map((p: any) => {
      let name_key = '';
      let desc_key = '';
      let features_keys: string[] = [];
      
      if (p.category === 'design') {
        name_key = 'pkg_design_name';
        desc_key = 'pkg_design_desc';
        features_keys = ['pkg_design_f1', 'pkg_design_f2', 'pkg_design_f3'];
      } else if (p.category === 'dev') {
        name_key = 'pkg_dev_name';
        desc_key = 'pkg_dev_desc';
        features_keys = ['pkg_dev_f1', 'pkg_dev_f2', 'pkg_dev_f3'];
      } else if (p.category === 'marketing') {
        name_key = 'pkg_marketing_name';
        desc_key = 'pkg_marketing_desc';
        features_keys = ['pkg_marketing_f1', 'pkg_marketing_f2', 'pkg_marketing_f3'];
      }

      return { 
        ...p, 
        features: JSON.parse(p.features),
        name_key,
        desc_key,
        features_keys
      };
    }));
  });

  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects").all();
    res.json(projects.map((p: any) => ({ ...p, files: JSON.parse(p.files || '[]') })));
  });

  app.post("/api/projects", (req, res) => {
    const { name, package_id, description } = req.body;
    const info = db.prepare(`
      INSERT INTO projects (name, package_id, status, progress, start_date, description, files)
      VALUES (?, ?, 'pending', 0, ?, ?, '[]')
    `).run(name, package_id, new Date().toISOString(), description);
    
    const projectId = info.lastInsertRowid;
    
    // Create invoice automatically
    const pkg = db.prepare("SELECT price FROM packages WHERE id = ?").get(package_id) as any;
    db.prepare(`
      INSERT INTO invoices (project_id, amount, status, date)
      VALUES (?, ?, 'unpaid', ?)
    `).run(projectId, pkg.price, new Date().toISOString());

    res.json({ id: projectId });
  });

  app.get("/api/stats", (req, res) => {
    const totalProjects = db.prepare("SELECT COUNT(*) as count FROM projects").get() as any;
    const currentProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status != 'completed'").get() as any;
    const completedProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'completed'").get() as any;
    const totalPayments = db.prepare("SELECT SUM(amount) as sum FROM payments WHERE status = 'success'").get() as any;
    const unpaidInvoices = db.prepare("SELECT COUNT(*) as count FROM invoices WHERE status = 'unpaid'").get() as any;
    const totalPoints = db.prepare("SELECT SUM(amount) as sum FROM point_transactions").get() as any;

    res.json({
      totalProjects: totalProjects.count,
      currentProjects: currentProjects.count,
      completedProjects: completedProjects.count,
      totalPayments: totalPayments.sum || 0,
      unpaidInvoices: unpaidInvoices.count,
      totalPoints: totalPoints.sum || 0
    });
  });

  app.post("/api/payments", (req, res) => {
    const { amount, method, points_to_deduct, project_id } = req.body;
    
    try {
      db.transaction(() => {
        // 1. Record Payment
        db.prepare(`
          INSERT INTO payments (amount, method, status, date)
          VALUES (?, ?, 'success', ?)
        `).run(amount, method, new Date().toISOString());

        // 2. Deduct Points if any
        if (points_to_deduct > 0) {
          db.prepare(`
            INSERT INTO point_transactions (amount, description, date)
            VALUES (?, ?, ?)
          `).run(-points_to_deduct, `Discount for project ${project_id}`, new Date().toISOString());
        }

        // 3. Earn Points (1 point per 1 SAR paid)
        db.prepare(`
          INSERT INTO point_transactions (amount, description, date)
          VALUES (?, ?, ?)
        `).run(Math.floor(amount), `Earned from project ${project_id}`, new Date().toISOString());

        // 4. Update Invoice status if project_id provided
        if (project_id) {
          db.prepare("UPDATE invoices SET status = 'paid' WHERE project_id = ?").run(project_id);
        }
      })();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Payment failed" });
    }
  });

  app.get("/api/invoices", (req, res) => {
    const invoices = db.prepare(`
      SELECT i.*, p.name as project_name 
      FROM invoices i 
      JOIN projects p ON i.project_id = p.id
    `).all();
    res.json(invoices);
  });

  app.post("/api/reviews", (req, res) => {
    const { project_id, quality_rating, speed_rating, comm_rating, commitment_rating, comment, recommend } = req.body;
    db.prepare(`
      INSERT INTO reviews (project_id, quality_rating, speed_rating, comm_rating, commitment_rating, comment, recommend)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(project_id, quality_rating, speed_rating, comm_rating, commitment_rating, comment, recommend ? 1 : 0);
    
    // Update project status to closed or similar if needed
    res.json({ success: true });
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { firstName, lastName, email, phone, countryCode, password } = req.body;
    
    // Explicitly check if user exists first
    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existingUser) {
      return res.status(400).json({ error: "user_already_exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullPhone = `${countryCode}${phone}`;
    try {
      db.prepare(`
        INSERT INTO users (first_name, last_name, email, phone, password)
        VALUES (?, ?, ?, ?, ?)
      `).run(firstName, lastName, email, fullPhone, hashedPassword);
      console.log(`New user registered: ${email}`);
      res.json({ success: true, message: "Account created successfully" });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ error: "signup_failed" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (user && bcrypt.compareSync(password, user.password)) {
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          firstName: user.first_name, 
          lastName: user.last_name, 
          email: user.email,
          phone: user.phone,
          role: user.role || 'client',
          department: user.department
        } 
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/settings", (req, res) => {
    const { userId, name, email, phone, currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    try {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (email && email !== user.email) {
        const conflict = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, userId);
        if (conflict) {
          return res.status(400).json({ message: "Email is already in use" });
        }
      }

      let hashedPassword = user.password;
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: "Current password is required to change password" });
        }
        if (!bcrypt.compareSync(currentPassword, user.password)) {
          return res.status(400).json({ message: "Incorrect current password" });
        }
        hashedPassword = bcrypt.hashSync(newPassword, 10);
      }

      const nameParts = (name || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      db.prepare(`
        UPDATE users 
        SET first_name = ?, last_name = ?, email = ?, phone = ?, password = ?
        WHERE id = ?
      `).run(firstName, lastName, email, phone, hashedPassword, userId);

      const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      res.json({
        id: updatedUser.id,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role || 'client',
        department: updatedUser.department
      });
    } catch (err: any) {
      console.error("Settings update error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    
    // Always return success to prevent user enumeration
    // In a real app, we would only send the email if the user exists
    if (user) {
      console.log(`Password reset link sent to ${email}`);
    } else {
      console.log(`Password reset requested for non-existent email: ${email}`);
    }
    
    res.json({ success: true, message: "Password reset link sent to your email." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
