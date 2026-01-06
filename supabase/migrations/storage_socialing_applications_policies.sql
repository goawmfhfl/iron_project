-- Storage RLS policies for bucket: socialing-applications
-- 목적: 신청서 파일 업로드/조회가 RLS에 의해 막히지 않도록 최소 정책을 추가

-- 읽기: public (버킷이 public인 경우에만 의미 있음)
DROP POLICY IF EXISTS "Public can read socialing-applications" ON storage.objects;
CREATE POLICY "Public can read socialing-applications"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'socialing-applications');

-- 업로드: 인증된 사용자만 허용 (회원 전용)
-- 경로 규칙: {32자리 hex socialingId}/{파일명} 형태만 허용
-- 예) 2df834013f708078be54f2a628fd6e40/1700000000000-xxxx.png
DROP POLICY IF EXISTS "Public can upload socialing-applications" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload socialing-applications" ON storage.objects;
CREATE POLICY "Authenticated users can upload socialing-applications"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'socialing-applications'
    -- 폴더(prefix)만 32자리 hex로 제한 (파일명은 자유)
    -- 대소문자 모두 허용
    AND name ~* '^[0-9a-f]{32}/'
  );

-- 삭제: authenticated 사용자는 본인 소유 object만 삭제 가능
DROP POLICY IF EXISTS "Authenticated can delete own socialing-applications" ON storage.objects;
CREATE POLICY "Authenticated can delete own socialing-applications"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'socialing-applications'
    AND owner = auth.uid()
  );

