/**
 * Seed Tunisian Influencers — Batch 2
 *
 * Adds additional Tunisian social media influencers to Firestore.
 * This batch adds ~40 more influencers beyond the original 31.
 *
 * Run with: node scripts/seed-influencers-batch2.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Helper to build a standard influencer object
function makeInfluencer({
  id, name, description,
  subcategory_id, subcategory_name, sub_categories,
  location, latitude, longitude,
  is_featured = false,
  contact = {},
}) {
  return {
    id,
    name,
    description,
    category_id: 'influencer',
    category_name: 'Influencer',
    subcategory_id,
    subcategory_name,
    sub_categories,
    location,
    latitude,
    longitude,
    cover_image_url: null,
    logo_url: null,
    rating: 0,
    review_count: 0,
    is_featured,
    is_open: true,
    owner_id: 'system',
    status: 'active',
    is_verified: false,
    contact: {
      phone: contact.phone || null,
      email: contact.email || null,
      website: contact.website || null,
      instagram_handle: contact.instagram_handle || null,
      facebook_name: contact.facebook_name || null,
      tiktok_handle: contact.tiktok_handle || null,
    },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ],
    category_ratings: [
      { name: 'Content Quality', icon: 'video-check', rating: 0 },
      { name: 'Authenticity', icon: 'shield-check', rating: 0 },
      { name: 'Engagement', icon: 'heart-multiple', rating: 0 },
    ],
  };
}

const INFLUENCERS = [
  // ── Fashion & Beauty (new) ─────────────────────────────────────────────────

  makeInfluencer({
    id: 'influencer_lina_toumi',
    name: 'Lina Toumi',
    description: 'Most followed Tunisian influencer on Instagram with 1.8M followers. Based in Sfax, she creates fashion, beauty, and lifestyle content with strong audience engagement.',
    subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty', 'food_lifestyle'],
    location: 'Sfax, Tunisia', latitude: 34.7406, longitude: 10.7603,
    is_featured: true,
    contact: { instagram_handle: 'toumi_lina' },
  }),

  makeInfluencer({
    id: 'influencer_najla_violette',
    name: 'Najla Violette',
    description: 'Second most popular Tunisian influencer on Instagram with 1M subscribers. Known for fashion, beauty, and lifestyle content that resonates with North African audiences.',
    subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty', 'food_lifestyle'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    is_featured: true,
    contact: { instagram_handle: 'najla_violette' },
  }),

  makeInfluencer({
    id: 'influencer_roua_chouaibi',
    name: 'Roua Chouaibi',
    description: 'Tunisian beauty, skincare, and lifestyle creator. Shares wedding and event content, travel diaries, and makeup looks with strong engagement on Instagram and TikTok.',
    subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty', 'travel'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'rouachouaibi', tiktok_handle: 'rouachouaibi' },
  }),

  makeInfluencer({
    id: 'influencer_sabrine_rezgui',
    name: 'Sabrine Rezgui',
    description: 'Tunisian fashion influencer known for being ahead of fashion trends. Her Instagram feed features bomb outfits and attractive looks that inspire followers across Tunisia.',
    subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'sabrinerezgui' },
  }),

  makeInfluencer({
    id: 'influencer_farah_el_kadhi',
    name: 'Farah El Kadhi',
    description: 'Stylish yet girly Tunisian fashion influencer. Curates a distinctive Instagram feed blending elegance with accessible fashion inspiration for her followers.',
    subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'farahelkadhi' },
  }),

  makeInfluencer({
    id: 'influencer_belkis_ksouri',
    name: 'Belkis Ksouri',
    description: 'Tunisian lifestyle and content creator with a vivid Instagram feed and a successful YouTube channel. Creates content blending Tunisian culture with modern lifestyle.',
    subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle',
    sub_categories: ['food_lifestyle', 'fashion_beauty'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'belkisksouri' },
  }),

  makeInfluencer({
    id: 'influencer_biba_jbeeli',
    name: 'Biba Jbeeli',
    description: 'Tunisian photographer known for engaging TikTok content showcasing her creative work and promoting beauty products. Active presence across multiple platforms.',
    subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty', 'music_art'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { tiktok_handle: 'bibajbeeli' },
  }),

  makeInfluencer({
    id: 'influencer_oumaima_hamrouni',
    name: 'Oumaima Hamrouni',
    description: 'Tunisian content creator known for diverse and engaging TikTok posts. Incorporates elements from her Tunisian cultural background to connect with a wide audience.',
    subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty', 'food_lifestyle'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { tiktok_handle: 'oumaimahamrouni' },
  }),

  // ── Comedy & Entertainment (new) ───────────────────────────────────────────

  makeInfluencer({
    id: 'influencer_marwen_nordo',
    name: 'Marwen Nordo (Marwene Jibali)',
    description: 'Tunisian comedian and YouTube star with 2.85M subscribers and an average of 20M views per video. His comedy taps into Tunisian humor while maintaining broad Arabic-speaking appeal.',
    subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment',
    sub_categories: ['comedy_entertainment'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    is_featured: true,
    contact: { instagram_handle: 'nordo_officiel', facebook_name: 'MarwenNordoOfficiel' },
  }),

  makeInfluencer({
    id: 'influencer_choaaib_gamssi',
    name: 'Choaaib Gamssi',
    description: 'Prominent Tunisian content creator with over 1.9M followers. Known for engaging emotional content, personal experiences, and societal reflections. Also an aircraft maintenance planner.',
    subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment',
    sub_categories: ['comedy_entertainment', 'food_lifestyle'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    is_featured: true,
    contact: { tiktok_handle: 'gamssichoaaib' },
  }),

  makeInfluencer({
    id: 'influencer_bilel_hlaila',
    name: 'Bilel Hlaila',
    description: 'Tunisian TikTok star with 1.3M followers and 29.2M likes. Known for humorous and relatable posts engaging with cultural references and current trends. Owner of Swai Collection.',
    subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment',
    sub_categories: ['comedy_entertainment', 'business_finance'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { tiktok_handle: 'bilel.hlaila' },
  }),

  makeInfluencer({
    id: 'influencer_jihed_ameni',
    name: 'Jihed and Ameni',
    description: 'Tunisian couple based in Dubai with 767K TikTok followers. Their content features pranks, family moments, and cultural references highlighting their Tunisian heritage.',
    subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment',
    sub_categories: ['comedy_entertainment', 'family_parenting', 'food_lifestyle'],
    location: 'Dubai, UAE', latitude: 25.2048, longitude: 55.2708,
    contact: { tiktok_handle: 'jihed.and.ameni' },
  }),

  // ── Music & Art (new) ──────────────────────────────────────────────────────

  makeInfluencer({
    id: 'influencer_sanfara',
    name: 'Sanfara (Yassine Kalboussi)',
    description: 'Tunisian rapper and singer with 3.72M YouTube subscribers, 2M Instagram followers, and 1.16B total views. One of the biggest names in Tunisian hip-hop.',
    subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    is_featured: true,
    contact: { instagram_handle: 'sanfara7050', facebook_name: 'SanfaraOfficial' },
  }),

  makeInfluencer({
    id: 'influencer_klay_bbj',
    name: 'Klay BBJ (Ahmed Ben Ahmed)',
    description: 'Prominent Tunisian rapper with 2.45M YouTube subscribers. Known for his raw, authentic style that blends street rap with social commentary on Tunisian life.',
    subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    is_featured: true,
    contact: { instagram_handle: 'kaborsa_klay' },
  }),

  makeInfluencer({
    id: 'influencer_artmasta',
    name: 'Artmasta',
    description: 'Tunisian rapper with 1.61M YouTube subscribers and 444K Instagram followers. Known for creative musical production and collaborations in the Tunisian hip-hop scene.',
    subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'artmastaofficiel' },
  }),

  makeInfluencer({
    id: 'influencer_jenjoon',
    name: 'JenJoon (Omar Twihri)',
    description: 'Tunisian rapper born in 1991, known for blending traditional Tunisian rhythms with modern rap beats. Creates a unique fusion sound that celebrates Tunisian musical heritage.',
    subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'jenjoon_officiel' },
  }),

  makeInfluencer({
    id: 'influencer_kafon',
    name: 'Kafon',
    description: 'Tunisian hip-hop artist who performed at the 51st Carthage International Festival. Known for his contributions to the Tunisian rap scene and engaging live performances.',
    subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'kafon_officiel' },
  }),

  makeInfluencer({
    id: 'influencer_saber_rebai',
    name: 'Saber Rebai',
    description: 'Iconic Tunisian singer, actor, and composer. His song "Sidi Mansour" became a cultural phenomenon, ranked #8 on Rolling Stone\'s 50 Best Arabic Pop Songs of the 21st Century.',
    subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art', 'comedy_entertainment'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    is_featured: true,
    contact: { instagram_handle: 'saberrebaiofficial', facebook_name: 'SaberRebaiOfficial' },
  }),

  makeInfluencer({
    id: 'influencer_chirine_lajmi',
    name: 'Chirine Lajmi',
    description: 'Tunisian singer, poet, and composer. Known for her emotional vocals and distinctive fusion of traditional Arabic and modern pop sounds. Producer at JÈMI PROD.',
    subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'chirinelajmi' },
  }),

  makeInfluencer({
    id: 'influencer_yosra_mahnouch',
    name: 'Yosra Mahnouch',
    description: 'Tunisian singer and composer known for her powerful voice and unique blend of Arabic music with modern emotion. Actively shares her artistic journey on social media.',
    subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'yosramahnouch', website: 'https://yosramahnouch.net' },
  }),

  makeInfluencer({
    id: 'influencer_young_rz',
    name: 'Young RZ',
    description: 'Tunisian hip-hop and rap artist known for engaging music videos and collaborations. Blends cultural influences from Tunisia and Spain in his unique musical style.',
    subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'youngrz_officiel' },
  }),

  makeInfluencer({
    id: 'influencer_medusa',
    name: 'Medusa',
    description: "Tunisia's most famous female rapper internationally. Based in France, she has boosted her profile on the global stage while representing Tunisian hip-hop culture.",
    subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art'],
    location: 'Paris, France', latitude: 48.8566, longitude: 2.3522,
    contact: { instagram_handle: 'medusa_tn' },
  }),

  makeInfluencer({
    id: 'influencer_mohamed_saeed',
    name: 'Mohamed Saeed',
    description: 'Tunisian TikTok creator known for engaging music performances and humorous content. Often interacts with his audience through song challenges and responses to popular trends.',
    subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art', 'comedy_entertainment'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { tiktok_handle: 'mohamedsaeed' },
  }),

  // ── Sports (new) ───────────────────────────────────────────────────────────

  makeInfluencer({
    id: 'influencer_aymen_abdennour',
    name: 'Aymen Abdennour',
    description: 'Tunisian professional footballer with 2.4M Instagram followers. Former Valencia CF and AS Monaco defender, one of the most followed Tunisian sports personalities on social media.',
    subcategory_id: 'sports', subcategory_name: 'Sports',
    sub_categories: ['sports'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    is_featured: true,
    contact: { instagram_handle: 'aymenabdennour_' },
  }),

  makeInfluencer({
    id: 'influencer_ali_maaloul',
    name: 'Ali Maaloul',
    description: 'Captain of the Tunisian national football team and CS Sfaxien player. Active on Instagram sharing match highlights, celebrations, and fan engagement content.',
    subcategory_id: 'sports', subcategory_name: 'Sports',
    sub_categories: ['sports'],
    location: 'Sfax, Tunisia', latitude: 34.7406, longitude: 10.7603,
    is_featured: true,
    contact: { instagram_handle: 'ali_maaloul' },
  }),

  makeInfluencer({
    id: 'influencer_wahbi_khazri',
    name: 'Wahbi Khazri',
    description: 'Tunisian professional footballer with 188K Instagram followers. Known for his career in European football and his contributions to the Tunisian national team.',
    subcategory_id: 'sports', subcategory_name: 'Sports',
    sub_categories: ['sports'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'wahbi_khazri_8' },
  }),

  makeInfluencer({
    id: 'influencer_bayari_billionaire',
    name: 'Bayari Billionaire',
    description: 'Tunisian sports content creator on YouTube. Features discussions and analyses of national teams, player performances, and match outcomes for Tunisian football fans.',
    subcategory_id: 'sports', subcategory_name: 'Sports',
    sub_categories: ['sports', 'comedy_entertainment'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: {},
  }),

  // ── Food & Lifestyle (new) ────────────────────────────────────────────────

  makeInfluencer({
    id: 'influencer_cuisine_samiira',
    name: 'Cuisine Samiira',
    description: 'Tunisian food influencer with 733K+ Instagram subscribers. Shares traditional Tunisian recipes featuring local ingredients with engaging visuals of dishes like couscous and mloukhia.',
    subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle',
    sub_categories: ['food_lifestyle'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    is_featured: true,
    contact: { instagram_handle: 'cuisine.samiira' },
  }),

  makeInfluencer({
    id: 'influencer_chef_wafik',
    name: 'Chef Wafik Belaid',
    description: 'Tunisian celebrity chef and food influencer with 780K+ followers. Creates engaging culinary content showcasing both traditional Tunisian and modern cuisine.',
    subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle',
    sub_categories: ['food_lifestyle'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    is_featured: true,
    contact: { instagram_handle: 'chefwafikbelaid' },
  }),

  makeInfluencer({
    id: 'influencer_cuisine_chahrazed',
    name: 'Cuisine de Chahrazed',
    description: 'One of the most popular Tunisian food creators with 1.2M+ followers. Shares authentic Tunisian recipes, cooking tutorials, and culinary traditions from across Tunisia.',
    subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle',
    sub_categories: ['food_lifestyle'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    is_featured: true,
    contact: { instagram_handle: 'cuisinedechahrazed' },
  }),

  makeInfluencer({
    id: 'influencer_warda_cuisine',
    name: 'Warda',
    description: 'Tunisian food creator sharing traditional recipes featuring local ingredients and cultural elements. Known for engaging visuals of dishes like couscous and mloukhia alongside family moments.',
    subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle',
    sub_categories: ['food_lifestyle', 'family_parenting'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: {},
  }),

  makeInfluencer({
    id: 'influencer_moudi',
    name: 'Moudi',
    description: 'Tunisian food and travel guide showcasing street food and culinary experiences across the Arab world. Creates vibrant food reviews and travel adventures appealing to food enthusiasts.',
    subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle',
    sub_categories: ['food_lifestyle', 'travel'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { tiktok_handle: 'moudi' },
  }),

  makeInfluencer({
    id: 'influencer_emna_sadfi',
    name: 'Emna Sadfi',
    description: 'Tunisian lifestyle vlogger known for engaging family-oriented content and travel experiences. Shares family gatherings, food, and local culture on Instagram and TikTok.',
    subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle',
    sub_categories: ['food_lifestyle', 'family_parenting', 'travel'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'emnasadfi', tiktok_handle: 'emnasadfi' },
  }),

  // ── Travel ─────────────────────────────────────────────────────────────────

  makeInfluencer({
    id: 'influencer_bilel_troudi',
    name: 'Bilel Troudi',
    description: 'Tunisian travel, tourism, and aviation influencer with 262K+ Instagram followers. Creates captivating travel content showcasing wondrous sights and attractions of Tunisia.',
    subcategory_id: 'travel', subcategory_name: 'Travel',
    sub_categories: ['travel'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'troudibilel' },
  }),

  // ── Education & Tips (new) ────────────────────────────────────────────────

  makeInfluencer({
    id: 'influencer_mayssa_ferchichi',
    name: 'Mayssa Ferchichi',
    description: 'Tunisian education YouTuber with 982K subscribers. Creates educational content in Arabic covering study tips, motivation, and academic guidance for Tunisian students.',
    subcategory_id: 'education', subcategory_name: 'Education & Tips',
    sub_categories: ['education'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'mayssa.ferchichi' },
  }),

  makeInfluencer({
    id: 'influencer_nour_guidouz',
    name: 'Nour Guidouz',
    description: 'Tunisian educational content creator with 751K YouTube subscribers. Focuses on educational videos and tips for Arabic-speaking audiences.',
    subcategory_id: 'education', subcategory_name: 'Education & Tips',
    sub_categories: ['education'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'nour.guidouz.official' },
  }),

  // ── Fitness & Health (new) ────────────────────────────────────────────────

  makeInfluencer({
    id: 'influencer_lydia_asli',
    name: 'Lydia Asli',
    description: 'Tunisian fitness and sports influencer with 507K+ Instagram followers. One of the top female sports influencers in Tunisia, sharing workout routines and healthy lifestyle content.',
    subcategory_id: 'fitness_health', subcategory_name: 'Fitness & Health',
    sub_categories: ['fitness_health', 'sports'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: { instagram_handle: 'lydiaasli' },
  }),

  // ── Business & Finance (new) ──────────────────────────────────────────────

  makeInfluencer({
    id: 'influencer_skander_baccari',
    name: 'Skander Baccari',
    description: 'Tunisian LinkedIn and personal branding expert with 60K+ LinkedIn followers. CEO of M D M Consulting, focused on empowering professionals and entrepreneurs.',
    subcategory_id: 'business_finance', subcategory_name: 'Business & Finance',
    sub_categories: ['business_finance', 'education'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    contact: {},
  }),
];

// ── Seed Function ────────────────────────────────────────────────────────────

async function seedInfluencers() {
  console.log('=== Seeding Tunisian Influencers — Batch 2 ===\n');

  let created = 0;
  let skipped = 0;

  for (const biz of INFLUENCERS) {
    const { id, ...data } = biz;
    const docRef = db.collection('businesses').doc(id);
    const existing = await docRef.get();

    if (existing.exists) {
      console.log(`  ~ SKIP (exists): ${biz.name}`);
      skipped++;
      continue;
    }

    await docRef.set({
      ...data,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  + ${biz.name} — ${biz.location} [${biz.sub_categories.join(', ')}]`);
    created++;
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}, Total in batch: ${INFLUENCERS.length}`);
}

async function main() {
  try {
    await seedInfluencers();
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
  process.exit(0);
}

main();
