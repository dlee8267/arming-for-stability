import React, { useState, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Button Text
const sectionTitles = {
  section1: 'Introduction',
  section2: 'Competition in Strategic Regions',
  section3: 'Strength in Alliance & Partnership',
  section4: 'Countering through Proxy Support',
  section5: 'Preparing Allies for Emerging Threats',
  section6: 'From Tensions to Strategic Economic Engines',
  section7: 'Case Study: Taiwan',
  section8: 'Conclusion',
};

// Button Link
const Section1 = lazy(() => import('./components/001_intro'));
const Section2 = lazy(() => import('./components/002_competition'));
const Section3 = lazy(() => import('./components/003_alliance'));
const Section4 = lazy(() => import('./components/004_proxySupport'));
const Section5 = lazy(() => import('./components/005_emergingThreats'));
const Section6 = lazy(() => import('./components/006_manufacturers'));
const Section7 = lazy(() => import('./components/007_taiwan'));
const Section8 = lazy(() => import('./components/008_conclusion'));

const App = () => {
  const [activeSection, setActiveSection] = useState('section1');

  // Button Func
  const renderSection = () => {
    switch (activeSection) {
      case 'section1':
        return <Section1 />;
      case 'section2':
        return <Section2 />;
      case 'section3':
        return <Section3 />;
      case 'section4':
        return <Section4 />;
      case 'section5':
        return <Section5 />;
      case 'section6':
        return <Section6 />;
      case 'section7':
        return <Section7 />;  
      case 'section8':
        return <Section8 />;
      default:
        return <Section1 />;
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Arming for Stability: U.S. Strategy Through Global Arms Trade</h1>
      </header>

      <aside className="sidebar">
        <h3>Explore the Story</h3>
        <ul>
          {Object.keys(sectionTitles).map((section) => (
            <li key={section}>
              <button onClick={() => setActiveSection(section)}>
                {sectionTitles[section]}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-content">
          <Suspense fallback={<div>Loading...</div>}>
            {renderSection()}
          </Suspense>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
