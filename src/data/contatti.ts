// Contatti e indirizzo della vetreria, in un posto solo: erano scritti a mano in una dozzina di
// file (footer, contatti, privacy, cookie, 500, manutenzione, chatbot, mappa, JSON-LD) e un
// cambio ne avrebbe lasciato indietro qualcuno. Restano a mano, perche' non possono importare:
// public/llms.txt e src/data/chatbot-flow.json.
export const phoneLocal = '0142 563728';
export const phone = `+39 ${phoneLocal}`;
export const phoneE164 = phone.replaceAll(' ', '');
export const phoneHref = `tel:${phoneE164}`;
export const email = 'vetreriamonferrina@gmail.com';
export const emailHref = `mailto:${email}`;
export const whatsapp = '+39 335 595 5786';
export const whatsappHref = `https://wa.me/${whatsapp.replace(/\D/g, '')}`;

// Dati dell'impresa dal Registro Imprese (d.lgs. 70/2003 art. 7: ragione sociale, REA, P.IVA).
export const ragioneSociale = 'Vetreria Monferrina di Fioravanti Giuseppe';
export const partitaIva = '01574530067';
export const rea = 'AL-171335';

export const street = 'Strada Statale 31, 98/C';
export const postalCode = '15033';
export const town = 'Casale Monferrato';
export const province = 'AL';
export const city = `${postalCode} ${town} (${province})`;
export const latitude = 45.1334;
export const longitude = 8.4525;
