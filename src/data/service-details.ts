/**
 * Contenuti dettagliati per le pagine servizio individuali.
 * Chiave: slug del servizio (da services.ts)
 */
export interface ServiceDetail {
  intro: string;
  features: { title: string; text: string }[];
  materials?: string[];
  seoDescription: string;
}

export const serviceDetails: Record<string, ServiceDetail> = {
  'box-doccia': {
    intro:
      'Realizziamo box doccia su misura in vetro temperato di sicurezza, progettati per adattarsi perfettamente al tuo bagno. Ogni box doccia è pensato insieme al cliente: forma, dimensioni, apertura e finitura vengono scelte in fase di sopralluogo per un risultato senza compromessi.',
    features: [
      {
        title: 'Su misura',
        text: 'Ogni box doccia è realizzato sulle misure esatte del tuo bagno, anche per spazi irregolari o nicchie.',
      },
      {
        title: 'Vetro temperato di sicurezza',
        text: 'Vetro temperato da 6 o 8 mm conforme alla normativa UNI 7697. In caso di rottura si frantuma in piccoli frammenti non taglienti.',
      },
      {
        title: 'Finiture e profili',
        text: 'Profili in alluminio cromato, satinato o nero opaco. Cerniere e maniglie coordinate per un design armonioso.',
      },
      {
        title: 'Trattamento anticalcare',
        text: 'Disponibile il trattamento protettivo delle superfici che facilita la pulizia e mantiene il vetro trasparente nel tempo.',
      },
    ],
    materials: [
      'Vetro temperato 6 mm',
      'Vetro temperato 8 mm',
      'Vetro satinato',
      'Vetro trasparente extra-chiaro',
    ],
    seoDescription:
      'Box doccia su misura in vetro temperato a Casale Monferrato. Progettazione, realizzazione e montaggio professionale. Sopralluogo gratuito.',
  },

  parapetti: {
    intro:
      'Installiamo parapetti in vetro per balconi, terrazze, scale interne ed esterne. Il vetro stratificato di sicurezza garantisce protezione senza rinunciare alla trasparenza e alla luce naturale.',
    features: [
      {
        title: 'Sicurezza certificata',
        text: 'Vetro stratificato di sicurezza conforme alle norme UNI 7697 e alle NTC 2018 per elementi strutturali.',
      },
      {
        title: 'Sistemi di fissaggio',
        text: 'Fissaggio a pinza, con profilo a pavimento o a muro. Scelta del sistema in base al contesto architettonico.',
      },
      {
        title: 'Trasparenza totale',
        text: 'Massima luminosità e visuale libera, ideale per valorizzare terrazze panoramiche e interni moderni.',
      },
      {
        title: 'Resistenza agli agenti atmosferici',
        text: 'Materiali progettati per resistere a pioggia, vento, sole e sbalzi termici senza alterazioni nel tempo.',
      },
    ],
    materials: [
      'Vetro stratificato trasparente',
      'Vetro stratificato satinato',
      'Vetro extra-chiaro',
    ],
    seoDescription:
      'Parapetti in vetro per balconi, scale e terrazze a Casale Monferrato. Installazione certificata con vetro stratificato di sicurezza.',
  },

  pensiline: {
    intro:
      "Progettiamo e installiamo pensiline in vetro per ingressi, terrazze e spazi esterni. Protezione dalle intemperie con un design elegante che valorizza l'architettura dell'edificio.",
    features: [
      {
        title: 'Protezione efficace',
        text: 'Copertura in vetro stratificato che protegge da pioggia, grandine e raggi UV diretti.',
      },
      {
        title: 'Struttura portante',
        text: 'Tiranti in acciaio inox o mensole a sbalzo, progettati per garantire stabilità e sicurezza.',
      },
      {
        title: 'Design personalizzato',
        text: "Forma, dimensioni e inclinazione studiate per integrarsi con lo stile architettonico dell'edificio.",
      },
      {
        title: 'Luminosità garantita',
        text: "Il vetro lascia passare la luce naturale, evitando l'effetto di chiusura tipico delle coperture opache.",
      },
    ],
    seoDescription:
      'Pensiline in vetro per ingressi e terrazze a Casale Monferrato. Progettazione su misura, installazione professionale.',
  },

  vetrine: {
    intro:
      'Installiamo vetrine per negozi e attività commerciali di qualsiasi dimensione. Dalla singola vetrina alla facciata continua, garantiamo posa professionale e materiali di prima qualità.',
    features: [
      {
        title: 'Qualsiasi dimensione',
        text: 'Esperienza nella posa di vetrate commerciali anche di grandi dimensioni, con attrezzature professionali.',
      },
      {
        title: 'Vetro di sicurezza',
        text: 'Vetro temperato o stratificato a seconda delle esigenze di sicurezza e delle normative locali.',
      },
      {
        title: 'Isolamento termico',
        text: 'Vetrocamera per garantire isolamento termico e acustico, con risparmio sui costi energetici.',
      },
      {
        title: 'Tempi rapidi',
        text: 'Consapevoli che un negozio chiuso è un negozio che perde: lavoriamo per ridurre al minimo i tempi di intervento.',
      },
    ],
    seoDescription:
      'Installazione vetrine per negozi e attività commerciali a Casale Monferrato. Vetro di sicurezza, posa professionale.',
  },

  'sostituzione-vetri': {
    intro:
      "Sostituiamo vetri per finestre esistenti senza modificare il telaio. Interveniamo su finestre in legno, alluminio e PVC per migliorare l'isolamento termico e acustico della tua abitazione.",
    features: [
      {
        title: 'Senza opere murarie',
        text: 'Sostituiamo solo il vetro, mantenendo il serramento esistente. Intervento rapido e pulito.',
      },
      {
        title: 'Miglioramento prestazioni',
        text: "Passaggio da vetro singolo a vetrocamera per un sensibile miglioramento dell'isolamento.",
      },
      {
        title: 'Compatibilità universale',
        text: 'Interveniamo su serramenti in legno, alluminio e PVC di qualsiasi marca e modello.',
      },
      {
        title: 'Detrazioni fiscali',
        text: 'La sostituzione dei vetri può rientrare nelle agevolazioni per il risparmio energetico.',
      },
    ],
    seoDescription:
      'Sostituzione vetri finestre a Casale Monferrato. Miglioramento isolamento termico e acustico senza sostituire il serramento.',
  },

  blindati: {
    intro:
      'Forniamo e installiamo vetri blindati antieffrazione per abitazioni, uffici e attività commerciali. Protezione reale contro tentativi di intrusione, senza rinunciare alla trasparenza.',
    features: [
      {
        title: 'Classi di resistenza',
        text: "Vetri disponibili nelle classi da P1A a P8B, certificate secondo la norma EN 356 contro l'effrazione.",
      },
      {
        title: 'Composizione multistrato',
        text: 'Più lastre di vetro unite da intercalari in PVB ad alta resistenza. Anche in caso di rottura il vetro resta in posizione.',
      },
      {
        title: 'Trasparenza preservata',
        text: "Nonostante lo spessore maggiore, il vetro blindato mantiene un'ottima trasparenza e luminosità.",
      },
      {
        title: 'Installazione dedicata',
        text: "Posa con ferramenta rinforzata e sistemi di fissaggio specifici per garantire l'efficacia della protezione.",
      },
    ],
    seoDescription:
      'Vetri blindati antieffrazione a Casale Monferrato. Classi di resistenza certificate EN 356, installazione professionale.',
  },

  madras: {
    intro:
      'Il vetro Madras è un vetro decorativo che unisce privacy e design. Disponibile in numerose texture e pattern, è ideale per porte, divisori, box doccia e qualsiasi applicazione dove si desidera luce senza rinunciare alla riservatezza.',
    features: [
      {
        title: 'Privacy con luce',
        text: 'Le texture del vetro Madras filtrano la vista mantenendo il passaggio della luce naturale.',
      },
      {
        title: 'Ampia gamma di design',
        text: 'Decine di pattern disponibili: satinati, rigati, ondulati, floreali e geometrici.',
      },
      {
        title: "Versatilità d'uso",
        text: "Utilizzabile per porte interne, divisori, box doccia, finestre e complementi d'arredo.",
      },
      {
        title: 'Lavorabile su misura',
        text: 'Taglio, foratura e molatura su misura nel nostro laboratorio per qualsiasi forma e dimensione.',
      },
    ],
    seoDescription:
      'Vetro decorativo Madras a Casale Monferrato. Privacy e design per porte, divisori e box doccia. Lavorazione su misura.',
  },

  stratificati: {
    intro:
      'I vetri stratificati sono composti da due o più lastre unite da un intercalare plastico (PVB). In caso di rottura il vetro resta unito, garantendo sicurezza. Disponibili trasparenti, satinati e colorati.',
    features: [
      {
        title: 'Sicurezza passiva',
        text: "In caso di urto o rottura, i frammenti restano aderenti all'intercalare. Nessun rischio di caduta vetri.",
      },
      {
        title: 'Isolamento acustico',
        text: "L'intercalare in PVB migliora sensibilmente l'abbattimento del rumore rispetto al vetro singolo.",
      },
      {
        title: 'Protezione UV',
        text: 'Filtra fino al 99% dei raggi ultravioletti, proteggendo arredi e pavimenti dallo scolorimento.',
      },
      {
        title: 'Finiture disponibili',
        text: 'Trasparente, satinato, extra-chiaro e colorato. Combinabile con vetrocamera per prestazioni complete.',
      },
    ],
    materials: [
      'Stratificato 33.1',
      'Stratificato 44.2',
      'Stratificato satinato',
      'Stratificato colorato',
    ],
    seoDescription:
      'Vetri stratificati di sicurezza a Casale Monferrato. Trasparenti, satinati e colorati. Taglio su misura e installazione.',
  },

  monolitici: {
    intro:
      'I vetri monolitici sono lastre singole di vetro float, la base di ogni lavorazione vetraria. Li forniamo trasparenti e satinati, tagliati su misura e con lavorazioni di bordo a richiesta.',
    features: [
      {
        title: 'Taglio su misura',
        text: 'Taglio di precisione su macchina automatica per qualsiasi dimensione e forma, anche sagomata.',
      },
      {
        title: 'Lavorazioni di bordo',
        text: 'Molatura a filo lucido, filo opaco o bisello per una finitura curata e sicura.',
      },
      {
        title: 'Spessori disponibili',
        text: 'Da 2 mm a 19 mm, per applicazioni che vanno dalla cornice al piano tavolo.',
      },
      {
        title: 'Base per altre lavorazioni',
        text: 'Il vetro monolitico è il punto di partenza per tempera, stratifica e accoppiamento in vetrocamera.',
      },
    ],
    materials: ['Float trasparente', 'Float satinato', 'Float extra-chiaro'],
    seoDescription:
      'Vetri monolitici trasparenti e satinati a Casale Monferrato. Taglio su misura, molatura e lavorazioni di bordo.',
  },

  vetrocamera: {
    intro:
      "Il vetrocamera è composto da due lastre di vetro separate da un'intercapedine d'aria o gas nobile. È la soluzione standard per l'isolamento termico e acustico di finestre e vetrate.",
    features: [
      {
        title: 'Isolamento termico',
        text: "L'intercapedine riduce la dispersione di calore in inverno e il surriscaldamento in estate.",
      },
      {
        title: 'Isolamento acustico',
        text: 'Significativa riduzione del rumore esterno, ideale per abitazioni su strade trafficate.',
      },
      {
        title: 'Risparmio energetico',
        text: 'Riduzione dei costi di riscaldamento e raffrescamento. Intervento ammissibile alle detrazioni fiscali.',
      },
      {
        title: 'Vetri basso-emissivi',
        text: 'Disponibili con trattamento basso-emissivo per prestazioni termiche ancora superiori.',
      },
    ],
    materials: ['Vetrocamera 4/16/4', 'Vetrocamera basso-emissivo', 'Vetrocamera con gas argon'],
    seoDescription:
      'Vetrocamera doppi per isolamento termico e acustico a Casale Monferrato. Basso-emissivi, con gas argon. Sostituzione e posa.',
  },

  'vetrocamera-tripli': {
    intro:
      'Il triplo vetrocamera offre il massimo livello di isolamento termico e acustico. Tre lastre di vetro con due intercapedini per prestazioni energetiche superiori, ideale per nuove costruzioni e ristrutturazioni di alto livello.',
    features: [
      {
        title: 'Isolamento superiore',
        text: 'Due intercapedini con gas argon per valori di trasmittanza termica (Ug) fino a 0,5 W/m²K.',
      },
      {
        title: 'Comfort abitativo',
        text: 'Elimina la sensazione di freddo vicino alle finestre e riduce la condensa interna.',
      },
      {
        title: 'Abbattimento acustico',
        text: 'Tre lastre con spessori differenziati per il massimo abbattimento del rumore.',
      },
      {
        title: 'Standard di nuova costruzione',
        text: 'Risponde ai requisiti energetici delle normative più recenti per edifici nZEB.',
      },
    ],
    seoDescription:
      'Vetrocamera tripli per massimo isolamento termico e acustico a Casale Monferrato. Ideale per edifici ad alta efficienza energetica.',
  },

  specchi: {
    intro:
      "Realizziamo specchi su misura per bagni, armadi a muro, palestre, studi di danza e complementi d'arredo. Taglio di precisione, molatura dei bordi e installazione a parete con sistemi professionali.",
    features: [
      {
        title: 'Su misura',
        text: 'Qualsiasi dimensione e forma, anche sagomata. Ideale per spazi dove gli specchi standard non si adattano.',
      },
      {
        title: 'Finitura dei bordi',
        text: 'Molatura a filo lucido per un bordo elegante e sicuro, oppure bisello per un effetto decorativo.',
      },
      {
        title: 'Installazione sicura',
        text: 'Fissaggio a parete con sistemi professionali: collante strutturale, clips o profili a muro.',
      },
      {
        title: 'Specchi di sicurezza',
        text: 'Disponibili con pellicola di sicurezza posteriore che trattiene i frammenti in caso di rottura.',
      },
    ],
    seoDescription:
      "Specchi su misura a Casale Monferrato. Taglio, molatura e installazione professionale per bagni, armadi e complementi d'arredo.",
  },

  'porte-interne': {
    intro:
      "Installiamo porte interne in vetro, scorrevoli e a battente, per portare luce e leggerezza negli ambienti. Il vetro temperato di sicurezza garantisce resistenza e tranquillità nell'uso quotidiano.",
    features: [
      {
        title: 'Scorrevoli e a battente',
        text: 'Sistemi scorrevoli a vista o a scomparsa nel muro, e porte a battente con cerniere dedicate.',
      },
      {
        title: 'Vetro temperato',
        text: 'Vetro temperato di sicurezza da 8 o 10 mm, resistente agli urti e conforme alla normativa.',
      },
      {
        title: 'Personalizzazione',
        text: 'Vetro trasparente, satinato, decorato o colorato. Maniglie e accessori in diverse finiture.',
      },
      {
        title: 'Luce tra gli ambienti',
        text: 'Il vetro lascia passare la luce tra le stanze, rendendo gli spazi più ampi e luminosi.',
      },
    ],
    seoDescription:
      'Porte interne in vetro a Casale Monferrato. Scorrevoli e a battente, vetro temperato di sicurezza. Installazione su misura.',
  },

  sagomature: {
    intro:
      'Eseguiamo tagli e sagomature di vetro su misura per qualsiasi forma: rettangoli, cerchi, ovali, angoli smussati e forme libere. Precisione garantita dalla nostra macchina da taglio automatica.',
    features: [
      {
        title: 'Qualsiasi forma',
        text: 'Tagli rettilinei, curvi, a cerchio, ovale e forme personalizzate su disegno del cliente.',
      },
      {
        title: 'Precisione millimetrica',
        text: 'Macchina da taglio automatica per risultati precisi e ripetibili, anche su grandi quantità.',
      },
      {
        title: 'Tutti i tipi di vetro',
        text: 'Tagliamo vetro float, satinato, specchio, laminato e vetri decorativi.',
      },
      {
        title: 'Combinabile con altre lavorazioni',
        text: 'Dopo il taglio è possibile procedere con molatura, foratura e tempera.',
      },
    ],
    seoDescription:
      'Sagomatura e taglio vetro su misura a Casale Monferrato. Qualsiasi forma e dimensione, precisione millimetrica.',
  },

  fori: {
    intro:
      'Eseguiamo forature di precisione su vetro per maniglie, cerniere, passaggi tubazioni e fissaggi. Fori calibrati con utensili diamantati per un risultato netto e senza scheggiature.',
    features: [
      {
        title: 'Foratura di precisione',
        text: 'Utensili diamantati per fori netti e senza scheggiature, anche su vetri spessi.',
      },
      {
        title: 'Diametri disponibili',
        text: 'Fori da 6 mm a 100 mm di diametro, per qualsiasi tipo di ferramenta e fissaggio.',
      },
      {
        title: 'Posizionamento esatto',
        text: "Foratura su dima per garantire l'allineamento perfetto con cerniere, maniglie e supporti.",
      },
      {
        title: 'Su vetro temperato',
        text: "La foratura va eseguita prima della tempera. Ci occupiamo dell'intero ciclo di lavorazione.",
      },
    ],
    seoDescription:
      'Foratura vetro di precisione a Casale Monferrato. Fori per maniglie, cerniere e fissaggi con utensili diamantati.',
  },

  molature: {
    intro:
      'La molatura è la lavorazione dei bordi del vetro che li rende lisci, sicuri ed esteticamente curati. Offriamo filo lucido, filo opaco e bisello per ogni esigenza funzionale e decorativa.',
    features: [
      {
        title: 'Filo lucido',
        text: 'Bordo lavorato e lucidato a specchio. La finitura più elegante per piani tavolo, mensole e specchi.',
      },
      {
        title: 'Filo opaco',
        text: 'Bordo lavorato con finitura satinata. Ideale per vetri da incassare in telai o profili.',
      },
      {
        title: 'Bisello',
        text: 'Smusso inclinato sul bordo del vetro che crea un effetto prismatico decorativo. Classico per specchi.',
      },
      {
        title: 'Sicurezza',
        text: "La molatura elimina i bordi taglienti del vetro grezzo, rendendo sicura la manipolazione e l'installazione.",
      },
    ],
    seoDescription:
      'Molatura bordi vetro a Casale Monferrato. Filo lucido, filo opaco e bisello. Lavorazione professionale su misura.',
  },
};
