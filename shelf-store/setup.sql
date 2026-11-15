-- متتبع منتجات شلف: تجهيز قاعدة البيانات في Supabase
-- انسخ هذا الملف كامل في Supabase > SQL Editor واضغط Run (مرة وحدة بس).

create table if not exists public.products (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- أي أحد عنده رابط الصفحة يقدر يشوف ويعدل (بدون تسجيل دخول)
drop policy if exists "shelf read" on public.products;
drop policy if exists "shelf insert" on public.products;
drop policy if exists "shelf update" on public.products;
drop policy if exists "shelf delete" on public.products;
create policy "shelf read"   on public.products for select to anon, authenticated using (true);
create policy "shelf insert" on public.products for insert to anon, authenticated with check (true);
create policy "shelf update" on public.products for update to anon, authenticated using (true) with check (true);
create policy "shelf delete" on public.products for delete to anon, authenticated using (true);

-- التحديث المباشر: لما أحد يعدل، يتحدث عند الباقين
do $$ begin
  alter publication supabase_realtime add table public.products;
exception when duplicate_object then null; end $$;

-- المنتجات الحالية (20 منتج، منسوخة من المتتبع على claude.ai)
insert into public.products (id, data) values
  ('p01', '{"note": "", "order": 1, "people": [], "priority": "A", "product": "توت باقز", "reviewers": [], "status": "لم يبدأ", "theme": "", "updatedAt": "2026-11-15T10:16:49.966Z"}'::jsonb),
  ('p02', '{"note": "", "order": 2, "people": [], "priority": "A", "product": "Patches", "reviewers": [], "status": "لم يبدأ", "theme": "", "updatedAt": "2026-11-15T10:19:11.327Z"}'::jsonb),
  ('p03', '{"note": "", "order": 3, "people": [], "priority": "A", "product": "باوجز ومقلمات", "reviewers": [], "status": "لم يبدأ", "theme": "", "updatedAt": "2026-11-15T10:19:10.284Z"}'::jsonb),
  ('p04', '{"note": "", "order": 4, "people": [], "priority": "A", "product": "باك شهر رمضان", "reviewers": [], "status": "لم يبدأ", "theme": "رمضان"}'::jsonb),
  ('p05', '{"note": "", "order": 5, "people": [], "priority": "A", "product": "أدوات المائدة", "reviewers": [], "status": "لم يبدأ", "theme": ""}'::jsonb),
  ('p06', '{"note": "", "order": 6, "people": [], "priority": "A", "product": "ستيكرات التلفون", "reviewers": [], "status": "لم يبدأ", "theme": ""}'::jsonb),
  ('p07', '{"note": "", "order": 7, "people": [], "priority": "A", "product": "ماقنتس", "reviewers": [], "status": "لم يبدأ", "theme": ""}'::jsonb),
  ('p08', '{"note": "", "order": 8, "people": [], "priority": "A", "product": "ميداليات", "reviewers": [], "status": "لم يبدأ", "theme": ""}'::jsonb),
  ('p09', '{"note": "مخصصين لمواقع معينة", "order": 9, "people": ["مريم", "معصومة", "الماجد"], "priority": "B", "product": "البوسترات", "reviewers": [], "status": "لم يبدأ", "theme": ""}'::jsonb),
  ('p10', '{"note": "", "order": 10, "people": ["آلاء"], "priority": "B", "product": "كلندر", "reviewers": [], "status": "لم يبدأ", "theme": ""}'::jsonb),
  ('p11', '{"note": "", "order": 11, "people": ["آلاء"], "priority": "B", "product": "لعبة كارد قيم", "reviewers": [], "status": "لم يبدأ", "theme": ""}'::jsonb),
  ('p12', '{"note": "مراجعة جنان", "order": 13.5, "people": [], "priority": "B", "product": "دفتر اكتيفيتي", "reviewers": ["جنان"], "status": "لم يبدأ", "theme": "", "updatedAt": "2026-11-15T09:30:50.473Z"}'::jsonb),
  ('p13', '{"note": "مراجعة المحتوى: جنان وآلاء", "order": 12.25, "people": [], "priority": "B", "product": "دفتر الألعاب", "reviewers": ["جنان", "آلاء"], "status": "لم يبدأ", "theme": "", "updatedAt": "2026-11-15T09:30:55.115Z"}'::jsonb),
  ('p14', '{"note": "", "order": 14, "people": ["الموسوي"], "priority": "B", "product": "مناظر", "reviewers": [], "status": "لم يبدأ", "theme": ""}'::jsonb),
  ('p15', '{"note": "", "order": 15, "people": ["جنان", "الماجد", "آلاء"], "priority": "B", "product": "فريمات", "reviewers": [], "status": "لم يبدأ", "theme": ""}'::jsonb),
  ('p16', '{"note": "تصاميم جديدة متنوعة: أشياء fun وأشياء رزينة", "order": 16, "people": ["مريم", "معصومة", "الماجد"], "priority": "B", "product": "بطاقات تهنئة", "reviewers": [], "status": "لم يبدأ", "theme": ""}'::jsonb),
  ('p17', '{"note": "تصاميم جديدة + حجم كبير", "order": 17, "people": ["مريم", "معصومة", "الماجد"], "priority": "B", "product": "ستيكرات", "reviewers": [], "status": "لم يبدأ", "theme": ""}'::jsonb),
  ('p18', '{"icon": "notebook", "note": "", "order": 18, "people": ["مريم", "معصومة"], "priority": "B", "product": "تاسك لست صغير / دفاتر بسيطة مسطرة / بلانر", "reviewers": [], "status": "لم يبدأ", "steps": [], "theme": "", "updatedAt": "2026-11-15T09:39:47.783Z", "urgent": false}'::jsonb),
  ('p19', '{"note": "كوتيشن على التصميم الموجود", "order": 19, "people": ["طه", "جنان"], "priority": "B", "product": "مفارش", "reviewers": [], "status": "لم يبدأ", "theme": ""}'::jsonb),
  ('p20', '{"note": "متعلقات مائدة شهر رمضان", "order": 20, "people": ["الماجد", "معصومة", "مريم"], "priority": "B", "product": "Tray mats ورق / أكواب ورقية / ستكرات أو ستاندات الأكل", "reviewers": ["جنان"], "status": "لم يبدأ", "theme": "رمضان"}'::jsonb)
on conflict (id) do nothing;
