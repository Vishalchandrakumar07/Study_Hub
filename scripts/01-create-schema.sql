-- Create tables for College Study Hub

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
  type VARCHAR(50) NOT NULL, -- 'notes', 'paper', 'syllabus', 'model_paper'
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
  exam_type VARCHAR(50), -- 'midterm', 'final', 'practical'
  location VARCHAR(255),
  instructions TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Timetables table
CREATE TABLE IF NOT EXISTS timetables (
  id BIGSERIAL PRIMARY KEY,
  semester_id BIGINT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL, -- 'Monday', 'Tuesday', etc
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  room_number VARCHAR(50),
  instructor VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Opinions/Reviews table
CREATE TABLE IF NOT EXISTS opinions (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  difficulty_level VARCHAR(50), -- 'easy', 'medium', 'hard'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Admin users profile (for metadata storage)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'moderator'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable Row Level Security on all tables
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

-- Public read policies (anyone can read)
CREATE POLICY "Allow public read on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Allow public read on years" ON years FOR SELECT USING (true);
CREATE POLICY "Allow public read on semesters" ON semesters FOR SELECT USING (true);
CREATE POLICY "Allow public read on subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow public read on materials" ON materials FOR SELECT USING (true);
CREATE POLICY "Allow public read on exam_schedules" ON exam_schedules FOR SELECT USING (true);
CREATE POLICY "Allow public read on timetables" ON timetables FOR SELECT USING (true);
CREATE POLICY "Allow public read on opinions" ON opinions FOR SELECT USING (true);

-- Admin-only write policies
CREATE POLICY "Admins can manage categories" ON categories 
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage departments" ON departments 
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage years" ON years 
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage semesters" ON semesters 
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage subjects" ON subjects 
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage materials" ON materials 
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage exam_schedules" ON exam_schedules 
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage timetables" ON timetables 
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow users to create opinions" ON opinions FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow public read opinions" ON opinions FOR SELECT USING (true);

CREATE POLICY "Allow users to read own admin profile" ON admin_profiles FOR SELECT 
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_departments_category_id ON departments(category_id);
CREATE INDEX idx_years_department_id ON years(department_id);
CREATE INDEX idx_semesters_year_id ON semesters(year_id);
CREATE INDEX idx_subjects_semester_id ON subjects(semester_id);
CREATE INDEX idx_materials_subject_id ON materials(subject_id);
CREATE INDEX idx_exam_schedules_semester_id ON exam_schedules(semester_id);
CREATE INDEX idx_timetables_semester_id ON timetables(semester_id);
CREATE INDEX idx_opinions_subject_id ON opinions(subject_id);
