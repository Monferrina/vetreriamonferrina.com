import { CheckGroupV2 } from 'checkly/constructs';

// Gruppo unico di tutti i monitor di PRODUZIONE del sito (uptime + API + pagine).
// Raggruppa per una vista d'insieme in Checkly. CheckGroupV2: i monitor mantengono
// la propria config (frequenza/location) → solo raggruppamento, nessun cambio di consumo.
// Owned dal progetto 'vetreria-monferrina' (questo repo); l'agente SEO ha il suo
// gruppo separato 'Agent-MonferrinoAI' nel repo monferrinoAI.
export const websiteGroup = new CheckGroupV2('monferrina-website', {
  name: 'Monferrina-website',
  tags: ['monferrina', 'production'],
});

// NOTA: il browser check homepage.spec.ts resta FUORI dal gruppo di proposito.
// Spostare il suo testMatch nel gruppo ne cambia il logicalId → Checkly farebbe
// Delete+Create, perdendo lo storico del monitor. Vincolo: zero perdite di config.
