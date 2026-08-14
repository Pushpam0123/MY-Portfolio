import { LoadingProvider } from '@/context/LoadingContext';
import { Preloader } from '@/components/layout/Preloader';
import { Smoother } from '@/components/layout/Smoother';
import { Navbar } from '@/components/layout/Navbar';
import { Cursor } from '@/components/layout/Cursor';
import { SocialRail } from '@/components/layout/SocialRail';
import { Noise } from '@/components/layout/Noise';
import { Footer } from '@/components/layout/Footer';

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
          <section id="top" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
            <h1 className="display" style={{ fontSize: 'var(--t-hero)' }}>
              Pushpam Raj
            </h1>
          </section>
          <section id="about" className="section">
            <div className="shell">
              <p className="lede">Placeholder section.</p>
            </div>
          </section>
        </main>
        <Footer />
      </Smoother>
    </LoadingProvider>
  );
}
