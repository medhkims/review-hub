/**
 * Seed Tunisian Influencers — Batch 25
 * TikTok/Instagram native creators: lifestyle, vlog, comedy, beauty, couple content
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
const B = 'Bizerte, Tunisia', BL = 37.2744, BG = 9.8739;

const INFLUENCERS = [
  // ── TikTok-First Lifestyle ────────────────────────────────────────────────
  m({ id: 'influencer_ala_tn_tiktok', name: 'Ala TN', desc: 'Tunisian TikTok lifestyle creator with millions of likes. Short relatable videos about everyday Tunisian life, relationships, and social observations in Tunisian dialect.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, featured: true, contact: { tt: 'ala_tn_official', ig: 'alatn_official', fb: 'AlaTNOfficial' } }),
  m({ id: 'influencer_ghofran_tn_tiktok', name: 'Ghofran TN', desc: 'Tunisian TikTok creator known for comedic lifestyle content. Her authentic personality and Tunisian dialect humor make her one of the most-shared creators in Tunisia.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { tt: 'ghofran_tn', ig: 'ghofrantn', fb: 'GhofranTN' } }),
  m({ id: 'influencer_malek_tn_vlog', name: 'Malek Vlog TN', desc: 'Young Tunisian vlogger documenting his daily life, university experiences, and Tunisian youth culture. Very popular among Tunisian teens and young adults.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'malek_vlog_tn', tt: 'malekvlogtn', yt: 'MalekVlogTN' } }),
  m({ id: 'influencer_rym_tn_lifestyle', name: 'Rym Lifestyle TN', desc: 'Tunisian lifestyle and fashion influencer sharing morning routines, study vlogs, and city guides from Tunis. Aspirational content for Tunisian young women.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'rymlifestyle_tn', tt: 'rym_lifestyle_tn', fb: 'RymLifestyleTN' } }),
  m({ id: 'influencer_adam_tn_content', name: 'Adam TN', desc: 'Tunisian content creator producing high-quality lifestyle and travel content. Known for cinematic videos exploring Tunisian cities and sharing authentic experiences.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: T, lat: TL, lng: TG, contact: { ig: 'adam_tn_content', tt: 'adamtn_official', yt: 'AdamTNContent' } }),
  m({ id: 'influencer_sarra_tn_daily', name: 'Sarra Daily', desc: 'Tunisian daily vlogger sharing productivity, self-care, and student life content. A role model for Tunisian young women navigating academics and social life.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'sarra_daily_tn', tt: 'sarradailytn', yt: 'SarraDailyTN' } }),
  m({ id: 'influencer_zied_tn_vlogs', name: 'Zied Vlogs', desc: 'Tunisian vlogger known for spontaneous street content, interviews with Tunisians, and social experiments capturing real Tunisian society.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'zied_vlogs_tn', yt: 'ZiedVlogsTN', tt: 'zivedvlogstn' } }),
  m({ id: 'influencer_yosra_tn_lifestyle', name: 'Yosra Lifestyle', desc: 'Tunisian beauty and lifestyle TikTok creator. Shares skincare secrets, affordable fashion finds, and day-in-the-life content from Sousse.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'fashion_beauty'], loc: SO, lat: SOL, lng: SOG, contact: { tt: 'yosra_lifestyle_tn', ig: 'yosra_lifestyle_tn', fb: 'YosraLifestyleTN' } }),

  // ── Couple & Family Vloggers ──────────────────────────────────────────────
  m({ id: 'influencer_couple_tn_vlog', name: 'Couple TN Vlog', desc: 'Tunisian couple vloggers documenting their relationship, travels, and daily life together. Popular among young Tunisian couples seeking relatable content.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting', 'food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'coupletn_vlog', yt: 'CoupleTNVlog', tt: 'coupletn_official' } }),
  m({ id: 'influencer_hamid_et_samia', name: 'Hamid & Samia', desc: 'Tunisian married couple creating authentic family content. Their videos on Tunisian marriage culture, parenting, and couple challenges resonate widely.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting'], loc: T, lat: TL, lng: TG, contact: { ig: 'hamid_et_samia', yt: 'HamidEtSamia', fb: 'HamidEtSamia' } }),
  m({ id: 'influencer_famille_sfax', name: 'Famille Sfaxienne', desc: 'Sfax-based Tunisian family YouTube channel. Documents daily family life, parenting in southern Tunisia, and Sfaxien culture and traditions.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting'], loc: S, lat: SL, lng: SG, contact: { yt: 'FamilleSfaxienne', ig: 'famille_sfaxienne', fb: 'FamilleSfaxienne' } }),
  m({ id: 'influencer_walid_et_mariem', name: 'Walid & Mariem', desc: 'Tunisian newlywed couple sharing wedding planning, honeymoon travels, and early married life. Very popular among Tunisian women planning their weddings.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting', 'food_lifestyle'], loc: M, lat: ML, lng: MG, contact: { ig: 'walid_et_mariem', tt: 'walid_et_mariem', yt: 'WalidEtMariem' } }),

  // ── Comedy & Reaction ─────────────────────────────────────────────────────
  m({ id: 'influencer_wassim_tn_comedy', name: 'Wassim Comedy', desc: 'Tunisian comedian and actor creating viral sketch videos. His impersonations of Tunisian social types and celebrities are endlessly shared across platforms.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'wassim_comedy_tn', tt: 'wassimcomedytn', yt: 'WassimComedyTN' } }),
  m({ id: 'influencer_fedi_tn_comedy', name: 'Fedi TN', desc: 'Tunisian TikTok comedian known for his spot-on impressions and absurdist skits about Tunisian life. Millions of views on his viral comedy content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { tt: 'fedi_tn_official', ig: 'feditnofficiel', fb: 'FediTNOfficial' } }),
  m({ id: 'influencer_amine_tn_troll', name: 'Amine Troll TN', desc: 'Tunisian social media entertainer known for trolling videos and social experiments in Tunis. His genuine Tunisian reactions drive massive engagement.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'aminetroll_tn', yt: 'AmineTrollTN', fb: 'AmineTrollTN' } }),
  m({ id: 'influencer_med_ali_parody', name: 'Med Ali Parody', desc: 'Tunisian content creator specializing in parody and satire videos about Tunisian news, politics, and social media trends. Sharp wit loved by young Tunisians.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'medali_parody', tt: 'medaliparody', yt: 'MedAliParody' } }),
  m({ id: 'influencer_sousse_comedy_tn', name: 'Sousse Comedy', desc: 'Comedy content creator from Sousse celebrating the unique humour and dialect of the Sahel region. Very popular among Tunisians from the central coast.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: SO, lat: SOL, lng: SOG, contact: { ig: 'sousse_comedy', tt: 'soussecomedy', fb: 'SousseComedy' } }),
  m({ id: 'influencer_bizerte_vlog', name: 'Bizerte Vlogger', desc: 'Content creator from Bizerte documenting the beautiful northern Tunisian city — its harbor, lake, old fort, and local culture. Growing regional following.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'food_lifestyle'], loc: B, lat: BL, lng: BG, contact: { ig: 'bizerte_vlogger', tt: 'bizertevlogger', yt: 'BizerteVlogger' } }),

  // ── Beauty & Skincare ──────────────────────────────────────────────────────
  m({ id: 'influencer_aicha_beauty_tn', name: 'Aicha Beauty', desc: 'Tunisian beauty influencer specializing in drugstore and affordable makeup. Helps Tunisian women find budget-friendly beauty solutions that work for Arab skin tones.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'aicha_beauty_tn', tt: 'aichabeauty_tn', yt: 'AichaBeautyTN' } }),
  m({ id: 'influencer_hairdresser_tn', name: 'Coiffeur TN', desc: 'Tunisian hairdresser and hair care educator on social media. Shares professional hair transformation videos and tips adapted to North African hair textures.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'coiffeur_tn_pro', tt: 'coiffeurtn', yt: 'CoiffeurTN' } }),
  m({ id: 'influencer_skincare_arabic_tn', name: 'Skincare بالعربي', desc: 'Tunisian skincare educator sharing routines and product reviews in Arabic. Focuses on solutions for hyperpigmentation and oily skin common in Tunisian climate.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'skincare_balarabi_tn', tt: 'skincarebalarbai', yt: 'SkincareBilArabi' } }),
  m({ id: 'influencer_nails_by_ines_tn', name: 'Nails by Inès', desc: 'Tunisian nail artist and beauty influencer. Creates elaborate nail art designs blending Tunisian motifs with international nail art trends.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: SO, lat: SOL, lng: SOG, contact: { ig: 'nails_by_ines_tn', tt: 'nailsbyinestn', fb: 'NailsByInesTN' } }),

  // ── Photography & Visual Arts ─────────────────────────────────────────────
  m({ id: 'influencer_imed_photo_tn', name: 'Imed Photography TN', desc: 'Tunisian landscape and portrait photographer. His stunning Instagram portfolio of Tunisian landscapes has been featured in international travel publications.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'travel'], loc: T, lat: TL, lng: TG, contact: { ig: 'imed_photography_tn', fb: 'ImedPhotographyTN' } }),
  m({ id: 'influencer_sami_tn_photographer', name: 'Sami Lens', desc: 'Tunisian street and documentary photographer documenting daily Tunisian life through compelling visual storytelling. His work captures authentic Tunisia.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'sami_lens_tn', fb: 'SamiLensTN' } }),
  m({ id: 'influencer_tunis_aerials', name: 'Tunisia from Above', desc: 'Tunisian drone photographer and videographer. Aerial footage of Tunisian cities, coastlines, and Sahara desert have earned global attention on Instagram.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'travel'], loc: T, lat: TL, lng: TG, contact: { ig: 'tunisia_from_above', yt: 'TunisiaFromAbove', fb: 'TunisiaFromAbove' } }),
  m({ id: 'influencer_illustration_tn', name: 'Illus TN', desc: 'Tunisian digital illustrator and graphic artist. Creates artwork inspired by Tunisian culture, Medina architecture, and North African identity shared on Instagram.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'illus_tn', fb: 'IllusTN' } }),

  // ── Food Delivery & Restaurant Reviews ────────────────────────────────────
  m({ id: 'influencer_tunis_eats', name: 'Tunis Eats', desc: 'Tunisian food review Instagram account covering the best restaurants, hidden gems, and street food spots across Greater Tunis. A trusted guide for food lovers.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'tunis_eats', fb: 'TunisEats', tt: 'tunis_eats' } }),
  m({ id: 'influencer_sfax_restaurants', name: 'Sfax Restaurants', desc: 'Food review and discovery account for Sfax. Covers new restaurant openings, best traditional Sfaxien dishes, and hidden culinary gems in the city.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: S, lat: SL, lng: SG, contact: { ig: 'sfax_restaurants', fb: 'SfaxRestaurants', tt: 'sfaxrestaurants' } }),
  m({ id: 'influencer_sousse_food_guide', name: 'Sousse Food', desc: 'Sousse-based food content creator reviewing restaurants and documenting the rich food culture of the Sahel coast from Sousse to Monastir.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: SO, lat: SOL, lng: SOG, contact: { ig: 'sousse_food_tn', fb: 'SousseFoodGuide', tt: 'soussefood' } }),
  m({ id: 'influencer_vegan_tunisie', name: 'Vegan Tunisie', desc: 'Tunisian vegan lifestyle content creator. Adapts traditional Tunisian recipes to plant-based versions and promotes veganism in the Arab-Muslim context.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'vegan_tunisie', fb: 'VeganTunisie', yt: 'VeganTunisie' } }),

  // ── Podcasts ──────────────────────────────────────────────────────────────
  m({ id: 'influencer_podcast_tn_show', name: 'Podcast TN', desc: 'Leading Tunisian podcast platform featuring interviews with Tunisian entrepreneurs, creatives, and thought leaders. Available on all major streaming platforms.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'business_finance'], loc: T, lat: TL, lng: TG, contact: { ig: 'podcast_tn', fb: 'PodcastTN', yt: 'PodcastTN' } }),
  m({ id: 'influencer_jalssouni_podcast', name: 'Jalssouni', desc: 'Popular Tunisian Arabic podcast covering culture, self-development, and social topics. One of the most downloaded Tunisian podcasts with a loyal audience.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { ig: 'jalssouni_podcast', fb: 'Jalssouni', yt: 'Jalssouni' } }),
  m({ id: 'influencer_tnpreneurs_podcast', name: 'TNpreneurs', desc: 'Tunisian entrepreneurship podcast interviewing startup founders and investors. Essential listening for the Tunisian startup and tech community.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: { ig: 'tnpreneurs', fb: 'TNpreneurs', yt: 'TNpreneurs' } }),

  // ── LGBTQ+ & Social Issues ─────────────────────────────────────────────────
  m({ id: 'influencer_shams_tn', name: 'Shams Tunisie', desc: 'First Tunisian LGBTQ+ rights organization with social media presence. Advocates for decriminalization and human rights in Tunisia despite legal challenges.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'shamstunisie', fb: 'ShamsTunisie', tt: 'shamstunisie' } }),
  m({ id: 'influencer_kolna_tounes', name: 'Kolna Tounes', desc: 'Tunisian civic movement and social media account promoting national dialogue, civic education, and democratic values in post-revolution Tunisia.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'kolnatounes', fb: 'KolnaTounes' } }),

  // ── Diaspora ──────────────────────────────────────────────────────────────
  m({ id: 'influencer_tunisian_in_france', name: 'Tunisien en France', desc: 'Franco-Tunisian content creator sharing the experience of being Tunisian in France. Bridges the two cultures with humor, advice, and relatable immigrant stories.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'tunisienenfrance', tt: 'tunisienenfrance', yt: 'TunisienEnFrance' } }),
  m({ id: 'influencer_tunisian_in_germany', name: 'Tunisier in Deutschland', desc: 'Tunisian expat content creator in Germany documenting Tunisian life abroad, integration challenges, and cultural bridges between Tunisia and Germany.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'tunisierindeutschland', yt: 'TunisierInDeutschland', fb: 'TunisierInDeutschland' } }),
  m({ id: 'influencer_tunisian_in_canada', name: 'Tunisien au Canada', desc: 'Tunisian immigrant in Canada sharing immigration tips, life in Quebec, and the Tunisian-Canadian experience. Highly followed by Tunisians seeking to emigrate.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'education'], loc: T, lat: TL, lng: TG, contact: { ig: 'tunisienaucanada', yt: 'TunisienAuCanada', fb: 'TunisienAuCanada' } }),

  // ── Religious & Spiritual ─────────────────────────────────────────────────
  m({ id: 'influencer_sheikh_tn_islam', name: 'Sheikh TN', desc: 'Tunisian Islamic scholar and content creator sharing accessible Islamic knowledge, Quran reflections, and spiritual guidance for Tunisian Muslim youth.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { ig: 'sheikh_tn_official', fb: 'SheikhTNOfficiel', yt: 'SheikhTN' } }),
  m({ id: 'influencer_coran_tunisie', name: 'Coran Tunisie', desc: 'Tunisian Quran recitation and Islamic education YouTube channel. Features Tunisian qaris and Islamic content produced to a high quality standard.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { yt: 'CoranTunisie', fb: 'CoranTunisie', ig: 'coran_tunisie' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 25 ===\n');
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
