-- CTA 버튼 영역 완전 제거 (리드마그넷)
-- 대상: public.read_margnet.cta_buttons
--
-- 주의:
-- - 실행 전, Supabase에서 백업/스냅샷을 권장합니다.
-- - cta_buttons 컬럼 타입이 jsonb가 아닐 경우, '[]'::jsonb 캐스팅을 알맞게 수정하세요.

begin;

-- (선택) 컬럼 드랍 전에 기존 데이터 정리
-- 컬럼이 이미 없으면 이 update는 실행 오류가 날 수 있으니,
-- 운영 환경에서는 정보스키마로 컬럼 존재 여부를 확인한 뒤 실행하는 것을 권장합니다.
update public.read_margnet
set cta_buttons = '[]'::jsonb
where cta_buttons is not null;

-- CTA 컬럼 완전 제거
alter table public.read_margnet
drop column if exists cta_buttons;

commit;

