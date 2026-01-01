-- "Policy does not exist" hatası aldıysanız, muhtemelen isimlendirme biraz farklıdır.
-- Bu script, olası tüm isimleri deneyerek siler ve temiz bir başlangıç yapar.
-- Hepsini kopyalayıp çalıştırabilirsiniz.

-- 1. Olası eski kuralları temizle (Hata vermez, varsa siler)
drop policy if exists "Enable insert/update for anon" on "public"."site_settings";
drop policy if exists "Enable insert/update for anon (for dev only - restrict in prod)" on "public"."site_settings";
drop policy if exists "Enable insert for anon" on "public"."site_settings";
drop policy if exists "Enable update for anon" on "public"."site_settings";

-- 2. "Enable read access for all users" kuralının zaten var olduğunu varsayıyoruz (Select).
-- Eğer o da yoksa veya emin olmak isterseniz şu satırın başındaki -- işaretini kaldırın:
-- create policy "Enable read access for all users" on "public"."site_settings" for select using (true);

-- 3. Yazma (INSERT) ve Güncelleme (UPDATE) için temiz kuralları ekle
create policy "Enable insert for anon"
on "public"."site_settings"
for insert
to anon
with check (true);

create policy "Enable update for anon"
on "public"."site_settings"
for update
to anon
using (true);

-- Başarılı olursa "Success, no rows returned" diyecektir.
