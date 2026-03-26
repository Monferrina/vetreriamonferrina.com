export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  content: string;
  related?: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'come-scegliere-vetro-box-doccia',
    title: 'Come scegliere il vetro per il box doccia',
    description:
      'Guida alla scelta del vetro giusto per il box doccia: temperato o stratificato, spessori, finiture e trattamenti.',
    date: '2026-03-26',
    image: '/images/services/box-doccia.webp',
    related: ['vetrocamera-doppio-o-triplo', 'vetro-temperato-vs-stratificato'],
    content: `
<h2>Vetro temperato: lo standard per il box doccia</h2>
<p>Il vetro temperato è la scelta più diffusa per i box doccia, e per buone ragioni. Sottoposto a un trattamento termico che ne aumenta la resistenza meccanica di 4-5 volte rispetto al vetro comune, in caso di rottura si frantuma in piccoli frammenti a bordi smussati, riducendo al minimo il rischio di tagli.</p>
<p>Per il box doccia si utilizzano generalmente spessori da <strong>6 mm</strong> (cabine standard) o <strong>8 mm</strong> (soluzioni di pregio o grandi dimensioni). La scelta dipende dalle dimensioni della lastra e dal tipo di apertura.</p>

<h2>Trasparente, satinato o extra-chiaro?</h2>
<p>La finitura del vetro cambia radicalmente l'aspetto del bagno:</p>
<ul>
<li><strong>Trasparente</strong> — massima luminosità, effetto di ampiezza. Ideale per bagni piccoli.</li>
<li><strong>Satinato</strong> — garantisce privacy mantenendo il passaggio della luce. La soluzione più richiesta per bagni condivisi.</li>
<li><strong>Extra-chiaro</strong> — vetro trasparente senza la leggera tonalità verde del vetro standard. Resa estetica superiore, perfetto per ambienti di design.</li>
</ul>

<h2>Il trattamento anticalcare</h2>
<p>Un aspetto spesso sottovalutato è il trattamento protettivo delle superfici. Si tratta di un rivestimento invisibile che impedisce al calcare di aderire al vetro, rendendo la pulizia quotidiana molto più semplice.</p>
<p>Il nostro consiglio: se il vostro bagno ha acqua particolarmente dura, il trattamento anticalcare è un investimento che ripaga nel tempo.</p>

<h2>Profili e ferramenta</h2>
<p>La scelta dei profili completa il design del box doccia. Le opzioni più comuni:</p>
<ul>
<li><strong>Cromato lucido</strong> — classico e versatile, si abbina a qualsiasi rubinetteria.</li>
<li><strong>Satinato (acciaio spazzolato)</strong> — moderno, nasconde meglio le impronte.</li>
<li><strong>Nero opaco</strong> — tendenza contemporanea, ideale per bagni in stile industriale o minimal.</li>
</ul>

<h2>Su misura è meglio</h2>
<p>I box doccia industriali hanno misure standard che raramente si adattano perfettamente allo spazio disponibile. Un box doccia su misura elimina il problema: le lastre vengono tagliate sulle dimensioni esatte del vostro bagno, compresi spazi irregolari, nicchie e sottotetti.</p>
<p>Ogni box doccia che realizziamo nel nostro laboratorio è un pezzo unico, pensato insieme al cliente dalla prima misurazione alla posa finale.</p>
`,
  },
  {
    slug: 'vetrocamera-doppio-o-triplo',
    title: 'Vetrocamera doppio o triplo: quale scegliere',
    description:
      "Differenze tra vetrocamera doppio e triplo: isolamento termico, acustico, costi e quando conviene uno o l'altro.",
    date: '2026-03-26',
    image: '/images/gallery/vetri-grande-vetrata.webp',
    related: ['come-scegliere-vetro-box-doccia', 'vetro-temperato-vs-stratificato'],
    content: `
<h2>Come funziona il vetrocamera</h2>
<p>Il vetrocamera (o vetro isolante) è composto da due o tre lastre di vetro separate da intercapedini riempite d'aria disidratata o gas nobile (argon o kripton). Questa struttura crea una barriera che riduce significativamente la trasmissione di calore e rumore.</p>

<h2>Vetrocamera doppio</h2>
<p>La configurazione classica prevede due lastre di vetro (tipicamente 4 mm ciascuna) separate da un'intercapedine di 16 mm. I vantaggi principali:</p>
<ul>
<li><strong>Isolamento termico</strong> — riduce la dispersione di calore del 50-60% rispetto al vetro singolo.</li>
<li><strong>Isolamento acustico</strong> — abbattimento significativo del rumore esterno.</li>
<li><strong>Costo contenuto</strong> — il miglior rapporto qualità-prezzo per la maggior parte delle situazioni.</li>
<li><strong>Peso ridotto</strong> — compatibile con la maggior parte dei serramenti esistenti.</li>
</ul>

<h2>Vetrocamera triplo</h2>
<p>Tre lastre con due intercapedini offrono prestazioni nettamente superiori:</p>
<ul>
<li><strong>Trasmittanza termica (Ug)</strong> — fino a 0,5 W/m²K contro 1,1 W/m²K del doppio. Praticamente il doppio dell'isolamento.</li>
<li><strong>Comfort superiore</strong> — elimina la sensazione di freddo vicino alle finestre e riduce la condensa.</li>
<li><strong>Abbattimento acustico</strong> — con lastre di spessori differenziati, il triplo vetro offre il massimo isolamento dal rumore.</li>
</ul>

<h2>Quando scegliere il triplo</h2>
<p>Il vetrocamera triplo è la scelta giusta quando:</p>
<ul>
<li>Si costruisce una casa nuova o si fa una ristrutturazione importante.</li>
<li>L'edificio si trova in zona climatica E o F (inverni rigidi).</li>
<li>Si vuole raggiungere la classe energetica A o superiore.</li>
<li>L'abitazione è su una strada trafficata e serve il massimo isolamento acustico.</li>
</ul>
<p>Per sostituzioni su serramenti esistenti, il doppio vetrocamera con trattamento basso-emissivo rappresenta spesso la scelta più equilibrata.</p>

<h2>Gas argon e trattamento basso-emissivo</h2>
<p>Due accorgimenti che migliorano le prestazioni di qualsiasi vetrocamera:</p>
<ul>
<li><strong>Gas argon</strong> — riempie l'intercapedine al posto dell'aria, migliorando l'isolamento termico del 15-20%.</li>
<li><strong>Trattamento basso-emissivo</strong> — un rivestimento invisibile sulla superficie interna del vetro che riflette il calore verso l'interno d'inverno e lo respinge d'estate.</li>
</ul>
<p>Entrambi sono disponibili sia sul doppio che sul triplo vetrocamera.</p>
`,
  },
  {
    slug: 'vetro-temperato-vs-stratificato',
    title: 'Vetro temperato e stratificato: le differenze',
    description:
      'Guida completa alle differenze tra vetro temperato e stratificato: sicurezza, usi, normative e quale scegliere.',
    date: '2026-03-26',
    image: '/images/services/stratificati.webp',
    related: ['come-scegliere-vetro-box-doccia', 'come-pulire-mantenere-vetri'],
    content: `
<h2>Due vetri di sicurezza, due comportamenti diversi</h2>
<p>Sia il vetro temperato che lo stratificato sono classificati come "vetri di sicurezza", ma si comportano in modo opposto in caso di rottura. Capire questa differenza è fondamentale per scegliere il vetro giusto.</p>

<h2>Vetro temperato</h2>
<p>Il vetro temperato viene riscaldato a circa 700°C e poi raffreddato rapidamente. Questo processo crea tensioni interne che aumentano la resistenza meccanica di 4-5 volte.</p>
<p><strong>In caso di rottura:</strong> si frantuma in piccoli frammenti a bordi arrotondati, simili a granuli. Nessun pezzo tagliente, ma il vetro non resta in posizione.</p>
<p><strong>Dove si usa:</strong> box doccia, porte interne in vetro, piani tavolo, mensole, ripiani.</p>
<p><strong>Importante:</strong> il vetro temperato non può essere tagliato, forato o lavorato dopo la tempera. Tutte le lavorazioni (sagomatura, foratura, molatura) vanno eseguite prima del trattamento termico.</p>

<h2>Vetro stratificato</h2>
<p>Il vetro stratificato è composto da due o più lastre unite da un intercalare plastico in PVB (polivinilbutirrale). L'intercalare tiene insieme i frammenti in caso di rottura.</p>
<p><strong>In caso di rottura:</strong> il vetro si crepa ma resta in posizione, trattenuto dall'intercalare. Nessuna caduta di frammenti.</p>
<p><strong>Dove si usa:</strong> parapetti, balaustre, pensiline, vetrine, lucernari — ovunque un vetro rotto che cade potrebbe essere pericoloso.</p>
<p><strong>Vantaggi aggiuntivi:</strong> l'intercalare in PVB filtra fino al 99% dei raggi UV e migliora l'isolamento acustico.</p>

<h2>La normativa UNI 7697</h2>
<p>La norma italiana UNI 7697 stabilisce quando è obbligatorio l'uso di vetro di sicurezza (temperato o stratificato) in base alla posizione e all'altezza dell'installazione. In sintesi:</p>
<ul>
<li><strong>Parapetti e balaustre</strong> — vetro stratificato obbligatorio (deve restare in posizione).</li>
<li><strong>Porte interne</strong> — vetro temperato o stratificato.</li>
<li><strong>Box doccia</strong> — vetro temperato.</li>
<li><strong>Pensiline e coperture</strong> — vetro stratificato (protezione da caduta).</li>
</ul>

<h2>Quale scegliere</h2>
<p>La regola è semplice: se il vetro è in posizione verticale e non rischia di cadere su qualcuno (box doccia, porte), il <strong>temperato</strong> è sufficiente e più economico. Se è in posizione elevata, inclinata o dove la caduta di frammenti sarebbe pericolosa (parapetti, pensiline, lucernari), serve lo <strong>stratificato</strong>.</p>
<p>In caso di dubbio, contattateci: valutiamo ogni situazione e vi consigliamo la soluzione conforme alle normative.</p>
`,
  },
  {
    slug: 'come-pulire-mantenere-vetri',
    title: 'Come pulire e mantenere i vetri nel tempo',
    description:
      'Consigli pratici per la pulizia e la manutenzione di box doccia, vetrate, parapetti e specchi.',
    date: '2026-03-26',
    image: '/images/services/specchi.webp',
    related: ['come-scegliere-vetro-box-doccia', 'vetro-temperato-vs-stratificato'],
    content: `
<h2>La regola d'oro: semplicità</h2>
<p>Il vetro è un materiale resistente e facile da mantenere. Nella maggior parte dei casi bastano acqua e un panno morbido. I prodotti aggressivi non solo sono inutili, ma possono danneggiare guarnizioni e profili.</p>

<h2>Box doccia</h2>
<p>Il box doccia è la superficie vetrata più esposta al calcare. Pochi accorgimenti fanno la differenza:</p>
<ul>
<li><strong>Dopo ogni utilizzo</strong> — passate una spatola o un panno asciutto sulle pareti. Trenta secondi che prevengono ore di pulizia.</li>
<li><strong>Pulizia settimanale</strong> — acqua tiepida con un goccio di detersivo per piatti. Risciacquate e asciugate.</li>
<li><strong>Calcare ostinato</strong> — una soluzione di acqua e aceto bianco (50/50) lasciata agire 10 minuti, poi risciacquo. Evitate prodotti a base di acido muriatico.</li>
<li><strong>Guarnizioni</strong> — pulitele regolarmente con uno spazzolino morbido per evitare la formazione di muffa.</li>
</ul>

<h2>Vetrate e finestre</h2>
<p>Le vetrate esterne si sporcano per polvere, pioggia e smog. La pulizia periodica mantiene la trasparenza e l'estetica:</p>
<ul>
<li><strong>Frequenza</strong> — ogni 2-3 mesi è sufficiente per la maggior parte delle situazioni.</li>
<li><strong>Metodo</strong> — acqua con un goccio di detersivo neutro, panno in microfibra o lavavetri professionale. Asciugate con panno asciutto o carta di giornale.</li>
<li><strong>Da evitare</strong> — spugne abrasive, pagliette, prodotti con ammoniaca su vetri con trattamento basso-emissivo.</li>
</ul>

<h2>Parapetti in vetro</h2>
<p>I parapetti esterni sono esposti alle intemperie ma richiedono poca manutenzione:</p>
<ul>
<li><strong>Pulizia</strong> — acqua e detergente neutro, come per le vetrate.</li>
<li><strong>Fissaggi</strong> — controllate una volta all'anno che pinze, morsetti e viti siano ben serrati.</li>
<li><strong>Guarnizioni perimetrali</strong> — verificate che non siano deteriorate o staccate.</li>
</ul>

<h2>Specchi</h2>
<p>Gli specchi sono più delicati dei vetri normali perché hanno un rivestimento posteriore sensibile all'umidità:</p>
<ul>
<li><strong>Pulizia</strong> — spray specifico per specchi o acqua con poco aceto. Spruzzate sul panno, mai direttamente sullo specchio (l'umidità può infiltrarsi dai bordi).</li>
<li><strong>Bordi</strong> — mantenete asciutti i bordi inferiori, soprattutto negli specchi da bagno. L'umidità persistente può causare macchie scure nel tempo.</li>
</ul>

<h2>Cosa non fare mai</h2>
<ul>
<li>Non usate lame, raschietti metallici o pagliette d'acciaio sul vetro.</li>
<li>Non usate prodotti a base di acido fluoridrico o muriatico.</li>
<li>Non pulite il vetro sotto il sole diretto: il detergente si asciuga troppo in fretta e lascia aloni.</li>
<li>Non forzate mai le ante del box doccia se incontrano resistenza: controllate guide e cerniere.</li>
</ul>
`,
  },
];
