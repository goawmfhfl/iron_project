-- 소셜링 신청 테이블
CREATE TABLE IF NOT EXISTS socialing_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  socialing_id TEXT NOT NULL,
  form_database_type TEXT NOT NULL CHECK (form_database_type IN ('DORAN_BOOK', 'EVENT', 'VIVID')),
  form_database_id TEXT NOT NULL,
  applicant_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_socialing_applications_form_database_type
  ON socialing_applications(form_database_type);
CREATE INDEX IF NOT EXISTS idx_socialing_applications_status
  ON socialing_applications(status);
CREATE INDEX IF NOT EXISTS idx_socialing_applications_created_at
  ON socialing_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_socialing_applications_socialing_id
  ON socialing_applications(socialing_id);
CREATE INDEX IF NOT EXISTS idx_socialing_applications_user_id
  ON socialing_applications(user_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_socialing_applications_updated_at ON socialing_applications;
CREATE TRIGGER update_socialing_applications_updated_at
  BEFORE UPDATE ON socialing_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE socialing_applications ENABLE ROW LEVEL SECURITY;

-- 익명/로그인 모두 신청 생성 가능
DROP POLICY IF EXISTS "Anyone can create applications" ON socialing_applications;
CREATE POLICY "Anyone can create applications"
  ON socialing_applications
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 로그인 사용자는 자신의 신청 조회 가능
DROP POLICY IF EXISTS "Users can view their own applications" ON socialing_applications;
CREATE POLICY "Users can view their own applications"
  ON socialing_applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 관리자(user_metadata.user_role=admin)는 전체 조회/수정 가능
DROP POLICY IF EXISTS "Admins can view all applications" ON socialing_applications;
CREATE POLICY "Admins can view all applications"
  ON socialing_applications
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'user_role') = 'admin'
  );

DROP POLICY IF EXISTS "Admins can update applications" ON socialing_applications;
CREATE POLICY "Admins can update applications"
  ON socialing_applications
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'user_role') = 'admin'
  );

