import { useEffect } from 'react'

export default function LaCreatrice() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <main className="page-createur">

      {/* ── Hero texte ── */}
      <section className="createur-hero">
        <p className="createur-label">La créatrice</p>
        <h1 className="createur-title">
          Coline<br /><em>Cleiren</em>
        </h1>
      </section>

      {/* ── Portrait + citation ── */}
      <section className="createur-portrait">
        <div className="createur-portrait__img-wrap">
          <img
            src="/hero.png"
            alt="Coline Cleiren"
            className="createur-portrait__img"
          />
        </div>
        <div className="createur-portrait__text">
          <blockquote className="createur-quote">
            « Une robe de mariée n'est pas un vêtement.<br />
            C'est une promesse faite en tissu. »
          </blockquote>
          <p className="createur-body">
            Coline Cleiren grandit entourée de tissus, d'aiguilles et de la patience
            des gestes répétés. Après des années de formation en couture haute
            et plusieurs saisons à Paris, elle choisit Bordeaux — sa lumière
            dorée, son rythme — pour ouvrir son atelier.
          </p>
          <p className="createur-body">
            Chaque robe naît d'une conversation. D'abord les silences,
            les hésitations, les mots qui cherchent leur forme. Puis la matière
            qui prend vie sous les mains. Coline travaille exclusivement sur
            rendez-vous, une mariée à la fois, pour offrir une attention
            qui ne se divise pas.
          </p>
        </div>
      </section>

      {/* ── Savoir-faire ── */}
      <section className="createur-savoir">
        <div className="createur-savoir__col">
          <h2 className="createur-savoir__titre">Le sur-mesure</h2>
          <p className="createur-body">
            Aucun patron industriel. Chaque pièce est construite à partir
            de vos mensurations exactes, dans les matières que vous choisissez
            ensemble lors de la première rencontre — soie, crêpe, dentelle
            de Calais, organza.
          </p>
        </div>
        <div className="createur-savoir__col">
          <h2 className="createur-savoir__titre">L'atelier</h2>
          <p className="createur-body">
            Situé au cœur de Bordeaux, l'atelier est un espace de calme
            et de lumière naturelle. Les essayages s'y déroulent dans
            l'intimité, sans précipitation, avec le soin que mérite
            ce moment unique.
          </p>
        </div>
        <div className="createur-savoir__col">
          <h2 className="createur-savoir__titre">La durée</h2>
          <p className="createur-body">
            Comptez quatre à six mois entre le premier rendez-vous
            et la livraison finale. Ce délai n'est pas une contrainte —
            c'est la condition d'une robe qui vous ressemble vraiment.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="createur-cta">
        <p className="createur-cta__text">
          Rencontrons-nous.
        </p>
        <a href="/contact" className="createur-cta__btn">
          Prendre rendez-vous
        </a>
      </section>

    </main>
  )
}
