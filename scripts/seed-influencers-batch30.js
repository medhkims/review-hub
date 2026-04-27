/**
 * Seed Tunisian Influencers — Batch 30
 * More real Tunisian personalities: journalists, activists, academics, artists,
 * community pages, sport clubs, and niche creators
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

const INFLUENCERS = [
  // ── More Athletes ──────────────────────────────────────────────────────────
  m({ id: 'influencer_seifeddine_jaziri_tn', name: 'Seifeddine Jaziri', desc: 'Tunisian striker who played for Wolverhampton Wanderers in the Premier League. His journey to England made him a source of national pride and a social media personality.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'seifeddinejaziri', fb: 'SeifeddineJaziri', tt: 'seifeddinejaziri' } }),
  m({ id: 'influencer_ben_amor_goalkeeper', name: 'Moez Hassan', desc: 'Tunisian goalkeeper who played in Europe and represents the national team. Active on social media sharing goalkeeping content and national team moments.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'moezhassan_gk', fb: 'MoezHassan' } }),
  m({ id: 'influencer_club_africain_stars', name: 'Maher Hannachi CA', desc: 'Club Africain legend and former captain. Immensely popular among Club Africain supporters and active ambassador for the historic Tunis football club.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'maherhannachi_ca', fb: 'MaherHannachiCA' } }),
  m({ id: 'influencer_nidhal_tn_swimmer', name: 'Nidhal Zemzemi', desc: 'Tunisian competitive swimmer and national team member. Shares swimming training content and international competition experiences with a growing sports following.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'nidhalzemzemi', fb: 'NidhalZemzemi' } }),
  m({ id: 'influencer_yosr_sfar_tennis', name: 'Yosr Sfar', desc: 'Former Tunisian tennis professional and coach. One of the most successful Tunisian tennis players before Ons Jabeur, now an active ambassador for the sport.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'yosrsfar_tennis', fb: 'YosrSfarTennis' } }),
  m({ id: 'influencer_hammadi_athletic', name: 'Hammadi Ben Messaoued', desc: 'Tunisian Olympic athletics coach and former long-jump athlete. Shares athletic training content and promotes track and field sports across social platforms.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'hammadi_athletics_tn', fb: 'HammadiBenMessaoued' } }),
  m({ id: 'influencer_saber_khlif_coach', name: 'Saber Khlif', desc: 'Tunisian football coach and former professional player. Shares tactical football analysis and coaching insights across social platforms with a dedicated football following.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'saberkhlif_coach', fb: 'SaberKhlif' } }),

  // ── Musicians & Artists (More) ─────────────────────────────────────────────
  m({ id: 'influencer_zied_rahbani_tn', name: 'Zied Gharbi', desc: 'Tunisian singer and songwriter blending contemporary Arabic pop with Tunisian folk traditions. Active on streaming platforms and social media with a loyal fanbase.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'ziedgharbi_music', fb: 'ZiedGharbi', yt: 'ZiedGharbiOfficial' } }),
  m({ id: 'influencer_amal_mathlouti_tn', name: 'Amal Mathlouthi', desc: 'Tunisian visual artist and painter known for vibrant canvases inspired by Tunisian landscapes, heritage, and identity. Shares creative process on Instagram.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'amalmathlouthi_art', fb: 'AmalMathloutiArt' } }),
  m({ id: 'influencer_malek_jaziri_art', name: 'Malek Jaziri Art', desc: 'Tunisian contemporary artist and sculptor. Works exploring Tunisian identity, North African mythology, and Arab modernity exhibited internationally.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'malekjaziriart', fb: 'MalekJaziriArt' } }),
  m({ id: 'influencer_graffiti_tn_art', name: 'Street Art Tunis', desc: 'Tunisian street art collective and content creator documenting the explosion of mural art in Tunis since the 2011 revolution. Maps and celebrates Tunis as an open-air gallery.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'streetart_tunis', fb: 'StreetArtTunis', tt: 'streetarttunis' } }),
  m({ id: 'influencer_oumaima_tn_singer', name: 'Oumaima', desc: 'Emerging Tunisian singer known for soulful vocals and emotional performances. Her YouTube releases and TikTok covers have been building her a fast-growing fanbase.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'oumaima_tn_singer', tt: 'oumaima_tn', yt: 'OumaimaOfficial' } }),
  m({ id: 'influencer_seif_tn_rapper', name: 'Seif Rapper TN', desc: 'Tunisian underground rapper known for political and social rap. His raw commentary on Tunisian society has earned him cult status in the Tunisian hip-hop community.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'seif_rapper_tn', yt: 'SeifRapperTN', tt: 'seifrappertn' } }),
  m({ id: 'influencer_amazigh_music_tn', name: 'Amazigh Music Tunisie', desc: 'Dedicated Tunisian channel promoting Amazigh (Berber) music and cultural heritage. Preserves indigenous Tunisian musical traditions reaching diaspora worldwide.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'amazigh_music_tn', yt: 'AmazighMusicTunisie', fb: 'AmazighMusicTunisie' } }),

  // ── Comedy & Entertainment ────────────────────────────────────────────────
  m({ id: 'influencer_interview_tn', name: 'Tasrih TN', desc: 'Tunisian street interview content creator. Goes out in Tunis asking Tunisians funny and thought-provoking questions generating authentic reactions and viral moments.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'tasrih_tn', tt: 'tasrih_tn', yt: 'TasrihTN' } }),
  m({ id: 'influencer_challenge_tn', name: 'Challenge TN', desc: 'Tunisian challenge content creator. Organizes and films social challenges in public spaces across Tunisia creating viral and entertaining content for local audiences.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'challenge_tn_official', tt: 'challengetn', yt: 'ChallengeTN' } }),
  m({ id: 'influencer_5stars_tn', name: '5 Stars TN', desc: 'Tunisian entertainment page rating and reviewing everyday Tunisian experiences — restaurants, services, and public spaces with a humorous five-star rating system.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: '5stars_tn', tt: '5starstn', fb: '5StarsTN' } }),
  m({ id: 'influencer_scene_tn', name: 'Scène Tunisienne', desc: 'Tunisian theater and performing arts content creator. Promotes Tunisian theatrical productions, shares rehearsal footage, and documents the vibrant Tunis theater scene.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'scene_tunisienne', fb: 'ScèneTunisienne', yt: 'ScèneTunisienne' } }),

  // ── News, Politics & Activism ─────────────────────────────────────────────
  m({ id: 'influencer_sana_ben_achour', name: 'Sana Ben Achour', desc: 'Prominent Tunisian feminist legal scholar and human rights activist. Strong public intellectual voice on women\'s rights, constitutional law, and Tunisian civil society.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'sanabena_achour', fb: 'SanaBenAchour', tt: 'sanabenachour' } }),
  m({ id: 'influencer_jawaher_ben_mbarek', name: 'Jawaher Ben Mbarek', desc: 'Tunisian journalist and investigative reporter covering social issues and corruption. Known for courageous reporting that challenges powerful interests in Tunisia.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'jawaher_benm', fb: 'JawaherBenMbarek' } }),
  m({ id: 'influencer_haythem_mekki', name: 'Haythem Mekki', desc: 'Tunisian journalist and media trainer. Covers press freedom, media ethics, and Tunisian journalism through his social media platforms and editorial contributions.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'haythemmekki', fb: 'HaythemMekki' } }),
  m({ id: 'influencer_aymen_zaghdoud', name: 'Aymen Zaghdoud', desc: 'Tunisian political commentator and media personality. Shares daily analysis of Tunisian and Arab political affairs with a large and engaged social media following.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'aymenzaghdoud', fb: 'AymenZaghdoud', tt: 'aymenzaghdoud' } }),
  m({ id: 'influencer_feministn_tn', name: 'Féministes Tunisiennes', desc: 'Tunisian feminist collective and social media page. Advocates for gender equality, women\'s rights, and reproductive rights in post-revolution Tunisia.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'feministestunisiennes', fb: 'FeministesTunisiennes', tt: 'feministestn' } }),

  // ── Community & Special Interest ──────────────────────────────────────────
  m({ id: 'influencer_tunisian_cat', name: 'Cats of Tunis', desc: 'Famous Tunisian Instagram account celebrating the beloved stray cats of Tunis. The iconic cats of the Medina and their photogenic lives followed worldwide.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'catsoftunis', fb: 'CatsOfTunis', tt: 'catsoftunis' } }),
  m({ id: 'influencer_photography_tn_community', name: 'Photography Tunisia', desc: 'Tunisian photography community page gathering the best photographic work from Tunisian photographers. A curated showcase of Tunisia through the lens.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'photography_tunisia', fb: 'PhotographyTunisia' } }),
  m({ id: 'influencer_hammamet_festival', name: 'Festival de Hammamet', desc: 'Tunisia\'s oldest and most prestigious arts festival official social media. Annual international festival in Hammamet attracting global artists since 1964.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: 36.4012, lng: 10.6200, contact: { ig: 'festival_hammamet', fb: 'FestivalDeHammamet', tt: 'festivalhammamet' } }),
  m({ id: 'influencer_carthage_festival', name: 'Festival de Carthage', desc: 'Tunisia\'s most iconic summer festival official account. The International Festival of Carthage hosts world-class performers in the ancient Roman amphitheater each July.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: 36.8528, lng: 10.3238, featured: true, contact: { ig: 'festival_carthage', fb: 'FestivalDeCarthage', tt: 'festivalcarthage' } }),
  m({ id: 'influencer_djerba_fest', name: 'Festival Djerba', desc: 'Tunisian island music and culture festival celebrating the unique heritage of Djerba. Brings together Tunisian and international musicians for annual island celebrations.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'travel'], loc: T, lat: 33.8075, lng: 10.8451, contact: { ig: 'festivaldjerba', fb: 'FestivalDjerba' } }),
  m({ id: 'influencer_tunisvibe', name: 'Tunis Vibe', desc: 'Tunisian lifestyle community page capturing the energy of Tunis — nightlife, street fashion, cultural events, and the cosmopolitan pulse of the Tunisian capital.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'tunisvibe', fb: 'TunisVibe', tt: 'tunisvibe' } }),
  m({ id: 'influencer_think_tn', name: 'Think Tunisia', desc: 'Tunisian ideas and innovation platform spotlighting changemakers, social entrepreneurs, and creative thinkers building Tunisia\'s future. Think tank meets social media.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'education'], loc: T, lat: TL, lng: TG, contact: { ig: 'think_tunisia', fb: 'ThinkTunisia', yt: 'ThinkTunisia' } }),
  m({ id: 'influencer_made_in_tn', name: 'Made in Tunisia', desc: 'Dedicated page promoting Tunisian-made products, local brands, and artisanal crafts. Campaigns for Tunisian consumers to choose locally made products over imports.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance'], loc: T, lat: TL, lng: TG, contact: { ig: 'madeintunisia_official', fb: 'MadeInTunisiaOfficial', tt: 'madeintunisia' } }),
  m({ id: 'influencer_smart_tn_tips', name: 'Smart Tips TN', desc: 'Tunisian life hacks and productivity content creator sharing practical tips for everyday Tunisian life — from dealing with bureaucracy to smart shopping strategies.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { ig: 'smart_tips_tn', tt: 'smarttipstn', fb: 'SmartTipsTN' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 30 ===\n');
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
