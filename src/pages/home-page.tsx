import { en as t } from '../i18n/en.ts';

export function HomePage() {
  return (
    <section>
      <h1>{t.appName}</h1>
      <p className="tagline">{t.tagline}</p>
      <p>{t.home.intro}</p>
    </section>
  );
}
