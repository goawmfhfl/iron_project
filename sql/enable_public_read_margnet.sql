-- 비회원도 오픈 상태 컨텐츠 읽기 가능하도록 RLS 정책 추가
-- 대상: public.read_margnet 테이블

-- 기존 정책이 있다면 제거 (선택적)
-- DROP POLICY IF EXISTS "Allow public read for open contents" ON public.read_margnet;

-- 익명 사용자(anon) 및 인증된 사용자(authenticated)에게 오픈 상태 컨텐츠 읽기 권한 부여
CREATE POLICY "Allow public read for open contents"
ON public.read_margnet
FOR SELECT
TO anon, authenticated
USING (status = '오픈');

-- 참고:
-- - 이 정책은 SELECT 작업에만 적용됩니다
-- - INSERT, UPDATE, DELETE는 기존 정책에 따라 관리됩니다
-- - status가 '오픈'인 행만 읽을 수 있습니다
-- - 비회원(anon)과 회원(authenticated) 모두 이 정책의 적용을 받습니다
