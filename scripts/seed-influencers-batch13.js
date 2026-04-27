/**
 * Seed Tunisian Influencers — Batch 13 (More creators across all categories)
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
const K = 'Kairouan, Tunisia', KL = 35.6781, KG = 10.0956;
const B = 'Bizerte, Tunisia', BL = 37.2746, BG = 9.8739;
const M = 'Monastir, Tunisia', ML = 35.7773, MG = 10.8262;
const TA = 'Tabarka, Tunisia', TAL = 36.9547, TAG = 8.7564;

const INFLUENCERS = [
  // ====== MORE COMEDY / ENTERTAINMENT ======
  m({ id: 'influencer_mondher_ayed', name: 'Mondher Ayed', desc: 'Tunisian actor and comedian with a long TV career. A familiar face on Tunisian Ramadan series and comedy programs.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_najoua_el_fil', name: 'Najoua El Fil', desc: 'Tunisian actress known for her roles in Tunisian drama series, particularly popular Ramadan productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_yosra_chefik', name: 'Yosra Chefik', desc: 'Tunisian actress who has appeared in multiple Tunisian TV productions and gained a social media following.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ramzi_hmidi', name: 'Ramzi Hmidi', desc: 'Tunisian comedian and impressionist. Known for his spot-on impressions of public figures and viral comedy sketches.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_riadh_ben_amor', name: 'Riadh Ben Amor', desc: 'Tunisian political satirist and comedian. Creates sharp commentary on Tunisian political life through humor and skits.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_nacer_el_amir', name: 'Nacer El Amir', desc: 'Tunisian actor featured in multiple Tunisian television dramas. Well-known figure in Tunisian entertainment industry.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_habib_chebbi', name: 'Habib Chebbi', desc: 'Tunisian comedian and television personality known for his humor and entertaining social media content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_imed_alibi', name: 'Imed Alibi', desc: 'Tunisian jazz musician and actor. Known for his role in award-winning film "Four Daughters" and outstanding musical career.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_soufiane_ben_farhat', name: 'Soufiane Ben Farhat', desc: 'Tunisian journalist and political commentator. Prominent media voice on Tunisian political affairs and social issues.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_oussema_daoud', name: 'Oussema Daoud', desc: 'Tunisian content creator and vlogger. Creates lifestyle and entertainment content popular with Tunisian youth audiences.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== MORE FASHION & BEAUTY ======
  m({ id: 'influencer_nour_khalil', name: 'Nour Khalil', desc: 'Tunisian beauty content creator specializing in hijab styling and modest fashion for Tunisian Muslim women.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ameni_omri', name: 'Ameni Omri', desc: 'Tunisian fashion influencer sharing outfit inspiration, seasonal trends, and lifestyle content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hiba_ben_ali', name: 'Hiba Ben Ali', desc: 'Tunisian beauty and skincare educator. Creates educational content about skincare routines and ingredient science.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_leila_sfar', name: 'Leila Sfar', desc: 'Tunisian fashion designer and content creator. Shares Tunisian traditional embroidery and contemporary fashion fusion.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hela_dridi', name: 'Hela Dridi', desc: 'Tunisian beauty influencer and aesthetician. Shares professional skincare treatments and beauty tips.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_wafa_ben_amor', name: 'Wafa Ben Amor', desc: 'Tunisian fashion and lifestyle blogger sharing her personal style journey and beauty recommendations.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_myriam_ben_salem', name: 'Myriam Ben Salem', desc: 'Tunisian beauty content creator and makeup artist sharing glam tutorials and beauty inspiration.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_boutique_tunisie', name: 'Boutique Tunisie Style', desc: 'Tunisian fashion content page showcasing local Tunisian fashion brands, clothing hauls, and style inspiration.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_takchita_tunisie', name: 'Takchita Tunisie', desc: 'Tunisian cultural fashion content creator dedicated to traditional Tunisian dress, embroidery, and bridal fashion.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_tunisian_bride', name: 'Tunisian Bride', desc: 'Tunisian wedding and bridal content creator. Shares bridal fashion, wedding planning tips, and Tunisian wedding traditions.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'family_parenting'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== MORE FOOD ======
  m({ id: 'influencer_kairouan_cuisine', name: 'Kairouan Cuisine', desc: 'Food creator dedicated to the culinary heritage of Kairouan. Documents traditional recipes including the world-famous makroudh.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: K, lat: KL, lng: KG, contact: {} }),
  m({ id: 'influencer_lablabi_tn', name: 'Street Food Tunisie', desc: 'Tunisian street food tour creator. Documents the best lablabi, fricassee, brik, and other Tunisian street foods.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_chef_moez', name: 'Chef Moez', desc: 'Tunisian professional chef and culinary content creator. Elevates traditional Tunisian dishes with gourmet techniques.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_cake_design_tn', name: 'Cake Design Tunisia', desc: 'Tunisian cake designer and pastry content creator sharing elaborate cake designs and baking tutorials.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_healthy_cuisine_tn', name: 'Healthy Cuisine TN', desc: 'Tunisian healthy food content creator sharing nutritious recipes that adapt traditional Tunisian cuisine.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_couscous_queen', name: 'Couscous Queen', desc: 'Tunisian content creator dedicated to the art of couscous making. Shares authentic couscous recipes and techniques.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_restaurant_review_tn', name: 'Restaurant Guide Tunis', desc: 'Tunisian food critic and restaurant reviewer. Guides Tunisians and tourists to the best restaurants across Tunisia.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_vegan_tn', name: 'Vegan Tunisie', desc: 'Tunisian plant-based food creator sharing vegan adaptations of traditional Tunisian recipes.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_patisserie_tn', name: 'Pâtisserie Tunisienne', desc: 'Tunisian pastry content creator sharing traditional Tunisian sweets — baklava, bambalouni, makroudh, and more.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_grillades_tn', name: 'BBQ Tunisia', desc: 'Tunisian grilling and BBQ content creator. Shares mechoui, merguez, and outdoor cooking culture from Tunisia.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== MORE SPORTS ======
  m({ id: 'influencer_esperance_stars', name: 'Espérance Sportive Stars', desc: 'Channel following Tunisian football superstars at Espérance Sportive de Tunis — Africa\'s most successful club.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_rafaa_chtioui', name: 'Rafaa Chtioui', desc: 'Tunisian professional cyclist and one of the fastest cyclists in North Africa. Represents Tunisia in international cycling competitions.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_khaled_babbou', name: 'Khaled Babbou', desc: 'Tunisian professional tennis player and ATP competitor. Part of Tunisia\'s growing tennis talent pool alongside Ons Jabeur.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_aymen_barakat', name: 'Aymen Barakat', desc: 'Tunisian basketball content creator and player. Shares basketball training content and promotes the sport in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_fitness_boxing_tn', name: 'Boxing Tunisia', desc: 'Tunisian boxing and combat sports channel. Covers Tunisian boxers, training tips, and combat sports culture.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_padel_tn', name: 'Padel Tunisia', desc: 'Tunisian padel tennis content creator and community builder. Promotes the fast-growing padel sport in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_surf_tunisia', name: 'Surf Tunisia', desc: 'Tunisian surfing and water sports content creator. Documents the growing surf culture along Tunisia\'s Mediterranean coast.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'travel'], loc: TA, lat: TAL, lng: TAG, contact: {} }),
  m({ id: 'influencer_running_tn', name: 'Running Tunisia', desc: 'Tunisian running community content creator. Shares marathon training, local races, and running culture in Tunisia.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_crossfit_tn', name: 'CrossFit Tunisia', desc: 'Tunisian CrossFit coach and content creator sharing WODs, functional fitness, and CrossFit competition content.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_karate_tn', name: 'Karate Tunisia', desc: 'Tunisian karate instructor and content creator promoting karate sports and martial arts in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== MORE TRAVEL ======
  m({ id: 'influencer_djerba_guide', name: 'Djerba Guide', desc: 'Tunisian travel content creator dedicated to Djerba island — its Jewish heritage, beaches, markets, and culture.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: T, lat: 33.8076, lng: 10.8455, contact: {} }),
  m({ id: 'influencer_tozeur_explorer', name: 'Tozeur Explorer', desc: 'Tunisian travel creator showcasing the oasis city of Tozeur — palm groves, Star Wars filming locations, and Sahara adventures.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: T, lat: 33.9197, lng: 8.1335, contact: {} }),
  m({ id: 'influencer_hammamet_life', name: 'Hammamet Life', desc: 'Tunisian coastal lifestyle and travel content from Hammamet. Shares beach life, resort culture, and coastal Tunisia.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'food_lifestyle'], loc: T, lat: 36.3997, lng: 10.5466, contact: {} }),
  m({ id: 'influencer_bizerte_explore', name: 'Bizerte Explorer', desc: 'Travel content creator from Bizerte documenting the northern coast, ancient ruins, and fishing culture of Tunisia\'s most northern city.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: B, lat: BL, lng: BG, contact: {} }),
  m({ id: 'influencer_monastir_vlog', name: 'Monastir Vlog', desc: 'Travel and lifestyle vlogger from Monastir. Shares content about Tunisia\'s cultural capital and Mediterranean lifestyle.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'food_lifestyle'], loc: M, lat: ML, lng: MG, contact: {} }),
  m({ id: 'influencer_tunisia_roadtrip', name: 'Tunisia Road Trip', desc: 'Tunisian travel content creator documenting cross-country road trips covering all 24 governorates of Tunisia.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_tunisian_diaspora', name: 'Tunisian Diaspora Vlog', desc: 'Tunisian expat content creator comparing life abroad to Tunisia, giving insights for the Tunisian diaspora community.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_golf_carthage', name: 'Golf in Tunisia', desc: 'Tunisian golf and luxury travel content creator. Documents Tunisia\'s golf courses and high-end tourism offerings.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== MORE EDUCATION & TECH ======
  m({ id: 'influencer_arabic_python', name: 'Learn Python Arabic TN', desc: 'Tunisian programming educator teaching Python and data science in Arabic. One of Tunisia\'s most popular coding channels.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ai_tunisie', name: 'AI Tunisie', desc: 'Tunisian artificial intelligence and machine learning education channel. Makes AI concepts accessible in Arabic for North African learners.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_digital_marketing_tn', name: 'Digital Marketing TN', desc: 'Tunisian digital marketing education channel. Teaches social media marketing, SEO, and online business strategies.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_bac_tunisie', name: 'BAC Tunisie', desc: 'Tunisian educational channel dedicated to high school students. Provides exam prep content and study tips for the Tunisian baccalaureate.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_concours_tn', name: 'Concours Tunisie', desc: 'Tunisian education content channel helping students prepare for competitive entrance exams for engineering and medicine schools.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_startup_tn', name: 'Startup Tunisie', desc: 'Tunisian entrepreneurship and startup ecosystem content channel. Covers Tunisian tech startups, investment, and innovation.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_freelance_tn', name: 'Freelance Tunisie', desc: 'Tunisian freelancing education channel. Helps Tunisians find remote work, build freelance careers, and work internationally.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_immobilier_tn', name: 'Immobilier Tunisie', desc: 'Tunisian real estate education and investment content creator. Guides Tunisians through property investment and real estate market.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_forex_tn', name: 'Trading Tunisie', desc: 'Tunisian financial trading education content creator. Teaches forex, stocks, and investment concepts in Arabic.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ecommerce_tn', name: 'E-commerce Tunisie', desc: 'Tunisian e-commerce education creator. Teaches how to start online stores and sell products digitally from Tunisia.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 13 ===\n');
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
