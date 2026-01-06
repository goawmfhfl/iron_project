
-- RLS 활성화 확인 및 활성화
ALTER TABLE socialing_applications ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거
DROP POLICY IF EXISTS "Anyone can insert applications" ON socialing_applications;
DROP POLICY IF EXISTS "Authenticated users can insert applications" ON socialing_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON socialing_applications;
DROP POLICY IF EXISTS "Users can view applications" ON socialing_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON socialing_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON socialing_applications;

-- INSERT 정책: 인증된 사용자만 신청을 생성할 수 있으며, user_id는 현재 사용자와 일치해야 함
CREATE POLICY "Authenticated users can insert applications"
  ON socialing_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- SELECT 정책: 관리자는 모든 신청을 볼 수 있고, 일반 사용자는 자신의 신청만 볼 수 있음
CREATE POLICY "Users can view applications"
  ON socialing_applications
  FOR SELECT
  TO authenticated
  USING (
    -- 관리자는 모든 신청 조회 가능
    (auth.jwt() -> 'user_metadata' ->> 'user_role') = 'admin' OR
    -- 인증된 사용자는 자신의 신청만 조회 가능
    (auth.uid() = user_id)
  );

-- UPDATE 정책: 관리자만 신청 상태를 업데이트할 수 있음
CREATE POLICY "Admins can update applications"
  ON socialing_applications
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'user_role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'user_role') = 'admin'
  );

