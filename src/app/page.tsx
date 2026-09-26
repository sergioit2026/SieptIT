"use client";

import { useCallback, useState } from "react";
import IntroSplash from "@/components/IntroSplash";
import styles from "./page.module.css";

export default function HomePage() {
  const [ready, setReady] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setReady(true);
  }, []);

  return (
    <>
      <IntroSplash onComplete={handleIntroComplete} />

      <div
        className={`${styles.shell} ${ready ? styles.shellReady : ""}`}
        aria-hidden={!ready}
      >
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <a href="#topo" className={styles.logo}>
              Siept IT
            </a>
            <nav className={styles.nav} aria-label="Principal">
              <a href="#como-funciona">Como funciona</a>
              <a href="#planos">Planos</a>
              <a href="/criar" className={styles.navCta}>
                Começar
              </a>
            </nav>
          </div>
        </header>

        <main id="topo">
          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroGlow} aria-hidden="true" />
            <div className={styles.heroInner}>
              <p className={styles.eyebrow}>Websites por assinatura</p>
              <h1 id="hero-title" className={styles.heroTitle}>
                O seu site na web.
                <br />
                Simples. Contínuo.
              </h1>
              <p className={styles.heroLead}>
                A Siept IT dá-lhe uma presença digital sóbria e profissional —
                escolha o modelo, personalize e fique online após a assinatura.
                Sem ruído. Sem complexidade desnecessária.
              </p>
              <div className={styles.heroActions}>
                <a href="/criar" className={styles.btn} id="comecar">
                  Criar o meu site
                </a>
                <a href="#como-funciona" className={`${styles.btn} ${styles.btnGhost}`}>
                  Ver como funciona
                </a>
              </div>
              <div className={styles.heroMeta}>
                <div className={styles.metaItem}>
                  <strong>Identidade clara</strong>
                  <span>Um site que representa a sua marca</span>
                </div>
                <div className={styles.metaItem}>
                  <strong>Processo curto</strong>
                  <span>Três passos até estar online</span>
                </div>
                <div className={styles.metaItem}>
                  <strong>Assinatura mensal</strong>
                  <span>Manutenção e evolução incluídas</span>
                </div>
              </div>
            </div>
          </section>

          <section
            id="como-funciona"
            className={styles.section}
            aria-labelledby="steps-title"
          >
            <p className={styles.eyebrow}>Como funciona</p>
            <h2 id="steps-title" className={styles.h2}>
              Do zero ao online, em três passos
            </h2>
            <p className={styles.lead}>
              Um fluxo directo: escolhe, personaliza e publica — a assinatura
              activa o seu site na web.
            </p>
            <ol className={styles.steps}>
              <li className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">
                  01
                </span>
                <h3>Escolher</h3>
                <p>
                  Seleccione o modelo e a estrutura que melhor se adapta ao seu
                  negócio ou projecto.
                </p>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">
                  02
                </span>
                <h3>Personalizar</h3>
                <p>
                  Ajuste textos, cores e conteúdos. Mantenha o controlo da sua
                  identidade visual.
                </p>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">
                  03
                </span>
                <h3>Online após assinatura</h3>
                <p>
                  Confirme a assinatura e o site fica disponível — estável,
                  actualizado e pronto a partilhar.
                </p>
              </li>
            </ol>
          </section>

          <section
            id="planos"
            className={`${styles.section} ${styles.sectionAlt}`}
            aria-labelledby="plans-title"
          >
            <p className={styles.eyebrow}>Planos</p>
            <h2 id="plans-title" className={styles.h2}>
              Comece pelo essencial
            </h2>
            <p className={styles.lead}>
              O plano Básico é o foco actual: identidade na web, limpa e
              profissional. O Futuro chega a seguir, com capacidades avançadas.
              Os preços estão definidos; o pagamento online chega mais perto do
              lançamento.
            </p>

            <div className={styles.plans}>
              <article className={`${styles.plan} ${styles.planFocus}`}>
                <span className={styles.planBadge}>Em destaque</span>
                <h3>Básico</h3>
                <p className={styles.planPrice}>
                  <span className={styles.planAmount}>19,90&nbsp;€</span>
                  <span className={styles.planPeriod}>/mês</span>
                </p>
                <p className={styles.planAlt}>
                  ou <strong>179&nbsp;€/ano</strong> (equivale a 14,90&nbsp;€/mês)
                </p>
                <p className={styles.planTax}>Preços finais · sem checkout por agora</p>
                <p className={styles.planDesc}>
                  A sua identidade na web — página profissional, actualizações
                  contínuas e presença estável sob assinatura.
                </p>
                <ul className={styles.planList}>
                  <li>Site com a sua marca e conteúdos</li>
                  <li>Design sóbrio e responsivo</li>
                  <li>Publicação após assinatura</li>
                  <li>Manutenção e suporte incluídos</li>
                </ul>
                <div className={styles.planCta}>
                  <a href="/criar" className={styles.btn}>
                    Começar o wizard
                  </a>
                </div>
              </article>

              <article className={styles.plan} aria-label="Plano Futuro, em breve">
                <span className={`${styles.planBadge} ${styles.planComing}`}>
                  Em breve
                </span>
                <h3>Futuro</h3>
                <p className={styles.planPriceSoon}>Preço a anunciar</p>
                <p className={styles.planDesc}>
                  Expansão natural do Básico: base de dados, newsletters e
                  ferramentas para crescer com a sua audiência.
                </p>
                <ul className={`${styles.planList} ${styles.planMuted}`}>
                  <li>Base de dados e conteúdos dinâmicos</li>
                  <li>Newsletters e comunicação</li>
                  <li>Mais integrações e automação</li>
                </ul>
              </article>
            </div>
          </section>

          <section className={styles.strip} aria-labelledby="strip-title">
            <div className={styles.stripInner}>
              <div className={styles.stripCopy}>
                <h2 id="strip-title">Tecnologia calma. Presença clara.</h2>
                <p>
                  Inspirado na precisão de marcas que valorizam o essencial:
                  espaços generosos, tipografia limpa e um azul sóbrio que
                  orienta sem gritar.
                </p>
              </div>
              <div className={styles.stripVisual} aria-hidden="true">
                <div className={styles.stripGrid} />
                <div className={styles.stripOrb} />
                <div className={styles.stripLine} />
                <span className={styles.stripLabel}>Siept IT · sistema visual</span>
              </div>
            </div>
          </section>

          <section className={styles.final} aria-labelledby="final-title">
            <h2 id="final-title">Pronto para estar online?</h2>
            <p>
              Comece pelo plano Básico e construa a sua presença digital com a
              Siept IT — sem fricção, com continuidade.
            </p>
            <div className={styles.finalActions}>
              <a href="/criar" className={styles.btn}>
                Criar o meu site
              </a>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <p className={styles.footerCopy}>© {new Date().getFullYear()} Siept IT</p>
            <div className={styles.footerLinks}>
              <a href="/privacidade">Privacidade</a>
              <a href="/termos">Termos</a>
              <a href="#">Contacto</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
