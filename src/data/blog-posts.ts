export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  content: string;
  related?: string[];
  /** Autore reale del post (E-E-A-T). Default: Giuseppe Fioravanti. */
  author?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'come-scegliere-vetro-box-doccia',
    title: 'Come scegliere il vetro per il box doccia',
    description:
      'Guida alla scelta del vetro giusto per il box doccia: temperato o stratificato, spessori, finiture e trattamenti.',
    date: '2026-03-26',
    image: '/images/blog/come-scegliere-vetro-box-doccia.webp',
    related: [
      'montare-siliconare-box-doccia',
      'come-pulire-box-doccia-incrostato',
      'vetrocamera-doppio-o-triplo',
      'vetro-temperato-vs-stratificato',
    ],
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
<p>I box doccia industriali hanno misure standard che raramente si adattano perfettamente allo spazio disponibile. Un <a href="/servizi/box-doccia">box doccia su misura</a> elimina il problema: le lastre vengono tagliate sulle dimensioni esatte del vostro bagno, compresi spazi irregolari, nicchie e sottotetti.</p>
<p>Ogni box doccia che realizziamo nel nostro laboratorio è un pezzo unico, pensato insieme al cliente dalla prima misurazione alla posa finale.</p>
`,
  },
  {
    slug: 'vetrocamera-doppio-o-triplo',
    title: 'Vetrocamera doppio o triplo: quale scegliere',
    description:
      "Differenze tra vetrocamera doppio e triplo: isolamento termico, acustico, costi e quando conviene uno o l'altro.",
    date: '2026-03-26',
    image: '/images/blog/vetrocamera-doppio-o-triplo.webp',
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
<p>Il <a href="/servizi/vetrocamera-tripli">vetrocamera triplo</a> è la scelta giusta quando:</p>
<ul>
<li>Si costruisce una casa nuova o si fa una ristrutturazione importante.</li>
<li>L'edificio si trova in zona climatica E o F (inverni rigidi).</li>
<li>Si vuole raggiungere la classe energetica A o superiore.</li>
<li>L'abitazione è su una strada trafficata e serve il massimo isolamento acustico.</li>
</ul>
<p>Per sostituzioni su serramenti esistenti, il <a href="/servizi/vetrocamera">doppio vetrocamera</a> con trattamento basso-emissivo rappresenta spesso la scelta più equilibrata.</p>

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
    image: '/images/blog/vetro-temperato-vs-stratificato.webp',
    related: ['come-scegliere-vetro-box-doccia', 'come-pulire-mantenere-vetri'],
    content: `
<h2>Due vetri di sicurezza, due comportamenti diversi</h2>
<p>Sia il vetro temperato che lo stratificato sono classificati come "vetri di sicurezza", ma si comportano in modo opposto in caso di rottura. Capire questa differenza è fondamentale per scegliere il vetro giusto.</p>

<h2>Vetro temperato</h2>
<p>Il vetro temperato viene riscaldato a circa 700°C e poi raffreddato rapidamente. Questo processo crea tensioni interne che aumentano la resistenza meccanica di 4-5 volte.</p>
<p><strong>In caso di rottura:</strong> si frantuma in piccoli frammenti a bordi arrotondati, simili a granuli. Nessun pezzo tagliente, ma il vetro non resta in posizione.</p>
<p><strong>Dove si usa:</strong> <a href="/servizi/box-doccia">box doccia</a>, <a href="/servizi/porte-interne">porte interne in vetro</a>, piani tavolo, mensole, ripiani.</p>
<p><strong>Importante:</strong> il vetro temperato non può essere tagliato, forato o lavorato dopo la tempera. Tutte le lavorazioni (sagomatura, foratura, molatura) vanno eseguite prima del trattamento termico.</p>

<h2>Vetro stratificato</h2>
<p>Il <a href="/servizi/stratificati">vetro stratificato</a> è composto da due o più lastre unite da un intercalare plastico in PVB (polivinilbutirrale). L'intercalare tiene insieme i frammenti in caso di rottura.</p>
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
    image: '/images/blog/come-pulire-mantenere-vetri.webp',
    related: ['come-scegliere-vetro-box-doccia', 'vetro-temperato-vs-stratificato'],
    content: `
<h2>La regola d'oro: semplicità</h2>
<p>Il vetro è un materiale resistente e facile da mantenere. Nella maggior parte dei casi bastano acqua e un panno morbido. I prodotti aggressivi non solo sono inutili, ma possono danneggiare guarnizioni e profili.</p>

<h2>Box doccia</h2>
<p>Il <a href="/servizi/box-doccia">box doccia</a> è la superficie vetrata più esposta al calcare. Pochi accorgimenti fanno la differenza:</p>
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
<p>I <a href="/servizi/parapetti">parapetti</a> esterni sono esposti alle intemperie ma richiedono poca manutenzione:</p>
<ul>
<li><strong>Pulizia</strong> — acqua e detergente neutro, come per le vetrate.</li>
<li><strong>Fissaggi</strong> — controllate una volta all'anno che pinze, morsetti e viti siano ben serrati.</li>
<li><strong>Guarnizioni perimetrali</strong> — verificate che non siano deteriorate o staccate.</li>
</ul>

<h2>Specchi</h2>
<p>Gli <a href="/servizi/specchi">specchi</a> sono più delicati dei vetri normali perché hanno un rivestimento posteriore sensibile all'umidità:</p>
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
  {
    slug: 'come-pulire-box-doccia-incrostato',
    title: 'Come pulire un box doccia molto incrostato',
    description:
      'Guida pratica per togliere calcare e incrostazioni dal box doccia in vetro: rimedi che funzionano, errori da evitare e come prevenire gli aloni.',
    date: '2026-06-23',
    image: '/images/blog/come-pulire-box-doccia-incrostato.webp',
    related: [
      'come-scegliere-vetro-box-doccia',
      'montare-siliconare-box-doccia',
      'come-pulire-mantenere-vetri',
    ],
    content: `
<h2>Come pulire un box doccia molto incrostato</h2>
<p>Sul box doccia il calcare è il nemico numero uno: si deposita a ogni doccia e, se trascurato, forma una patina opaca difficile da togliere. La buona notizia è che nella maggior parte dei casi si rimuove con prodotti che hai già in casa, un po' di pazienza e il gesto giusto. Vediamo come, partendo dalle incrostazioni più ostinate.</p>
<p>Il rimedio veloce: scalda dell'aceto bianco (tiepido agisce meglio), passalo sul vetro con un panno morbido o uno spruzzino e lascialo agire 15-20 minuti. Poi strofina con delicatezza e risciacqua con acqua tiepida. Per le incrostazioni più dure va benissimo anche l'acido citrico sciolto in acqua calda. Niente spugne abrasive: sul vetro lasciano micro-graffi.</p>

<h2>Calcare ostinato: i rimedi che funzionano davvero</h2>
<p>Quando la patina è spessa, servono tempo di posa e un pizzico di metodo. Tre soluzioni semplici:</p>
<ul>
<li><strong>Aceto bianco caldo</strong> — il più versatile. Imbevi un panno, appoggialo sul vetro come un impacco e lascialo aderire mezz'ora.</li>
<li><strong>Acido citrico</strong> — un paio di cucchiai in mezzo litro d'acqua calda. Inodore e delicato sul vetro, ottimo sui depositi più tenaci.</li>
<li><strong>Bicarbonato in pasta</strong> — mescolato con poca acqua, aiuta meccanicamente sulle macchie localizzate. Applica, attendi, poi rimuovi con un panno umido.</li>
</ul>
<p>Ripeti l'impacco invece di aumentare la forza: è il tempo, non l'attrito, a sciogliere il calcare.</p>

<h2>Pulire il box doccia in vetro trasparente senza aloni</h2>
<p>Sul vetro trasparente ogni alone si nota, perciò conta più l'asciugatura che il detergente. Dopo aver risciacquato, passa un tergivetro dall'alto verso il basso, poi una microfibra asciutta. Se l'acqua di casa è molto dura, un ultimo passaggio con acqua demineralizzata evita le tracce bianche quando asciuga.</p>

<h2>Gli errori da evitare</h2>
<p>Qualche gesto fa più male che bene. Da evitare:</p>
<ul>
<li><strong>Spugne abrasive, pagliette e lamette</strong> — graffiano il vetro in modo permanente.</li>
<li><strong>Prodotti troppo aggressivi su alluminio e silicone</strong> — acidi forti e candeggina rovinano profili e guarnizioni.</li>
<li><strong>Lasciare asciugare i prodotti al sole</strong> — possono lasciare aloni difficili da togliere.</li>
</ul>
<p>Sul vetro vale sempre la regola della delicatezza: meno aggredisci, più dura nel tempo.</p>

<h2>Come evitare che il calcare torni</h2>
<p>Prevenire costa molto meno che recuperare. Bastano tre abitudini: passare il tergivetro dopo ogni doccia, arieggiare il bagno per far asciugare le superfici, e una pulizia leggera una volta a settimana. Su un vetro con <a href="/servizi/box-doccia">trattamento anticalcare</a> il mantenimento è ancora più semplice, perché l'acqua scivola via senza lasciare depositi. Per la cura di tutti i vetri di casa trovi altri consigli nella nostra <a href="/blog/come-pulire-mantenere-vetri">guida alla pulizia dei vetri</a>.</p>

<h2>Silicone annerito: quando pulirlo e quando rifarlo</h2>
<p>Il silicone che diventa nero ai bordi è muffa, non sporco normale. Se è superficiale, si pulisce con una pasta di bicarbonato lasciata agire e poi rimossa. Ma quando il silicone si stacca, si screpola o la muffa è penetrata, l'unica soluzione è <a href="/blog/montare-siliconare-box-doccia">rifare la sigillatura</a>: si rimuove il vecchio cordolo, si pulisce e si asciuga bene la sede e si stende un silicone nuovo specifico per il bagno. Un box ben sigillato protegge anche la parete dietro la doccia.</p>

<h2>Quando il vetro non torna più pulito</h2>
<p>A volte, dopo anni di calcare trascurato, il vetro resta opaco anche dopo una pulizia accurata: il deposito ha ormai inciso la superficie e l'alone è permanente. In quei casi non è una questione di prodotto. Si può valutare un <a href="/servizi/box-doccia">box doccia nuovo su misura</a>, magari con trattamento anticalcare di serie, così la pulizia torna a essere questione di pochi minuti. Se stai scegliendo, ti aiuta la nostra guida su <a href="/blog/come-scegliere-vetro-box-doccia">come scegliere il vetro per il box doccia</a>.</p>

<h2>Domande frequenti</h2>
<ul>
<li><strong>Posso usare l'aceto sul box doccia tutti i giorni?</strong> Meglio di no: l'aceto è ottimo per il calcare, ma sull'uso quotidiano basta sciacquare e asciugare. Tienilo per la pulizia settimanale o per le incrostazioni.</li>
<li><strong>L'aceto rovina il silicone e l'alluminio?</strong> Usato di rado e ben risciacquato no. Evita però di lasciarlo a lungo su guarnizioni e profili, e non usarlo su silicone già deteriorato.</li>
<li><strong>Come pulisco il box doccia in vetro satinato?</strong> Stessi rimedi delicati, ma asciuga tamponando: sul satinato il tergivetro conta meno e il calcare si vede di meno, quindi è più importante una pulizia regolare.</li>
</ul>
`,
  },
  {
    slug: 'come-tagliare-vetro-temperato',
    title: 'Come tagliare il vetro temperato',
    description:
      'Si può tagliare il vetro temperato? No: una volta temperato non si taglia né si fora. Ecco perché e come si lavora correttamente, prima della tempera.',
    date: '2026-06-23',
    image: '/images/blog/come-tagliare-vetro-temperato.webp',
    related: ['vetro-temperato-vs-stratificato', 'come-scegliere-vetro-box-doccia'],
    content: `
<h2>Si può tagliare il vetro temperato?</h2>
<p>No. Una volta temperato, il vetro non si può più tagliare né forare: qualsiasi incisione ne rompe l'equilibrio interno e lo fa frantumare in un istante in migliaia di piccoli frammenti. Il vetro temperato va quindi tagliato, molato e forato <strong>prima</strong> della tempera, mai dopo. È il punto più importante da sapere prima di ordinare o modificare una lastra.</p>

<h2>Perché il temperato non si taglia dopo la tempera</h2>
<p>La tempera è un trattamento termico: il vetro viene scaldato a circa 600 °C e poi raffreddato in fretta. Così la superficie resta in compressione e il cuore in tensione, ed è questo equilibrio a renderlo fino a cinque volte più resistente del vetro normale. Un taglio o un foro spezzano quell'equilibrio di colpo: la lastra non si "scheggia", esplode tutta insieme. È lo stesso motivo per cui è così sicuro in caso di rottura.</p>

<h2>Come si lavora correttamente: prima si dimensiona, poi si tempra</h2>
<p>Con il temperato l'ordine è tutto. Ogni lavorazione va decisa e fatta sulla lastra ancora "cruda":</p>
<ul>
<li><strong>Taglio su misura</strong> — la lastra si porta alle dimensioni esatte richieste.</li>
<li><strong>Lavorazione dei bordi</strong> — molatura a filo lucido o filo grezzo.</li>
<li><strong>Fori e sagomature</strong> — per cerniere, maniglie, prese e forme particolari.</li>
</ul>
<p>Solo quando il pezzo è completo in ogni dettaglio si passa al forno di tempera. Dopo, la lastra è definitiva: non si tocca più.</p>

<h2>Mi serve una misura diversa: si può ridurre?</h2>
<p>Purtroppo no: un vetro temperato non si può rifilare nemmeno di pochi millimetri. Se la misura non va, la lastra va rifatta da capo su misura. Per questo conta molto prendere le quote giuste fin dall'inizio — nel dubbio, un sopralluogo evita errori costosi. Se l'applicazione lo permette, in alcuni casi si valuta il vetro stratificato, che offre sicurezza con un'altra logica di lavorazione: ne parliamo nella guida su <a href="/blog/vetro-temperato-vs-stratificato">temperato e stratificato a confronto</a>.</p>

<h2>Il vetro normale invece si taglia?</h2>
<p>Sì, ed è proprio qui la differenza. Il vetro float (non temperato) si incide e si taglia su misura senza problemi, e infatti è la base di partenza di quasi ogni lavorazione. Il temperato è un prodotto "finito": nasce già nella forma definitiva. Quando ti serve un pezzo robusto e sicuro — un <a href="/servizi/box-doccia">box doccia</a>, un <a href="/servizi/parapetti">parapetto</a> o una <a href="/servizi/porte-interne">porta in vetro</a> — partiamo dalle tue misure e prepariamo tutto prima della tempera.</p>

<h2>Domande frequenti</h2>
<ul>
<li><strong>Cosa significa "vetro temperato"?</strong> È vetro sottoposto a un trattamento termico che lo rende molto più resistente e, in caso di rottura, lo fa frantumare in piccoli frammenti non taglienti. Per questo è richiesto dove serve sicurezza.</li>
<li><strong>Posso fare un foro in un vetro temperato già pronto?</strong> No: forare un temperato lo rompe. Fori e asole vanno eseguiti prima della tempera.</li>
<li><strong>Come faccio a sapere se un vetro è temperato?</strong> Spesso porta un piccolo marchio inciso in un angolo. Nel dubbio, chiedici una verifica prima di tentare qualsiasi lavorazione.</li>
</ul>
`,
  },
  {
    slug: 'montare-siliconare-box-doccia',
    title: 'Come montare e siliconare un box doccia in vetro',
    description:
      'Guida passo passo per montare e siliconare un box doccia in vetro: misure, profili, ante e il punto chiave silicone interno o esterno contro le infiltrazioni.',
    date: '2026-06-24',
    image: '/images/blog/montare-siliconare-box-doccia.webp',
    related: [
      'come-scegliere-vetro-box-doccia',
      'come-pulire-box-doccia-incrostato',
      'come-tagliare-vetro-temperato',
    ],
    content: `
<h2>Si può montare un box doccia da soli?</h2>
<p>Sì, montare un box doccia in vetro è alla portata di chi ha un minimo di manualità, a patto di lavorare con calma e nell'ordine giusto. Due passaggi fanno la differenza tra una doccia che dura anni e una che inizia a perdere dopo pochi mesi: prendere le misure con la lastra a piombo e <strong>siliconare nel verso corretto</strong>. Su quest'ultimo punto si sbaglia quasi sempre, e qui sotto ti spieghiamo come si fa davvero. Se il bagno ha pareti fuori squadra o misure irregolari, però, un <a href="/servizi/box-doccia">box doccia su misura</a> ti evita gran parte dei problemi: parti già da un pezzo che combacia.</p>

<h2>Cosa ti serve</h2>
<p>Prepara tutto prima di iniziare, così non ti fermi a metà:</p>
<ul>
<li><strong>Trapano</strong> con punte adatte alla parete (muro, piastrelle con punta da vetro/ceramica).</li>
<li><strong>Livella a bolla</strong> e metro: sono gli strumenti più importanti di tutta l'operazione.</li>
<li><strong>Cacciaviti</strong>, tasselli e viti (di solito forniti con il box).</li>
<li><strong>Silicone neutro</strong> per sanitari, antimuffa, e una pistola per silicone.</li>
<li><strong>Nastro di carta</strong>, panno pulito e un cutter per rifinire i cordoli.</li>
</ul>
<p>Usa sempre silicone <strong>neutro</strong> e specifico per il bagno: quello acetico (odore di aceto) può corrodere alluminio e alcune superfici, e regge peggio nel tempo in ambiente umido.</p>

<h2>Prima di iniziare: misure e verifiche</h2>
<p>La fase più trascurata è anche la più importante. Prima di forare qualsiasi cosa, controlla tre cose. Che il <strong>piatto doccia sia in bolla</strong>: se pende, il vetro non chiuderà mai bene. Che le <strong>pareti siano a piombo</strong>: nei bagni vecchi capita spesso che non lo siano, e i profili di regolazione del box servono proprio a recuperare questi scarti. E che le misure dello spazio corrispondano a quelle del box: appoggia i profili a secco, senza fissarli, e verifica che tutto torni prima di prendere il trapano.</p>

<h2>Come montare un box doccia passo passo</h2>
<p>Una volta verificato tutto, si procede dall'alto verso il basso, partendo dalle parti fisse:</p>
<ul>
<li><strong>Profili a parete</strong> — segna i fori con la livella, fora, inserisci i tasselli e fissa i montanti verticali perfettamente a piombo. È da qui che dipende tutta la squadratura.</li>
<li><strong>Profilo a terra (soglia)</strong> — appoggialo sul piatto seguendo la linea dei montanti. Non forarlo nel piatto doccia: si fissa con il silicone, mai con viti che bucherebbero l'impermeabilizzazione.</li>
<li><strong>Vetri e ante</strong> — inserisci le lastre fisse nei profili, poi monta le ante (scorrevoli o a battente) e regola cerniere o carrelli finché la chiusura è uniforme e l'anta scorre senza forzare.</li>
<li><strong>Guarnizioni</strong> — applica le guarnizioni di battuta e quelle paraspruzzi sui bordi delle ante: completano la tenuta e proteggono il vetro.</li>
</ul>
<p>Lavora senza stringere a fondo le viti finché non hai verificato che tutto è in squadra: una volta sicuro, serri e passi alla siliconatura.</p>

<h2>Siliconare il box doccia: interno o esterno?</h2>
<p>Questo è il punto che fa la differenza, e dove quasi tutti sbagliano. La regola corretta è semplice: <strong>i giunti verticali e quelli con la parete si sigillano sia dentro sia fuori</strong>, mentre il <strong>profilo a terra si silicona solo all'esterno</strong>. Sul profilo basso, all'interno della doccia, <strong>non stendere un cordolo continuo</strong>: lascia liberi i piccoli fori o gli spazi di drenaggio.</p>
<p>Il motivo è idraulico. Un po' d'acqua si infiltra sempre tra vetro e profilo: se sigilli completamente anche l'interno del profilo a terra, quell'acqua resta intrappolata, ristagna e crea muffa e cattivi odori impossibili da togliere. Lasciando il drenaggio aperto verso l'interno, invece, l'acqua rientra da sola nel piatto doccia. Il cordolo esterno serve a un'altra cosa: impedire che l'acqua coli sul pavimento del bagno.</p>
<p>Per un cordolo pulito, applica il nastro di carta ai due lati della fuga, stendi il silicone in modo continuo, liscialo con il dito bagnato (o un'apposita spatolina) in un solo passaggio e rimuovi subito il nastro prima che inizi a tirare.</p>

<h2>Quanto far asciugare prima di usare la doccia</h2>
<p>Il silicone ha bisogno di tempo per fare presa. Aspetta <strong>almeno 24 ore</strong> prima di usare la doccia: le superfici devono essere asciutte al momento dell'applicazione e devono restare asciutte mentre il silicone reticola. Usare la doccia troppo presto è il modo più rapido per ritrovarsi con una sigillatura che si stacca e infiltra.</p>

<h2>Gli errori più comuni</h2>
<p>Quasi tutti i problemi nascono da pochi gesti sbagliati. Da evitare:</p>
<ul>
<li><strong>Sigillare anche l'interno del profilo a terra</strong> — intrappola l'acqua e fa nascere la muffa.</li>
<li><strong>Forare il piatto doccia per fissare la soglia</strong> — rovini l'impermeabilizzazione e crei un'infiltrazione sicura.</li>
<li><strong>Montare i profili non a piombo</strong> — l'anta non chiude e il box "lavora" male.</li>
<li><strong>Usare silicone acetico o non specifico</strong> — corrode i profili e dura poco in ambiente umido.</li>
<li><strong>Usare la doccia prima delle 24 ore</strong> — il silicone non fa presa e si stacca.</li>
</ul>

<h2>Quando conviene affidarsi a un professionista</h2>
<p>Il fai da te funziona bene su box di misura standard e pareti regolari. Quando lo spazio è irregolare, le pareti sono fuori squadra o servono lastre grandi e pesanti, montare da soli diventa rischioso: una lastra mal sostenuta è pericolosa, e gli errori di misura sul vetro non si correggono (il temperato non si ritaglia, come spiegato nella guida su <a href="/blog/come-tagliare-vetro-temperato">come tagliare il vetro temperato</a>). In questi casi un <a href="/servizi/box-doccia">box doccia su misura</a> con posa professionale ti dà un risultato a tenuta e senza sorprese. Se stai ancora scegliendo le lastre, parti dalla nostra guida su <a href="/blog/come-scegliere-vetro-box-doccia">come scegliere il vetro per il box doccia</a>.</p>

<h2>Domande frequenti</h2>
<ul>
<li><strong>Il silicone va dentro o fuori la doccia?</strong> I giunti verticali e con la parete si sigillano da entrambi i lati; il profilo a terra solo all'esterno, lasciando aperti i fori di drenaggio interni così l'acqua rientra nel piatto.</li>
<li><strong>Quanto deve asciugare il silicone prima di usare la doccia?</strong> Almeno 24 ore, con le superfici asciutte durante l'applicazione e la reticolazione.</li>
<li><strong>Quale silicone usare per il box doccia?</strong> Silicone neutro per sanitari, antimuffa. Evita quello acetico, che corrode l'alluminio dei profili.</li>
<li><strong>Posso fissare la soglia con le viti nel piatto doccia?</strong> No: si fissa con il silicone. Forare il piatto comprometterebbe l'impermeabilizzazione.</li>
<li><strong>Come faccio se le pareti non sono dritte?</strong> I box hanno profili di regolazione che recuperano qualche millimetro di scarto. Per scarti maggiori o spazi irregolari conviene un box su misura.</li>
</ul>
`,
  },
];
