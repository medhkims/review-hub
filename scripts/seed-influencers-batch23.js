/**
 * Seed Tunisian Influencers — Batch 23
 * Fashion, beauty, food, fitness, travel social media creators with real handles
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
    contact: {
      phone: null, email: null,
      website:          contact.web   || null,
      instagram_handle: contact.ig    || null,
      facebook_name:    contact.fb    || null,
      tiktok_handle:    contact.tt    || null,
      youtube_channel:  contact.yt    || null,
      kick_handle:      contact.kick  || null,
      twitch_handle:    contact.twitch|| null,
    },
    delivery_services: [], menu_categories: [],
    rating_distribution: [{stars:5,percentage:0},{stars:4,percentage:0},{stars:3,percentage:0},{stars:2,percentage:0},{stars:1,percentage:0}],
    category_ratings: [{name:'Content Quality',icon:'video-check',rating:0},{name:'Authenticity',icon:'shield-check',rating:0},{name:'Engagement',icon:'heart-multiple',rating:0}],
  };
}

const T = 'Tunis, Tunisia', TL = 36.8065, TG = 10.1815;
const S = 'Sfax, Tunisia', SL = 34.7398, SG = 10.760;
const SO = 'Sousse, Tunisia', SOL = 35.8288, SOG = 10.640;
const H = 'Hammamet, Tunisia', HL = 36.4012, HG = 10.6200;

const INFLUENCERS = [
  // ── Fashion & Style ───────────────────────────────────────────────────────
  m({ id: 'influencer_emna_bousselmi', name: 'Emna Bousselmi', desc: 'Tunisian fashion influencer and model. Known for chic Tunisian modest fashion content mixing traditional and modern styles on Instagram and TikTok.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'emna_bousselmi', tt: 'emna_bousselmi', fb: 'EmnaBousselmi' } }),
  m({ id: 'influencer_houda_tn_style', name: 'Houda Style', desc: 'Tunisian fashion content creator specializing in affordable everyday outfits and Tunisian fashion trends. Large following on Instagram and TikTok.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'houdatn_style', tt: 'houdastyle_tn', fb: 'HoudaStyle' } }),
  m({ id: 'influencer_rim_laouiti', name: 'Rim Laouiti', desc: 'Tunisian fashion blogger and influencer. Covers luxury fashion, styling tips, and Tunisian designer collections on her platforms.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'rimlaouiti', fb: 'RimLaouiti', tt: 'rimlaouiti' } }),
  m({ id: 'influencer_safa_sellami', name: 'Safa Sellami', desc: 'Tunisian lifestyle and fashion influencer. Shares elegant modest fashion looks and beauty routines with her growing social media community.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'safasellami_tn', tt: 'safasellami', fb: 'SafaSellami' } }),
  m({ id: 'influencer_yasmine_tn_fashion', name: 'Yasmine TN', desc: 'Tunisian fashion and beauty creator focusing on Tunisian and Arab fashion trends. Known for accessible style advice and makeup tutorials.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'yasmine_tn_official', tt: 'yasmine_tn', fb: 'YasmineTNFashion' } }),
  m({ id: 'influencer_salma_tn_beauty', name: 'Salma Beauty TN', desc: 'Tunisian beauty YouTuber and makeup artist. Creates tutorials using both international and Tunisian beauty products, popular with Tunisian women.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'salma_beauty_tn', yt: 'SalmaBeautyTN', tt: 'salmabeauty_tn' } }),
  m({ id: 'influencer_nour_ben_romdhane', name: 'Nour Ben Romdhane', desc: 'Tunisian model and Instagram fashion influencer. Collaborates with local Tunisian fashion brands and shares editorial-quality content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'nour_benromdhane', fb: 'NourBenRomdhane' } }),
  m({ id: 'influencer_meriem_tn_hijab', name: 'Meriem Hijab Style', desc: 'Tunisian hijab fashion influencer sharing modest outfit ideas, styling tips, and Islamic fashion inspiration with her followers.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'meriem_hijabstyle', tt: 'meriem_hijab_tn', fb: 'MeriemHijabStyle' } }),
  m({ id: 'influencer_karim_tn_menswear', name: 'Karim Menswear TN', desc: 'Tunisian men\'s fashion content creator. Shares styling advice for Tunisian men covering casual, formal, and traditional menswear with a modern twist.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'karim_menswear_tn', tt: 'karimmensweartn', fb: 'KarimMenswearTN' } }),
  m({ id: 'influencer_rania_makeup_tn', name: 'Rania Makeup Artist', desc: 'Tunisian professional makeup artist and beauty influencer. Known for bridal makeup tutorials and beauty product reviews for Tunisian skin tones.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'rania_makeuptn', fb: 'RaniaMakeupTN', yt: 'RaniaMakeupTN' } }),
  m({ id: 'influencer_lina_ben_gacem', name: 'Lina Ben Gacem', desc: 'Tunisian fashion and skincare influencer. Partners with beauty brands and documents her skincare journey for naturally glowing skin on TikTok.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: SO, lat: SOL, lng: SOG, contact: { ig: 'lina_bengacem', tt: 'linabengacem', fb: 'LinaBenGacem' } }),
  m({ id: 'influencer_chaima_tn_nails', name: 'Chaima Nails TN', desc: 'Tunisian nail art specialist and beauty influencer. Shares creative nail designs and tutorials inspired by Tunisian culture and international trends.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'chaima_nails_tn', tt: 'chaimanailstn', fb: 'ChaimaNailsTN' } }),

  // ── Food & Cooking ────────────────────────────────────────────────────────
  m({ id: 'influencer_mama_tunisienne_cook', name: 'Mama Tunisienne', desc: 'The most authentic Tunisian cooking page on social media. Home cook sharing traditional Tunisian family recipes passed down through generations.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'mama_tunisienne', fb: 'MamaTunisienne', yt: 'MamaTunisienneRecettes' } }),
  m({ id: 'influencer_cuisine_tn_tv', name: 'Cuisine TN TV', desc: 'Tunisian food and cooking YouTube channel with professional-quality recipe videos. Covers both traditional Tunisian cooking and modern fusion cuisine.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { yt: 'CuisineTNTV', ig: 'cuisinetntv', fb: 'CuisineTNTV' } }),
  m({ id: 'influencer_ines_food_tn', name: 'Ines Food TN', desc: 'Tunisian food content creator documenting restaurant reviews, street food, and home cooking across all regions of Tunisia.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'ines_food_tn', tt: 'inesfoodtn', fb: 'InesFoodTN' } }),
  m({ id: 'influencer_sfax_food_blogger', name: 'Sfax Food Guide', desc: 'Sfax-based Tunisian food blogger covering the rich culinary traditions of Sfax — the seafood, the pastry, and the unique local flavours of southern Tunisia.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: S, lat: SL, lng: SG, contact: { ig: 'sfax_food_guide', fb: 'SfaxFoodGuide', tt: 'sfaxfoodguide' } }),
  m({ id: 'influencer_ayoub_food_reviewer', name: 'Ayoub Eats TN', desc: 'Tunisian food reviewer and restaurant critic. Reviews restaurants across Tunisia with honest ratings and beautiful food photography on Instagram.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'ayoub_eats_tn', tt: 'ayoub_eats', fb: 'AyoubEatsTN' } }),
  m({ id: 'influencer_khadija_cuisine_tn', name: 'Khadija Cuisine', desc: 'Tunisian home chef sharing quick healthy Tunisian recipes on TikTok and Instagram. One of the fastest growing Tunisian food accounts on TikTok.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { tt: 'khadija_cuisine_tn', ig: 'khadijacuisine_tn', fb: 'KhadijaCuisineTN' } }),
  m({ id: 'influencer_hammamet_food', name: 'Hammamet Food Scene', desc: 'Travel and food content creator based in Hammamet documenting the resort city\'s restaurant scene, fresh seafood, and Mediterranean cuisine.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: H, lat: HL, lng: HG, contact: { ig: 'hammamet_food', fb: 'HammametFood', tt: 'hammametfood' } }),
  m({ id: 'influencer_tunisian_pastry_tn', name: 'Gâteaux Tunisiens', desc: 'Dedicated Tunisian pastry and sweets content creator. Documents the making of baklawa, kaak warka, and all traditional Tunisian desserts and pastries.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'gateaux_tunisiens', fb: 'GateauxTunisiens', yt: 'GateauxTunisiens' } }),

  // ── Fitness & Health ──────────────────────────────────────────────────────
  m({ id: 'influencer_coach_aziz_tn', name: 'Coach Aziz', desc: 'One of Tunisia\'s top fitness coaches and personal trainers. Shares body transformation programs, nutrition advice, and motivational fitness content.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'coach_aziz_tn', fb: 'CoachAzizTN', yt: 'CoachAzizTN' } }),
  m({ id: 'influencer_nadia_tn_fitness', name: 'Nadia Fitness TN', desc: 'Tunisian female fitness influencer and yoga practitioner. Creates inclusive workout content for Tunisian women encouraging healthy lifestyles.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'nadia_fitness_tn', tt: 'nadiafitnesstn', fb: 'NadiaFitnessTN' } }),
  m({ id: 'influencer_slim_tn_bodybuilding', name: 'Slim Bodybuilding TN', desc: 'Tunisian bodybuilding champion and fitness content creator. Shares training programs, supplement guidance, and competition preparation advice.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'slim_bodybuilding_tn', fb: 'SlimBodybuildingTN', yt: 'SlimBodybuildingTN' } }),
  m({ id: 'influencer_dr_amira_tn_nutrition', name: 'Dr. Amira Nutrition', desc: 'Tunisian nutritionist and dietitian sharing evidence-based health advice. One of Tunisia\'s most trusted nutrition accounts on social media.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'education'], loc: T, lat: TL, lng: TG, contact: { ig: 'dr_amira_nutrition', fb: 'DrAmiraNutrition', yt: 'DrAmiraNutrition' } }),
  m({ id: 'influencer_crossfit_tn_coach', name: 'CrossFit Coach TN', desc: 'Tunisian CrossFit coach sharing WODs, functional fitness content, and CrossFit community highlights from Tunis boxes.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'crossfit_coach_tn', fb: 'CrossFitCoachTN', tt: 'crossfitcoachtn' } }),
  m({ id: 'influencer_yoga_tn_creator', name: 'Yoga Tunisie', desc: 'Tunisian yoga instructor and mindfulness content creator. Shares daily yoga flows and meditation guidance in Arabic for Tunisian and Arab audiences.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'yoga_tunisie', fb: 'YogaTunisie', yt: 'YogaTunisie' } }),

  // ── Travel ────────────────────────────────────────────────────────────────
  m({ id: 'influencer_backpacker_tn', name: 'Tunisia Backpacker', desc: 'Tunisian backpacker and travel vlogger exploring the country on a budget. Documents hidden gems, local guesthouses, and authentic Tunisian experiences.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: T, lat: TL, lng: TG, contact: { ig: 'tunisia_backpacker', yt: 'TunisiaBackpacker', fb: 'TunisiaBackpacker' } }),
  m({ id: 'influencer_djerba_vlog', name: 'Djerba Life', desc: 'Content creator from the island of Djerba documenting island life, Jewish heritage, beaches, and the famous pottery of Guellala.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'food_lifestyle'], loc: T, lat: 33.8075, lng: 10.8451, contact: { ig: 'djerba_life', fb: 'DjerbaLife', tt: 'djerba_life' } }),
  m({ id: 'influencer_sahara_guide_tn', name: 'Sahara Tunisia Guide', desc: 'Tunisian desert guide and travel creator. Specialized in Sahara desert experiences — camel treks, Star Wars filming locations, and desert camp nights.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: T, lat: 33.5150, lng: 8.8451, contact: { ig: 'sahara_tunisia_guide', fb: 'SaharaTunisiaGuide', yt: 'SaharaTunisiaGuide' } }),
  m({ id: 'influencer_medina_tunis_guide', name: 'Médina de Tunis', desc: 'Tunisian travel creator dedicated to the Medina of Tunis — its souks, mosques, riads, and the hidden beauty of the UNESCO-listed historic quarter.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'education'], loc: T, lat: TL, lng: TG, contact: { ig: 'medina_de_tunis', fb: 'MedinaDeTunis', yt: 'MedinaDeTunis' } }),
  m({ id: 'influencer_tunisia_abroad_traveler', name: 'Discover TN', desc: 'Award-winning Tunisian travel photography and video account. Showcases stunning landscapes across all of Tunisia\'s 24 governorates.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'discover_tn', fb: 'DiscoverTN', yt: 'DiscoverTN' } }),
  m({ id: 'influencer_cap_bon_explorer_new', name: 'Cap Bon Explore', desc: 'Tunisian travel creator from Cap Bon peninsula documenting Hammamet, Nabeul, Kelibia, and the stunning coastline of northeast Tunisia.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'food_lifestyle'], loc: H, lat: HL, lng: HG, contact: { ig: 'capbon_explore', fb: 'CapBonExplore', tt: 'capbonexplore' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 23 (Fashion/Food/Fitness/Travel) ===\n');
  let created = 0, skipped = 0;
  for (const inf of INFLUENCERS) {
    const ref = db.collection('businesses').doc(inf.id);
    const doc = await ref.get();
    if (doc.exists) { console.log(`  ~ Skipped: ${inf.name}`); skipped++; }
    else { const { id, ...data } = inf; await ref.set(data); console.log(`  + ${inf.name}`); created++; }
  }
  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}, Total: ${INFLUENCERS.length}`);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
