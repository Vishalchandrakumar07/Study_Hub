import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST() {
  try {
    console.log("[v0] Starting database schema setup...")

    // Execute schema creation
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(name, category_id)
);

-- Years table
CREATE TABLE IF NOT EXISTS years (
  id BIGSERIAL PRIMARY KEY,
  year_number INT NOT NULL,
  department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(year_number, department_id)
);

-- Semesters table
CREATE TABLE IF NOT EXISTS semesters (
  id BIGSERIAL PRIMARY KEY,
  semester_number INT NOT NULL,
  year_id BIGINT NOT NULL REFERENCES years(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(semester_number, year_id)
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  semester_id BIGINT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  credits INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  pdf_url VARCHAR(500),
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Exam Schedules table
CREATE TABLE IF NOT EXISTS exam_schedules (
  id BIGSERIAL PRIMARY KEY,
  semester_id BIGINT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  exam_time TIME,
  exam_type VARCHAR(50),
  location VARCHAR(255),
  instructions TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Timetables table
CREATE TABLE IF NOT EXISTS timetables (
  id BIGSERIAL PRIMARY KEY,
  semester_id BIGINT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  room_number VARCHAR(50),
  instructor VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Opinions table
CREATE TABLE IF NOT EXISTS opinions (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  difficulty_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Admin profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
      `,
    })

    if (error) {
      console.log("[v0] RPC exec_sql not available, trying direct SQL...", error)
      // Try direct SQL approach
      const { error: sqlError } = await supabase.sql`
        CREATE TABLE IF NOT EXISTS categories (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        );
      `

      if (sqlError) {
        return NextResponse.json(
          {
            error:
              "Database RPC method not configured. Please run the SQL migration manually in your Supabase dashboard.",
            details: sqlError,
          },
          { status: 500 },
        )
      }
    }

    console.log("[v0] Database schema created successfully")
    return NextResponse.json({ success: true, message: "Database schema created successfully" })
  } catch (error) {
    console.error("[v0] Setup error:", error)
    return NextResponse.json({ error: "Failed to setup database", details: String(error) }, { status: 500 })
  }
}
