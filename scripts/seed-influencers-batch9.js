/**
 * Seed Tunisian Influencers — Batch 9 (Athletes: football, Olympics, handball, athletics, other sports)
 * Run with: node scripts/seed-influencers-batch9.js
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
  // ====== FOOTBALL — NATIONAL TEAM & CLUBS ======
  m({ id: 'influencer_seifeddine_jaziri', name: 'Seifeddine Jaziri', desc: 'Tunisian professional footballer and prolific striker. National team regular with impressive goal record. Highly followed on social media by Tunisian football fans.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_nader_ghandri', name: 'Nader Ghandri', desc: 'Tunisian professional footballer and national team captain. Commanding center-back with leadership qualities both on and off the pitch.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_wajdi_kechrida', name: 'Wajdi Kechrida', desc: 'Tunisian professional footballer known for his dynamic performances as a right-back or winger. Active on social media sharing his professional life.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_dylan_bronn', name: 'Dylan Bronn', desc: 'Franco-Tunisian professional footballer who chose to represent Tunisia. Played in major European leagues and was part of the 2022 World Cup squad.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_montassar_talbi', name: 'Montassar Talbi', desc: 'Tunisian professional center-back who plays in European leagues. Part of Tunisia\'s World Cup 2022 defensive setup.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_bilel_ifa', name: 'Bilel Ifa', desc: 'Tunisian professional right-back playing in France. National team regular with consistent performances at club level.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ghaylen_chaalali', name: 'Ghaylen Chaalali', desc: 'Tunisian professional midfielder known for his creativity and passing range. Regular contributor to the Tunisian national team.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_seifeddine_khaoui', name: 'Seifeddine Khaoui', desc: 'Tunisian professional attacking midfielder who has played in Europe. Known for his technical skill and goal-scoring ability.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hamza_rafia', name: 'Hamza Rafia', desc: 'Tunisian-Italian professional midfielder who developed through Juventus youth academy. Active on social media with a growing following.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_mouez_hassen', name: 'Mouez Hassen', desc: 'Tunisian professional goalkeeper with experience in European leagues. National team goalkeeper with a large following on social media.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_aymen_dahmen', name: 'Aymen Dahmen', desc: 'Tunisian professional goalkeeper known for his performances in the 2022 FIFA World Cup. Prominent figure in Tunisian football.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_issam_jemaa', name: 'Issam Jemaa', desc: 'Tunisian football legend and all-time top scorer for the national team with 100+ caps. One of the most celebrated Tunisian footballers ever.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_radhi_jaidi', name: 'Radhi Jaïdi', desc: 'Tunisian football legend who played in the English Premier League (Bolton Wanderers). Iconic Tunisian defender and national team hero.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_hamdi_harbaoui', name: 'Hamdi Harbaoui', desc: 'Tunisian professional striker, top scorer in Tunisian domestic football. Prolific goal-scorer with massive local following.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: S, lat: SL, lng: SG, contact: {} }),
  m({ id: 'influencer_ali_abdi', name: 'Ali Abdi', desc: 'Tunisian professional left-back playing in Europe. Part of Tunisia\'s national team setup with active social media.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_yohan_benalouane', name: 'Yohan Bénalouane', desc: 'Franco-Tunisian professional footballer who represented Tunisia. Played in the English Premier League for Leicester City during their title-winning season.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_rami_kaib', name: 'Rami Kaib', desc: 'Tunisian professional footballer and reliable defender in European leagues. Growing social media following among Tunisian fans.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_wahbi_khazri', name: 'Wahbi Khazri', desc: 'Tunisian professional footballer who played in the English Premier League (Sunderland) and Ligue 1 (Saint-Étienne). One of Tunisia\'s biggest football stars.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_sami_trabelsi', name: 'Sami Trabelsi', desc: 'Tunisian football coach and former international player. Managed multiple national teams across Africa and Asia. Prominent figure in Tunisian football.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_nabil_maaloul', name: 'Nabil Maâloul', desc: 'Tunisian football coach who led Tunisia to the 2018 and 2022 World Cups. One of Tunisia\'s most celebrated football managers with huge social media following.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_mehdi_ben_slimane', name: 'Mehdi Ben Slimane', desc: 'Tunisian professional footballer playing in European leagues. Versatile player representing Tunisia on the international stage.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== WOMEN'S FOOTBALL ======
  m({ id: 'influencer_chaima_abbassi', name: 'Chaima Abbassi', desc: 'Captain of the Tunisia women\'s national football team. Pioneer of Tunisian women\'s football and role model for young Tunisian female athletes.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_tesnim_zerelli', name: 'Tesnim Zerelli', desc: 'Tunisian women\'s football forward and national team player. Part of the rising generation of Tunisian women in football.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_yasmine_ben_kaabia', name: 'Yasmine Ben Kaabia', desc: 'Tunisian women\'s football player and national team forward. Aspiring Tunisian female footballer with growing influence.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_wided_mejri_football', name: 'Wided Mejri', desc: 'Tunisian women\'s national team midfielder. One of the key players in Tunisia\'s women\'s football development.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== OLYMPIC ATHLETES ======
  m({ id: 'influencer_oussama_mellouli', name: 'Oussama Mellouli', desc: 'Tunisian swimming legend. Olympic gold medalist in 1500m freestyle (Beijing 2008) and 10km marathon swimming (London 2012). Greatest Tunisian swimmer ever.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_habiba_ghribi', name: 'Habiba Ghribi', desc: 'Tunisian athletics star and Olympic silver medalist in 3000m steeplechase (London 2012). One of Tunisia\'s greatest ever female athletes.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_ikram_dhahri', name: 'Ikram Dhahri', desc: 'Tunisian taekwondo athlete who competed at the 2024 Paris Olympics. Part of Tunisia\'s strong taekwondo contingent.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_chaima_toumi_sports', name: 'Chaima Toumi', desc: 'Tunisian taekwondo athlete who competed at the 2024 Paris Olympics. Active on social media as a Tunisian sports ambassador.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_khouloud_hlimi', name: 'Khouloud Hlimi', desc: 'Tunisian boxer who competed at the 2024 Paris Olympics. Trailblazer for women\'s boxing in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_marwa_bouzayani', name: 'Marwa Bouzayani', desc: 'Tunisian athletics star and steeplechase runner who competed at the 2024 Paris Olympics. Elite Tunisian track and field athlete.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_oumaima_bedioui', name: 'Oumaima Bedioui', desc: 'Tunisian judoka who competed at the 2024 Paris Olympics. Represents Tunisia in international judo competitions.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_sarra_mzougui', name: 'Sarra Mzougui', desc: 'Tunisian judoka who competed at the 2024 Paris Olympics. Part of Tunisia\'s judo Olympic team.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_siwar_bousetta', name: 'Siwar Bousetta', desc: 'Tunisian wrestler who competed at the 2024 Paris Olympics. Elite Tunisian female wrestling competitor.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_yasmine_daghfous', name: 'Yasmine Daghfous', desc: 'Tunisian fencer who competed at the 2024 Paris Olympics alongside gold medalist Farès Ferjani.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_rihab_elwalid', name: 'Rihab Elwalid', desc: 'Tunisian archer who competed at the 2024 Paris Olympics. Pioneer of archery sport in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_moez_echargui', name: 'Moez Echargui', desc: 'Tunisian professional tennis player who competed at the 2024 Paris Olympics. Ranked among the top Tunisian tennis players.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_selma_dhaouadi', name: 'Selma Dhaouadi', desc: 'Tunisian rower who competed at the 2024 Paris Olympics. Part of Tunisia\'s growing rowing tradition.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_jamila_boulakbech', name: 'Jamila Boulakbech', desc: 'Tunisian swimmer who competed at the 2024 Paris Olympics. Elite female Tunisian swimmer.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_karem_ben_hnia', name: 'Karem Ben Hnia', desc: 'Tunisian weightlifter who competed at the 2024 Paris Olympics. Represents Tunisia in strength sports.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_aziz_dougaz', name: 'Aziz Dougaz', desc: 'Tunisian professional tennis player competing on the ATP Tour. Rising Tunisian tennis talent following in Ons Jabeur\'s footsteps.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== MORE HANDBALL ======
  m({ id: 'influencer_amine_bannour', name: 'Amine Bannour', desc: 'Tunisian handball player competing in European leagues. Prolific scorer for both club and national team.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_rayan_aribi', name: 'Rayan Aribi', desc: 'Young Tunisian handball talent making waves in European handball. One of the rising stars of Tunisian sport.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_marouan_chouiref', name: 'Marouan Chouiref', desc: 'Tunisian handball player and national team member. Active on social media connecting with handball fans.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_oussama_jaziri_handball', name: 'Oussama Jaziri (Handball)', desc: 'Tunisian handball player and national team member. Part of Tunisia\'s successful handball program.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== ATHLETICS & OTHER SPORTS ======
  m({ id: 'influencer_siwar_chaabane', name: 'Siwar Chaabane', desc: 'Tunisian taekwondo champion and world-class competitor. Multiple-time African champion in taekwondo.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_zaineb_sghaier', name: 'Zaineb Sghaier', desc: 'Tunisian female wrestler who competed at the 2024 Paris Olympics. Elite combat sports athlete from Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_salim_jemai', name: 'Salim Jemai', desc: 'Tunisian canoeist who competed at the 2024 Paris Olympics. Pioneer of canoeing in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_lotfi_bouchnaq_sports', name: 'Mohamed Amin Jhinaoui', desc: 'Tunisian track and field athlete who competed at the 2024 Paris Olympics. Elite Tunisian runner.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: {} }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 9 (Sports) ===\n');
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
