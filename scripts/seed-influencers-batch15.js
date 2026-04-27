/**
 * Seed Tunisian Influencers — Batch 15 (Even more creators, niche channels, personalities)
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
  // ====== MORE COMEDY & ENTERTAINMENT ======
  m({ id: 'influencer_zouhour_brini', name: 'Zouhour Brini', desc: 'Tunisian actress and theater artist with extensive career in Tunisian dramatic arts.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_asma_naggara2', name: 'Asma Naggara Content', desc: 'Tunisian actress expanding her online presence with behind-the-scenes content and personal lifestyle vlogs.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ayoub_hamdi', name: 'Ayoub Hamdi', desc: 'Tunisian content creator and entertainer creating viral comedy content reflecting modern Tunisian social life.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_moncef_drama', name: 'Moncef Toumi', desc: 'Tunisian actor with a career spanning Tunisian television dramas and theater productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_mariem_rebai', name: 'Mariem Rebai', desc: 'Tunisian actress and media personality. Known for her roles in popular Tunisian TV productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_chahine_zouaoui', name: 'Chahine Zouaoui', desc: 'Tunisian actor featured in multiple Tunisian television and film productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_lina_ben_mhenni', name: 'Lina Ben Mhenni', desc: 'Tunisian activist and blogger who became a symbol of the Arab Spring. Her blog "A Tunisian Girl" documented the revolution and inspired thousands.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_sami_ben_gharbia', name: 'Sami Ben Gharbia', desc: 'Tunisian digital rights activist and co-founder of Nawaat blog. One of the pioneers of Tunisian online activism and media freedom.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_zouhair_yahyaoui', name: 'Zouhair Yahyaoui', desc: 'Pioneer Tunisian blogger whose activism under the pseudonym TUNeZINE was groundbreaking for Tunisian press freedom.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_tunisia_vox_pop', name: 'Tunisia Vox Pop', desc: 'Tunisian street interview and social commentary channel. Captures authentic Tunisian public opinion on social issues.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== MORE MUSIC ======
  m({ id: 'influencer_jazz_tunisie', name: 'Jazz Tunisie', desc: 'Tunisian jazz music channel showcasing Tunisia\'s vibrant jazz scene and the annual Tabarka Jazz Festival.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_rap_battle_tn', name: 'Rap Battle TN', desc: 'Tunisian rap battle and freestyle content channel. Documents the underground rap battle scene in Tunisian cities.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_cover_song_tn', name: 'Covers Tunisie', desc: 'Tunisian music cover channel featuring talented Tunisian musicians covering popular Arabic and international songs.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_amine_hamza', name: 'Amine and Hamza', desc: 'Tunisian musical duo creating popular Arabic music content. Known for their emotional performances and music videos.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_zara_tn', name: 'Zara TN', desc: 'Tunisian female singer and content creator. Combines contemporary pop with Tunisian musical influences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_achref_elloumi', name: 'Achref Elloumi', desc: 'Tunisian singer-songwriter creating original Arabic and Tunisian dialect songs with a loyal social media following.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_chaima_ben_ali', name: 'Chaima Ben Ali', desc: 'Tunisian pop singer creating contemporary Arabic music content for social media audiences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_majed_el_atti', name: 'Majed El Atti', desc: 'Tunisian-German pop singer who gained fame through Arabic pop music. Connects Tunisian diaspora with Arab culture.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_wassim_ben_zid', name: 'Wassim Ben Zid', desc: 'Tunisian singer and performer contributing to contemporary Tunisian pop music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_marwa_ben_amor', name: 'Marwa Ben Amor', desc: 'Tunisian music content creator sharing original compositions and covers blending Tunisian melodies with modern production.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== MORE FASHION & LIFESTYLE ======
  m({ id: 'influencer_ons_habib', name: 'Ons Habib', desc: 'Tunisian fashion and travel content creator sharing stylish looks from across Tunisia and the world.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_nour_eddine_style', name: 'Nour Eddine Style', desc: 'Tunisian men\'s fashion content creator. Shares men\'s style tips, grooming advice, and lifestyle content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_mariem_style_tn', name: 'Mariem Style TN', desc: 'Tunisian lifestyle and modest fashion influencer. Creates content around Islamic fashion and Tunisian feminine style.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hair_care_tn', name: 'Hair Care Tunisia', desc: 'Tunisian hair care and hair styling content creator. Shares hair growth tips, natural treatments, and styling tutorials.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_nails_tn', name: 'Nail Art Tunisia', desc: 'Tunisian nail art and beauty content creator. Creates elaborate nail designs and manicure tutorials.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hairstylist_tn', name: 'Coiffure Tunisie', desc: 'Tunisian hairstylist and hair transformation content creator sharing hair makeovers and styling techniques.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_luxury_tn', name: 'Luxury Tunisia', desc: 'Tunisian luxury lifestyle content creator showcasing fine dining, luxury hotels, and premium experiences in Tunisia.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_morning_routine_tn', name: 'Morning Routine TN', desc: 'Tunisian productivity and lifestyle content creator sharing morning routines, self-improvement, and daily habits.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_home_decor_tn', name: 'Home Decor Tunisia', desc: 'Tunisian interior design and home decoration content creator sharing Tunisian-style home decoration ideas.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'family_parenting'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_plant_lover_tn', name: 'Plant Lover Tunisia', desc: 'Tunisian urban gardening and plant content creator. Shares indoor plant care, gardening tips, and botanical content.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== MORE SPORTS ======
  m({ id: 'influencer_club_africain_stars', name: 'Club Africain Stars', desc: 'Channel dedicated to Club Africain footballers and their social media presence. Second biggest football club in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_volleyball_tn', name: 'Volleyball Tunisia', desc: 'Tunisian volleyball content creator covering national team matches and club competitions.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_basketball_tn', name: 'Basketball Tunisia', desc: 'Tunisian basketball community channel covering national league, national team, and promoting basketball culture.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_martial_arts_tn', name: 'Arts Martiaux TN', desc: 'Tunisian mixed martial arts content creator. Covers MMA, judo, taekwondo, and combat sports culture in Tunisia.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_motorsport_tn', name: 'Motorsport Tunisia', desc: 'Tunisian motorsport enthusiast and content creator. Documents car racing, rallies, and motorsport culture in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_equitation_tn', name: 'Équitation Tunisie', desc: 'Tunisian equestrian sports content creator. Shares horse riding, training, and equestrian culture from Tunisian stables.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== TECH, GAMING & INNOVATION ======
  m({ id: 'influencer_instadeep_tn', name: 'InstaDeep Tunisia', desc: 'Tunisian AI company content channel. Showcases world-class AI research and machine learning from Tunisia\'s leading tech company.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'business_finance'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_wevioo_tn', name: 'Wevioo Tech', desc: 'Tunisian IT consulting and digital transformation company sharing tech insights and innovation content.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_esports_tn', name: 'eSports Tunisia', desc: 'Tunisian esports organization and competitive gaming content channel. Covers local and international gaming tournaments.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_mobile_review_tn', name: 'Mobile Review TN', desc: 'Tunisian smartphone and gadget review channel. Reviews the latest smartphones, tablets, and tech gadgets in Arabic.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_cyber_security_tn', name: 'CyberSec Tunisia', desc: 'Tunisian cybersecurity professional and content creator. Shares online safety tips and cybersecurity awareness content.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_web_dev_tn', name: 'Web Dev TN', desc: 'Tunisian web development educator sharing tutorials on React, Next.js, and modern web technologies in Arabic.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_drone_tn', name: 'Drone Tunisia', desc: 'Tunisian aerial photography and drone content creator. Captures breathtaking aerial views of Tunisian landscapes and cities.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== EDUCATION & SCIENCE ======
  m({ id: 'influencer_science_arabic_tn', name: 'Science en Arabe TN', desc: 'Tunisian science education channel explaining scientific concepts in Arabic for Tunisian students.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_medecine_tn', name: 'Médecine Tunisie', desc: 'Tunisian medical student and doctor content creator sharing medical education and healthcare tips for Tunisian audiences.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_law_tn', name: 'Droit Tunisie', desc: 'Tunisian legal education content creator explaining Tunisian law, rights, and legal advice in accessible Arabic language.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_psychology_tn', name: 'Psychologie Tunisie', desc: 'Tunisian psychologist and mental health content creator. Breaks down mental health stigma and shares psychology insights in Arabic.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_english_tn', name: 'English Tunisie', desc: 'Tunisian English language educator. Teaches English to Arabic speakers using Tunisian cultural context and relatable examples.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_history_tn', name: 'Histoire Tunisie', desc: 'Tunisian history educator sharing in-depth content about Tunisian history from Carthage to independence in Arabic.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_environment_tn', name: 'Environnement Tunisie', desc: 'Tunisian environmental activist and content creator. Raises awareness about climate change, pollution, and ecology in Tunisia.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_filosofia_tn', name: 'Philosophie TN', desc: 'Tunisian philosophy educator making philosophical ideas accessible to Tunisian audiences through engaging Arabic content.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ramadan_tn', name: 'Ramadan Tunisie', desc: 'Seasonal Tunisian content creator producing Ramadan-themed cooking, culture, and family lifestyle content.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting', 'food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_wedding_planner_tn', name: 'Wedding Planner TN', desc: 'Tunisian wedding planner and event content creator sharing Tunisian wedding traditions, décor, and planning tips.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting', 'fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 15 ===\n');
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
