import { en as t } from '../i18n/en.ts';

export function AboutPage() {
  return (
    <section>
      <h1>{t.about.title}</h1>
      <p>{t.disclaimer}</p>
      <h2>{t.about.aiUsage}</h2>
      <p>{t.about.aiUsageText}</p>
      <h2>{t.about.privacy}</h2>
      <p>{t.about.privacyText}</p>
    </section>
  );
}
