import { AnalyticsTracker } from "../analytics/AnalyticsTracker";
import { AboutSection } from "./AboutSection";
import { ContactSection } from "./ContactSection";
import { CtaSection } from "./CtaSection";
import { FaqSection } from "./FaqSection";
import { HeroSection } from "./HeroSection";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { MethodSection } from "./MethodSection";
import { MissionVisionSection } from "./MissionVisionSection";
import { OperationalEvidenceSection } from "./OperationalEvidenceSection";
import { ResourcesSection } from "./ResourcesSection";
import { SectorsSection } from "./SectorsSection";
import { ServicesSection } from "./ServicesSection";
import { StatsBar } from "./StatsBar";
import { TestimonialsSection } from "./TestimonialsSection";
import { TrustSection } from "./TrustSection";
import { WhatsAppFAB } from "./WhatsAppFAB";
export function PublicLandingContent() {
	return (
		<div className="relative isolate w-full max-w-full overflow-x-hidden bg-canvas text-ink">
			<AnalyticsTracker />
			<a
				href="#main-content"
				className="sr-only fixed left-4 top-4 z-[60] rounded-lg bg-canvas px-4 py-3 text-sm font-semibold text-ink shadow-2 focus:not-sr-only focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/60"
			>
				Saltar al contenido principal
			</a>
			<LandingHeader />

			<div id="main-content" tabIndex={-1}>
				<HeroSection />
				<StatsBar />
				<TrustSection />
				<ServicesSection />
				<SectorsSection />
				<MethodSection />
				<TestimonialsSection />
				<OperationalEvidenceSection />
				<ResourcesSection />
				<AboutSection />
				<MissionVisionSection />
				<FaqSection />
				<CtaSection />
				<ContactSection />
			</div>

			<LandingFooter />
			<WhatsAppFAB />
		</div>
	);
}
