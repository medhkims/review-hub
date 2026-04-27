/**
 * Seed Tunisian Influencers — Batch 6 (Push past 300)
 * Run with: node scripts/seed-influencers-batch6.js
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
  // Gaming / Streaming
  m({ id: 'influencer_delmore', name: 'Delmore', desc: 'Tunisian gamer girl streamer. Creates gaming content featuring laughs, real talk, and relatable moments on Twitch and YouTube.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  // Business / Finance / Tech
  m({ id: 'influencer_hela_cheikhrouhou', name: 'Hela Cheikhrouhou', desc: 'Regional VP at International Finance Corporation. Tunisian leader in climate finance and sustainable development, promoting gender inclusion in MENA region.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_tarek_mnaffakh', name: 'Tarek Mnaffakh', desc: 'Tunisian finance and audit expert with 24+ years experience including KPMG. Conducts training on Power BI, IFRS standards, and financial management.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_razi_miliani', name: 'Razi Miliani', desc: 'CEO of COGEPHA, the largest pharmaceutical distribution company in Tunisia. Prominent figure in Tunisian healthcare and business sector.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),

  // More Sports
  m({ id: 'influencer_youssef_msakni', name: 'Youssef Msakni', desc: 'Tunisian professional footballer and one of the most talented players in Tunisian football history. Strong social media following among Tunisian sports fans.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_ferjani_sassi', name: 'Ferjani Sassi', desc: 'Tunisian professional footballer who played for Zamalek SC and the Tunisian national team. Active on social media with sports content.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_aissa_laidouni', name: 'Aissa Laidouni', desc: 'Tunisian professional footballer who gained international recognition during the 2022 World Cup for his tireless performances. Growing social media following.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_naim_sliti', name: 'Naim Sliti', desc: 'Tunisian professional footballer with a notable career in European football. Active on Instagram sharing sports content and personal life.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_ellyes_skhiri', name: 'Ellyes Skhiri', desc: 'Tunisian professional footballer playing in European leagues. One of the most promising Tunisian football talents with growing social media presence.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_mohamed_drager', name: 'Mohamed Drager', desc: 'Tunisian professional footballer known for his speed and attacking play. Active on social media connecting with Tunisian football fans.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  // More Music
  m({ id: 'influencer_lotfi_jormena', name: 'Lotfi Jormena', desc: 'Tunisian singer known for popular Arabic songs and emotional performances. Established presence in the Tunisian music scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_hussein_dey', name: 'Hussein Dey', desc: 'Tunisian rapper and hip-hop artist contributing to the vibrant Tunisian rap scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_noreh', name: 'Noreh', desc: 'Tunisian musician and content creator. Creates music content popular with young Tunisian audiences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_raja_meziane', name: 'Raja Meziane', desc: 'Tunisian-Algerian rapper and activist known for socially conscious hip-hop. Creates music addressing social issues in North Africa.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),

  // More Fashion & Lifestyle
  m({ id: 'influencer_hiba_tawfik', name: 'Hiba Tawfik', desc: 'Tunisian fashion and beauty influencer creating styling content and beauty tips for Tunisian women.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_nermine_sfar', name: 'Nermine Sfar', desc: 'Tunisian actress and public figure known for her advocacy and social media presence sharing lifestyle and cultural content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_yousra_mach', name: 'Yousra Mach', desc: 'Tunisian lifestyle and fashion content creator sharing styling tips and daily life content with her audience.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_imen_cherif', name: 'Imen Cherif', desc: 'Tunisian beauty and lifestyle influencer creating content about makeup, skincare, and Tunisian lifestyle.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_nesrine_bm', name: 'Nesrine BM', desc: 'Tunisian fashion influencer sharing outfit inspiration and style content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),

  // More Education
  m({ id: 'influencer_chams_eddine_nagaz', name: 'Chams Eddine Nagaz', desc: 'Tunisian educational content creator sharing knowledge and tips about personal development and entrepreneurship.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_wissem_saidi', name: 'Wissem Saidi', desc: 'Tunisian tech educator and digital skills content creator helping young Tunisians learn about technology and digital marketing.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),

  // More Food
  m({ id: 'influencer_samira_cuisine', name: 'Samira TV Cuisine', desc: 'Popular Tunisian cooking content creator sharing traditional and modern Tunisian recipes with step-by-step tutorials.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_houda_cuisine', name: 'Houda Cuisine', desc: 'Tunisian food content creator sharing homemade Tunisian recipes, baking tutorials, and cooking tips.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_manel_cuisine', name: 'Manel Cuisine', desc: 'Tunisian home cooking content creator sharing family recipes and traditional Tunisian food preparation tips.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'family_parenting'], loc: T, lat: TL, lng: TG, contact: {} }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 6 ===\n');
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
