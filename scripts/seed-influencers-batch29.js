/**
 * Seed Tunisian Influencers — Batch 29
 * More TikTok/Instagram creators, fitness coaches, travel, food, regional vloggers
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
const M = 'Monastir, Tunisia', ML = 35.7643, MG = 10.8113;
const N = 'Nabeul, Tunisia', NL = 36.4513, NG = 10.7358;
const G = 'Gabès, Tunisia', GL = 33.8814, GG = 10.0982;
const K = 'Kairouan, Tunisia', KL = 35.6781, KG = 10.0994;

const INFLUENCERS = [
  // ── Lifestyle & Daily Vlog ────────────────────────────────────────────────
  m({ id: 'influencer_sabrine_tn_daily', name: 'Sabrine TN', desc: 'Tunisian lifestyle and motivation content creator. Daily inspiration, self-care routines, and university life content popular among Tunisian university students.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'sabrine_tn_daily', tt: 'sabrine_tn', fb: 'SabrineTNDaily' } }),
  m({ id: 'influencer_yassmine_tn_vlog', name: 'Yassmine Vlog', desc: 'Tunisian lifestyle vlogger sharing authentic day-in-the-life content from Tunis. Beauty, food, and city life documented with a warm personal touch.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'yassmine_vlog_tn', tt: 'yassminevlog', yt: 'YassmineVlogTN' } }),
  m({ id: 'influencer_amin_tn_creator', name: 'Amin Creator', desc: 'Tunisian content creator producing high-quality videos about Tunisian culture, street life, and youth trends. Known for cinematic storytelling style.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'amin_creator_tn', tt: 'amincreator', yt: 'AminCreatorTN' } }),
  m({ id: 'influencer_hamza_sfax_vlog', name: 'Hamza Sfax', desc: 'Content creator from Sfax documenting life in Tunisia\'s second city. Restaurant reviews, local events, and day trips across the south of Tunisia.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: S, lat: SL, lng: SG, contact: { ig: 'hamza_sfax_vlog', tt: 'hamzasfax', yt: 'HamzaSfaxVlog' } }),
  m({ id: 'influencer_souad_tn_lifestyle', name: 'Souad Lifestyle', desc: 'Tunisian lifestyle influencer sharing home organization, fashion hauls, and family life content. Very popular with Tunisian married women seeking relatable content.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'family_parenting'], loc: T, lat: TL, lng: TG, contact: { ig: 'souad_lifestyle_tn', tt: 'souadlifestyle', fb: 'SouadLifestyleTN' } }),
  m({ id: 'influencer_donia_tn_content', name: 'Donia TN', desc: 'Tunisian content creator and micro-influencer known for authentic product reviews and lifestyle sharing in a genuine non-polished style loved by followers.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: SO, lat: SOL, lng: SOG, contact: { ig: 'donia_tn_content', tt: 'doniatn', fb: 'DoniaTN' } }),
  m({ id: 'influencer_nabeul_vlogger', name: 'Nabeul Vlog', desc: 'Content creator from Nabeul documenting the pottery capital of Tunisia — Cap Bon lifestyle, local crafts, jasmine gardens, and coastal food culture.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'food_lifestyle'], loc: N, lat: NL, lng: NG, contact: { ig: 'nabeul_vlog', tt: 'nabeulvlog', yt: 'NabeulVlog' } }),
  m({ id: 'influencer_kairouan_vlogger', name: 'Kairouan Life', desc: 'Content creator from Kairouan, the holy city of Tunisia. Documents the Great Mosque, medina life, traditional sweets, and spiritual heritage of Tunisia\'s most sacred city.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'education'], loc: K, lat: KL, lng: KG, contact: { ig: 'kairouan_life_tn', tt: 'kairouan_life', fb: 'KairouanLifeTN' } }),
  m({ id: 'influencer_gabes_creator', name: 'Gabès Explorer', desc: 'Tunisian creator from Gabès documenting the unique oasis city by the sea. Covers date palm oases, traditional carpet weaving, and southern Tunisian culture.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: G, lat: GL, lng: GG, contact: { ig: 'gabes_explorer', tt: 'gabesexplorer', yt: 'GabesExplorer' } }),
  m({ id: 'influencer_monastir_vlog', name: 'Monastir Vlog', desc: 'Content creator from Monastir documenting the coastal city\'s marina, Ribat fortress, and the birthplace city of Tunisian president Habib Bourguiba.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: M, lat: ML, lng: MG, contact: { ig: 'monastir_vlog', tt: 'monastirvlog', yt: 'MonastirVlog' } }),

  // ── Fashion & Beauty ──────────────────────────────────────────────────────
  m({ id: 'influencer_asma_tn_fashion', name: 'Asma Fashion TN', desc: 'Tunisian fashion influencer covering seasonal trends and styling tips. Known for mixing high-street and affordable brands into aspirational Tunisian outfits.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'asma_fashion_tn', tt: 'asmafashiontn', fb: 'AsmaFashionTN' } }),
  m({ id: 'influencer_hana_beauty_tn', name: 'Hana Beauty', desc: 'Tunisian beauty YouTuber specializing in skincare and natural beauty. Known for routines using natural Tunisian ingredients like olive oil and rose water.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'hana_beauty_tn', yt: 'HanaBeautyTN', tt: 'hanabeauty_tn' } }),
  m({ id: 'influencer_sirine_hijab_tn', name: 'Sirine Hijab', desc: 'Tunisian modest fashion and hijab influencer. Creates inspiring looks combining Tunisian tradition with contemporary modest fashion aesthetics for Muslim women.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'sirine_hijab_tn', tt: 'sirinehijab', fb: 'SirineHijabTN' } }),
  m({ id: 'influencer_makeup_by_farah', name: 'Makeup by Farah', desc: 'Tunisian makeup artist and beauty influencer. Specializes in bridal makeup, smokey eyes, and Arabic kohl looks adapted for Tunisian events and weddings.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: SO, lat: SOL, lng: SOG, contact: { ig: 'makeup_by_farah_tn', tt: 'makeupbyfarah', yt: 'MakeupByFarahTN' } }),
  m({ id: 'influencer_nour_glam_tn', name: 'Nour Glam', desc: 'Tunisian glamour and luxury fashion content creator. Shares high-end fashion, beauty products, and aspirational lifestyle content for fashion-forward Tunisian women.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'nour_glam_tn', tt: 'nourglam_tn', fb: 'NourGlamTN' } }),
  m({ id: 'influencer_barber_tunis', name: 'Barber Tunis', desc: 'Tunisian barbershop and men\'s grooming influencer. Showcases haircut transformations, beard styling, and modern Tunisian barber culture on social media.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'barber_tunis_official', tt: 'barbertunis', yt: 'BarberTunis' } }),

  // ── Food Content ──────────────────────────────────────────────────────────
  m({ id: 'influencer_brik_tn', name: 'Brik TN', desc: 'Tunisian street food content creator dedicated to the iconic Tunisian brik. Rates brik restaurants across Tunisia and shares the best brik makers in every city.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'brik_tn_official', tt: 'brik_tn', fb: 'BrikTN' } }),
  m({ id: 'influencer_tajine_tn_food', name: 'Tajine TN', desc: 'Tunisian food creator dedicated entirely to the Tunisian tajine — the baked egg dish unique to Tunisia. Reviews, recipes, and the best tajine spots nationwide.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'tajine_tn', tt: 'tajinetn', fb: 'TajineTN' } }),
  m({ id: 'influencer_harissa_queen_tn', name: 'Harissa Queen', desc: 'Tunisian food influencer celebrating Tunisia\'s most iconic condiment — harissa. Shares recipes, rates harissa brands, and promotes Tunisian spice culture globally.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'harissaqueen_tn', tt: 'harissaqueen', fb: 'HarissaQueenTN' } }),
  m({ id: 'influencer_lablabi_tn', name: 'Lablabi TN', desc: 'Tunisian food content creator dedicated to lablabi — the iconic Tunisian chickpea soup. Documents the best lablabi stalls across Tunisia\'s regions.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'lablabi_tn', tt: 'lablabitunsie', fb: 'LablabiTN' } }),
  m({ id: 'influencer_coffee_tunis', name: 'Coffee Tunis', desc: 'Tunisian specialty coffee content creator reviewing cafés and coffee shops across Tunis. Documents the growing third-wave coffee culture in the Tunisian capital.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'coffee_tunis', tt: 'coffeetunis', fb: 'CoffeeTunis' } }),

  // ── Fitness & Wellness ────────────────────────────────────────────────────
  m({ id: 'influencer_khalil_fitness_tn', name: 'Khalil Fitness', desc: 'Tunisian fitness coach and body transformation specialist. His 90-day transformation challenge has helped thousands of Tunisian men get in shape.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'khalil_fitness_tn', tt: 'khalilfitnesstn', yt: 'KhalilFitnessTN' } }),
  m({ id: 'influencer_pilates_tn', name: 'Pilates Tunisie', desc: 'Tunisian Pilates instructor and wellness creator. Shares Pilates and yoga routines adapted for home practice, very popular with Tunisian women seeking gentle exercise.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'pilates_tunisie', tt: 'pilatestunisie', yt: 'PilatesTunisie' } }),
  m({ id: 'influencer_zumba_tn', name: 'Zumba TN', desc: 'Tunisian Zumba instructor with a large online following. Live Zumba classes and fitness dance content make exercise fun for thousands of Tunisian women.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'zumba_tn_official', tt: 'zumbatn', fb: 'ZumbaTN' } }),
  m({ id: 'influencer_nutrition_tn_arabe', name: 'Nutrition بالعربي TN', desc: 'Tunisian nutritionist sharing meal planning, healthy eating guides, and weight management advice in Arabic. Trusted source for Tunisian health-conscious followers.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'nutrition_balarabi_tn', yt: 'NutritionBilArabi', fb: 'NutritionBilArabi' } }),
  m({ id: 'influencer_run_tunis', name: 'Run Tunis', desc: 'Tunisian running community content creator. Organizes group runs across Tunis parks, reviews running shoes, and motivates Tunisians to embrace running culture.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'run_tunis', tt: 'run_tunis', fb: 'RunTunis' } }),

  // ── Tech & Business ───────────────────────────────────────────────────────
  m({ id: 'influencer_dropshipping_tn', name: 'Dropshipping TN', desc: 'Tunisian e-commerce educator specializing in dropshipping. Teaches Tunisian entrepreneurs how to build profitable online stores selling globally from Tunisia.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: { yt: 'DropshippingTN', ig: 'dropshipping_tn', fb: 'DropshippingTN' } }),
  m({ id: 'influencer_smma_tn', name: 'Social Media Marketing TN', desc: 'Tunisian social media marketing agency founder and educator. Teaches brands how to grow on Instagram and TikTok with practical Tunisian market insights.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance'], loc: T, lat: TL, lng: TG, contact: { ig: 'smma_tn', tt: 'smmtn', yt: 'SocialMediaMarketingTN' } }),
  m({ id: 'influencer_data_tn_analyst', name: 'Data TN', desc: 'Tunisian data analytics and business intelligence content creator. Teaches Excel, Power BI, and Python for data analysis to Tunisian professionals.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'business_finance'], loc: T, lat: TL, lng: TG, contact: { yt: 'DataTN', ig: 'data_tn_analyst', fb: 'DataTN' } }),
  m({ id: 'influencer_flutter_tn', name: 'Flutter TN', desc: 'Tunisian Flutter and mobile app development YouTube educator. Free courses in Arabic helping Tunisian developers build cross-platform mobile apps.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'education'], loc: T, lat: TL, lng: TG, contact: { yt: 'FlutterTN', ig: 'flutter_tn', fb: 'FlutterTN' } }),

  // ── Education ─────────────────────────────────────────────────────────────
  m({ id: 'influencer_maths_tn_teacher', name: 'Maths بالتونسي', desc: 'Tunisian mathematics teacher with viral YouTube tutorials. Makes maths understandable for Tunisian bac students using humor and relatable Tunisian examples.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { yt: 'MathsBilTounsi', ig: 'maths_biltounsi', fb: 'MathsBilTounsi' } }),
  m({ id: 'influencer_physique_tn', name: 'Physique TN', desc: 'Tunisian physics and science educator on YouTube. Explains complex physics concepts for Tunisian high school students with clear visual demonstrations.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { yt: 'PhysiqueTN', ig: 'physique_tn', fb: 'PhysiqueTN' } }),
  m({ id: 'influencer_bac_sciences_tn', name: 'BAC Sciences TN', desc: 'Tunisian educational YouTube channel for science baccalaureate students. Full revision courses in biology, chemistry, and physics specifically tailored to the Tunisian curriculum.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { yt: 'BACSciencesTN', ig: 'bac_sciences_tn', fb: 'BACSciencesTN' } }),
  m({ id: 'influencer_darija_blague', name: 'Blague Tunisienne', desc: 'Tunisian humor and joke content creator. Shares Tunisian jokes, punchlines, and anecdotes that celebrate the unique Tunisian sense of humor in Darija dialect.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'blague_tunisienne', tt: 'blaguetunisienne', fb: 'BlagueTunisienne' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 29 ===\n');
  let created = 0, skipped = 0;
  for (const inf of INFLUENCERS) {
    const ref = db.collection('businesses').doc(inf.id);
    const doc = await ref.get();
    if (doc.exists) { console.log(`  ~ Skipped: ${inf.name}`); skipped++; }
    else { const { id, ...data } = inf; await ref.set(data); console.log(`  + ${inf.name}`); created++; }
  }
  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
