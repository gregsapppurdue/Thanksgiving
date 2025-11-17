import React from 'react';
import { GeneralInfo } from './components/GeneralInfo.tsx';
import { MenuSection } from './components/MenuSection.tsx';
import { RsvpSection } from './components/RsvpSection.tsx';

export const App: React.FC = () => {
  return (
    <div className="text-sage">
      <header className="sticky top-0 z-50 bg-gradient-to-b from-pumpkin to-maple text-wheat shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/Images/SAPP Dinner Logo.png"
              alt="Sapp Dinner Logo"
              className="h-28 md:h-36 w-auto"
            />
            <div>
              <p className="uppercase tracking-[0.25em] text-xs md:text-sm text-wheat/80">
                You&apos;re invited
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-serif font-semibold tracking-tight">
                Thanksgiving Dinner
              </h1>
              <p className="mt-1 text-sm md:text-base text-wheat/90">
                A cozy evening of gratitude, good food, and great company.
              </p>
            </div>
          </div>
          <nav className="flex gap-3 text-sm md:text-base">
            <a 
              href="#info" 
              className="px-3 py-2 rounded-full bg-wheat/10 hover:bg-wheat/20 border border-wheat/30 transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('info');
                if (element) {
                  const headerOffset = 100; // Approximate header height
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}
            >
              Info
            </a>
            <a 
              href="#menu" 
              className="px-3 py-2 rounded-full bg-wheat/10 hover:bg-wheat/20 border border-wheat/30 transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('menu');
                if (element) {
                  const headerOffset = 100; // Approximate header height
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}
            >
              Menu
            </a>
            <a 
              href="#rsvp" 
              className="px-3 py-2 rounded-full bg-wheat text-pumpkin font-medium shadow-sm hover:bg-amber-100 transition-all duration-200 hover:scale-105"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('rsvp');
                if (element) {
                  const headerOffset = 100; // Approximate header height
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}
            >
              RSVP
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-16">
        <section id="info" className="scroll-mt-24">
          <GeneralInfo />
        </section>
        <section id="menu" className="scroll-mt-24">
          <MenuSection />
        </section>
        <section id="rsvp" className="scroll-mt-24">
          <RsvpSection />
        </section>
      </main>

      <footer className="mt-8 pb-8 text-center text-xs text-sage/70">
        Made with gratitude and pumpkin pie in mind.
      </footer>
    </div>
  );
};


