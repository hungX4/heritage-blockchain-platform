import { HeroSection } from "../components/layout/HeroSection";
import { LoginCTASection } from "../components/layout/LoginCTASection";
import { NewsletterSection } from "../components/layout/NewsletterSection";

export function HomePage() {
  return <>
    <HeroSection />
    <NewsletterSection />
    <LoginCTASection />
  </>
}
