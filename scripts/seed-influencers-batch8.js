/**
 * Seed Tunisian Influencers — Batch 8 (Film directors, athletes, artists, more creators)
 * Run with: node scripts/seed-influencers-batch8.js
 */
const admin = require('firebase-admin');
const sa = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

function m({ id, name, desc, sub_id, sub_name, subs, loc, lat, lng, featured = false, contact = {} }) {
  return {
    id, name, description: desc, category_id: 'influencer', category_name: 'Influencer',
    subcategory_id: sub_id, subcategory_name: sub_name, sub_categories: subs,
    location: loc, latitude: lat, longitude: lng,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0,
    is_featured: featured, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: contact.ig||null, facebook_name: contact.fb||null, tiktok_handle: contact.tt||null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [{stars:5,percentage:0},{stars:4,percentage:0},{stars:3,percentage:0},{stars:2,percentage:0},{stars:1,percentage:0}],
    category_ratings: [{name:'Content Quality',icon:'video-check',rating:0},{name:'Authenticity',icon:'shield-check',rating:0},{name:'Engagement',icon:'heart-multiple',rating:0}],
  };
}

const T = 'Tunis, Tunisia', TL = 36.8065, TG = 10.1815;

const INFLUENCERS = [
  // ============ FILM DIRECTORS & PRODUCERS ============

  m({ id: 'influencer_kaouther_ben_hania', name: 'Kaouther Ben Hania', desc: 'Tunisian filmmaker. Oscar-nominated for "Four Daughters" (2023). One of the most internationally acclaimed Tunisian directors of her generation.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_leyla_bouzid', name: 'Leyla Bouzid', desc: 'Tunisian filmmaker known for "As I Open My Eyes". Award-winning director representing Tunisian cinema at international festivals.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_nouri_bouzid', name: 'Nouri Bouzid', desc: 'Pioneering Tunisian filmmaker and screenwriter. One of the most important figures in Tunisian cinema history with socially engaged films.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_raja_amari', name: 'Raja Amari', desc: 'Tunisian filmmaker known for award-winning films. Active in promoting Tunisian cinema internationally.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_mehdi_barsaoui', name: 'Mehdi Barsaoui', desc: 'Tunisian filmmaker whose debut "A Son" won awards at Venice Film Festival. Rising star of Tunisian cinema.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_mohamed_ben_attia', name: 'Mohamed Ben Attia', desc: 'Tunisian filmmaker. His debut "Hedi" won Best First Feature at Berlin Film Festival. Acclaimed director in contemporary Tunisian cinema.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_selma_baccar', name: 'Selma Baccar', desc: 'Pioneering Tunisian woman filmmaker and one of the first female directors in the Arab world. Trailblazer in Tunisian cinema.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_hinde_boujemaa', name: 'Hinde Boujemaa', desc: 'Tunisian filmmaker and documentary director. Creates socially conscious content and films about Tunisian society.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_lotfi_achour', name: 'Lotfi Achour', desc: 'Tunisian filmmaker and director known for his work in Tunisian independent cinema.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_nacer_khemir', name: 'Nacer Khemir', desc: 'Tunisian filmmaker, storyteller, and calligrapher. Known for his visually stunning films about Arab and Islamic culture.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_ferid_boughedir', name: 'Férid Boughedir', desc: 'Tunisian film director and critic. Leading voice in African cinema, known for films like "Halfaouine" and "A Summer in La Goulette".', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_abdelhamid_bouchnak', name: 'Abdelhamid Bouchnak', desc: 'Tunisian filmmaker known for horror and thriller films. Pioneer of genre cinema in Tunisia, including "Dachra" — the first Tunisian horror film.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ============ MORE ATHLETES ============

  // Tennis
  m({ id: 'influencer_malek_jaziri', name: 'Malek Jaziri', desc: 'Tunisian professional tennis player. Highest-ranked Tunisian male tennis player in history. Active sports figure with social media presence.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_selima_sfar', name: 'Selima Sfar', desc: 'Tunisian former professional tennis player. First Tunisian woman to win a WTA Tour match. Paved the way for Tunisian women\'s tennis.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  // Handball
  m({ id: 'influencer_wissem_hmam', name: 'Wissem Hmam', desc: 'Tunisian handball legend. One of the greatest Tunisian handball players ever, with a distinguished career in European handball leagues.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_wael_jallouz', name: 'Wael Jallouz', desc: 'Tunisian handball player who played in top European leagues including FC Barcelona Handbol. Star of Tunisian handball.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_oussama_boughanmi', name: 'Oussama Boughanmi', desc: 'Tunisian handball player competing at the highest international level. Represents Tunisia in major handball tournaments.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_issam_tej', name: 'Issam Tej', desc: 'Tunisian handball goalkeeper. Key player in the Tunisian national handball team with an impressive international career.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  // More football
  m({ id: 'influencer_hamza_mathlouthi', name: 'Hamza Mathlouthi', desc: 'Tunisian professional footballer. Part of the Tunisian national team squad with growing social media following.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ============ VISUAL ARTISTS ============

  m({ id: 'influencer_nadia_khiari', name: 'Nadia Khiari', desc: 'Tunisian painter and cartoonist known for "Willis from Tunis" — political cartoons that went viral during the Tunisian revolution. Art as activism.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_meriem_bouderbala', name: 'Meriem Bouderbala', desc: 'Tunisian photographer, painter, and installation artist. Creates contemporary art exploring identity and culture. Exhibited internationally.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_mouna_karray', name: 'Mouna Karray', desc: 'Tunisian contemporary photographer and visual artist. Her work has been exhibited in major international galleries and museums.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_ghaya_oliveira', name: 'Ghaya Oliveira', desc: 'Tunisian chef who became executive pastry chef at Daniel (NYC). James Beard Award winner. Top Tunisian culinary talent internationally.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  // ============ MORE SINGERS ============

  m({ id: 'influencer_latifa_singer', name: 'Latifa', desc: 'Tunisian singer, one of the biggest Arab music stars. Millions of fans across the Arab world. Hugely popular on social media.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_chahrazed_helal', name: 'Chahrazed Helal', desc: 'Tunisian singer contributing to the contemporary Tunisian music scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ============ MORE ACTRESSES ============

  m({ id: 'influencer_kawther_el_bardi', name: 'Kawther El Bardi', desc: 'Tunisian actress featured in Tunisian and international film productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_nidhal_guiga', name: 'Nidhal Guiga', desc: 'Tunisian actress and filmmaker working across Tunisian cinema and television.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_wahida_dridi', name: 'Wahida Dridi', desc: 'Tunisian actress known for her performances in Tunisian drama and film.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_meriam_ben_hussein', name: 'Meriam Ben Hussein', desc: 'Tunisian actress and media personality. Active on social media sharing her acting career and personal life.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ============ MORE MALE ACTORS ============

  m({ id: 'influencer_raouf_ben_amor', name: 'Raouf Ben Amor', desc: 'Tunisian actor with a long career in Tunisian film and television. Respected figure in Tunisian acting.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_hatem_ben_rabah', name: 'Hatem Ben Rabah', desc: 'Tunisian actor featured in Tunisian television and film productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_faisal_bezzine', name: 'Faisal Bezzine', desc: 'Tunisian actor known for his appearances in Tunisian film and TV productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_ahmed_hafiane', name: 'Ahmed Hafiane', desc: 'Tunisian television actor with notable roles in Tunisian drama series.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_romdhan_chatta', name: 'Romdhan Chatta', desc: 'Tunisian actor and television personality with roles in Tunisian productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_lotfi_dziri', name: 'Lotfi Dziri', desc: 'Tunisian actor known for his roles in Tunisian cinema and television.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_mohamed_sayari', name: 'Mohamed Sayari', desc: 'Tunisian actor with a career in Tunisian television and film.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_tawfik_bahri', name: 'Tawfik Bahri', desc: 'Tunisian actor known for his roles in Tunisian TV series.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_noureddine_ben_ayed', name: 'Noureddine Ben Ayed', desc: 'Tunisian television actor with an established career in Tunisian drama.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_moncef_lazaar', name: 'Moncef Lazaâr', desc: 'Tunisian television actor featured in popular Tunisian TV series.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ============ FASHION DESIGNER ============

  m({ id: 'influencer_azzedine_alaia', name: 'Azzedine Alaïa', desc: 'Legendary Tunisian-French fashion designer known as the "King of Cling". One of the most influential fashion designers of all time. Iconic Tunisian figure in global fashion.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  // ============ NADIA EL FANI — filmmaker/activist ============

  m({ id: 'influencer_nadia_el_fani', name: 'Nadia El Fani', desc: 'Franco-Tunisian filmmaker known for provocative documentaries. Prominent figure in Tunisian cultural and social discourse.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 8 ===\n');
  let c = 0, s = 0;
  for (const biz of INFLUENCERS) {
    const { id, ...data } = biz;
    const ref = db.collection('businesses').doc(id);
    if ((await ref.get()).exists) { console.log(`  ~ SKIP: ${biz.name}`); s++; continue; }
    await ref.set({ ...data, created_at: admin.firestore.FieldValue.serverTimestamp(), updated_at: admin.firestore.FieldValue.serverTimestamp() });
    console.log(`  + ${biz.name} [${biz.sub_categories.join(', ')}]`);
    c++;
  }
  console.log(`\nDone! Created: ${c}, Skipped: ${s}, Total in batch: ${INFLUENCERS.length}`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
