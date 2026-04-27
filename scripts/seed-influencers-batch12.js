/**
 * Seed Tunisian Influencers — Batch 12 (Comedy creators, tech/gaming, news/media, more actors)
 * Run with: node scripts/seed-influencers-batch12.js
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
  // ====== COMEDY & ENTERTAINMENT ======
  m({ id: 'influencer_tarek_chemkhi', name: 'Tarek Chemkhi', desc: 'Tunisian comedian and content creator known for his sharp political and social satire. Popular short comedy skits about Tunisian daily life.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_slim_laribi', name: 'Slim Laribi', desc: 'Tunisian comedian and actor known for his roles in Tunisian comedy productions and social media entertainment content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_kamel_bheji', name: 'Kamel Bheji', desc: 'Tunisian comedian and entertainer with a long career in Tunisian television and theater. Known for his physical comedy.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hani_ouled', name: 'Hani Ouled', desc: 'Tunisian comedian and social media creator. Creates viral comedy sketches about Tunisian culture and social situations.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_meme_tunisie', name: 'Meme Tunisie', desc: 'Popular Tunisian humor and meme page. Delivers daily laughs through relatable Tunisian humor, viral videos, and cultural commentary.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_mokhtar_rjeb', name: 'Mokhtar Rjeb', desc: 'Tunisian comedian and content creator known for his satirical takes on Tunisian politics and everyday life.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ali_mabkhout', name: 'Ali Mabkhout', desc: 'Tunisian comedian actor known for his roles in Tunisian comedy films and TV series. Popular entertainer in Tunisia.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_said_dridi', name: 'Said Dridi', desc: 'Tunisian actor and comedian known for physical comedy and humorous roles in Tunisian TV and theater productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_anis_riahi', name: 'Anis Riahi', desc: 'Tunisian filmmaker and screenwriter known for directing popular Tunisian comedies. His films are blockbusters in Tunisian cinema.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_lassaad_oueslati', name: 'Lassaad Oueslati', desc: 'Veteran Tunisian actor and comedian with decades of work in Tunisian theater and television productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_jalila_baccar', name: 'Jalila Baccar', desc: 'Legendary Tunisian actress and playwright. Co-founder of Familia Productions, a pioneer of Tunisian contemporary theater and cinema.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_raouia', name: 'Raouia', desc: 'Tunisian actress known for her powerful performances in Tunisian and international films. Acclaimed figure in Tunisian cinema.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_baya_hamdi', name: 'Baya Hamdi', desc: 'Tunisian actress and TV personality. Known for her roles in popular Tunisian drama series and social media presence.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_khalil_bergaoui', name: 'Khalil Bergaoui', desc: 'Tunisian actor known for his performances in Tunisian TV series and film productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ines_khodja', name: 'Ines Khodja', desc: 'Tunisian actress featured in Tunisian film and TV productions with a growing online presence.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_rym_ben_messaoud', name: 'Rym Ben Messaoud', desc: 'Tunisian actress known for her work in Tunisian drama. Active on social media sharing behind-the-scenes content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_sabra_lahiani', name: 'Sabra Lahiani', desc: 'Tunisian actress known for her roles in Tunisian comedy and drama productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_wafa_ghorbel', name: 'Wafa Ghorbel', desc: 'Tunisian actress and TV personality featured in Tunisian television drama series.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_abir_dridi', name: 'Abir Dridi', desc: 'Tunisian actress known for her work in Tunisian TV productions and films.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_moufida_tlatli', name: 'Moufida Tlatli', desc: 'Legendary Tunisian filmmaker and former Minister of Culture. Director of "The Silences of the Palace" — considered one of the greatest Arab films ever made.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_fadhel_jaibi', name: 'Fadhel Jaibi', desc: 'Legendary Tunisian theater director and actor. Co-founded the Nouveau Théâtre de Tunis with Jalila Baccar. Defining figure of contemporary Tunisian theater.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_ridha_behi', name: 'Ridha Behi', desc: 'Tunisian film director known for his important contributions to Tunisian cinema history.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_khaled_ghorbal', name: 'Khaled Ghorbal', desc: 'Tunisian filmmaker known for thoughtful Tunisian dramas that explore society and identity.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_sami_fehri', name: 'Sami Fehri', desc: 'Tunisian media producer and entertainment personality. CEO of Cactus Prod, producing some of Tunisia\'s most popular TV shows and events.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'business_finance'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_tarak_ben_ammar', name: 'Tarak Ben Ammar', desc: 'Tunisian film producer and media mogul. One of the most powerful figures in international film production with connections to Cannes and Hollywood.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'business_finance'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  // ====== TECH & GAMING ======
  m({ id: 'influencer_mouhamed_aziz_tahari', name: 'Mouhamed Aziz Tahari', desc: 'Tunisian content creator and gaming personality with 6.9K+ followers. Shares gaming and lifestyle content.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { ig: 'edope.13a' } }),
  m({ id: 'influencer_gaming_tn', name: 'Gaming TN', desc: 'Tunisian gaming community channel. Covers PC and console gaming news, reviews, and tournaments in the Tunisian market.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_tunisia_tech', name: 'Tunisia Tech', desc: 'Tunisian technology news and review channel. Covers latest tech gadgets, app reviews, and digital trends for Tunisian audience.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_anis_saidi_dev', name: 'Anis Saidi', desc: 'Tunisian software developer and programming content creator. Shares coding tutorials and web development tips for Tunisian developers.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_code_tunisie', name: 'Code Tunisie', desc: 'Tunisian programming education channel teaching coding, web development, and software engineering in Arabic.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'education'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_monta3im_tn', name: 'Monta3im TN', desc: 'Tunisian tech and gaming content creator. Reviews the latest games and technology for the Tunisian gaming community.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_fares_abdeddayem_tech', name: 'Fares Abdeddayem', desc: 'Tunisian tech content creator and entrepreneur. Shares technology news and startup content for the Tunisian tech ecosystem.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_gamer_tunisien', name: 'Gamer Tunisien', desc: 'Tunisian gaming channel covering FIFA, GTA, PUBG and other popular titles. Popular destination for Tunisian gaming content.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_zineddine_gamer', name: 'Zineddine Gamer', desc: 'Tunisian gaming streamer and content creator. Streams popular games and engages with the Tunisian gaming community.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_yassine_labidi_tech', name: 'Yassine Labidi', desc: 'Tunisian tech entrepreneur and AI content creator. Shares insights about artificial intelligence and technology innovation in Tunisia.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'business_finance'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== NEWS & POLITICS ======
  m({ id: 'influencer_borhen_bssais', name: 'Borhen Bssais', desc: 'Tunisian journalist and political commentator. Known for his analysis of Tunisian politics and media commentary.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_saoussen_rekik', name: 'Saoussen Rekik', desc: 'Tunisian journalist and anchor at leading Tunisian TV channels. Known for her news coverage and political interviews.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_lotfi_hajji', name: 'Lotfi Hajji', desc: 'Tunisian journalist, former president of the Tunisian Journalists Syndicate. Outspoken voice on press freedom and Tunisian politics.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ahmed_jaziri_journalist', name: 'Ahmed Jaziri', desc: 'Tunisian journalist and political analyst known for his investigative journalism and political commentary.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_olfa_riahi', name: 'Olfa Riahi', desc: 'Tunisian investigative journalist and blogger. Known for her fearless reporting on corruption and political affairs in Tunisia.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_nawfel_zbidi', name: 'Nawfel Zbidi', desc: 'Tunisian politician and academic. Former Minister of Defence and Presidential candidate. Influential voice in Tunisian politics.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_moncef_marzouki_soc', name: 'Moncef Marzouki', desc: 'Former President of Tunisia (2011-2014). Human rights activist and politician with significant social media presence.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_rached_ghannouchi', name: 'Rached Ghannouchi', desc: 'Tunisian politician and co-founder of the Ennahda movement. One of the most prominent political figures in modern Tunisia.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_nadia_el_fani_media', name: 'Tunisia Fact Check', desc: 'Tunisian media accountability and fact-checking channel. Verifies viral news and combats misinformation in Tunisian social media.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_amira_yahyaoui', name: 'Amira Yahyaoui', desc: 'Tunisian human rights activist, tech entrepreneur, and founder of Bsoins (Al Bawsala). Forbes "30 under 30" honoree.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'tech_gaming'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  // ====== MORE CONTENT CREATORS / VLOGGERS ======
  m({ id: 'influencer_hamdi_ben_amor', name: 'Hamdi Ben Amor', desc: 'Tunisian lifestyle vlogger and content creator sharing daily Tunisian life, challenges, and entertainment content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_nader_jerbi_vlog', name: 'Nader Jerbi', desc: 'Tunisian content creator known for entertaining vlogs and challenges popular with Tunisian youth.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_prank_tn', name: 'Prank TN', desc: 'Tunisian prank and entertainment channel. Creates viral prank videos and social experiments popular across Tunisia.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_sarra_ben_salah', name: 'Sarra Ben Salah', desc: 'Tunisian lifestyle and beauty content creator sharing daily life, beauty tips, and personal advice.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ons_lifestyle', name: 'Ons Lifestyle', desc: 'Tunisian lifestyle content creator sharing productivity tips, home organization, and daily routine content.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_sousse_lifestyle', name: 'Sousse Lifestyle', desc: 'Tunisian content creator from Sousse sharing coastal lifestyle, food, and entertainment from Tunisia\'s tourist capital.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: SO, lat: SOL, lng: SOG, contact: {} }),
  m({ id: 'influencer_sfax_influencer', name: 'Sfax Content Creator', desc: 'Tunisian influencer from Sfax showcasing life in Tunisia\'s second city — food, culture, and business opportunities.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'travel'], loc: S, lat: SL, lng: SG, contact: {} }),
  m({ id: 'influencer_arab_comedy_tn', name: 'Comedy Tunisie', desc: 'Tunisian comedy page sharing the best Tunisian humor, dialect jokes, and cultural comedy content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_gaming_stream_tn', name: 'Stream TN', desc: 'Tunisian gaming and streaming community platform. Features Tunisian streamers and gaming events.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_crypto_tn', name: 'Crypto Tunisie', desc: 'Tunisian cryptocurrency and blockchain education channel. Explains digital finance and investment concepts for Tunisian audience.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 12 (Comedy, Tech, News, More) ===\n');
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
