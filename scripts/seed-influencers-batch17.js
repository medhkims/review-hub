/**
 * Seed Tunisian Influencers — Batch 17 (Final push to 1000+)
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

const INFLUENCERS = [
  // ====== COMEDY & ENTERTAINMENT ======
  m({ id: 'influencer_open_mic_tn', name: 'Open Mic Tunisia', desc: 'Tunisian stand-up comedy platform documenting open mic nights and emerging stand-up comedians across Tunisian cities.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_podcast_tn', name: 'Podcast Tunisie', desc: 'Tunisian podcast network featuring conversations about Tunisian society, culture, entrepreneurship, and lifestyle.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_storytelling_tn', name: 'Storytelling TN', desc: 'Tunisian storytelling content creator sharing Tunisian folk tales, urban legends, and captivating narrative content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_younes_ben_ali', name: 'Younes Ben Ali', desc: 'Tunisian content creator and vlogger sharing authentic daily life, opinions, and lifestyle content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_meriem_nasri', name: 'Meriem Nasri', desc: 'Tunisian actress and entertainer known for her roles in Tunisian television drama series.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_nizar_ben_ahmed', name: 'Nizar Ben Ahmed', desc: 'Tunisian content creator sharing trending Tunisian topics, pop culture commentary, and viral entertainment.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ons_trabelsi', name: 'Ons Trabelsi', desc: 'Tunisian actress and social media personality known for her vibrant screen presence in Tunisian productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_med_ali_krit', name: 'Med Ali Krit', desc: 'Tunisian filmmaker and content creator producing short films and creative video content about Tunisian youth culture.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_siwar_ben_mansour', name: 'Siwar Ben Mansour', desc: 'Tunisian TV presenter and media host known for her work on Tunisian satellite channels.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_amel_trabelsi', name: 'Amel Trabelsi', desc: 'Tunisian actress and theater artist with a career in Tunisian dramatic arts and television.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== MUSIC ======
  m({ id: 'influencer_voice_tn', name: 'The Voice Tunisia', desc: 'Tunisian talent discovery content channel featuring emerging vocal talent from across Tunisia.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hajer_farghal', name: 'Hajer Farghal', desc: 'Tunisian singer with a distinctive voice contributing to the contemporary Tunisian music landscape.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_rim_ben_fraj', name: 'Rim Ben Fraj', desc: 'Tunisian singer and songwriter creating heartfelt Arabic music content with authentic Tunisian storytelling.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_mokhtar_guesmi', name: 'Mokhtar Guesmi', desc: 'Tunisian singer known for traditional Tunisian music and folk songs. Preserves Tunisia\'s musical heritage through social media.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_guitar_tn', name: 'Guitar Tunisia', desc: 'Tunisian guitarist and music educator sharing guitar lessons and original compositions blending Arabic and Western styles.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_derbouka_tn', name: 'Derbouka Tunisia', desc: 'Tunisian percussion musician specializing in derbouka. Shares traditional North African rhythm patterns and music lessons.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_karim_gharbi', name: 'Karim Gharbi', desc: 'Tunisian-French singer and actor known for performing under the stage name Kim Kay. International music career.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_saber_khmiri_music', name: 'Ramzi Saber', desc: 'Tunisian music content creator sharing original Arabic pop compositions on social media platforms.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_nour_hammami', name: 'Nour Hammami', desc: 'Tunisian singer contributing to the vibrant Tunisian pop and R&B music scene with a growing fanbase.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_folklore_tn', name: 'Folklore Tunisien', desc: 'Tunisian folk music and dance content creator documenting traditional Tunisian regional folklore and performing arts.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== FASHION & BEAUTY ======
  m({ id: 'influencer_naceur_chouchane', name: 'Naceur Chouchane', desc: 'Tunisian fashion entrepreneur and clothing brand content creator promoting Tunisian-made fashion.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_sporty_fashion_tn', name: 'Sporty Fashion TN', desc: 'Tunisian athleisure and sportswear fashion content creator combining fitness and style.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_eyebrow_tn', name: 'Sourcils Parfaits TN', desc: 'Tunisian eyebrow and facial beauty specialist sharing professional tips and beauty transformations.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_traditional_jewelry', name: 'Bijoux Tunisiens', desc: 'Tunisian traditional jewelry content creator documenting gold jewelry, khomsa, and traditional Tunisian adornments.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_fashion_designer_tn', name: 'Créateur Mode TN', desc: 'Emerging Tunisian fashion designer sharing design process, collection launches, and behind-the-scenes atelier content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== SPORTS ======
  m({ id: 'influencer_noor_ben_hamida', name: 'Noor Ben Hamida', desc: 'Tunisian female footballer and sports content creator promoting women\'s football development in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_mma_tn', name: 'MMA Tunisia', desc: 'Tunisian MMA content creator covering mixed martial arts events, training, and fighters from Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_snooker_tn', name: 'Snooker Tunisia', desc: 'Tunisian snooker and billiards content creator. Promotes cue sports culture and covers tournaments in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_chess_tn', name: 'Échecs Tunisie', desc: 'Tunisian chess player and educator. Shares chess tutorials, puzzle challenges, and promotes chess culture in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_gym_owner_tn', name: 'Gym Tunisia', desc: 'Tunisian gym culture and fitness facility content creator. Showcases Tunisian fitness centers and workout facilities.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_calisthenics_tn', name: 'Calisthenics TN', desc: 'Tunisian calisthenics and street workout content creator. Shares bodyweight training skills and outdoor fitness.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_triathlon_tn', name: 'Triathlon Tunisia', desc: 'Tunisian triathlete and content creator covering swimming, cycling, and running endurance sports.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_kitesurfing_tn', name: 'Kitesurf Tunisia', desc: 'Tunisian kitesurfer and water sports content creator. Tunisia\'s beaches make it a top kitesurfing destination globally.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'travel'], loc: T, lat: 33.6700, lng: 10.1000, contact: {} }),
  m({ id: 'influencer_gymnastics_tn', name: 'Gymnastique Tunisie', desc: 'Tunisian gymnastics content creator sharing artistic gymnastics training and national team highlights.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_swimming_coach_tn', name: 'Coach Natation TN', desc: 'Tunisian swimming coach and content creator developing swimming talent following Oussama Mellouli\'s legacy.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== FOOD / LIFESTYLE ======
  m({ id: 'influencer_cafe_culture_tn', name: 'Café Culture TN', desc: 'Tunisian café culture content creator documenting Tunisia\'s vibrant coffee shop scene — from traditional qahwa to specialty coffee.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_diyet_tn', name: 'Régime Tunisie', desc: 'Tunisian weight loss and healthy lifestyle content creator sharing diet plans adapted for Tunisian food culture.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_chocolatier_tn', name: 'Chocolaterie TN', desc: 'Tunisian artisan chocolatier and pastry content creator. Creates Tunisian-inspired chocolate and confection content.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_market_tn', name: 'Souk Tunisie', desc: 'Tunisian market culture content creator exploring traditional souks, fresh produce markets, and artisan bazaars.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_breakfast_tn', name: 'Breakfast Tunisia', desc: 'Tunisian breakfast culture content creator documenting the rich tradition of Tunisian morning meals and café breakfasts.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== TRAVEL ======
  m({ id: 'influencer_chott_el_jerid', name: 'Chott El Jérid', desc: 'Tunisian desert travel content creator documenting the Great Salt Lake of Chott El Jérid — a surreal Tunisian landscape.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: T, lat: 33.7167, lng: 8.4333, contact: {} }),
  m({ id: 'influencer_kairouan_heritage', name: 'Kairouan Heritage', desc: 'Tunisian cultural travel creator from Kairouan — the holy city. Documents the ancient mosques, medina, and Islamic heritage.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'education'], loc: K, lat: KL, lng: KG, contact: {} }),
  m({ id: 'influencer_ain_draham', name: 'Aïn Draham Nature', desc: 'Tunisian nature and eco-travel content creator from Aïn Draham in the Kroumirie mountains — cork forests and fresh air.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: T, lat: 36.7871, lng: 8.6897, contact: {} }),
  m({ id: 'influencer_boat_trip_tn', name: 'Boat Trip Tunisia', desc: 'Tunisian maritime and boat trip content creator. Documents sea excursions, boat charters, and Mediterranean coastal adventures.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_camping_tn', name: 'Camping Tunisie', desc: 'Tunisian outdoor camping and adventure content creator. Shares desert camping, mountain camping, and glamping experiences.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== BUSINESS & EDUCATION ======
  m({ id: 'influencer_coaching_tn', name: 'Coaching de Vie TN', desc: 'Tunisian life coaching content creator offering personal development sessions and motivational content for Tunisian audiences.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_nlp_tn', name: 'PNL Tunisie', desc: 'Tunisian NLP (Neuro-Linguistic Programming) trainer sharing communication, mindset, and personal transformation content.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_bourse_tn', name: 'Bourse Tunisie', desc: 'Tunisian stock market and financial investment content creator. Teaches Tunisians about the local stock exchange (BVMT).', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_innovation_tn', name: 'Innovation Tunisie', desc: 'Tunisian technology innovation content creator showcasing Tunisian tech startups, inventions, and digital transformation.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_remote_work_tn', name: 'Télétravail Tunisie', desc: 'Tunisian remote work and digital nomad content creator. Helps Tunisians build online careers and work from anywhere.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_solar_energy_tn', name: 'Énergie Solaire TN', desc: 'Tunisian renewable energy content creator promoting solar panels, green energy, and sustainable living in Tunisia.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== FAMILY & PARENTING ======
  m({ id: 'influencer_single_mom_tn', name: 'Maman Solo TN', desc: 'Tunisian single mother content creator sharing honest advice, challenges, and resources for single parents in Tunisia.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_autism_tn', name: 'Autisme Tunisie', desc: 'Tunisian autism awareness content creator. Supports families of children with autism and raises awareness about neurodiversity.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_couple_tn', name: 'Couple Tunisien', desc: 'Tunisian couple content creators sharing relationship advice, marriage tips, and couple lifestyle content.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_grandma_cuisine', name: 'Cuisine de Tata', desc: 'Tunisian grandmother cooking content creator sharing authentic traditional recipes passed down through generations.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'family_parenting'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_special_needs_tn', name: 'Inclusion Tunisie', desc: 'Tunisian content creator advocating for people with special needs. Promotes inclusion and accessibility in Tunisian society.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'family_parenting'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== ART / PHOTOGRAPHY ======
  m({ id: 'influencer_wedding_photo_tn', name: 'Wedding Photography TN', desc: 'Tunisian wedding photographer sharing stunning bridal photography and documentation of Tunisian wedding traditions.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'family_parenting'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_landscape_tn', name: 'Paysages Tunisiens', desc: 'Tunisian landscape photographer sharing breathtaking images of Tunisia\'s diverse terrain from Mediterranean coast to Sahara.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_portrait_photo_tn', name: 'Portraits Tunisiens', desc: 'Tunisian portrait photographer capturing the faces of Tunisia — from farmers in the south to fishermen on the coast.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_graffiti_tn', name: 'Graffiti Tunisie', desc: 'Tunisian urban art and graffiti content creator documenting street art and spray paint culture in Tunisian cities.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_film_making_tn', name: 'Filmmaking TN', desc: 'Tunisian independent filmmaker and video production content creator teaching filmmaking and cinematography in Arabic.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_animation_tn', name: 'Animation Tunisie', desc: 'Tunisian 2D/3D animator and visual effects content creator. Showcases Tunisian animation talent and creative storytelling.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_dance_tn', name: 'Danse Tunisie', desc: 'Tunisian dance content creator covering all styles from traditional Tunisian folk dance to contemporary and hip-hop styles.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_belly_dance_tn', name: 'Danse Orientale TN', desc: 'Tunisian oriental and belly dance performer and instructor sharing dance tutorials and performance content.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_origami_tn', name: 'Artisanat Créatif TN', desc: 'Tunisian crafts and DIY content creator sharing paper crafts, handmade gifts, and creative art projects.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 17 (FINAL PUSH) ===\n');
  let c = 0, s = 0;
  for (const biz of INFLUENCERS) {
    const { id, ...data } = biz;
    const ref = db.collection('businesses').doc(id);
    if ((await ref.get()).exists) { console.log(`  ~ SKIP: ${biz.name}`); s++; continue; }
    await ref.set({ ...data, created_at: admin.firestore.FieldValue.serverTimestamp(), updated_at: admin.firestore.FieldValue.serverTimestamp() });
    console.log(`  + ${biz.name}`);
    c++;
  }
  console.log(`\nDone! Created: ${c}, Skipped: ${s}, Total in batch: ${INFLUENCERS.length}`);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
