# Google Vertex AI (Imagen) Kurulum Rehberi

Google'ın **Imagen 3** modeli şu an piyasadaki en iyi fotorealistik görsel üreten modellerden biridir (Midjourney seviyesindedir) ve API desteği sayesinde bu proje için **en profesyonel seçimdir.**

Bu entegrasyonu yapmak için aşağıdaki adımları takip etmeniz gerekir:

## 1. Google Cloud Projesi Oluşturun
1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin.
2. Sol üstten "New Project" diyerek yeni bir proje oluşturun (örn: `base-agency-ai`).
3. **Billing (Ödeme)** hesabınızı projeye bağlayın (Google Cloud API'leri kullanmak için zorunludur).

## 2. Vertex AI API'yi Etkinleştirin
1. Arama çubuğuna **"Vertex AI API"** yazın.
2. Çıkan sonuca tıklayıp **"ENABLE"** (Etkinleştir) butonuna basın.

## 3. Service Account (Hizmet Hesabı) Oluşturun
Projemizin Google ile güvenli konuşması için bir "kimlik kartına" ihtiyacı var.

1. Sol menüden **IAM & Admin** > **Service Accounts** kısmına gidin.
2. **"Create Service Account"** butonuna basın.
3. İsim verin (örn: `ai-generator`) ve "Create" deyin.
4. **Role** (Rol) kısmında: **"Vertex AI User"** rolünü seçin.
5. "Done" diyerek bitirin.

## 4. JSON Anahtarını İndirin
1. Oluşturduğunuz hesabın (email adresinin) üzerine tıklayın.
2. **KEYS** sekmesine gelin.
3. **"Add Key"** > **"Create new key"** seçeneğini seçin.
4. **JSON** seçeneğini işaretleyip "Create"e basın.
5. Bilgisayarınıza bir dosya inecek (örn: `base-agency-ai-12345.json`).

## 5. Projeye Entegre Edin
1. İndirdiğiniz bu JSON dosyasının içindeki her şeyi kopyalayın.
2. Bu dosyadaki metni tek satır haline getirin (veya `.env.local` dosyasına dikkatlice yapıştıracağız).
3. `.env.local` dosyanıza şu satırı ekleyin:

```bash
GOOGLE_APPLICATION_CREDENTIALS_JSON='{...kopyaladığınız_json_içeriği...}'
GOOGLE_PROJECT_ID='proje-id-niz'
```

Bu adımları tamamladığınızda bana haber verin, `actions.ts` dosyasını gerçek Imagen 3 API'sine bağlayalım! 🚀
