/**
 * Seed Tunisian Influencers — Batch 16 (Push toward 1000)
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
const S = 'Sfax, Tunisia', SL = 34.7398, SG = 10.760;
const SO = 'Sousse, Tunisia', SOL = 35.8288, SOG = 10.640;

const INFLUENCERS = [
  // ====== COMEDY / ENTERTAINMENT ======
  m({ id: 'influencer_sadok_trabelsi', name: 'Sadok Trabelsi', desc: 'Tunisian comedian and TV host known for his quick wit and entertaining talk show appearances on Tunisian television.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hamdi_ben_youssef', name: 'Hamdi Ben Youssef', desc: 'Tunisian actor with notable roles in Tunisian drama and film. Active on social media sharing his creative work.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_jihed_ben_amor', name: 'Jihed Ben Amor', desc: 'Tunisian entertainment content creator known for reaction videos and commentary on Tunisian pop culture.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_sarra_zaafouri', name: 'Sarra Zaafouri', desc: 'Tunisian actress and comedian featured in Tunisian television productions with growing social media presence.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_adel_lagha', name: 'Adel Lagha', desc: 'Tunisian actor known for his roles in popular Tunisian TV dramas and social media entertainment content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_gaming_commentary_tn', name: 'Gaming Commentary TN', desc: 'Tunisian sports commentary and gaming content creator providing lively analysis of football matches and gaming streams.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_reaction_tn', name: 'Reaction TN', desc: 'Tunisian reaction content creator responding to viral videos, Tunisian news, and entertainment with authentic commentary.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_duo_comique_tn', name: 'Duo Comique TN', desc: 'Tunisian comedy duo creating sketch content about Tunisian couple life, marriage, and social relationships.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_abir_ben_youssef', name: 'Abir Ben Youssef', desc: 'Tunisian actress and television personality known for her charismatic performances in Tunisian drama series.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_faycal_ben_ayed', name: 'Faycal Ben Ayed', desc: 'Tunisian comedian and actor known for his humor in Tunisian TV productions and social media entertainment.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== SPORTS ======
  m({ id: 'influencer_ali_ben_sassi', name: 'Ali Ben Sassi', desc: 'Tunisian professional footballer contributing to Tunisian club football with a growing social media following.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_moataz_gadhoum', name: 'Moataz Gadhoum', desc: 'Tunisian weightlifting and strength sports content creator. Shares training content and promotes strength sports.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_yoga_tn', name: 'Yoga Tunisia', desc: 'Tunisian yoga teacher and wellness content creator. Shares yoga flows, mindfulness, and holistic wellness in Arabic.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_football_academy_tn', name: 'Football Academy TN', desc: 'Tunisian football coaching content creator sharing drills, tactics, and youth football development tips.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_athletics_tn', name: 'Athlétisme Tunisie', desc: 'Tunisian track and field content channel covering national athletics competitions and training methods.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_judo_tn', name: 'Judo Tunisia', desc: 'Tunisian judo content creator and coach. Shares judo techniques, competition highlights, and martial arts culture.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_taekwondo_tn', name: 'Taekwondo Tunisia', desc: 'Tunisian taekwondo federation and athlete content channel promoting Tunisia\'s Olympic-medal sport.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_cycling_tn', name: 'Cyclisme Tunisie', desc: 'Tunisian cycling content creator covering road cycling, mountain biking, and cycling events across Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_fishing_tn', name: 'Pêche Tunisie', desc: 'Tunisian fishing and maritime sport content creator. Documents sea fishing, freshwater fishing, and coastal lifestyle.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hiking_tn', name: 'Randonnée Tunisie', desc: 'Tunisian hiking and outdoor adventure content creator. Documents treks through Tunisian mountains, forests, and landscapes.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== FOOD ======
  m({ id: 'influencer_tajine_tn', name: 'Tajine Tunisien', desc: 'Tunisian content creator dedicated entirely to the Tunisian tagine — a baked egg dish completely different from Moroccan tagine.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_harissa_tn', name: 'Harissa Tunisia', desc: 'Tunisian food culture content creator documenting Tunisia\'s most iconic condiment — harissa — its preparation and uses.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ftour_ramadan_tn', name: 'Ftour Ramadan TN', desc: 'Seasonal Tunisian content creator sharing Ramadan iftar recipes and Tunisian Ramadan food traditions.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'family_parenting'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_boulangerie_tn', name: 'Boulangerie Tunisienne', desc: 'Tunisian bakery and bread content creator sharing tabouna, kesra, and other traditional Tunisian breads.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_olive_oil_tn', name: 'Huile d\'Olive Tunisie', desc: 'Tunisian content creator specializing in olive oil culture. Tunisia is world\'s largest olive oil exporter — this channel documents the industry.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'business_finance'], loc: S, lat: SL, lng: SG, contact: {} }),
  m({ id: 'influencer_dates_tn', name: 'Dattes Tunisie', desc: 'Tunisian agricultural content creator focused on Tunisia\'s world-famous Deglet Noor dates and oasis culture.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: T, lat: 33.9197, lng: 8.1335, contact: {} }),
  m({ id: 'influencer_fish_cuisine_tn', name: 'Cuisine du Poisson TN', desc: 'Tunisian seafood content creator sharing coastal recipes — grilled fish, octopus, and Mediterranean seafood dishes.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_bio_cuisine_tn', name: 'Bio Cuisine Tunisie', desc: 'Tunisian organic food content creator promoting local seasonal produce and biological farming in Tunisia.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_cocktail_mocktail_tn', name: 'Cocktails Tunisie', desc: 'Tunisian drink and mocktail content creator sharing refreshing drinks and non-alcoholic cocktail recipes.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_brik_tn', name: 'Brik Tunisien', desc: 'Tunisian content creator dedicated to Tunisia\'s iconic brik pastry. Shares traditional and creative brik recipes.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== FASHION & BEAUTY ======
  m({ id: 'influencer_kaftan_tn', name: 'Kaftan Tunisie', desc: 'Tunisian traditional fashion content creator specializing in kaftan, jebba, and other traditional Tunisian garments.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_natural_beauty_tn', name: 'Beauté Naturelle TN', desc: 'Tunisian natural beauty content creator sharing DIY skincare using Tunisian natural ingredients — argan, rose water, and ghassoul clay.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_tattoo_tn', name: 'Tattoo Tunisia', desc: 'Tunisian tattoo artist and body art content creator showcasing original tattoo designs and the Tunisian tattoo culture.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hijab_style_tn', name: 'Hijab Style TN', desc: 'Tunisian modest fashion creator sharing elegant hijab styles, modest fashion outfits, and Islamic fashion inspiration.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_men_grooming_tn', name: 'Men\'s Grooming TN', desc: 'Tunisian men\'s grooming and style content creator. Shares beard care, skincare, and men\'s fashion for Tunisian men.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_vintage_tn', name: 'Vintage Tunisie', desc: 'Tunisian vintage fashion enthusiast and content creator. Documents thrift fashion, sustainable style, and vintage culture in Tunisia.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_makeup_artist_tn', name: 'Makeup Artist TN', desc: 'Professional Tunisian makeup artist sharing bridal makeup, event glamour looks, and professional makeup tutorials.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_plus_size_tn', name: 'Plus Size Tunisia', desc: 'Tunisian body-positive and plus-size fashion content creator promoting inclusive fashion for all body types.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_perfume_tn', name: 'Parfumerie Tunisie', desc: 'Tunisian fragrance enthusiast and perfume content creator reviewing Arabic and international perfumes for Tunisian audiences.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_fashion_week_tn', name: 'Fashion Week Tunis', desc: 'Tunisian fashion events content creator covering Tunis Fashion Week, fashion shows, and the local fashion industry.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== TRAVEL ======
  m({ id: 'influencer_lake_ichkeul', name: 'Ichkeul National Park', desc: 'Tunisian eco-travel content creator documenting the UNESCO World Heritage Ichkeul National Park and Tunisian wildlife.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: T, lat: 37.1666, lng: 9.6666, contact: {} }),
  m({ id: 'influencer_matmata_caves', name: 'Matmata Explorer', desc: 'Tunisian travel creator documenting the troglodyte cave dwellings of Matmata — the real-life inspiration for Star Wars Tatooine.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'education'], loc: T, lat: 33.5449, lng: 9.9697, contact: {} }),
  m({ id: 'influencer_douz_sahara', name: 'Douz Sahara', desc: 'Tunisian desert travel content creator from Douz — the gateway to the Sahara. Shares camel rides, dune festivals, and desert life.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: T, lat: 33.4546, lng: 9.0189, contact: {} }),
  m({ id: 'influencer_korbous_thermal', name: 'Korbous Thermal', desc: 'Tunisian wellness travel content creator documenting thermal baths and natural springs at Korbous on Cap Bon peninsula.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'fitness_health'], loc: T, lat: 36.8166, lng: 10.5666, contact: {} }),
  m({ id: 'influencer_tunis_hidden_gems', name: 'Tunis Hidden Gems', desc: 'Tunisian urban explorer documenting little-known neighborhood gems, cafes, and cultural spots across Greater Tunis.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== EDUCATION / BUSINESS ======
  m({ id: 'influencer_impot_tn', name: 'Fiscalité Tunisie', desc: 'Tunisian tax and accounting education content creator. Helps small businesses understand Tunisian tax law and fiscal obligations.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_agriculture_tn', name: 'Agriculture Tunisie', desc: 'Tunisian agricultural content creator sharing modern farming techniques, agribusiness, and rural life in Tunisia.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_export_tn', name: 'Export Tunisie', desc: 'Tunisian trade and export content creator sharing how Tunisian businesses can export products internationally.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_social_entrepreneur_tn', name: 'Social Enterprise TN', desc: 'Tunisian social entrepreneurship content creator. Highlights Tunisian startups solving social problems through business.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hr_tn', name: 'RH Tunisie', desc: 'Tunisian HR professional and career development content creator. Shares job search tips, CV advice, and workplace success strategies.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_volunteering_tn', name: 'Volontariat Tunisie', desc: 'Tunisian civic engagement and volunteering content creator. Promotes volunteerism, NGOs, and social action among Tunisian youth.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_gender_equality_tn', name: 'Egalité Tunisie', desc: 'Tunisian gender equality and women\'s rights advocate. Creates content promoting women\'s empowerment and social progress in Tunisia.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_art_therapy_tn', name: 'Art Thérapie TN', desc: 'Tunisian art therapist and mental health content creator using creative arts for healing and emotional wellness.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_pet_tn', name: 'Pet Tunisia', desc: 'Tunisian pet care and animal content creator. Shares cat and dog care tips and promotes animal welfare in Tunisia.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_astronomy_tn', name: 'Astronomie Tunisie', desc: 'Tunisian astronomy and science content creator sharing stargazing content from Tunisia\'s clear Saharan skies.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: {} }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 16 ===\n');
  let c = 0, s = 0;
  for (const biz of INFLUENCERS) {
    const { id, ...data } = biz;
    const ref = db.collection('businesses').doc(id);
    if ((await ref.get()).exists) { console.log(`  ~ SKIP: ${biz.name}`); s++; continue; }
    await ref.set({ ...data, created_at: admin.firestore.FieldValue.serverTimestamp(), updated_at: admin.firestore.FieldValue.serverTimestamp() });
    console.log(`  + ${biz.name}`);
    c++;
  }
  console.log(`\nDone! Created: ${c}, Skipped: ${s}, Total: ${INFLUENCERS.length}`);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
