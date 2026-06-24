/**
 * Contenuti dettagliati per le pagine servizio individuali.
 * Chiave: slug del servizio (da services.ts)
 */
export interface ServiceDetail {
  intro: string;
  features: { title: string; text: string }[];
  materials?: string[];
  seoDescription: string;
  /** Slug di servizi correlati curati. Se assente, la pagina usa i servizi della stessa categoria. */
  related?: string[];
  /** Paragrafo "Quando scegliere": contesto d'uso del servizio. Opzionale. */
  whenToChoose?: string;
  /** Domande frequenti. Se presenti, generano anche structured data FAQPage. Opzionale. */
  faq?: { q: string; a: string }[];
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
    related: ['specchi', 'porte-interne', 'madras'],
    whenToChoose:
      'La maggior parte dei box doccia in commercio ha misure standard, che raramente combaciano con lo spazio reale del bagno. Con un box su misura non sei tu a dover adattare il bagno al box: è il box ad adattarsi al bagno. È la scelta giusta quando hai una nicchia, un sottotetto in pendenza o una parete non perfettamente dritta, oppure quando cerchi semplicemente un risultato pulito, senza profili e ingombri inutili. Durante il sopralluogo prendiamo le misure esatte e ti consigliamo apertura, spessore del vetro e finiture più adatte al tuo spazio.',
    faq: [
      {
        q: 'È difficile pulire il vetro del box doccia?',
        a: 'Con il trattamento anticalcare basta passare una spatola dopo la doccia. Senza trattamento è sufficiente una pulizia settimanale con acqua e aceto bianco.',
      },
      {
        q: 'Si può realizzare un box doccia per la vasca?',
        a: 'Sì. Realizziamo pareti e antine su misura anche per la vasca da bagno, con lo stesso vetro temperato di sicurezza.',
      },
      {
        q: 'Quale apertura conviene per un bagno piccolo?',
        a: 'Negli spazi stretti consigliamo l’anta scorrevole o il modello walk-in, che non ingombrano quando si aprono.',
      },
      {
        q: 'Il montaggio del box doccia è compreso?',
        a: 'Sì, ci occupiamo noi dell’installazione. Mettiamo il box in bolla e sigilliamo i giunti con cura: la tenuta all’acqua dipende proprio da una posa fatta a regola d’arte.',
      },
    ],
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
    related: ['stratificati', 'pensiline', 'vetrine'],
    whenToChoose:
      'Un parapetto in vetro mette in sicurezza balconi, scale e terrazze senza togliere luce né visuale. È la soluzione ideale quando vuoi proteggere senza chiudere: il vetro stratificato di sicurezza garantisce resistenza e, in caso di rottura, trattiene i frammenti restando in posizione. Scegliamo insieme il sistema di fissaggio — a pinza, a pavimento o a muro — in base al contesto architettonico e alle normative vigenti.',
    faq: [
      {
        q: 'Un parapetto in vetro è sicuro come uno tradizionale?',
        a: 'Sì. Usiamo vetro stratificato di sicurezza conforme alle norme UNI 7697 e NTC 2018: resiste agli urti e, se si rompe, resta in posizione senza cadere.',
      },
      {
        q: 'Serve una struttura in metallo a vista?',
        a: 'Dipende dal sistema scelto: si può fissare a pinza, con profilo continuo a pavimento o a muro. Valutiamo la soluzione più adatta durante il sopralluogo.',
      },
      {
        q: 'Il vetro resiste a pioggia, vento e sole?',
        a: 'Sì, i materiali sono pensati per l’esterno e resistono ad agenti atmosferici e sbalzi termici senza alterarsi nel tempo.',
      },
    ],
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
    whenToChoose:
      'Una pensilina in vetro protegge ingressi, porte e terrazze dalla pioggia e dal sole senza appesantire la facciata. È la scelta giusta quando vuoi un riparo che non rinunci alla luce e all’eleganza: il vetro stratificato lascia passare la luminosità ed evita l’effetto “tettoia” delle coperture opache. Studiamo forma, inclinazione e fissaggi su misura, perché la pensilina si integri con lo stile dell’edificio.',
    faq: [
      {
        q: 'La pensilina in vetro resiste a grandine e intemperie?',
        a: 'Sì: usiamo vetro stratificato di sicurezza, pensato per resistere a pioggia, grandine e raggi UV, e per trattenere i frammenti in caso di rottura.',
      },
      {
        q: 'Come viene sostenuta la pensilina?',
        a: 'Con tiranti in acciaio inox o mensole a sbalzo, dimensionati per garantire stabilità e sicurezza nel tempo.',
      },
      {
        q: 'Si può fare su misura per il mio ingresso?',
        a: 'Sì, forma, dimensioni e inclinazione vengono studiate sul tuo ingresso e sullo stile architettonico dell’edificio.',
      },
    ],
    related: ['parapetti', 'stratificati', 'vetrine'],
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
    whenToChoose:
      'Una vetrina è il biglietto da visita di un’attività: deve essere ampia, luminosa e sicura. Interveniamo dalla singola vetrina alla facciata continua, con vetro temperato o stratificato a seconda delle esigenze di sicurezza, e vetrocamera quando serve isolare. Sappiamo che un negozio fermo perde incassi, perciò lavoriamo per ridurre al minimo i tempi e le chiusure.',
    faq: [
      {
        q: 'Sostituite una vetrina rotta in tempi rapidi?',
        a: 'Sì, è una delle nostre priorità: ci organizziamo per ridurre al minimo i tempi di intervento e la chiusura del negozio.',
      },
      {
        q: 'Che vetro si usa per le vetrine?',
        a: 'Temperato o stratificato di sicurezza secondo le normative, con vetrocamera quando serve isolamento termico e acustico.',
      },
      {
        q: 'Posate anche vetrate di grandi dimensioni?',
        a: 'Sì, abbiamo esperienza e attrezzature professionali per la posa di vetrate commerciali anche di grande formato.',
      },
    ],
    related: ['blindati', 'vetrocamera', 'sostituzione-vetri'],
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
    related: ['vetrocamera', 'vetrocamera-tripli', 'stratificati'],
    whenToChoose:
      'Sostituire solo il vetro è la scelta intelligente quando il serramento è ancora buono ma il vetro non isola più: passando da vetro singolo a vetrocamera migliori subito comfort e bolletta, senza il costo e i disagi di cambiare l’intera finestra. Interveniamo su legno, alluminio e PVC, senza opere murarie. È spesso anche un intervento che rientra nelle detrazioni per il risparmio energetico.',
    faq: [
      {
        q: 'Devo cambiare tutta la finestra?',
        a: 'No: nella maggior parte dei casi sostituiamo solo il vetro mantenendo il telaio esistente. Intervento rapido e senza opere murarie.',
      },
      {
        q: 'Su quali serramenti intervenite?',
        a: 'Su legno, alluminio e PVC, di qualsiasi marca e modello.',
      },
      {
        q: 'Migliora davvero l’isolamento?',
        a: 'Sì: il passaggio da vetro singolo a vetrocamera riduce sensibilmente la dispersione di calore e il rumore esterno.',
      },
    ],
  },

  blindati: {
    intro:
      'Forniamo e installiamo vetri blindati antisfondamento e antiproiettile per abitazioni, uffici e attività commerciali. Protezione reale contro tentativi di intrusione, senza rinunciare alla trasparenza.',
    features: [
      {
        title: 'Classi di resistenza',
        text: 'Vetri disponibili nelle classi da P1A a P8B, certificate secondo la norma EN 356 contro lo sfondamento.',
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
      'Vetri blindati antisfondamento e antiproiettile a Casale Monferrato. Classi di resistenza certificate EN 356, installazione professionale.',
    related: ['stratificati', 'vetrine', 'sostituzione-vetri'],
    whenToChoose:
      'I vetri blindati sono la scelta giusta quando la sicurezza viene prima di tutto: abitazioni al piano terra, vetrine di negozi, uffici con beni o dati sensibili, o semplicemente per dormire sonni tranquilli. A differenza di un’inferriata proteggono senza chiudere la vista e senza rinunciare alla luce. In sopralluogo valutiamo insieme la classe di resistenza più adatta al livello di protezione che cerchi.',
    faq: [
      {
        q: 'Quanto resiste un vetro blindato?',
        a: 'Dipende dalla classe (da P1A a P8B, norma EN 356): si va dalla resistenza al lancio di oggetti fino a quella contro attacchi ripetuti con corpi contundenti.',
      },
      {
        q: 'Si vede che è un vetro blindato?',
        a: 'No: nonostante lo spessore maggiore mantiene un’ottima trasparenza ed è praticamente indistinguibile da un vetro normale.',
      },
      {
        q: 'Posso montarlo su finestre esistenti?',
        a: 'Spesso sì, con ferramenta rinforzata. Valutiamo in sopralluogo la compatibilità con il serramento.',
      },
      {
        q: 'Cosa significa vetro antisfondamento?',
        a: 'È un vetro stratificato multistrato che resiste a urti e tentativi di sfondamento: anche se colpito ripetutamente, le lastre restano unite e l’apertura non cede. Le classi EN 356 (da P1A a P8B) misurano proprio questo livello di resistenza.',
      },
      {
        q: 'Fate anche vetri antiproiettile?',
        a: 'Sì. Oltre all’antisfondamento (norma EN 356), forniamo vetro antiproiettile certificato EN 1063, dimensionato per fermare colpi d’arma da fuoco. In sopralluogo scegliamo la classe adatta al livello di rischio.',
      },
    ],
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
    related: ['porte-interne', 'box-doccia', 'specchi'],
    whenToChoose:
      'Il vetro Madras è la risposta quando servono privacy e luce insieme: porte interne, divisori, box doccia, finestre su strada o ante di mobili. Le sue texture filtrano la vista lasciando passare la luce naturale, così schermi un ambiente senza renderlo buio. Con decine di pattern disponibili è anche una scelta estetica: scegliamo insieme la finitura più adatta al tuo arredo.',
    faq: [
      {
        q: 'Il vetro Madras è trasparente?',
        a: 'È traslucido: lascia passare la luce ma sfuma le forme, garantendo privacy. Il grado di riservatezza dipende dalla texture scelta.',
      },
      {
        q: 'Dove si usa più spesso?',
        a: 'Porte interne, divisori, box doccia e finestre dove serve riservatezza senza rinunciare alla luminosità.',
      },
      {
        q: 'Si può lavorare su misura?',
        a: 'Sì: taglio, foratura e molatura su misura nel nostro laboratorio, per qualsiasi forma e dimensione.',
      },
    ],
  },

  stratificati: {
    intro:
      'I vetri stratificati sono il vetro di sicurezza per eccellenza: due o più lastre unite da un intercalare plastico (PVB) che, in caso di rottura, trattiene i frammenti. Un vetro antinfortunistico che protegge dalle cadute e dai tagli. Disponibili trasparenti, satinati e colorati.',
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
    related: ['parapetti', 'vetrocamera', 'pensiline'],
    whenToChoose:
      'Il vetro stratificato è la scelta quando la sicurezza conta: parapetti, vetrate basse, porte, lucernari, ovunque un vetro che si rompe e cade possa essere pericoloso. L’intercalare in PVB trattiene i frammenti, abbatte il rumore e filtra fino al 99% dei raggi UV, proteggendo arredi e pavimenti dallo scolorimento. Lo forniamo trasparente, satinato, extra-chiaro o colorato, e combinabile con vetrocamera.',
    faq: [
      {
        q: 'Cosa succede se il vetro stratificato si rompe?',
        a: 'I frammenti restano attaccati all’intercalare in PVB: il vetro si crepa ma non cade, eliminando il rischio di tagli.',
      },
      {
        q: 'Aiuta contro il rumore?',
        a: 'Sì, l’intercalare in PVB migliora sensibilmente l’isolamento acustico rispetto a un vetro singolo.',
      },
      {
        q: 'Protegge dai raggi solari?',
        a: 'Filtra fino al 99% dei raggi UV, proteggendo mobili, tende e pavimenti dallo scolorimento.',
      },
      {
        q: 'Dove è obbligatorio il vetro di sicurezza?',
        a: 'La norma UNI 7697 indica dove serve il vetro stratificato o temperato: parapetti, vetrate a tutta altezza, porte, lucernari e superfici a rischio di urto o caduta. Ti aiutiamo a scegliere il vetro a norma per ogni applicazione.',
      },
    ],
  },

  monolitici: {
    intro:
      'I vetri monolitici sono lastre singole di vetro float, la base di ogni lavorazione del vetro. Forniamo vetro su misura — trasparente, satinato o extra-chiaro — tagliato nello spessore giusto e rifinito sui bordi a richiesta.',
    features: [
      {
        title: 'Taglio su misura',
        text: 'Taglio di precisione su macchina automatica per qualsiasi dimensione e forma, anche sagomata.',
      },
      {
        title: 'Lavorazioni di bordo',
        text: 'Molatura a filo lucido o filo grezzo per una finitura curata e sicura.',
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
    related: ['sagomature', 'molature', 'stratificati'],
    whenToChoose:
      'Il vetro monolitico è il punto di partenza di quasi ogni lavorazione: piani tavolo, mensole, ripiani, cornici e top. Lo forniamo tagliato su misura nello spessore giusto per ogni uso, dai 2 mm per piccoli inserti fino ai 19 mm per piani portanti. Quando serve più sicurezza o isolamento, è anche la base da cui partiamo per tempera, stratifica e vetrocamera.',
    faq: [
      {
        q: 'Che spessore mi serve?',
        a: 'Dipende dall’uso: pochi millimetri per cornici e inserti, 8-19 mm per piani tavolo e ripiani portanti. Ti consigliamo in base al progetto.',
      },
      {
        q: 'Posso averlo sagomato?',
        a: 'Sì, tagliamo qualsiasi forma su disegno: angoli smussati, curve, fori e sagome particolari.',
      },
      {
        q: 'Che differenza c’è con lo stratificato?',
        a: 'Il monolitico è una lastra singola; lo stratificato unisce più lastre per maggiore sicurezza. Il monolitico è spesso la base di partenza.',
      },
      {
        q: 'Tagliate il vetro su misura?',
        a: 'Sì: tagliamo ogni lastra sulle tue dimensioni, anche sagomata, e rifiniamo i bordi con molatura a filo lucido o filo grezzo. Portaci le misure o un disegno e pensiamo noi al resto.',
      },
    ],
  },

  vetrocamera: {
    intro:
      "Il vetrocamera — il classico doppio vetro — è composto da due lastre separate da un'intercapedine d'aria o gas nobile. È il vetro isolante standard per l'isolamento termico e acustico di finestre e vetrate.",
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
        text: 'Disponibili con trattamento basso-emissivo e selettivo (controllo solare) per prestazioni termiche ancora superiori.',
      },
    ],
    materials: ['Vetrocamera 4/16/4', 'Vetrocamera basso-emissivo', 'Vetrocamera con gas argon'],
    seoDescription:
      'Vetrocamera doppi per isolamento termico e acustico a Casale Monferrato. Basso-emissivi, con gas argon. Sostituzione e posa.',
    related: ['vetrocamera-tripli', 'sostituzione-vetri', 'stratificati'],
    whenToChoose:
      'Il vetrocamera è la scelta standard quando vuoi una casa più calda d’inverno, più fresca d’estate e più silenziosa: due lastre separate da un’intercapedine isolante riducono la dispersione di calore e il rumore della strada. È l’intervento giusto per chi cambia le finestre o sostituisce vetri vecchi a lastra singola, e con trattamento basso-emissivo e gas argon le prestazioni salgono ancora. Rientra spesso nelle detrazioni fiscali.',
    faq: [
      {
        q: 'Quanto isola rispetto a un vetro singolo?',
        a: 'Riduce la dispersione di calore del 50-60% e abbatte sensibilmente il rumore esterno.',
      },
      {
        q: 'Cos’è il trattamento basso-emissivo?',
        a: 'Un rivestimento invisibile che riflette il calore verso l’interno d’inverno e lo respinge d’estate, migliorando l’isolamento.',
      },
      {
        q: 'Posso averlo sui miei serramenti?',
        a: 'Spesso sì: valutiamo in sopralluogo la compatibilità e, se serve, sostituiamo solo il vetro mantenendo il telaio.',
      },
    ],
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
    related: ['vetrocamera', 'sostituzione-vetri', 'blindati'],
    whenToChoose:
      'Il triplo vetrocamera è la scelta per chi punta al massimo comfort e alla massima efficienza: tre lastre e due intercapedini con gas argon portano l’isolamento a livelli da nuova costruzione. È l’ideale per case nuove, ristrutturazioni importanti, edifici in zone fredde o su strade molto trafficate, dove contano sia il calore sia il silenzio. Elimina anche la sensazione di freddo vicino alle finestre.',
    faq: [
      {
        q: 'Quando conviene il triplo rispetto al doppio?',
        a: 'Per nuove costruzioni, ristrutturazioni importanti, climi rigidi o massimo isolamento acustico. Su semplici sostituzioni spesso basta il doppio basso-emissivo.',
      },
      {
        q: 'Quanto isola un triplo vetro?',
        a: 'Raggiunge valori di trasmittanza (Ug) fino a 0,5 W/m²K, circa il doppio dell’isolamento di un vetrocamera doppio.',
      },
      {
        q: 'Riduce la condensa sulle finestre?',
        a: 'Sì: elimina la sensazione di freddo vicino al vetro e riduce la formazione di condensa interna.',
      },
    ],
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
    related: ['box-doccia', 'molature', 'porte-interne'],
    whenToChoose:
      'Uno specchio su misura risolve tutti i casi in cui i modelli standard non bastano: pareti irregolari, spazi sopra il lavabo, ante di armadi, palestre e studi di danza. Possiamo tagliare qualsiasi forma e rifinire i bordi con molatura a filo lucido o bisello, per un risultato sicuro ed elegante. In fase di sopralluogo valutiamo insieme dimensioni, tipo di fissaggio e finitura più adatti all’ambiente.',
    faq: [
      {
        q: 'Posso avere uno specchio di forma irregolare?',
        a: 'Sì, tagliamo lo specchio in qualsiasi sagoma: tonda, ovale, con angoli smussati o forme personalizzate su disegno.',
      },
      {
        q: 'Come si fissa lo specchio senza forarlo?',
        a: 'Usiamo un collante strutturale dedicato, oppure clips e profili a muro: soluzioni sicure che non richiedono fori sulla lastra.',
      },
      {
        q: 'Gli specchi del bagno si rovinano con l’umidità?',
        a: 'Per i bagni proponiamo specchi con trattamento di protezione posteriore, che previene le tipiche macchie scure dovute all’umidità nel tempo.',
      },
    ],
  },

  'porte-interne': {
    intro:
      "Installiamo porte interne in vetro — la porta scorrevole in vetro, a vista o a scomparsa nel muro, e il modello a battente — per portare luce e leggerezza negli ambienti. Il vetro temperato di sicurezza garantisce resistenza e tranquillità nell'uso quotidiano.",
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
    whenToChoose:
      'Una porta interna in vetro è la scelta giusta quando vuoi portare luce tra le stanze e dare un senso di ampiezza, senza rinunciare alla separazione degli ambienti. Scorrevole a vista, a scomparsa nel muro o a battente: il sistema dipende dallo spazio che hai. Con vetro trasparente, satinato o decorato, scegliamo insieme la soluzione più adatta all’arredo e alla privacy che desideri.',
    faq: [
      {
        q: 'Una porta in vetro è sicura?',
        a: 'Sì: usiamo vetro temperato di sicurezza da 8 o 10 mm, resistente agli urti e conforme alla normativa.',
      },
      {
        q: 'Meglio scorrevole o a battente?',
        a: 'Dipende dallo spazio: la scorrevole (a vista o a scomparsa) fa risparmiare ingombro, la battente è la soluzione più classica.',
      },
      {
        q: 'Posso avere privacy con una porta in vetro?',
        a: 'Sì, con vetro satinato o decorato come il Madras: lascia passare la luce ma scherma la vista.',
      },
      {
        q: 'La porta scorrevole in vetro si può nascondere nel muro?',
        a: 'Sì: con un controtelaio a scomparsa la porta scorre dentro la parete e sparisce alla vista, liberando spazio. In alternativa lo scorrevole a vista monta un binario a parete, senza opere murarie.',
      },
    ],
    related: ['madras', 'specchi', 'box-doccia'],
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
    related: ['fori', 'monolitici', 'molature'],
    whenToChoose:
      'La sagomatura serve quando il vetro deve adattarsi a uno spazio o a un progetto che esce dalle forme standard: top con angoli smussati, piani tondi o ovali, inserti curvi, vetri per mobili su disegno. Con la nostra macchina da taglio automatica realizziamo qualsiasi forma con precisione millimetrica, anche in serie. Dopo il taglio possiamo molare, forare e temprare, seguendo l’intero ciclo di lavorazione.',
    faq: [
      {
        q: 'Che forme potete tagliare?',
        a: 'Rettangoli, cerchi, ovali, angoli smussati e forme libere su disegno del cliente, con precisione millimetrica.',
      },
      {
        q: 'Tagliate anche vetri particolari?',
        a: 'Sì: float, satinato, specchio, laminato e vetri decorativi.',
      },
      {
        q: 'Dopo il taglio si può lavorare ancora il vetro?',
        a: 'Sì, il taglio è il primo passo: seguono molatura, foratura ed eventuale tempera.',
      },
    ],
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
    related: ['sagomature', 'monolitici', 'box-doccia'],
    whenToChoose:
      'La foratura serve ogni volta che un vetro deve ospitare maniglie, cerniere, pomelli, distanziali o passaggi per tubazioni: porte in vetro, box doccia, parapetti, mensole. Va eseguita con precisione e — fondamentale — sempre prima della tempera, perché un vetro temperato non può più essere lavorato. Ci occupiamo dell’intero ciclo, dal foro alla tempera finale.',
    faq: [
      {
        q: 'Posso forare un vetro già temperato?',
        a: 'No, è impossibile: la foratura va eseguita prima del trattamento di tempera. Per questo seguiamo l’intero ciclo di lavorazione.',
      },
      {
        q: 'Che diametri di foro realizzate?',
        a: 'Da 6 a 100 mm, per qualsiasi tipo di ferramenta, cerniera o fissaggio.',
      },
      {
        q: 'I bordi del foro sono sicuri?',
        a: 'Sì, usiamo utensili diamantati che danno fori netti e senza scheggiature, anche su vetri spessi.',
      },
    ],
  },

  molature: {
    intro:
      'La molatura è la lavorazione dei bordi del vetro che li rende lisci, sicuri ed esteticamente curati. Offriamo filo lucido e filo grezzo, oltre al bisello su richiesta, per ogni esigenza funzionale e decorativa.',
    features: [
      {
        title: 'Filo lucido',
        text: 'Bordo lavorato e lucidato a specchio. La finitura più elegante per piani tavolo, mensole e specchi.',
      },
      {
        title: 'Filo grezzo',
        text: 'Bordo molato per eliminare il taglio vivo, senza lucidatura. La finitura essenziale per vetri da incassare in telai o profili, dove il bordo non resta a vista.',
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
      'Molatura bordi vetro a Casale Monferrato. Filo lucido, filo grezzo e bisello su richiesta. Lavorazione professionale su misura.',
    related: ['specchi', 'sagomature', 'fori'],
    whenToChoose:
      'La molatura serve ogni volta che un bordo di vetro resta a vista o a portata di mano: piani tavolo, mensole, specchi, ripiani. Trasforma un bordo grezzo e tagliente in una finitura liscia, sicura ed elegante. La scelta tra filo lucido, filo grezzo e bisello dipende dall’uso e dall’effetto estetico desiderato: ti consigliamo la lavorazione giusta in base al pezzo.',
    faq: [
      {
        q: 'A cosa serve la molatura?',
        a: 'A rendere il bordo del vetro liscio e sicuro, eliminando le parti taglienti del taglio grezzo, e a dargli una finitura curata.',
      },
      {
        q: 'Che differenza c’è tra filo lucido e bisello?',
        a: 'Il filo lucido è un bordo lavorato a specchio; il bisello è uno smusso inclinato che crea un effetto decorativo, classico per gli specchi.',
      },
      {
        q: 'Si può molare qualsiasi vetro?',
        a: 'Sì, lavoriamo vetro float, specchio, stratificato e vetri decorativi di vari spessori.',
      },
    ],
  },
};
