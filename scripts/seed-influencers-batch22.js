/**
 * Seed Tunisian Influencers — Batch 22
 * Actors, TV presenters, journalists, media personalities, filmmakers
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

const INFLUENCERS = [
  // ── Actresses ─────────────────────────────────────────────────────────────
  m({ id: 'influencer_hend_sabry', name: 'Hend Sabry', desc: 'Internationally acclaimed Tunisian actress, UNICEF goodwill ambassador, and one of the biggest names in Arab cinema. Massive social media following across the Arab world.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'hendsabry', fb: 'HendSabryOfficialPage', tt: 'hendsabry' } }),
  m({ id: 'influencer_dorra_zarrouk', name: 'Dorra Zarrouk', desc: 'Tunisian actress and model, one of the most recognizable faces in Tunisian and Arab entertainment. Very active on Instagram with millions of followers.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'dorra_zarrouk', fb: 'DorraZarrouk' } }),
  m({ id: 'influencer_soumaya_maannou', name: 'Soumaya Mâannou', desc: 'Tunisian actress and social media personality known for her roles in popular Tunisian TV dramas and her vibrant Instagram presence.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'soumaya_maannou', fb: 'SoumayaMaannou' } }),
  m({ id: 'influencer_raja_ben_ammar', name: 'Raja Ben Ammar', desc: 'Iconic Tunisian actress with a career spanning several decades. Pioneer of Tunisian cinema and television with a legendary status in the industry.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: { fb: 'RajaBenAmmarActress', ig: 'rajabenammar_officiel' } }),
  m({ id: 'influencer_mariam_fazani', name: 'Mariam Fazani', desc: 'Tunisian actress known for her work in Ramadan dramas. Very active on Instagram and TikTok sharing acting projects and personal lifestyle content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'mariamfazani', fb: 'MariamFazani', tt: 'mariamfazani' } }),
  m({ id: 'influencer_yosra_tn_actress', name: 'Yosra', desc: 'Tunisian-Egyptian actress known across the Arab world. One of the biggest stars to emerge from Tunisia and make it in pan-Arab cinema and television.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'yosra_official', fb: 'YosraOfficial' } }),
  m({ id: 'influencer_fatma_ben_saidane', name: 'Fatma Ben Saïdane', desc: 'Prominent Tunisian actress and theatre performer. Known for powerful dramatic roles and strong social media engagement with fans.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'fatmabensaidane', fb: 'FatmaBenSaidane' } }),
  m({ id: 'influencer_nour_mehrez', name: 'Nour Mehrez', desc: 'Young Tunisian actress and content creator gaining visibility through TV roles and active social media presence in fashion and lifestyle.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'nourmehrez', fb: 'NourMehrez', tt: 'nourmehrez' } }),
  m({ id: 'influencer_amel_karboul', name: 'Amel Karboul', desc: 'Tunisian actress and voice actress active in TV productions. Shares behind-the-scenes content and personal moments with a dedicated fan following.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'amel_karboul_actress', fb: 'AmelKarboul' } }),
  m({ id: 'influencer_sabrine_ben_othman', name: 'Sabrine Ben Othman', desc: 'Tunisian actress popular for her roles in Tunisian Ramadan series. Known for versatile acting and active engagement on social platforms.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'sabrine_benothman', fb: 'SabrineBenOthman' } }),

  // ── Actors ────────────────────────────────────────────────────────────────
  m({ id: 'influencer_jamel_sghair', name: 'Jamel Sghair', desc: 'Beloved Tunisian comedian and actor known for his iconic character portrayals. A staple of Tunisian comedy television for decades.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: { fb: 'JamelSghairOfficial', ig: 'jamel_sghair_official' } }),
  m({ id: 'influencer_zied_ayadi', name: 'Zied Ayadi', desc: 'Tunisian actor and comedian known for his comedic timing in TV shows. Very active on social media sharing comedy sketches and behind-the-scenes content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'zied_ayadi', fb: 'ZiedAyadi', tt: 'ziedayadi' } }),
  m({ id: 'influencer_mokhtar_laajimi', name: 'Mokhtar Laajimi', desc: 'Veteran Tunisian actor with an extensive career in cinema and television. His dramatic performances have made him one of the most respected Tunisian actors.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { fb: 'MokhtarLaajimi', ig: 'mokhtar_laajimi' } }),
  m({ id: 'influencer_hassen_ben_miled', name: 'Hassen Ben Miled', desc: 'Tunisian actor known for dramatic roles in major Tunisian television productions. Active on social media sharing his work and personal reflections.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'hassenbenmiled', fb: 'HassenBenMiled' } }),
  m({ id: 'influencer_slah_msaddak', name: 'Slah Msaddak', desc: 'Tunisian actor and director known for both comedic and dramatic roles. Shares insights into the Tunisian arts scene on social media.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'slahmsaddak', fb: 'SlahMsaddak' } }),
  m({ id: 'influencer_najib_belkadhi', name: 'Najib Belkadhi', desc: 'Tunisian actor and filmmaker. Best known for his lead role in the award-winning film "Bastardo". Active voice in Tunisian cultural life on social media.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'najibbelkadhi', fb: 'NajibBelkadhi' } }),
  m({ id: 'influencer_omar_lotfi_actor', name: 'Omar Lotfi', desc: 'Franco-Tunisian actor known for French and international film roles. Brings Tunisian identity to French cinema and TV with a strong social presence.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'omar_lotfi', fb: 'OmarLotfiActor' } }),

  // ── TV Presenters & Journalists ───────────────────────────────────────────
  m({ id: 'influencer_rim_namani', name: 'Rim Namani', desc: 'Tunisian TV journalist and political news presenter. Known for sharp interviews and political analysis on major Tunisian TV channels.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'rimnamani', fb: 'RimNamani' } }),
  m({ id: 'influencer_lassad_ben_hamed', name: 'Lassad Ben Hamed', desc: 'Tunisian TV presenter and political commentator. Regular face on major Tunisian channels and widely followed on social media for his analysis.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'lassadbenhamed', fb: 'LassadBenHamed' } }),
  m({ id: 'influencer_moez_ben_gharbia', name: 'Moez Ben Gharbia', desc: 'Tunisian journalist working with Al Jazeera and international media. Covers North African and Arab world news with a wide international following.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'moezbengharbiatv', fb: 'MoezBenGharbia', tt: 'moezbengharbiatv' } }),
  m({ id: 'influencer_samira_ben_said', name: 'Samira Ben Saïd', desc: 'Tunisian TV presenter and media personality. Known for entertainment and cultural programs on major Tunisian channels with active social media.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'samirabensaid_tv', fb: 'SamiraBenSaid' } }),
  m({ id: 'influencer_myriam_ben_ghali', name: 'Myriam Ben Ghali', desc: 'Tunisian TV presenter and influencer known for her style and charisma on screen. Very popular on Instagram sharing fashion and lifestyle content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'myriambenghali', fb: 'MiriamBenGhali', tt: 'myriambenghali' } }),
  m({ id: 'influencer_naoufel_ouertani', name: 'Naoufel Ouertani', desc: 'Tunisian journalist and political analyst. Strong voice in Tunisian media covering post-revolution politics and social issues.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'naoufelouertani', fb: 'NaoufelOuertani' } }),
  m({ id: 'influencer_salwa_ben_salah', name: 'Salwa Ben Salah', desc: 'Tunisian television presenter known for cultural and entertainment shows. Shares personal content and professional updates with her large following.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'salwabensalah_tn', fb: 'SalwaBenSalah' } }),
  m({ id: 'influencer_bochra_belhaj', name: 'Bochra Belhaj Hmida', desc: 'Tunisian lawyer, feminist activist, and political figure. Prominent voice for women\'s rights and social justice in Tunisia with strong public following.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'bochrabelhajhmida', fb: 'BochraBelhajHmida' } }),
  m({ id: 'influencer_elyes_gharbi', name: 'Elyes Gharbi', desc: 'Tunisian journalist and TV anchor. Covers politics, economics, and social affairs on major Tunisian broadcasting networks.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'elyesgharbi', fb: 'ElyesGharbi' } }),
  m({ id: 'influencer_hajer_belhaj_tv', name: 'Hajer Belhaj', desc: 'Tunisian TV presenter and lifestyle influencer. Known for her warmth on screen and active content creation around fashion, parenting, and Tunisian culture.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'hajerbelhaj_tv', fb: 'HajerBelhaj', tt: 'hajerbelhaj' } }),

  // ── Filmmakers & Directors ────────────────────────────────────────────────
  m({ id: 'influencer_ala_eddine_slim', name: 'Ala Eddine Slim', desc: 'Tunisian avant-garde filmmaker whose film "The Last of Us" won major international awards. A bold voice in contemporary African and Arab cinema.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'alaeddineslim', fb: 'AlaEddineSilm' } }),
  m({ id: 'influencer_sarra_abidi', name: 'Sarra Abidi', desc: 'Tunisian contemporary artist and video art creator. Her installations have been exhibited internationally making her one of Tunisia\'s most recognized contemporary artists.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'sarraabidi', fb: 'SarraAbidi' } }),
  m({ id: 'influencer_ghassen_ben_hamda', name: 'Ghassen Ben Hamda', desc: 'Tunisian short film director and content creator. One of the new wave of Tunisian digital filmmakers finding global audiences through online platforms.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'ghassenbenhamda', yt: 'GhassenBenHamda' } }),
  m({ id: 'influencer_nadia_ben_rachid', name: 'Nadia Ben Rachid', desc: 'Tunisian actress and content creator active in Tunisian web series and digital content. Growing social media following among Tunisian youth.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'nadia_benrachid', fb: 'NadiaBenRachid', tt: 'nadiabenrachid' } }),
  m({ id: 'influencer_abbes_mimi', name: 'Abbes Mimi', desc: 'Tunisian comedian and content creator known for short skits and reaction videos. A fan favourite among Tunisian social media users for his humour.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'abbes_mimi_tn', fb: 'AbbesMimi', tt: 'abbesmimi' } }),
  m({ id: 'influencer_youssef_kerkeni', name: 'Youssef Kerkeni', desc: 'Tunisian comedy actor and YouTube content creator. His viral skits about Tunisian daily life have earned him millions of views online.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'youssefkerkeni', yt: 'YoussefKerkeni', fb: 'YoussefKerkeni' } }),
  m({ id: 'influencer_hazem_ben_arfa_media', name: 'Hazem Ben Arfa', desc: 'Tunisian sports journalist and media personality covering football. Very popular among Tunisian football fans for his expert analysis and commentary.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'hazembenarfa_media', fb: 'HazemBenArfa' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 22 (Actors & Media) ===\n');
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
