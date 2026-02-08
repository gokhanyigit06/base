const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function downloadFile(url, fileName) {
    if (!url || !url.startsWith('http')) return url;
    if (!url.includes('supabase.co')) return url; // Sadece Supabase linklerini çek

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);

        const buffer = Buffer.from(await response.arrayBuffer());
        const finalFileName = `${Date.now()}-${fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
        const filePath = path.join(UPLOADS_DIR, finalFileName);

        await fs.writeFile(filePath, buffer);
        console.log(`✅ İndirildi: ${finalFileName}`);
        return `/uploads/${finalFileName}`;
    } catch (err) {
        console.error(`❌ İndirme hatası (${url}):`, err.message);
        return url; // Hata alırsak orijinal link kalsın
    }
}

async function migrate() {
    console.log("🔄 Veri ve Medya taşıma işlemi başlıyor...");
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const pg = new Client({
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5454,
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'mysecretpassword',
        database: process.env.POSTGRES_DB || 'agency_site'
    });

    try {
        await pg.connect();

        // --- 1. Site Ayarları ---
        console.log("📥 Ayarlar ve Medyalar taşınıyor...");
        const { data: settings } = await supabase.from('site_settings').select('*');
        if (settings) {
            for (const item of settings) {
                let value = item.value;
                // Eğer değer bir görsel/video linki ise indir
                if (value && (value.includes('.png') || value.includes('.jpg') || value.includes('.jpeg') || value.includes('.mp4') || value.includes('.webm') || value.includes('.otf') || value.includes('.ttf'))) {
                    const fileName = value.split('/').pop().split('?')[0];
                    value = await downloadFile(value, fileName);
                }
                await pg.query(
                    'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
                    [item.key, value]
                );
            }
        }

        // --- 2. Müşteriler ---
        console.log("📥 Müşteriler ve Logolar taşınıyor...");
        const { data: clients } = await supabase.from('clients').select('*');
        if (clients) {
            for (const item of clients) {
                let logoUrl = item.logo_url;
                if (logoUrl) {
                    const fileName = logoUrl.split('/').pop().split('?')[0];
                    logoUrl = await downloadFile(logoUrl, fileName);
                }
                await pg.query(
                    'INSERT INTO clients (id, name, logo_url, description, display_order) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET logo_url = $3, name = $2, description = $4',
                    [item.id, item.name, logoUrl, item.description, item.display_order]
                );
            }
        }

        // --- 3. Projeler ---
        console.log("📥 Projeler ve Medyalar taşınıyor...");
        const { data: projects } = await supabase.from('projects').select('*');
        if (projects) {
            for (const item of projects) {
                let coverImage = item.cover_image;
                if (coverImage) {
                    const fileName = coverImage.split('/').pop().split('?')[0];
                    coverImage = await downloadFile(coverImage, fileName);
                }

                let videoUrl = item.video_url || item.cover_video;
                if (videoUrl) {
                    const fileName = videoUrl.split('/').pop().split('?')[0];
                    videoUrl = await downloadFile(videoUrl, fileName);
                }

                // İçerik bloklarındaki medyaları işle (JSON)
                let content = item.content || [];
                if (Array.isArray(content)) {
                    for (let block of content) {
                        if (block.src) {
                            const fileName = block.src.split('/').pop().split('?')[0];
                            block.src = await downloadFile(block.src, fileName);
                        }
                        if (block.items && Array.isArray(block.items)) {
                            for (let subItem of block.items) {
                                if (subItem.src) {
                                    const fileName = subItem.src.split('/').pop().split('?')[0];
                                    subItem.src = await downloadFile(subItem.src, fileName);
                                }
                            }
                        }
                    }
                }

                await pg.query(
                    `INSERT INTO projects (id, title, slug, category, description, year, client, services, cover_image, video_url, cover_video, content, is_featured, display_order) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
                     ON CONFLICT (id) DO UPDATE SET cover_image = $9, video_url = $10, cover_video = $11, content = $12`,
                    [item.id, item.title, item.slug, item.category, item.description, item.year, item.client, item.services, coverImage, videoUrl, videoUrl, JSON.stringify(content), item.is_featured, item.display_order]
                );
            }
        }

        // --- 4. Markalar (Labs) ---
        console.log("📥 Labs Markaları ve Logolar taşınıyor...");
        const { data: brands } = await supabase.from('brands').select('*');
        if (brands) {
            for (const item of brands) {
                let logoUrl = item.logo_url;
                if (logoUrl) {
                    const fileName = logoUrl.split('/').pop().split('?')[0];
                    logoUrl = await downloadFile(logoUrl, fileName);
                }
                await pg.query(
                    `INSERT INTO brands (id, name, logo_url, brand_voice, meta_access_token) 
                     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET logo_url = $3`,
                    [item.id, item.name, logoUrl, item.brand_voice, item.meta_access_token]
                );
            }
        }

        // --- 5. Özel Fontlar ---
        console.log("📥 Özel Fontlar taşınıyor...");
        const { data: fonts } = await supabase.from('custom_fonts').select('*');
        if (fonts) {
            for (const item of fonts) {
                let fontUrl = item.font_url;
                if (fontUrl) {
                    const fileName = fontUrl.split('/').pop().split('?')[0];
                    fontUrl = await downloadFile(fontUrl, fileName);
                }
                await pg.query(
                    `INSERT INTO custom_fonts (id, name, font_url, font_family) 
                     VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET font_url = $3`,
                    [item.id, item.name, fontUrl, item.font_family]
                );
            }
        }

        console.log("🚀 Tüm veri ve medya dosyaları başarıyla aktarıldı!");

    } catch (err) {
        console.error("❌ Hata oluştu:", err);
    } finally {
        await pg.end();
    }
}

migrate();
