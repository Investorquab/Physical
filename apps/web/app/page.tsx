import { Nav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { Problem } from "@/components/marketing/problem";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { UseCases } from "@/components/marketing/use-cases";
import { Architecture } from "@/components/marketing/architecture";
import { Cta } from "@/components/marketing/cta";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <Problem />
        <HowItWorks />
        <UseCases />
        <Architecture />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
