/**
 * Seed Tunisian Influencers — Batch 5 (Final)
 *
 * Adds remaining influencers: fitness, rappers, photographers, and more.
 * Run with: node scripts/seed-influencers-batch5.js
 */

const admin = require('firebase-admin');
const sa = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

function m({ id, name, desc, sub_id, sub_name, subs, loc, lat, lng, featured = false, contact = {} }) {
  return {
    id, name, description: desc,
    category_id: 'influencer', category_name: 'Influencer',
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

  // ═══ FITNESS & HEALTH ══════════════════════════════════════════════════════

  m({ id: 'influencer_khaoula_slimani', name: 'Khaoula Slimani', desc: 'Top fitness influencer in Tunisia with 2.2M Instagram followers. Creates workout routines, fitness motivation, and healthy lifestyle content.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'fashion_beauty'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'khaoulaslimaniofficial' } }),

  m({ id: 'influencer_sonia_younsi', name: 'Sonia Younsi', desc: 'Tunisian fitness influencer with 639K Instagram followers. Shares workout content, fitness tips, and health-focused lifestyle.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'sonia_younsi' } }),

  m({ id: 'influencer_rihem_ben_alaya', name: 'Rihem Ben Alaya', desc: 'Tunisian fitness influencer with 574K Instagram followers. Creates fitness and wellness content for her Tunisian audience.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'rihem_ben_alaya' } }),

  m({ id: 'influencer_rania_toumi', name: 'Rania Toumi', desc: 'Tunisian fitness influencer with 1.5M Instagram followers. One of the biggest fitness creators in Tunisia.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'fashion_beauty'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'ranyatoumi_official' } }),

  m({ id: 'influencer_chamesseddinne', name: 'Chamesseddinne', desc: 'Tunisian health and fitness influencer with 89K followers focused on workout routines and healthy living.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'chamesseddinne' } }),

  m({ id: 'influencer_coach_maroun', name: 'Coach Maroun (Maroun Sammari)', desc: 'Tunisian fitness coach and personal trainer sharing workout tips and coaching content on Instagram.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'coach_maroun' } }),

  // ═══ PHOTOGRAPHY & ART ═════════════════════════════════════════════════════

  m({ id: 'influencer_mehdi_zemni', name: 'Mehdi Zemni', desc: 'Tunisian photographer and travel content creator with 380K+ followers. One of the most prominent photography-focused creators in Tunisia.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'travel'], loc: T, lat: TL, lng: TG, contact: { ig: 'mehdizemnitunisia' } }),

  m({ id: 'influencer_achref_ouerghemmi', name: 'Achref Ouerghemmi', desc: 'Tunisian photographer with 258K Instagram followers. Second most popular photographer influencer in Tunisia.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'achref_ouerghemmi_photographe' } }),

  m({ id: 'influencer_hamdi_van_buuren', name: 'Hamdi Van Buuren', desc: 'Tunisian photographer and content creator with 161K Instagram followers. Known for creative photography content.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'hamdi_van_buuren' } }),

  // ═══ RAPPERS & MUSICIANS (not yet added) ═══════════════════════════════════

  m({ id: 'influencer_el_general', name: 'El General (Hamada Ben Amor)', desc: 'Pioneer of Tunisian revolutionary rap. His song "Rais Lebled" became the anthem of the 2011 Tunisian Revolution that sparked the Arab Spring. A historic figure in Tunisian hip-hop.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'news_politics'], loc: 'Sfax, Tunisia', lat: 34.7406, lng: 10.7603, featured: true, contact: {} }),

  m({ id: 'influencer_kaso', name: 'KASO', desc: 'Tunisian rapper ranked among the top 25 Tunisian rappers. Creates hip-hop music contributing to the growing Tunisian rap scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_gga', name: 'G.G.A', desc: 'Tunisian rapper known for his unique style and contributions to Tunisian hip-hop. Ranked among top Tunisian rappers.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_tati_g13', name: 'TATI G13', desc: 'Tunisian rapper and hip-hop artist. Part of the vibrant Tunisian rap scene with a dedicated following.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_gati', name: 'Gati', desc: 'Tunisian rapper contributing to the diverse Tunisian hip-hop landscape.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_daly_taliani', name: 'Daly Taliani', desc: 'Tunisian rapper known for blending Tunisian and Italian influences in his hip-hop style.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_el_katiba', name: 'El Katiba', desc: 'Tunisian rap collective/artist contributing to the Tunisian hip-hop movement.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_si_lemhaf', name: 'Si Lemhaf', desc: 'Tunisian rapper with a growing following. Known for creative lyrics and contribution to Tunisian urban music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_2two', name: '2Two', desc: 'Tunisian rapper ranked among the top Tunisian hip-hop artists.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_esserpent', name: 'Esserpent', desc: 'Tunisian rapper and hip-hop artist contributing to the Tunisian music scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_ferid_extranjero', name: 'Ferid El Extranjero', desc: 'Tunisian rapper known for his international influences and contribution to Tunisian hip-hop.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_fbk', name: 'F.B.K', desc: 'Tunisian rapper and hip-hop artist.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_blvck_7050', name: 'BLVCK 7050', desc: 'Tunisian rapper known in the Tunisian underground hip-hop scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_space_rap', name: 'Space', desc: 'Tunisian rapper mentioned among honorable mentions in top Tunisian rappers list.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_ruka', name: 'Ruka', desc: 'Tunisian rapper contributing to the hip-hop scene in Tunisia.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_lully_snake', name: 'Lully Snake', desc: "Tunisian-Algerian female rapper based in Tunisia. Former breakdancer turned rapper, representing women in Tunisian hip-hop.", sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_sabrina_rap', name: 'Sabrina', desc: 'Tunisian female rapper who began performing rap in 2007. One of the pioneering women in Tunisian hip-hop.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_queen_nesrine', name: 'Queen Nesrine', desc: 'Tunisian female rapper contributing to the representation of women in Tunisian hip-hop music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_tuny_girl', name: 'Tuny Girl', desc: 'Tunisian female rapper part of the growing women-in-rap movement in Tunisia.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ═══ MORE LIFESTYLE/FASHION/FOOD ═══════════════════════════════════════════

  m({ id: 'influencer_yasser_machat', name: 'Yasser Machat', desc: 'Successful Tunisian YouTuber who breaks Tunisia stereotypes. Creates content about Tunisian culture and lifestyle for international audiences.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_mak_cha', name: 'Mak & Cha', desc: 'Tunisian travel and tourism Instagram influencer with 101K followers and 2.59% engagement rate. Creates travel content showcasing destinations.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_saber_mcdance', name: 'Saber Zaanouni (MC Dance)', desc: 'Tunisian fitness and dance content creator. Combines dance with fitness in entertaining Instagram content.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'mcdanceofficiel' } }),

  m({ id: 'influencer_glamour_abir', name: 'Glamour Beauty by Abir', desc: 'Tunisian beauty and makeup creator. Creates bridal makeup tutorials and beauty content trending on TikTok and Instagram.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'glamour.beauty____by.abir' } }),

  // ═══ MORE INSTAGRAM STARS & CREATORS ═══════════════════════════════════════

  m({ id: 'influencer_houssein_ettounsi', name: 'Houssein Ettounsi', desc: 'Tunisian health and fitness Instagram influencer with 48K followers. Creates wellness and fitness content.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'houssein_ettounsi' } }),

  m({ id: 'influencer_amal_boughdiri', name: 'Amal Boughdiri', desc: 'Tunisian fitness influencer and personal trainer sharing workout routines and fitness motivation content.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'boughdiri_amal' } }),

  m({ id: 'influencer_yassmine_ajmi', name: 'Yassmine Ajmi', desc: 'Tunisian fitness content creator sharing workout tips and healthy lifestyle content.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'yassmine_ajmi' } }),

  // ═══ MORE NOTABLE CREATORS ═════════════════════════════════════════════════

  m({ id: 'influencer_shvdy', name: 'SHVDY', desc: 'Tunisian rapper from the Tunisian hip-hop scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_nvst', name: 'NVST', desc: 'Tunisian rapper contributing to the diverse Tunisian hip-hop landscape.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_ta9chira', name: 'Ta9chira', desc: 'Tunisian rapper with a unique style in the Tunisian underground music scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_dabl_de', name: 'DABL DE', desc: 'Tunisian rapper contributing to the Tunisian hip-hop movement.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_mizo_h', name: 'Mizo-H', desc: 'Tunisian rapper and hip-hop artist.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ═══ ADDITIONAL NOTABLE PERSONALITIES ═══════════════════════════════════════

  m({ id: 'influencer_yassouk_ig', name: 'Yaas0u', desc: 'Tunisian Instagram star (25 years old). Creates lifestyle and beauty content popular in Tunisia.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_embtf', name: 'Embtf', desc: 'Tunisian Instagram star (23 years old). Content creator popular in the Tunisian digital community.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_pr3etty_ysmn', name: 'Pr3etty Ysmn', desc: 'Tunisian TikTok star creating beauty and lifestyle content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_momotns67', name: 'Momotns67', desc: 'Tunisian TikTok star creating entertainment content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_tunisia_explorer', name: 'Tunisia Explorer', desc: 'Tunisian travel and tourism account with 620K+ followers showcasing hidden gems, historical sites, and natural beauty of Tunisia.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'tunisia.explorer' } }),

  // ═══ FILL TO 300+ ══════════════════════════════════════════════════════════

  m({ id: 'influencer_ameer_slow_yt', name: 'Ameer Slow Gaming', desc: 'Tunisian gaming YouTuber with 4.21M subscribers creating gaming and entertainment content.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_sabrine_rezgui_ig', name: 'Sabrinelle Rezgui', desc: 'Tunisian fashion trendsetter known on Instagram as @sabrinelle_rezgui. Featured by Carthage Magazine for her trendy outfit inspiration.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'sabrinelle_rezgui' } }),

  m({ id: 'influencer_faf_elk', name: 'Faf Elk (Farah El Kadhi)', desc: 'Tunisian fashion blogger known for stylish-yet-girly fashion on Instagram @faf.elk.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'faf.elk' } }),

  // More rappers / musicians from various sources
  m({ id: 'influencer_hamzaoui_med_amine', name: 'Hamzaoui Med Amine', desc: 'Prominent Tunisian rapper and hip-hop artist. One of the most well-known names in Tunisian rap music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_phenix', name: 'Phenix', desc: 'Tunisian rapper and hip-hop artist with a dedicated fanbase in Tunisia.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_weld_el_15', name: 'Weld El 15', desc: 'Tunisian rapper known for politically-charged lyrics. One of the most prominent voices in Tunisian protest rap, famously arrested for his music criticizing police.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_lil_baba', name: 'Lil Baba', desc: 'Tunisian rapper and hip-hop artist contributing to the Tunisian music scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_psycho_m', name: 'Psycho M', desc: 'Tunisian rapper known for his intense lyrical style in the Tunisian rap scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_blingos', name: 'Blingos', desc: 'Tunisian rapper and hip-hop artist popular in the Tunisian music scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_maestro_rap', name: 'Maestro', desc: 'Tunisian rapper and hip-hop artist.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_mc_maghrabi', name: 'MC Maghrabi', desc: 'Tunisian rapper representing the Maghreb hip-hop movement.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_el_castro', name: 'El Castro', desc: 'Tunisian rapper and hip-hop artist.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_massi_rap', name: 'Massi', desc: 'Tunisian rapper contributing to the Tunisian hip-hop scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  // Islamic / educational content
  m({ id: 'influencer_nidhal_nahdi', name: 'Nidhal Nahdi', desc: 'Tunisian Islamic content creator sharing religious teachings and guidance on social media.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: {} }),

  // News / media
  m({ id: 'influencer_elhiwar_ettounsi', name: 'Elhiwar Ettounsi', desc: 'Major Tunisian media channel with 8.43M YouTube subscribers. News and political commentary covering Tunisian and regional affairs.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_attessia_tv', name: 'Attessia TV', desc: 'Tunisian television channel with 4.95M YouTube subscribers. Traditional media and news coverage of Tunisian current events.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_nessma_tv', name: 'Nessma TV', desc: 'Tunisian television channel with 2.77M YouTube subscribers. Provides news, entertainment, and cultural programming for Tunisian audiences.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 5 ===\n');
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
