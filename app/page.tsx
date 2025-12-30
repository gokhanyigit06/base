import { SiteHeader } from "@/components/site-header";
import { FeatureSection } from "@/components/feature-section";
import { MarqueeSection } from "@/components/marquee-section";
import { WorksSection } from "@/components/works-section";
import { SloganSection } from "@/components/slogan-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col bg-background text-foreground selection:bg-brand-red selection:text-white">
      <SiteHeader />

      {/* New Hero Section: The Future Has Arrived */}
      <div className="pt-24 min-h-[calc(100vh-6rem)] flex items-center">
        <FeatureSection />
      </div>

      {/* Marquee Section */}
      <MarqueeSection />

      {/* Works Section Grid */}
      <WorksSection />

      {/* Slogan Section */}
      <SloganSection />

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
