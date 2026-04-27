/**
 * Seed Tunisian Influencers — Batch 19
 * Focuses on YouTube / Twitch / Kick creators
 * Also updates contact schema to include youtube_channel, kick_handle, twitch_handle
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
      website:           contact.web || null,
      instagram_handle:  contact.ig  || null,
      facebook_name:     contact.fb  || null,
      tiktok_handle:     contact.tt  || null,
      youtube_channel:   contact.yt  || null,
      kick_handle:       contact.kick|| null,
      twitch_handle:     contact.twitch || null,
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
  // ── YouTube — Gaming ──────────────────────────────────────────────────────
  m({ id: 'influencer_gamer_tounsi', name: 'Gamer Tounsi', desc: 'Tunisian gaming YouTuber covering FIFA, GTA, and popular titles with commentary in Tunisian dialect. One of the most-watched Tunisian gaming channels.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { yt: 'GamerTounsi' } }),
  m({ id: 'influencer_fg_gaming_tn', name: 'FG Gaming TN', desc: 'Tunisian YouTube gaming channel with live streams, game reviews, and esports tournament coverage for the Tunisian gaming community.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { yt: 'FGGamingTN', ig: 'fggamingtn' } }),
  m({ id: 'influencer_zeus_gaming_tn', name: 'Zeus Gaming', desc: 'Tunisian content creator streaming competitive games on YouTube and Kick. Known for Call of Duty and Fortnite gameplay.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { yt: 'ZeusGamingTN', kick: 'zeusgamingtn' } }),
  m({ id: 'influencer_wolf_tn_games', name: 'Wolf TN', desc: 'Tunisian gaming YouTuber known for mobile gaming content — PUBG Mobile and Free Fire tournaments and highlights.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { yt: 'WolfTNGaming', tt: 'wolftn_gaming' } }),
  m({ id: 'influencer_king_gamer_tn', name: 'King Gamer TN', desc: 'Tunisian Free Fire and mobile esports content creator. Hosts tournaments and game challenge videos popular among Tunisian youth.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: S, lat: SL, lng: SG, contact: { yt: 'KingGamerTN', ig: 'kinggamertn' } }),
  m({ id: 'influencer_dz_gamer_tn', name: 'Pro Gamer TN', desc: 'Tunisian professional esports player and content creator competing in FIFA and Rocket League tournaments.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { yt: 'ProGamerTunisie', ig: 'progamertn' } }),
  m({ id: 'influencer_dark_stream_tn', name: 'Dark Stream TN', desc: 'Tunisian horror game and thriller gaming streamer on Twitch and YouTube. Known for terrified reactions during horror game streams.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { yt: 'DarkStreamTN', twitch: 'darkstreamtn' } }),
  m({ id: 'influencer_ninja_tn_gaming', name: 'Ninja TN', desc: 'Tunisian Fortnite and Battle Royale gaming content creator. Streams on Kick and posts highlights on YouTube.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: SO, lat: SOL, lng: SOG, contact: { kick: 'ninjatn', yt: 'NinjaTNGaming' } }),

  // ── YouTube — Tech & Education ────────────────────────────────────────────
  m({ id: 'influencer_tech_in_arabic_tn', name: 'Tech بالعربي', desc: 'Tunisian technology education YouTube channel explaining programming, AI, and tech news in Arabic for Arab world audiences.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'education'], loc: T, lat: TL, lng: TG, contact: { yt: 'TechBilArabi', ig: 'techbalarabi' } }),
  m({ id: 'influencer_code_tn_yt', name: 'Code TN', desc: 'Tunisian programming tutorial YouTube channel. Full web development courses in Arabic covering HTML, CSS, JavaScript, and React.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'education'], loc: T, lat: TL, lng: TG, contact: { yt: 'CodeTunisie', ig: 'codetn_official' } }),
  m({ id: 'influencer_learn_python_tn', name: 'Python بالتونسي', desc: 'Tunisian Python and data science YouTube educator. Teaches programming in Tunisian dialect making coding accessible to all Tunisians.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'education'], loc: T, lat: TL, lng: TG, contact: { yt: 'PythonTounsi' } }),
  m({ id: 'influencer_amine_marzouki_yt', name: 'Amine Marzouki', desc: 'Tunisian digital marketing and SEO YouTube educator. Popular channel for Tunisian entrepreneurs learning online marketing.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'education'], loc: T, lat: TL, lng: TG, contact: { yt: 'AmineMarzouki', ig: 'aminemarzouki_tn' } }),
  m({ id: 'influencer_bac_exams_tn', name: 'BAC Tunisie Officiel', desc: 'Tunisian academic YouTube channel providing full revision courses for baccalaureate exams in all subjects. Hugely popular with Tunisian students.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { yt: 'BACTunisieOfficiel', fb: 'BACTunisieOfficiel' } }),
  m({ id: 'influencer_darija_learn', name: 'تعلم الدارجة', desc: 'YouTube channel teaching Tunisian Arabic (Darija) to foreigners and diaspora. Popular among Tunisian expats and language learners.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { yt: 'TaallamDarija' } }),

  // ── YouTube — Lifestyle & Vlog ────────────────────────────────────────────
  m({ id: 'influencer_hajji_hakim_yt', name: 'Hakim Hajji', desc: 'Tunisian lifestyle and travel vlogger with a strong YouTube presence. Documents Tunisian daily life, food, and travel adventures.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: T, lat: TL, lng: TG, contact: { yt: 'HakimHajji', ig: 'hakimhajji' } }),
  m({ id: 'influencer_vlog_tunisie_yt', name: 'Vlog Tunisie', desc: 'Popular Tunisian YouTube vlog channel exploring Tunisian culture, food, and social life from an authentic Tunisian perspective.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: T, lat: TL, lng: TG, contact: { yt: 'VlogTunisie', fb: 'VlogTunisie' } }),
  m({ id: 'influencer_expat_tn_yt', name: 'Tunisien Abroad', desc: 'Tunisian expat YouTube vlogger documenting life as a Tunisian living in Europe. Bridges Tunisian diaspora with their homeland.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { yt: 'TunisienAbroad', ig: 'tunisienabroad' } }),
  m({ id: 'influencer_yassine_belattar', name: 'Yassine Belattar', desc: 'Franco-Tunisian stand-up comedian and political commentator with a strong YouTube presence. Known for social satire touching on Tunisian and French society.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { yt: 'YassineBelattar', ig: 'yassinebelattar' } }),

  // ── YouTube — Music & Entertainment ───────────────────────────────────────
  m({ id: 'influencer_music_covers_tn_yt', name: 'Ons Jabeur Fan TV', desc: 'Tunisian YouTube channel dedicated to world tennis star Ons Jabeur. Match highlights, interviews, and fan content in Arabic.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { yt: 'OnsJabeurFanTV', ig: 'onsjabeur_fans' } }),
  m({ id: 'influencer_football_tn_yt', name: 'Football Tunisien HD', desc: 'Tunisian football YouTube channel covering Ligue 1 Professionnelle highlights, national team matches, and transfer news in HD.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { yt: 'FootballTunisienHD', fb: 'FootballTunisienHD' } }),
  m({ id: 'influencer_rap_tn_yt', name: 'Rap Tunisien TV', desc: 'Dedicated YouTube channel for Tunisian rap and hip-hop music. Publishes official music videos, freestyles, and rap battle footage.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { yt: 'RapTunisienTV', ig: 'raptunisientry' } }),
  m({ id: 'influencer_malouf_tn_yt', name: 'Malouf Tunisien', desc: 'Tunisian classical Malouf music YouTube channel preserving and promoting traditional Andalusian-Tunisian musical heritage.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { yt: 'MaloufTunisien' } }),
  m({ id: 'influencer_cinema_tn_yt', name: 'Cinéma Tunisien', desc: 'YouTube channel dedicated to Tunisian cinema. Reviews, behind-the-scenes, and analysis of Tunisian films and television productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'music_art'], loc: T, lat: TL, lng: TG, contact: { yt: 'CinemaTunisienYT', fb: 'CinemaTunisien' } }),

  // ── Twitch — Gaming & Live ─────────────────────────────────────────────────
  m({ id: 'influencer_twitch_tn_hassin', name: 'Hassin TN', desc: 'Tunisian Twitch streamer with a growing community. Streams FIFA, Valorant, and variety content in Tunisian dialect.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { twitch: 'hassintn', ig: 'hassin_tn' } }),
  m({ id: 'influencer_twitch_valo_tn', name: 'Valorant TN', desc: 'Tunisian Valorant Twitch streamer. Competes in regional tournaments and streams ranked gameplay for the Tunisian esports community.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { twitch: 'valoranttn', ig: 'valoranttn' } }),
  m({ id: 'influencer_twitch_music_tn', name: 'Live Music TN', desc: 'Tunisian musician who performs live on Twitch — mixing traditional Tunisian sounds with modern beats in live streaming sessions.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: { twitch: 'livemusictn', ig: 'livemusictn' } }),

  // ── Kick — Streaming ───────────────────────────────────────────────────────
  m({ id: 'influencer_kick_becha_tn', name: 'Becha Live', desc: 'Tunisian Kick streamer known for reaction content and variety streams. Rapidly growing audience among Tunisian youth on the Kick platform.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: { kick: 'bechatn', ig: 'becha_live_tn' } }),
  m({ id: 'influencer_kick_red_tn', name: 'Red TN Kick', desc: 'Tunisian Kick streamer covering sports betting analysis, casino streams, and Tunisian football commentary live.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: { kick: 'redtn', tt: 'red_tn_official' } }),

  // ── YouTube — Food & Cooking ───────────────────────────────────────────────
  m({ id: 'influencer_recettes_tn_yt', name: 'Recettes Tunisiennes', desc: 'Tunisian recipe YouTube channel with hundreds of authentic home cooking tutorials. One of the most subscribed Tunisian food channels.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { yt: 'RecettesTunisiennes', fb: 'RecettesTunisiennes' } }),
  m({ id: 'influencer_chef_slim_yt', name: 'Chef Slim TN', desc: 'Tunisian professional chef sharing restaurant-quality Tunisian recipes on YouTube. Known for couscous, brik, and traditional pastries.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { yt: 'ChefSlimTN', ig: 'chefslimtn' } }),
  m({ id: 'influencer_street_food_tn_yt', name: 'Street Food Tunis', desc: 'YouTube channel documenting Tunisian street food culture — from lablabi stalls to ftira sandwiches and rooftop cafés of the Medina.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: T, lat: TL, lng: TG, contact: { yt: 'StreetFoodTunis', ig: 'streetfoodtunis' } }),

  // ── YouTube — Fitness & Health ─────────────────────────────────────────────
  m({ id: 'influencer_workout_tn_yt', name: 'Workout Tunisie', desc: 'Tunisian fitness YouTube channel with full home workout programs, nutrition guides, and body transformation challenges.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health'], loc: T, lat: TL, lng: TG, contact: { yt: 'WorkoutTunisie', ig: 'workoutnisie' } }),
  m({ id: 'influencer_dr_health_tn_yt', name: 'Dr. Santé TN', desc: 'Tunisian medical doctor sharing health education on YouTube. Covers chronic disease prevention, nutrition, and common health concerns.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'education'], loc: T, lat: TL, lng: TG, contact: { yt: 'DrSanteTN', fb: 'DrSanteTN' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 19 (YouTube/Twitch/Kick) ===\n');
  let created = 0, skipped = 0;
  for (const inf of INFLUENCERS) {
    const ref = db.collection('businesses').doc(inf.id);
    const doc = await ref.get();
    if (doc.exists) {
      console.log(`  ~ Skipped (exists): ${inf.name}`);
      skipped++;
    } else {
      const { id, ...data } = inf;
      await ref.set(data);
      console.log(`  + ${inf.name}`);
      created++;
    }
  }
  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}, Total in batch: ${INFLUENCERS.length}`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
