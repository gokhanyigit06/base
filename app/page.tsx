import { SiteHeader } from "@/components/site-header";
import { FeatureSection } from "@/components/feature-section";
import { MarqueeSection } from "@/components/marquee-section";
import { WorksSection } from "@/components/works-section";
import { ClientsSection } from "@/components/clients-section";
import { SloganSection } from "@/components/slogan-section";
import { SiteFooter } from "@/components/site-footer";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSettings() {
  console.log("Fetching settings on server...");
  try {
    const { rows } = await query('SELECT key, value FROM site_settings');

    const settings: Record<string, string> = {};
    rows.forEach((item: any) => {
      settings[item.key] = item.value;
    });

    console.log("Fetched Settings on Server:", JSON.stringify(settings, null, 2));
    return settings;
  } catch (error) {
    console.error("DB fetch error:", error);
    return {};
  }
}

export default async function Home() {
  const settings = await getSettings();

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col bg-background text-foreground selection:bg-brand-red selection:text-white">
      <SiteHeader />

      {/* New Hero Section: The Future Has Arrived */}
      <div className="min-h-screen flex items-center">
        <FeatureSection initialSettings={settings} />
      </div>

      {/* Marquee Section */}
      <MarqueeSection />

      {/* Works Section Grid */}
      <WorksSection />

      {/* Clients Section */}
      <ClientsSection />

      {/* Slogan Section */}
      <SloganSection initialSettings={settings} />

      {/* Footer */}
      <SiteFooter initialSettings={settings} />
    </main>
  );
}
