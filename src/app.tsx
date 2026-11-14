import { NavLink, Route, Routes } from 'react-router';
import { en as t } from './i18n/en.ts';
import { AboutPage } from './pages/about-page.tsx';
import { HomePage } from './pages/home-page.tsx';

export function App() {
  return (
    <>
      <header className="site-header">
        <NavLink to="/" className="brand">
          {t.appName}
        </NavLink>
        <nav aria-label="Main">
          <NavLink to="/">{t.nav.home}</NavLink>
          <NavLink to="/about">{t.nav.about}</NavLink>
        </nav>
      </header>
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <p>{t.disclaimer}</p>
      </footer>
    </>
  );
}
