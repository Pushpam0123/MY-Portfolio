import { LoadingProvider } from '@/context/LoadingContext';
import { Preloader } from '@/components/layout/Preloader';
import { Smoother } from '@/components/layout/Smoother';
import { Navbar } from '@/components/layout/Navbar';
import { Cursor } from '@/components/layout/Cursor';
import { SocialRail } from '@/components/layout/SocialRail';
import { Noise } from '@/components/layout/Noise';
import { Footer } from '@/components/layout/Footer';
import { Landing } from '@/components/sections/Landing';

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
        </main>
        <Footer />
      </Smoother>
    </LoadingProvider>
  );
}
