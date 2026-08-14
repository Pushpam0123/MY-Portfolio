import { LoadingProvider } from '@/context/LoadingContext';
import { Preloader } from '@/components/layout/Preloader';
import { Smoother } from '@/components/layout/Smoother';
import { Navbar } from '@/components/layout/Navbar';
import { Cursor } from '@/components/layout/Cursor';
import { SocialRail } from '@/components/layout/SocialRail';
import { Noise } from '@/components/layout/Noise';
import { Footer } from '@/components/layout/Footer';

import { Landing } from '@/components/sections/Landing';
import { About } from '@/components/sections/About';
import { WhatIDo } from '@/components/sections/WhatIDo';
import { Career } from '@/components/sections/Career';
import { Work } from '@/components/sections/Work';
import { TechStack } from '@/components/sections/TechStack';
import { Credentials } from '@/components/sections/Credentials';
import { Contact } from '@/components/sections/Contact';

export default function App() {
  return (
    <LoadingProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Preloader />
      <Cursor />
      <Noise />
      <Navbar />
      <SocialRail />

      <Smoother>
        <main id="main">
          <Landing />
          <About />
          <WhatIDo />
          <Career />
          <Work />
          <TechStack />
          <Credentials />
          <Contact />
        </main>
        <Footer />
      </Smoother>
    </LoadingProvider>
  );
}
