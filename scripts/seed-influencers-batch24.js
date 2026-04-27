/**
 * Seed Tunisian Influencers — Batch 24
 * Comedy creators, tech/education YouTubers, business/entrepreneurship, family/parenting, news/activism
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
  // ── Comedy & Skits ────────────────────────────────────────────────────────
  m({ id: 'influencer_ahmed_tn_comedy', name: 'Ahmed Comedy TN', desc: 'Tunisian comedy content creator known for relatable skits about Tunisian daily life, family dynamics, and social observations in Tunisian dialect.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'ahmed_comedy_tn', tt: 'ahmed_comedy_tn', fb: 'AhmedComedyTN', yt: 'AhmedComedyTN' } }),
  m({ id: 'influencer_nour_tn_comedian', name: 'Nour Comedy', desc: 'Tunisian female comedian breaking into the digital comedy space. Creates viral TikTok skits depicting Tunisian social life with sharp wit.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'nourcomedytn', tt: 'nour_comedy_tn', fb: 'NourComedyTN' } }),
  m({ id: 'influencer_zouhair_tn_sketches', name: 'Zouhair Sketches', desc: 'Tunisian sketch comedy creator. Viral videos satirizing Tunisian bureaucracy, traffic, and social customs have earned him a massive digital following.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'zouhair_sketches', tt: 'zouhairsketches', yt: 'ZouhairSketchesTN' } }),
  m({ id: 'influencer_prank_tn', name: 'Prank TN', desc: 'Tunisian prank and hidden camera content creator. Hugely popular pranks filmed on the streets of Tunis with millions of cumulative views online.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'prank_tn_official', yt: 'PrankTNOfficial', tt: 'prank_tn', fb: 'PrankTN' } }),
  m({ id: 'influencer_kermali_comedy', name: 'Kermali', desc: 'Tunisian comedy actor and content creator. Specializes in character-based comedy videos depicting classic Tunisian archetypes in hilarious situations.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'kermali_tn', fb: 'KermaliTN', tt: 'kermali_tn' } }),
  m({ id: 'influencer_hamza_tn_comedy_reacts', name: 'Hamza Reacts TN', desc: 'Tunisian reaction video content creator. Reacts to viral videos, Tunisian news, and internet trends from a funny Tunisian perspective.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'hamza_reacts_tn', yt: 'HamzaReactsTN', tt: 'hamzareactstn' } }),
  m({ id: 'influencer_the_tunisian_show', name: 'The Tunisian Show', desc: 'Tunisian comedy podcast and YouTube show. Covers Tunisian pop culture, news, and internet trends with a comedic twist appealing to millennial Tunisians.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { yt: 'TheTunisianShow', ig: 'thetunisianshow', fb: 'TheTunisianShow' } }),
  m({ id: 'influencer_hatem_tn_vines', name: 'Hatem TN Vines', desc: 'Tunisian short-form comedy creator transitioning from Vine to TikTok and YouTube. Known for perfectly timed Tunisian dialect humor and viral catchphrases.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'hatemtn_vines', tt: 'hatemtn_official', fb: 'HatemTNVines' } }),

  // ── Tech & Gaming Education ────────────────────────────────────────────────
  m({ id: 'influencer_youssef_tech_tn', name: 'Youssef Tech TN', desc: 'Tunisian technology reviewer and content creator. Reviews smartphones, laptops, and gadgets in Tunisian dialect making tech accessible to Arab audiences.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { ig: 'youssef_tech_tn', yt: 'YoussefTechTN', fb: 'YoussefTechTN' } }),
  m({ id: 'influencer_darija_tech', name: 'Darija Tech', desc: 'Tunisian technology education YouTube channel. Teaches coding, cybersecurity, and digital skills in Tunisian Arabic making tech education accessible.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'education'], loc: T, lat: TL, lng: TG, contact: { yt: 'DarijaTech', ig: 'darijatech', fb: 'DarijaTech' } }),
  m({ id: 'influencer_tn_phone_review', name: 'Phone Review TN', desc: 'Tunisian smartphone review channel on YouTube. One of the go-to sources for Tunisian consumers checking phone specs and prices before buying.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { yt: 'PhoneReviewTN', ig: 'phone_review_tn', fb: 'PhoneReviewTN' } }),
  m({ id: 'influencer_ai_revolution_tn', name: 'AI Revolution TN', desc: 'Tunisian artificial intelligence education content creator. Explains AI tools, ChatGPT, and machine learning in Arabic for the Tunisian professional community.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'education'], loc: T, lat: TL, lng: TG, contact: { ig: 'ai_revolution_tn', yt: 'AIRevolutionTN', fb: 'AIRevolutionTN' } }),
  m({ id: 'influencer_hacking_tn_ethical', name: 'Ethical Hacking TN', desc: 'Tunisian cybersecurity educator teaching ethical hacking and online security in Arabic. Popular with Tunisian IT students and cybersecurity professionals.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'education'], loc: T, lat: TL, lng: TG, contact: { yt: 'EthicalHackingTN', ig: 'ethicalhacking_tn', fb: 'EthicalHackingTN' } }),
  m({ id: 'influencer_startup_tn_podcaster', name: 'Startup TN Podcast', desc: 'Tunisian startup and entrepreneurship podcast on YouTube. Interviews Tunisian founders, investors, and innovators sharing lessons from building companies in Tunisia.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: { yt: 'StartupTNPodcast', ig: 'startuptn_podcast', fb: 'StartupTNPodcast' } }),

  // ── Education & Self-Development ──────────────────────────────────────────
  m({ id: 'influencer_sami_knowledge_tn', name: 'Sami Knowledge', desc: 'Tunisian educational YouTuber sharing knowledge on science, history, and culture in Tunisian dialect. Accessible learning for all ages.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { yt: 'SamiKnowledgeTN', ig: 'samiknowledge_tn', fb: 'SamiKnowledgeTN' } }),
  m({ id: 'influencer_motivation_tn', name: 'Motivation TN', desc: 'Tunisian personal development content creator. Shares daily motivational content, productivity tips, and life coaching in Arabic for young Tunisians.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { ig: 'motivation_tn_official', tt: 'motivationtn', yt: 'MotivationTN', fb: 'MotivationTN' } }),
  m({ id: 'influencer_english_tn_teacher', name: 'English with TN', desc: 'Tunisian English language teacher with a popular YouTube channel. Makes English learning fun and relevant for Tunisian students and professionals.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { yt: 'EnglishWithTN', ig: 'english_with_tn', fb: 'EnglishWithTN' } }),
  m({ id: 'influencer_investir_tn', name: 'Investir en Tunisie', desc: 'Tunisian financial education content creator. Teaches personal finance, stock market investing, and entrepreneurship to young Tunisian professionals.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'education'], loc: T, lat: TL, lng: TG, contact: { yt: 'InvestirEnTunisie', ig: 'investir_en_tunisie', fb: 'InvestirEnTunisie' } }),
  m({ id: 'influencer_histoire_tn_yt', name: 'Histoire de Tunisie', desc: 'Tunisian history education YouTube channel covering ancient Carthage to modern Tunisia. One of the best-produced history channels in Arab digital media.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { yt: 'HistoireDeTunisie', ig: 'histoiredetunisie', fb: 'HistoireDeTunisie' } }),
  m({ id: 'influencer_psycho_tn', name: 'Psychologie TN', desc: 'Tunisian psychologist and mental health content creator. Explains psychological concepts and mental health topics in accessible Arabic for Tunisian audiences.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'psychologie_tn', yt: 'PsychologieTN', fb: 'PsychologieTN' } }),

  // ── Business & Entrepreneurship ────────────────────────────────────────────
  m({ id: 'influencer_entrepreneur_tn_page', name: 'Entrepreneur TN', desc: 'Leading Tunisian entrepreneurship community page. Shares startup news, funding opportunities, and success stories from the Tunisian startup ecosystem.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance'], loc: T, lat: TL, lng: TG, contact: { ig: 'entrepreneur_tn', fb: 'EntrepreneurTN', yt: 'EntrepreneurTN' } }),
  m({ id: 'influencer_freelance_arabe_tn', name: 'Freelance Arabe', desc: 'Tunisian content creator teaching freelancing skills to Arab professionals. Covers Upwork, Fiverr, and building a freelance career from Tunisia.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'education'], loc: T, lat: TL, lng: TG, contact: { yt: 'FreelanceArabe', ig: 'freelancearabe_tn', fb: 'FreelanceArabe' } }),
  m({ id: 'influencer_marketing_tn_pro', name: 'Marketing TN Pro', desc: 'Tunisian digital marketing expert and content creator. Helps Tunisian businesses grow their online presence with actionable social media marketing strategies.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: { ig: 'marketingtn_pro', yt: 'MarketingTNPro', fb: 'MarketingTNPro' } }),
  m({ id: 'influencer_ecommerce_tn', name: 'E-Commerce TN', desc: 'Tunisian e-commerce education channel teaching how to build and scale online businesses in Tunisia. Covers dropshipping, digital products, and local platforms.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: { yt: 'EcommerceTN', ig: 'ecommerce_tn', fb: 'EcommerceTN' } }),

  // ── Family & Parenting ─────────────────────────────────────────────────────
  m({ id: 'influencer_famille_tn_youtube', name: 'Famille Tunisienne', desc: 'Tunisian family YouTube channel sharing parenting tips, family challenges, and daily vlogs of a modern Tunisian family. Hugely popular with Tunisian parents.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting'], loc: T, lat: TL, lng: TG, featured: true, contact: { yt: 'FamilleTunisienne', ig: 'famille_tunisienne', fb: 'FamilleTunisienneYT' } }),
  m({ id: 'influencer_maman_moderne_tn', name: 'Maman Moderne TN', desc: 'Tunisian mom blogger and content creator. Shares parenting advice, baby product reviews, and balancing motherhood with a career in modern Tunisia.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting'], loc: T, lat: TL, lng: TG, contact: { ig: 'mamanmoderne_tn', fb: 'MamanModerneTN', tt: 'mamanmoderntn' } }),
  m({ id: 'influencer_papa_tn_content', name: 'Papa Tunisien', desc: 'Tunisian dad content creator sharing fatherhood from a Tunisian male perspective. Challenges gender norms and celebrates involved fatherhood in Tunisian culture.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting'], loc: T, lat: TL, lng: TG, contact: { ig: 'papa_tunisien', fb: 'PapaTunisien', tt: 'papatunisien' } }),
  m({ id: 'influencer_kids_tn_youtube', name: 'Kids TN', desc: 'Tunisian children\'s educational YouTube channel. Arabic language learning videos, nursery rhymes, and educational content for Tunisian children aged 2-8.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting', 'education'], loc: T, lat: TL, lng: TG, contact: { yt: 'KidsTNArabic', fb: 'KidsTNArabic', ig: 'kids_tn_official' } }),

  // ── Social Activism & News ─────────────────────────────────────────────────
  m({ id: 'influencer_nawaat_blog', name: 'Nawaat', desc: 'Pioneer Tunisian citizen media and investigative journalism blog. Played a key role during the 2011 revolution and remains a leading independent media voice.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'nawaat_tn', fb: 'nawaat', tt: 'nawaat_tn' } }),
  m({ id: 'influencer_inkyfada_press', name: 'inkyfada', desc: 'Tunisian data journalism and investigative media outlet. Known for in-depth investigations into corruption, environment, and human rights in Tunisia.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'inkyfada', fb: 'inkyfada', tt: 'inkyfada_press' } }),
  m({ id: 'influencer_wmc_media', name: 'WMC Tunisie', desc: 'Tunisian business and economic news media outlet. Leading source for economic analysis, investment news, and business intelligence in Tunisia.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'business_finance'], loc: T, lat: TL, lng: TG, contact: { ig: 'wmc_tunisie', fb: 'WebManagerCenter', tt: 'wmc_tunisie' } }),
  m({ id: 'influencer_kapitalis_media', name: 'Kapitalis', desc: 'Tunisian news and opinion platform covering politics, economy, and culture. One of the most-read online news outlets in Tunisia.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'kapitalis_tn', fb: 'Kapitalis', tt: 'kapitalis_tn' } }),
  m({ id: 'influencer_leaders_tn', name: 'Leaders Tunisie', desc: 'Tunisian business and leadership magazine. Covers Tunisian entrepreneurs, economic policy, and executive interviews on social and digital platforms.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'business_finance'], loc: T, lat: TL, lng: TG, contact: { ig: 'leaders_tunisie', fb: 'LeadersTunisie', tt: 'leaders_tunisie' } }),
  m({ id: 'influencer_realites_tn', name: 'Réalités Tunisie', desc: 'Historic Tunisian political and news magazine now with a strong digital presence. Covers Tunisian affairs and Arab world news with authoritative journalism.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'realites_tunisie', fb: 'RealitesTunisie', tt: 'realites_tn' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 24 (Comedy/Tech/Education/Business/Family/News) ===\n');
  let created = 0, skipped = 0;
  for (const inf of INFLUENCERS) {
    const ref = db.collection('businesses').doc(inf.id);
    const doc = await ref.get();
    if (doc.exists) { console.log(`  ~ Skipped: ${inf.name}`); skipped++; }
    else { const { id, ...data } = inf; await ref.set(data); console.log(`  + ${inf.name}`); created++; }
  }
  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}, Total: ${INFLUENCERS.length}`);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
