/**
 * Seed Tunisian Influencers — Batch 14 (More across all niches + regional influencers)
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
const G = 'Gabes, Tunisia', GL = 33.8814, GG = 10.0982;

const INFLUENCERS = [
  // ====== COMEDY & SKITS ======
  m({ id: 'influencer_trick_tn', name: 'Trick TN', desc: 'Tunisian prank and comedy channel creating viral social experiments and entertaining skits reflecting everyday Tunisian life.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_sketch_tunisien', name: 'Sketch Tunisien', desc: 'Tunisian comedy sketch channel producing short-form comedy content about Tunisian culture, relationships, and social observations.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_salah_msaad', name: 'Salah Msaad', desc: 'Tunisian comedian known for improvisation and street comedy content. Creates spontaneous humor content with Tunisians.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_chokri_ben_amor', name: 'Chokri Ben Amor', desc: 'Tunisian actor known for his comedic roles in Tunisian TV series and theater.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_wissem_sekma', name: 'Wissem Sekma', desc: 'Tunisian comedian and content creator sharing humorous content about the Tunisian lifestyle and relatable everyday situations.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_haythem_rajhi', name: 'Haythem Rajhi', desc: 'Tunisian actor and entertainer featured in popular Tunisian television drama and comedy series.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_rym_saidi', name: 'Rym Saidi', desc: 'Tunisian actress and social media personality known for her sharp humor and entertaining social content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_fares_ben_jeddou', name: 'Fares Ben Jeddou', desc: 'Tunisian journalist and television presenter known for hard-hitting investigative journalism programs on Tunisian TV.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_yosr_kammoun', name: 'Yosr Kammoun', desc: 'Tunisian TV presenter and media personality. Known for hosting popular talk shows on Tunisian television channels.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_raja_ben_amor', name: 'Raja Ben Amor', desc: 'Tunisian TV presenter and journalist known for her role in Tunisian broadcast media.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== MUSIC ======
  m({ id: 'influencer_cheb_hasni_legacy', name: 'Zied Zitoun', desc: 'Tunisian musician and singer preserving and creating contemporary Tunisian popular music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hatem_el_amine', name: 'Hatem El Amine', desc: 'Tunisian composer and musician creating original Arabic music with modern production.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_oumayma_taleb', name: 'Oumayma Taleb', desc: 'Tunisian singer and performer known for her powerful vocals in Tunisian and Arabic music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_achraf_hammami', name: 'Achraf Hammami', desc: 'Tunisian musician and content creator making original Tunisian music content for digital audiences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hip_hop_tn', name: 'Hip Hop TN', desc: 'Tunisian hip-hop culture channel covering rap music, battles, events, and the growing Tunisian urban music scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_music_production_tn', name: 'Beats Tunisie', desc: 'Tunisian music producer and beatmaker creating original production content and beats for Tunisian artists.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_oud_tunisie', name: 'Oud Tunisia', desc: 'Tunisian oud musician and educator teaching traditional Arabic music through social media content.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_gnawa_tn', name: 'Gnawa Tunisia', desc: 'Tunisian traditional Stambeli and Gnawa music channel. Documents sacred healing music traditions of Tunisia.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_violin_tunisie', name: 'Violin Tunisie', desc: 'Tunisian violinist and classical musician sharing performances and music education content.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_piano_tn', name: 'Piano Tunisia', desc: 'Tunisian pianist and music educator sharing piano lessons and performances blending Western and Arabic classical music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== ART & CULTURE ======
  m({ id: 'influencer_street_art_tn', name: 'Street Art Tunisia', desc: 'Tunisian urban art channel documenting the vibrant street art scene across Tunisian cities, especially the famous El Bouhsina village.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_calligraphy_tn', name: 'Calligraphy Tunisie', desc: 'Tunisian calligrapher and visual artist sharing Arabic calligraphy tutorials and traditional art content.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_pottery_nabeul', name: 'Pottery Nabeul', desc: 'Tunisian pottery and ceramics content creator from Nabeul. Documents the ancient Tunisian pottery tradition and craft skills.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: 36.4513, lng: 10.7357, contact: {} }),
  m({ id: 'influencer_fourat_ben_mahmoud', name: 'Fourat Ben Mahmoud', desc: 'Tunisian visual artist and contemporary painter. Creates and shares visual art content documenting modern Tunisian artistic expression.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_heritage_tn', name: 'Heritage Tunisie', desc: 'Tunisian cultural heritage content creator documenting ancient ruins, archaeological sites, and historical monuments across Tunisia.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_carthage_history', name: 'Carthage History', desc: 'Tunisian history and archaeology channel dedicated to ancient Carthage and Tunisia\'s rich historical heritage. Educational content in Arabic.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'travel'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_cinema_tn', name: 'Cinéma Tunisie', desc: 'Tunisian film review and cinema culture channel. Reviews Tunisian and international films for Arab-speaking audiences.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_book_club_tn', name: 'Book Club Tunisie', desc: 'Tunisian book review and literary content creator. Promotes Arabic and French literature reading among Tunisian audiences.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_theatre_tn', name: 'Théâtre Tunisien', desc: 'Tunisian theater arts channel promoting stage performances, theater reviews, and drama culture in Tunisia.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_design_tn', name: 'Design Tunisie', desc: 'Tunisian graphic design and creative content channel sharing design tutorials, branding, and visual content creation tips.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== FITNESS & WELLNESS ======
  m({ id: 'influencer_swimming_tn', name: 'Swimming Tunisia', desc: 'Tunisian swimming coach and content creator. Promotes swimming training and aquatic sports culture across Tunisia.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_meditation_tn', name: 'Méditation Tunisie', desc: 'Tunisian mindfulness and meditation content creator. Shares mental wellness, breathing exercises, and stress reduction tips.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_nutrition_tn', name: 'Nutritionniste TN', desc: 'Tunisian registered nutritionist and dietitian sharing evidence-based nutrition advice and healthy eating tips in Arabic.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_pilates_tn', name: 'Pilates Tunisia', desc: 'Tunisian Pilates instructor sharing workout routines, core strength training, and body alignment content.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_zumba_tn', name: 'Zumba Tunisia', desc: 'Tunisian Zumba instructor and dance fitness content creator. Combines fitness with Arabic and Tunisian music for fun workouts.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_dr_slim_ben_saad', name: 'Dr. Slim Ben Saad', desc: 'Tunisian pulmonologist and sports medicine specialist. Shares medical research and health education content for athletes.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'education'], loc: S, lat: SL, lng: SG, contact: {} }),
  m({ id: 'influencer_keto_tn', name: 'Keto Tunisie', desc: 'Tunisian ketogenic diet educator and food content creator. Adapts the keto diet with Tunisian ingredients and recipes.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_physiotherapy_tn', name: 'Kiné Tunisie', desc: 'Tunisian physiotherapist and health content creator sharing injury prevention, rehabilitation, and sports medicine tips.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== FAMILY & PARENTING ======
  m({ id: 'influencer_bebe_tunisie', name: 'Bébé Tunisie', desc: 'Tunisian baby and toddler content channel. Shares newborn care tips, baby development milestones, and parenting advice.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_maternite_tn', name: 'Maternité Tunisie', desc: 'Tunisian pregnancy and motherhood content creator. Shares pregnancy journey, birth stories, and postpartum wellness tips.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ecole_parents_tn', name: 'École Maison TN', desc: 'Tunisian homeschooling and educational parenting content creator. Shares learning activities, educational games, and schooling tips.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_halel_famille', name: 'Halel Famille', desc: 'Tunisian Islamic parenting content creator. Shares advice on raising children with Islamic values in modern Tunisia.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_deco_maison_tn', name: 'Déco Maison Tunisie', desc: 'Tunisian home decoration and interior design content creator. Shares Tunisian home styling, renovation, and DIY decoration ideas.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting', 'food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_kids_tunisia', name: 'Kids Tunisia', desc: 'Tunisian children\'s content channel for Arabic-speaking kids. Educational and entertainment content for Tunisian children and families.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== REGIONAL INFLUENCERS ======
  m({ id: 'influencer_sfax_comedy', name: 'Sfax Comedy', desc: 'Comedy content creator from Sfax. Creates humor content in the distinctive Sfaxian dialect and style.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: S, lat: SL, lng: SG, contact: {} }),
  m({ id: 'influencer_sousse_content', name: 'Sousse Vlogger', desc: 'Tunisian content creator from Sousse sharing life in Tunisia\'s tourist capital — beaches, restaurants, and events.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: SO, lat: SOL, lng: SOG, contact: {} }),
  m({ id: 'influencer_gafsa_voice', name: 'Gafsa Voice', desc: 'Content creator from Gafsa sharing authentic content about life in central Tunisia and mining region culture.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'news_politics'], loc: T, lat: 34.4250, lng: 8.7842, contact: {} }),
  m({ id: 'influencer_el_jem_history', name: 'El Jem Discovery', desc: 'Tunisian heritage content creator documenting the magnificent Roman amphitheater of El Jem and surrounding cultural treasures.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'education'], loc: T, lat: 35.2963, lng: 10.7060, contact: {} }),
  m({ id: 'influencer_sidi_bou_said', name: 'Sidi Bou Saïd Life', desc: 'Lifestyle and travel content creator from the iconic blue and white village of Sidi Bou Saïd near Tunis.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'food_lifestyle'], loc: T, lat: 36.8695, lng: 10.3415, contact: {} }),
  m({ id: 'influencer_gabes_nature', name: 'Gabès Nature', desc: 'Environmental and nature content creator from Gabès documenting the unique oasis ecosystem and environmental challenges.', sub_id: 'travel', sub_name: 'Travel', subs: ['travel', 'news_politics'], loc: G, lat: GL, lng: GG, contact: {} }),
  m({ id: 'influencer_nabeul_artisan', name: 'Artisanat Nabeul', desc: 'Tunisian artisan content creator from Nabeul showcasing handmade ceramics, pottery, and traditional Tunisian crafts.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'travel'], loc: T, lat: 36.4513, lng: 10.7357, contact: {} }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 14 ===\n');
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
