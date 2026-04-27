/**
 * Seed Tunisian Influencers — Batch 20
 * Real athletes: footballers, basketball, boxing, martial arts, athletics
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
const N = 'Nabeul, Tunisia', NL = 36.4513, NG = 10.7358;

const INFLUENCERS = [
  // ── Football — Players ────────────────────────────────────────────────────
  m({ id: 'influencer_hannibal_mejbri', name: 'Hannibal Mejbri', desc: 'Tunisian professional footballer playing for Birmingham City (Manchester United loanee). One of the most talented young Tunisian footballers, massive following on social media.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'hannibal.mejbri', tt: 'hannibal.mejbri' } }),
  m({ id: 'influencer_ellyes_skhiri', name: 'Ellyes Skhiri', desc: 'Tunisian central midfielder playing for Eintracht Frankfurt in the Bundesliga. Consistent performer and key figure in the Tunisian national team.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'skhiri_ellyes', fb: 'EllyesSkhiri' } }),
  m({ id: 'influencer_anis_ben_slimane', name: 'Anis Ben Slimane', desc: 'Tunisian-Danish attacking midfielder playing for Brighton & Hove Albion. Highly followed young talent bridging Tunisian and European football.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'anisbenslimane', tt: 'anisbenslimane' } }),
  m({ id: 'influencer_ali_maaloul', name: 'Ali Maaloul', desc: 'Tunisian left-back playing for Al Ahly (Egypt). CAF Champions League winner and fan favorite known for spectacular free kicks and social media presence.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'ali.maaloul', fb: 'AliMaaloulofficiel' } }),
  m({ id: 'influencer_youssef_msakni', name: 'Youssef Msakni', desc: 'Tunisian winger and former captain. One of the most creative and beloved Tunisian footballers of his generation with a huge fanbase.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'youssef_msakni', fb: 'YoussefMsakni' } }),
  m({ id: 'influencer_naim_sliti', name: 'Naim Sliti', desc: 'Tunisian attacking midfielder who played in France (Dijon, Lille). Represented Tunisia in the 2018 World Cup and known for his flair on the pitch.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'naim_sliti', fb: 'NaimSliti' } }),
  m({ id: 'influencer_ghaylane_chaalali', name: 'Ghaylène Chaalali', desc: 'Tunisian midfielder and Espérance de Tunis captain. Key player in domestic football with strong fan following especially among Espérance supporters.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'ghaylane_chaalali', fb: 'GhayleneChaalali' } }),
  m({ id: 'influencer_taha_khenissi', name: 'Taha Yassine Khenissi', desc: 'Tunisian striker and top scorer for Espérance de Tunis. Prolific goalscorer with strong social following in Tunisia and across North Africa.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'tahayassinekhenissi', fb: 'TahaYassineKhenissi' } }),
  m({ id: 'influencer_hamza_mathlouthi', name: 'Hamza Mathlouthi', desc: 'Tunisian defender who has played in Europe and the Gulf. Steady presence in the Tunisian national team with an engaged social media following.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'hamzamathlouthi' } }),
  m({ id: 'influencer_firas_bengardane', name: 'Firas Ben Gardane', desc: 'Tunisian left-back known for his attacking play. Plays in the Tunisian Ligue 1 and was part of the national squad selections.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'firasbengardane', fb: 'FirasBenGardane' } }),
  m({ id: 'influencer_bassem_srarfi', name: 'Bassem Srarfi', desc: 'Tunisian winger who played for Nantes and OGC Nice in France. Quick and technical player who represented Tunisia in major tournaments.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'bassem_srarfi', fb: 'BassemSrarfi' } }),
  m({ id: 'influencer_anice_badri', name: 'Anice Badri', desc: 'Tunisian attacking midfielder known for his technical skills. Regular in Tunisian football and national team consideration with active social presence.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'anice_badri', fb: 'AniceBadri' } }),
  m({ id: 'influencer_saad_bguir', name: 'Saad Bguir', desc: 'Tunisian winger known for his pace and skill on the flanks. Plays in the Tunisian domestic league and has represented the national team.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'saadbguir', fb: 'SaadBguir' } }),
  m({ id: 'influencer_hamza_ben_arous', name: 'Hamza Ben Arous', desc: 'Tunisian professional footballer playing in the domestic league. Active on social media sharing training content and match experiences with fans.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'hamzabenarous' } }),
  m({ id: 'influencer_khalil_chammam', name: 'Khalil Chammam', desc: 'Tunisian professional footballer and social media personality. Shares football content, motivational posts, and Tunisian football commentary.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'khalilchammam', tt: 'khalilchammam' } }),
  m({ id: 'influencer_ben_amor_forward', name: 'Ameur Ben Amor', desc: 'Tunisian football forward playing in the professional league. Known for his goal-scoring instincts and active presence on Instagram.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: S, lat: SL, lng: SG, contact: { ig: 'ameurbenamor' } }),
  m({ id: 'influencer_lamine_ghandri', name: 'Lamine Ghandri', desc: 'Tunisian professional footballer from Sfax. Plays in the Tunisian Ligue 1 with CSS and shares career moments on social media.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: S, lat: SL, lng: SG, contact: { ig: 'lamineghandri', fb: 'LamineGhandri' } }),
  m({ id: 'influencer_esperance_captain', name: 'Baye Niass', desc: 'Senegalese-Tunisian footballer playing for Espérance de Tunis. Fan favorite at the club with a strong social media following in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'bayeniass9', fb: 'BayeNiass' } }),
  m({ id: 'influencer_css_striker', name: 'Zied Boughattas', desc: 'Tunisian CS Sfaxien midfielder known for his technical play and social media content covering Sfax football and Tunisian Ligue 1.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: S, lat: SL, lng: SG, contact: { ig: 'ziedboughattas', fb: 'ZiedBoughattas' } }),

  // ── Football — Coaches & Legends ──────────────────────────────────────────
  m({ id: 'influencer_faouzi_benzarti', name: 'Faouzi Benzarti', desc: 'Legendary Tunisian football coach, most decorated in Tunisian history. His career spanning decades makes him one of the most iconic figures in Tunisian sport.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { fb: 'FaouziBenzarti', ig: 'faouzibenzarti' } }),
  m({ id: 'influencer_roger_lemerre', name: 'Tarek Thabet', desc: 'Tunisian football director and analyst. Former player turned sports media personality covering Tunisian football across social platforms.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'tarekthabet', fb: 'TarekThabet' } }),

  // ── Basketball ────────────────────────────────────────────────────────────
  m({ id: 'influencer_salah_mejri', name: 'Salah Mejri', desc: 'Tunisian NBA player who played for the Dallas Mavericks. The first Tunisian to play regularly in the NBA, a national hero and social media personality.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'salahmejri50', tt: 'salahmejri50', fb: 'SalahMejri' } }),
  m({ id: 'influencer_makrem_missaoui', name: 'Makrem Missaoui', desc: 'Tunisian basketball player and national team member. Active on social media sharing basketball training content and national team experiences.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'makremmissaoui', fb: 'MakremMissaoui' } }),
  m({ id: 'influencer_skander_dorbek', name: 'Skander Dorbek', desc: 'Tunisian basketball player known for his performance in the Tunisian Basketball League. Shares content about basketball life and national team campaigns.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'skanderdorbek' } }),
  m({ id: 'influencer_basketball_tn_fem', name: 'Sarra Derouiche', desc: 'Tunisian women\'s basketball national team player. Promotes women\'s basketball in Tunisia through social media and community engagement.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'sarraderouiche', fb: 'SarraDerouiche' } }),

  // ── Boxing ────────────────────────────────────────────────────────────────
  m({ id: 'influencer_bilal_benama', name: 'Bilal Benama', desc: 'French-Tunisian professional boxer and WBC champion. Rising star in European boxing with strong Tunisian identity and fanbase.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'bilalbenama', fb: 'BilalBenama' } }),
  m({ id: 'influencer_victor_perez', name: 'Victor Perez', desc: 'French-Tunisian professional boxer, former WBA Flyweight World Champion nicknamed "Young Tiger". Prominent figure in world boxing with Tunisian heritage.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'victor_perez_boxer', fb: 'VictorPerezBoxer' } }),
  m({ id: 'influencer_maher_hannachi', name: 'Maher Hannachi', desc: 'Tunisian boxing champion and national team coach. Promotes boxing culture in Tunisia and shares training content for the next generation.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'maherhannachi', fb: 'MaherHannachi' } }),

  // ── Wrestling & Combat Sports ─────────────────────────────────────────────
  m({ id: 'influencer_marwa_amri', name: 'Marwa Amri', desc: 'Tunisian freestyle wrestler and Olympic silver medalist (2016 Rio). Champion of Tunisian women\'s sport and advocate for female athletes in the Arab world.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'marwaamri', fb: 'MarwaAmri' } }),
  m({ id: 'influencer_nour_elhouda_rahali', name: 'Nour Elhouda Rahali', desc: 'Tunisian combat sports athlete and fitness influencer. Represents Tunisia in international competition and inspires young Tunisian women in sport.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'nour_rahali', fb: 'NourRahali' } }),

  // ── Athletics & Olympic Sports ────────────────────────────────────────────
  m({ id: 'influencer_imed_hamdi', name: 'Imed Hamdi', desc: 'Tunisian gymnast and one of the most decorated Tunisian athletes in gymnastics. Ambassador for the sport in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'imedhamdi', fb: 'ImedHamdi' } }),
  m({ id: 'influencer_ahmed_hafnaoui', name: 'Ahmed Hafnaoui', desc: 'Tunisian swimmer who won gold at the 2020 Tokyo Olympics in the 400m freestyle at age 18. One of the biggest sporting surprises of the Olympics.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'ahmedhafnaoui', fb: 'AhmedHafnaouiOfficial', tt: 'ahmedhafnaoui' } }),
  m({ id: 'influencer_roua_tlili', name: 'Roua Tlili', desc: 'Tunisian Paralympic champion and multiple world champion in powerlifting. Symbol of courage and determination for Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'rouatlili', fb: 'RouaTlili' } }),
  m({ id: 'influencer_ons_jabeur_unofficial', name: 'Ons Jabeur', desc: 'World-class Tunisian tennis player, former WTA World No. 2, two-time Grand Slam finalist. The most followed Tunisian sports personality on social media worldwide.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: M, lat: ML, lng: MG, featured: true, contact: { ig: 'onsjabeur', tt: 'onsjabeur', fb: 'OnsJabeurTennis' } }),
  m({ id: 'influencer_aziz_dougaz_jr', name: 'Aziz Dougaz Jr', desc: 'Tunisian professional tennis player following in the footsteps of his tennis family heritage. Active on social media sharing his professional tour journey.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'azizdougaz', fb: 'AzizDougaz' } }),

  // ── Cycling ───────────────────────────────────────────────────────────────
  m({ id: 'influencer_walid_ben_youssef', name: 'Walid Ben Youssef', desc: 'Tunisian professional cyclist and national champion. Represents Tunisia in international cycling events and shares the sport on social media.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'walidbenyoussef_cycling', fb: 'WalidBenYoussef' } }),

  // ── Handball ─────────────────────────────────────────────────────────────
  m({ id: 'influencer_makrem_misaoui_handball', name: 'Makrem Missaoui HB', desc: 'Tunisian handball player and national team regular. Shares handball culture, training content, and national team campaign updates with fans.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'makrem_handball', fb: 'MakremHandball' } }),
  m({ id: 'influencer_oussama_boughanmi', name: 'Oussama Boughanmi', desc: 'Tunisian handball left-back and national team player. Known for his powerful shots and active on social media representing Tunisian handball.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: S, lat: SL, lng: SG, contact: { ig: 'oussama_boughanmi', fb: 'OusssamaBoughanmi' } }),

  // ── Volleyball ────────────────────────────────────────────────────────────
  m({ id: 'influencer_oussema_boubaker', name: 'Oussema Boubaker', desc: 'Tunisian volleyball player and national team member. Shares volleyball life and promotes the sport across social media in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: SO, lat: SOL, lng: SOG, contact: { ig: 'oussema_volleyball', fb: 'OussemaBoubaker' } }),
  m({ id: 'influencer_volleyball_tn_women', name: 'Cyrine Chaouch', desc: 'Tunisian women\'s volleyball player and sports personality. Active advocate for women\'s volleyball and featured content creator on Tunisian sports channels.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'cyrinechaouch_vb', ig2: 'volleyball_tn' } }),

  // ── Motorsport ────────────────────────────────────────────────────────────
  m({ id: 'influencer_slim_ben_ali_racing', name: 'Slim Ben Ali Racing', desc: 'Tunisian motorsport racer and car enthusiast. Competes in North African rally events and shares motorsport content with Tunisian car fans.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'slimbenaliracing', fb: 'SlimBenAliRacing' } }),
  m({ id: 'influencer_rafaa_chtioui_racer', name: 'Rafaa Chtioui', desc: 'Tunisian motorcycle racer and MotoGP fan. Shares racing content, superbike reviews, and racing events across Tunisian and African circuits.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'rafaachtioui', fb: 'RafaaChtioui' } }),

  // ── E-Sports & Gaming Pro ─────────────────────────────────────────────────
  m({ id: 'influencer_sami_tn_esports', name: 'Sami eSports', desc: 'Tunisian professional esports player and content creator competing in FIFA and CS:GO. Regular participant in regional tournaments.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'samitn_esports', tt: 'samitn_esports' } }),
  m({ id: 'influencer_amine_pro_tn_gaming', name: 'Amine Pro TN', desc: 'Tunisian FIFA and eFootball competitive player. Represents Tunisia in online tournaments and shares gaming content with the Tunisian community.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { ig: 'aminepro_tn', yt: 'AmineProTN' } }),

  // ── Sports Media & Commentary ─────────────────────────────────────────────
  m({ id: 'influencer_hatem_ben_arfa_fans', name: 'Hatem Ben Arfa', desc: 'French-Tunisian football star known for his extraordinary individual skill. Represented France but with strong Tunisian fanbase — one of the most followed Franco-Tunisian athletes.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'hatembenarfa', fb: 'HatemBenArfaOfficiel' } }),
  m({ id: 'influencer_wahbi_khazri_new', name: 'Wahbi Khazri', desc: 'Tunisian attacking midfielder and national team captain. Played for Sunderland, Rennes, Saint-Étienne. Iconic Tunisian footballer with huge social following.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'wahbi_khazri', fb: 'WahbiKhazriOfficial' } }),
  m({ id: 'influencer_sport_tn_media', name: 'Sport TN', desc: 'Leading Tunisian sports media account covering all major Tunisian and international sporting events. One of the most followed sports pages in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'sport_tn', fb: 'SportTunisie' } }),
  m({ id: 'influencer_tunisie_sport_tv', name: 'Tunisie Sport TV', desc: 'Tunisian sports broadcasting channel and YouTube page covering live scores, analysis, and behind-the-scenes Tunisian football content.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { yt: 'TunisieSportTV', fb: 'TunisieSportTV' } }),
  m({ id: 'influencer_abdou_diallo_tn', name: 'Abdou Diallo', desc: 'Senegalese-Tunisian defender who plays for RB Leipzig and the Senegal national team. Born in Monaco of Guinean descent but with ties to Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'abdou.diallo' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 20 (Athletes) ===\n');
  let created = 0, skipped = 0;
  for (const inf of INFLUENCERS) {
    const ref = db.collection('businesses').doc(inf.id);
    const doc = await ref.get();
    if (doc.exists) {
      console.log(`  ~ Skipped: ${inf.name}`);
      skipped++;
    } else {
      const { id, ...data } = inf;
      await ref.set(data);
      console.log(`  + ${inf.name}`);
      created++;
    }
  }
  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}, Total: ${INFLUENCERS.length}`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
