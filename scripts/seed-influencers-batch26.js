/**
 * Seed Tunisian Influencers — Batch 26
 * More real Tunisian celebrities: footballers, singers, politicians, academics, artists
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

const INFLUENCERS = [
  // ── Footballers ───────────────────────────────────────────────────────────
  m({ id: 'influencer_hamza_rafia', name: 'Hamza Rafia', desc: 'Tunisian midfielder who played for Juventus and LOSC Lille. One of the youngest Tunisian players to shine in European football with a large social following.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'hamzarafia', fb: 'HamzaRafia', tt: 'hamzarafia' } }),
  m({ id: 'influencer_ferjani_sassi', name: 'Ferjani Sassi', desc: 'Tunisian attacking midfielder who played in Belgium and UAE. Key Tunisian national team player known for his powerful long-range shots and free kicks.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'ferjanisassi', fb: 'FerjaniSassi' } }),
  m({ id: 'influencer_mortadha_ben_ouanes', name: 'Mortadha Ben Ouanes', desc: 'Tunisian winger playing in North African and Gulf leagues. Rapid attacking player with strong social media presence and fan engagement in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'mortadhabenouanes', fb: 'MortadhaBenOuanes' } }),
  m({ id: 'influencer_ali_ben_romdhane_tn', name: 'Ali Ben Romdhane', desc: 'Young Tunisian professional footballer playing in European leagues. His career trajectory and personality have built him a devoted fan following on social media.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'alibenromdhane', tt: 'ali_benromdhane' } }),
  m({ id: 'influencer_oussama_haddadi', name: 'Oussama Haddadi', desc: 'Tunisian left-back who played for Dijon in Ligue 1. International defender with substantial fan following and active social media presence.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'oussama_haddadi', fb: 'OussamaHaddadi' } }),
  m({ id: 'influencer_yassine_chikhaoui', name: 'Yassine Chikhaoui', desc: 'Former Tunisian international and Swiss Super League star. Retired but very active on social media as a football pundit and brand ambassador.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'yassinechikhaoui', fb: 'YassineChikhaoui' } }),
  m({ id: 'influencer_rami_bedoui', name: 'Rami Bedoui', desc: 'Tunisian goalkeeper playing in the domestic league. Popular personality among Tunisian football fans sharing goalkeeping content and match experiences.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: SO, lat: SOL, lng: SOG, contact: { ig: 'ramibedoui_gk', fb: 'RamiBedoui' } }),
  m({ id: 'influencer_club_africain_tn', name: 'Club Africain', desc: 'One of Tunisia\'s most popular football clubs with millions of fans. Their official social media pages are among the most followed sports accounts in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'clubafricain_officiel', fb: 'ClubAfricainOfficiel', tt: 'clubafricain_ca' } }),
  m({ id: 'influencer_esperance_tn_club', name: 'Espérance Sportive de Tunis', desc: 'Tunisia\'s most successful football club with record CAF Champions League titles. Their social media platforms have the largest sports following in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'esperancest', fb: 'EsperanceSportiveDeTunis', tt: 'esperancest' } }),
  m({ id: 'influencer_etoile_du_sahel_tn', name: 'Étoile du Sahel', desc: 'Historic Tunisian football club from Sousse. Multiple CAF Champions League winners with a passionate supporter base and large social media following.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: SO, lat: SOL, lng: SOG, featured: true, contact: { ig: 'etoiledusahel', fb: 'EtoileDuSahel', tt: 'etoiledusahel' } }),
  m({ id: 'influencer_css_sfax_club', name: 'CS Sfaxien', desc: 'Sfax\'s premier football club and one of the oldest in Tunisia. Strong fan base across Tunisia and North Africa following their Ligue 1 and continental campaigns.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: S, lat: SL, lng: SG, contact: { ig: 'cs_sfaxien_officiel', fb: 'CSSfaxien', tt: 'cssfaxien' } }),
  m({ id: 'influencer_fat_football_tn', name: 'FAT Tunisie', desc: 'Official social media of the Tunisian Football Federation. Covers all national team news, match updates, and Tunisian football development programs.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'fat_tunisie', fb: 'FATTunisie', tt: 'fat_tunisie' } }),

  // ── Musicians & Singers ────────────────────────────────────────────────────
  m({ id: 'influencer_takfarinas_music', name: 'Mohamed Wali', desc: 'Tunisian pop singer and music video star with catchy Tunisian pop hits. Regular releases on YouTube with strong streaming numbers across North Africa.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'mohamedwali_music', fb: 'MohamedWaliOfficial', yt: 'MohamedWaliOfficial' } }),
  m({ id: 'influencer_khaled_mabrouk_music', name: 'Khaled Mabrouk', desc: 'Tunisian singer known for romantic pop songs in both Arabic and French. His music straddles the Mediterranean identity of Tunisia with a devoted fanbase.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'khaledmabrouk_music', fb: 'KhaledMabrouk', yt: 'KhaledMabroukOfficial' } }),
  m({ id: 'influencer_linda_tn_singer', name: 'Linda', desc: 'Tunisian pop singer beloved for her upbeat and feel-good music. Her cheerful personality on social media has built her a massive following particularly among young Tunisians.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'linda_tunisienne', fb: 'LindaTunisienne', yt: 'LindaOfficielle' } }),
  m({ id: 'influencer_syrine_abdennour', name: 'Syrine Abdennour', desc: 'Tunisian actress and singer who has built a strong following through her combination of TV drama roles and music releases. One of the rising multi-talented stars.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'syrineabdennour', fb: 'SyrineAbdennour', tt: 'syrineabdennour' } }),
  m({ id: 'influencer_houssem_karoui_music', name: 'Houssem Karoui', desc: 'Tunisian singer who gained fame through Arab Idol. His powerful voice and loyal fanbase made him one of the most recognized Tunisian singers of his generation.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'houssemkaroui', fb: 'HoussemKarouiOfficiel', yt: 'HoussemKarouiOfficiel' } }),
  m({ id: 'influencer_zied_gharsa_music', name: 'Zied Gharsa', desc: 'Master of Tunisian classical Malouf music. His performances at major international festivals and his Instagram presence keep this ancient tradition alive for new generations.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'zied_gharsa', fb: 'ZiedGharsa' } }),
  m({ id: 'influencer_amel_bent_tn', name: 'Amel Bent', desc: 'Franco-Tunisian R&B and pop singer with major career in French music. Known for hits like "Ma philosophie". One of the most famous French singers of Tunisian origin.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'amelbent', fb: 'AmelBentOfficiel', tt: 'amelbentoff' } }),
  m({ id: 'influencer_lazhar_lahmar_music', name: 'Lazhar Lahmar', desc: 'Traditional Tunisian singer specializing in maluf and mezoued folk music. Keeper of Tunisian musical heritage with a loyal traditional music following.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { fb: 'LazharLahmarOfficial', ig: 'lazharlahmar_music' } }),
  m({ id: 'influencer_maher_zain_tn', name: 'Maher Zain', desc: 'Swedish-Tunisian Islamic pop singer known worldwide for devotional songs. His songs are among the most listened Islamic music globally with tens of millions of fans.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'maherzainofficial', fb: 'MaherZain', yt: 'MaherZain', tt: 'maherzain' } }),

  // ── Actors & TV ──────────────────────────────────────────────────────────
  m({ id: 'influencer_ahmed_landolsi', name: 'Ahmed Landolsi', desc: 'Tunisian comedian and TV presenter known for his popular Ramadan comedy series. One of the most beloved figures in Tunisian television comedy.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'ahmedlandolsi', fb: 'AhmedLandolsi' } }),
  m({ id: 'influencer_ons_jabeur_sister', name: 'Waad Jabeur', desc: 'Tunisian TV presenter and personality, known in Tunisian media circles. Active on social media covering cultural and entertainment events in Tunisia.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: M, lat: ML, lng: MG, contact: { ig: 'waadjabeur', fb: 'WaadJabeur' } }),
  m({ id: 'influencer_kenza_mrad', name: 'Kenza Mrad', desc: 'Tunisian actress and rising social media influencer. Gained following through television drama roles and her authentic lifestyle content on Instagram and TikTok.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'kenzamrad_officiel', fb: 'KenzaMrad', tt: 'kenzamrad' } }),
  m({ id: 'influencer_zina_slatnia', name: 'Zina Slatnia', desc: 'Tunisian-Algerian actress known for French-language film and TV roles. Represents Maghrebi talent in European cinema with a strong social media presence.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'zinaslatnia', fb: 'ZinaSlatnia' } }),

  // ── Political & Civic ─────────────────────────────────────────────────────
  m({ id: 'influencer_amira_yahyaoui_tn', name: 'Amira Yahyaoui', desc: 'Tunisian human rights activist, tech entrepreneur, and UNESCO prize winner. Founder of Bsoins and champion of digital rights and youth empowerment in Tunisia.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'tech_gaming'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'amirayahyaoui', fb: 'AmiraYahyaoui', tt: 'amirayahyaoui' } }),
  m({ id: 'influencer_slim_amamou', name: 'Slim Amamou', desc: 'Tunisian hacktivist, former government minister, and tech activist. A symbolic figure of the Tunisian revolution and digital freedom movement.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'tech_gaming'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'slim404', fb: 'slim.amamou', tt: 'slim404' } }),
  m({ id: 'influencer_ala_chebbi_tn', name: 'Alaa Chebbi', desc: 'Tunisian journalist and Al Hiwar Ettounsi TV host. One of the most recognizable faces in Tunisian television journalism with millions of viewers.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'alaachebbi_officiel', fb: 'AlaaChebbi', tt: 'alaachebbi' } }),
  m({ id: 'influencer_imen_ben_mohamed', name: 'Imen Ben Mohamed', desc: 'Tunisian journalist and news anchor. Known for live political coverage and sharp analysis of Tunisian current affairs on major Tunisian TV channels.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'imen_ben_med', fb: 'ImenBenMohamed' } }),

  // ── Business & Finance ─────────────────────────────────────────────────────
  m({ id: 'influencer_marouane_ben_miled', name: 'Marouane Ben Miled', desc: 'Tunisian entrepreneur and co-founder of major Tunisian fintech. Active speaker on the startup circuit sharing insights on building businesses in emerging markets.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance'], loc: T, lat: TL, lng: TG, contact: { ig: 'marouan_benmiled', fb: 'MarouaneBenMiled', tt: 'marouan_benmiled' } }),
  m({ id: 'influencer_yosr_dkhil_coach', name: 'Yosr Dkhil', desc: 'Tunisian certified life coach and personal development influencer. Her coaching content on LinkedIn and Instagram has built her a strong professional following.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance', 'education'], loc: T, lat: TL, lng: TG, contact: { ig: 'yosr_dkhil', fb: 'YosrDkhil', web: 'linkedin.com/in/yosrdkhil' } }),
  m({ id: 'influencer_amine_tn_finance', name: 'Amine Finance TN', desc: 'Tunisian personal finance educator. Shares practical money management tips, investment basics, and financial literacy content for the Tunisian middle class.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance'], loc: T, lat: TL, lng: TG, contact: { ig: 'amine_finance_tn', yt: 'AmineFinanceTN', fb: 'AmineFinanceTN' } }),

  // ── Science & Academia ────────────────────────────────────────────────────
  m({ id: 'influencer_dr_med_tn_youtube', name: 'Dr Med TN', desc: 'Tunisian medical doctor and health educator on YouTube and Instagram. Explains complex medical topics in accessible Arabic for Tunisian patients and families.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: { yt: 'DrMedTN', ig: 'dr_med_tn', fb: 'DrMedTN' } }),
  m({ id: 'influencer_astrophysics_tn', name: 'Astronomie Tunisie', desc: 'Tunisian astronomy and astrophysics educator. Shares stunning space images with Arabic explanations making science accessible to Tunisian students.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { ig: 'astronomie_tunisie', fb: 'AstronomieTunisie', yt: 'AstronomieTunisie' } }),
  m({ id: 'influencer_geology_tn', name: 'Géologie Tunisie', desc: 'Tunisian geology and earth science educator documenting the country\'s diverse terrain from Sahara dunes to the Atlas Mountains through educational social content.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'travel'], loc: T, lat: TL, lng: TG, contact: { ig: 'geologie_tunisie', fb: 'GeologieTunisie', yt: 'GeologieTunisie' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 26 ===\n');
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
