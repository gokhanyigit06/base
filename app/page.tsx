import { SiteHeader } from "@/components/site-header";
import { FeatureSection } from "@/components/feature-section";
import { MarqueeSection } from "@/components/marquee-section";
import { WorksSection } from "@/components/works-section";
import { SloganSection } from "@/components/slogan-section";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSettings() {
  // Add a timestamp to bypass any edge caching if absolutely needed, but force-dynamic should work.
  const { data } = await supabase.from('site_settings').select('key, value');
  if (!data) return {};
  const settings: Record<string, string> = {};
  data.forEach(item => {
    settings[item.key] = item.value;
  });
  return settings;
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

      {/* Slogan Section */}
      <SloganSection initialSettings={settings} />

      {/* Footer */}
      <SiteFooter initialSettings={settings} />
    </main>
  );
}
