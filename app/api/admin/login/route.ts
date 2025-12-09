import { getDb, initializeDatabase } from "@/lib/db"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Initialize database on first run
    initializeDatabase()
    const db = getDb()

    // For demo purposes, create admin if doesn't exist
    const existingAdmin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email) as any

    if (!existingAdmin) {
      // Create demo admin with demo credentials
      if (email === "admin@college.edu" && password === "admin123") {
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")
        db.prepare("INSERT INTO admins (email, password_hash) VALUES (?, ?)").run(email, hashedPassword)
      } else {
        return Response.json({ message: "Invalid credentials" }, { status: 401 })
      }
    } else {
      // Verify password
      const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")
      if (existingAdmin.password_hash !== hashedPassword) {
        return Response.json({ message: "Invalid credentials" }, { status: 401 })
      }
    }

    // Generate a simple token (in production, use JWT)
    const token = crypto.randomBytes(32).toString("hex")

    return Response.json({
      message: "Login successful",
      token,
      admin: { email },
    })
  } catch (error) {
    return Response.json({ message: "An error occurred" }, { status: 500 })
  }
}
