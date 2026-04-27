/**
 * Seed Tunisian Influencers — Batch 21
 * Musicians, singers, rappers, DJs, bands
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
  // ── Rap & Hip-Hop ─────────────────────────────────────────────────────────
  m({ id: 'influencer_balti', name: 'Balti', desc: 'Legendary Tunisian rapper who helped define the Tunisian hip-hop scene. Hit songs "Ya Lili" and "Niveau Level" have hundreds of millions of streams worldwide.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'balti_officiel', fb: 'BaltiOfficiel', yt: 'BaltiVEVO' } }),
  m({ id: 'influencer_hamzaoui_med_amine', name: 'Hamzaoui Med Amine', desc: 'Tunisian rapper and one of the most streamed Tunisian artists globally. Known for mixing rap with Tunisian folk music creating a unique genre-defying sound.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'hamzaoui_medamine', fb: 'HamzaouiMedAmine', yt: 'HamzaouiMedAmineOfficial' } }),
  m({ id: 'influencer_kafon_rap', name: 'Kafon', desc: 'Tunisian rap and R&B artist known for conscious lyrics and smooth beats. Pioneer of the modern Tunisian music scene with a massive loyal fanbase.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'kafonofficial', fb: 'KafonOfficial', yt: 'KafonOfficial' } }),
  m({ id: 'influencer_el_general_hamma', name: 'El Général', desc: 'Tunisian rapper Hamada Ben Amor known as El Général whose song "Rais Lebled" became the anthem of the Arab Spring revolution in 2010-2011.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'elgeneral_officiel', fb: 'ElGeneralOfficiel', yt: 'ElGeneralOfficiel' } }),
  m({ id: 'influencer_tunisiano_rap', name: 'Tunisiano', desc: 'Franco-Tunisian rapper and founding member of Sniper crew. One of the pioneers of French rap with strong Tunisian roots and massive following.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'tunisiano_officiel', fb: 'TunisianoOfficiel' } }),
  m({ id: 'influencer_klay_bbj', name: 'Klay BBJ', desc: 'Tunisian rapper known for raw street rap and authentic Tunisian dialect lyrics. One of the most influential voices in Tunisian underground hip-hop.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'klay_bbj', yt: 'KlayBBJOfficial' } }),
  m({ id: 'influencer_imen_montaha', name: 'Imen Montaha', desc: 'Tunisian female rapper breaking boundaries in the male-dominated Tunisian rap scene. Known for empowering lyrics and bold artistic identity.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'imen_montaha', fb: 'ImenMontaha', yt: 'ImenMontaha' } }),
  m({ id: 'influencer_kais_b_rap', name: 'Kais B', desc: 'Tunisian rapper and one of the most consistent voices in Tunisian street rap. Known for meaningful lyrics touching on Tunisian social issues.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'kais_b_official', fb: 'KaisBOfficial' } }),
  m({ id: 'influencer_weld_bled', name: 'Weld El 15', desc: 'Tunisian controversial rapper known for political rap and boundary-pushing lyrics. Gained international attention for songs addressing police brutality.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'weld_el15', yt: 'WeldEl15Official' } }),
  m({ id: 'influencer_lbenj_rap', name: 'Lbenj', desc: 'Moroccan-North African rapper with strong Tunisian following. Multiple collaborations with Tunisian artists and shared audience across the Maghreb.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'lbenj_official', fb: 'LbenjOfficial', yt: 'LbenjOfficial' } }),
  m({ id: 'influencer_saif_nabeel', name: 'Saif Nabeel', desc: 'Tunisian R&B and pop singer known for romantic songs in Tunisian dialect. Smooth vocals and catchy hooks make him popular among young Tunisian audiences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'saifnabeel_official', fb: 'SaifNabeel', yt: 'SaifNabeelOfficial' } }),

  // ── Pop & R&B ──────────────────────────────────────────────────────────────
  m({ id: 'influencer_saber_rebai', name: 'Saber Rebai', desc: 'Iconic Tunisian-Saudi pop singer known across the Arab world. Decades-long career with hit songs beloved by multiple generations of Tunisians.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'saberrebai', fb: 'SaberRebaiOfficiel' } }),
  m({ id: 'influencer_lotfi_bouchnak', name: 'Lotfi Bouchnak', desc: 'Renowned Tunisian classical and maqam singer. One of Tunisia\'s greatest vocal artists with international recognition in Arab classical music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'lotfi_bouchnak', fb: 'LotfiBouchnak' } }),
  m({ id: 'influencer_emel_mathlouthi', name: 'Emel Mathlouthi', desc: 'Tunisian singer-songwriter whose anthem "Kelmti Horra" became the voice of the Arab Spring revolution. Performs globally blending Arabic folk with electronic music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'emelmathlouthi', fb: 'EmelMathlouthi', yt: 'EmelMathlouthi' } }),
  m({ id: 'influencer_dorsaf_hamdani', name: 'Dorsaf Hamdani', desc: 'Tunisian classical singer celebrated for her interpretations of Fairuz and Arab classical repertoire. One of Tunisia\'s most respected contemporary vocalists.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'dorsafhamdani', fb: 'DorsafHamdani' } }),
  m({ id: 'influencer_sabrine_khalil', name: 'Sabrine Khalil', desc: 'Tunisian pop singer known for her powerful voice and emotional ballads. Active on social media connecting with her fanbase across North Africa.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'sabrinekhalil_official', fb: 'SabrineKhalilOfficielle', yt: 'SabrineKhalil' } }),
  m({ id: 'influencer_nadia_ben_chouikha', name: 'Nadia Ben Chouikha', desc: 'Tunisian pop singer and actress with a loyal fanbase. Known for romantic songs and collaborations with major Arab artists.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'nadiabenchouikha', fb: 'NadiaBenChouikha' } }),
  m({ id: 'influencer_riadh_fehri_music', name: 'Riadh Fehri', desc: 'Tunisian singer and media personality. Known for traditional and modern Tunisian musical compositions shared widely on social media.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'riadhfehriofficial', fb: 'RiadhFehri' } }),
  m({ id: 'influencer_oussama_jaziri_music', name: 'Oussama Jaziri Music', desc: 'Tunisian singer and social media personality blending traditional Tunisian sounds with modern pop arrangements. Active across all platforms.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'oussamajaziri_music', yt: 'OussamaJaziriMusic' } }),
  m({ id: 'influencer_walid_ftiti_music', name: 'Walid Ftiti', desc: 'Tunisian singer known for romantic pop songs. Regularly releases music across YouTube and streaming platforms with a dedicated Tunisian following.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'walidftiti_music', fb: 'WalidFtitiOfficiel', yt: 'WalidFtitiOfficial' } }),
  m({ id: 'influencer_hajer_farghal_singer', name: 'Hajer Farghal', desc: 'Tunisian singer known for emotional Arabic songs. Her YouTube releases consistently attract large audiences and she is active on multiple social platforms.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'hajerfarghal', fb: 'HajerFarghal', yt: 'HajerFarghalOfficial' } }),

  // ── Traditional & World Music ─────────────────────────────────────────────
  m({ id: 'influencer_fawzi_ben_gamra', name: 'Fawzi Ben Gamra', desc: 'Tunisian oud master and composer. Ambassador of Tunisian and Arab classical music internationally with performances at prestigious world music festivals.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'fawzibengamra', fb: 'FawziBenGamra' } }),
  m({ id: 'influencer_sonia_mbarek', name: 'Sonia M\'barek', desc: 'Internationally acclaimed Tunisian singer specializing in Andalusian and Malouf classical music. Represents Tunisian cultural heritage on the world stage.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'soniambarek_officiel', fb: 'SoniaMbarek' } }),
  m({ id: 'influencer_dhafer_youssef_oud', name: 'Dhafer Youssef', desc: 'Internationally acclaimed Tunisian oud player, vocalist, and composer based in Europe. Fusion of jazz, electronic, and Sufi music with a global fanbase.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'dhaferyoussef', fb: 'DhaferYoussef' } }),
  m({ id: 'influencer_belgacem_houissa', name: 'Belgacem Houissa', desc: 'Tunisian traditional singer from the Saharan south. Specializes in Stambali and traditional Tunisian music, ambassador of southern Tunisian heritage.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { fb: 'BelgacemHouissa', yt: 'BelgacemHouissa' } }),

  // ── DJ & Electronic ───────────────────────────────────────────────────────
  m({ id: 'influencer_dj_khaled_tn', name: 'DJ Slim TN', desc: 'One of Tunisia\'s most booked DJs. Plays major festivals and private events across Tunisia and shares mixing sessions on social media.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'djslimtn', fb: 'DJSlimTN' } }),
  m({ id: 'influencer_dj_yoyo_tn', name: 'DJ Yoyo', desc: 'Tunisian DJ and music producer. Known for energetic sets at Tunisian club nights, festivals, and his original electronic productions.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'djyoyo_tn', fb: 'DJYoyoTunisie', yt: 'DJYoyoTN' } }),
  m({ id: 'influencer_dj_zina_tn', name: 'DJ Zina', desc: 'Tunisian female DJ breaking gender norms in the electronic music scene. Active social media personality promoting inclusivity in Tunisian nightlife.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'djzina_tn', tt: 'djzina_tn' } }),
  m({ id: 'influencer_dj_lucky_tn', name: 'DJ Lucky', desc: 'Prolific Tunisian DJ and music producer known for popular Tunisian pop remixes and live festival performances across the country.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'dj_lucky_tn', fb: 'DJLuckyTN', yt: 'DJLuckyTNOfficial' } }),

  // ── Bands ─────────────────────────────────────────────────────────────────
  m({ id: 'influencer_wled_bled_band', name: 'Wled Bled', desc: 'Tunisian musical group blending Tunisian folk rhythms with modern production. Their catchy fusion sound has earned a devoted following across North Africa.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'wledbled_official', fb: 'WledBled', yt: 'WledBledOfficial' } }),
  m({ id: 'influencer_swab_band_tn', name: 'Swab', desc: 'Tunisian alternative rock band mixing Arabic poetry with rock music. Pioneer of the Tunisian alternative music scene with a passionate underground following.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'swab_official', fb: 'SwabBand', yt: 'SwabOfficial' } }),
  m({ id: 'influencer_ala_ghali_band', name: 'Ala Ghali', desc: 'Tunisian band popular for their energetic live shows and crossover sound mixing Tunisian traditional elements with modern pop production.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'alaghali_official', fb: 'AlaGhali', yt: 'AlaGhaliOfficial' } }),

  // ── Music Media ───────────────────────────────────────────────────────────
  m({ id: 'influencer_music_tn_page', name: 'Music Tunisie', desc: 'The leading Tunisian music news and media page. Covers releases, concerts, awards, and interviews with Tunisian artists across all platforms.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'music_tunisie', fb: 'MusicTunisie', yt: 'MusicTunisie' } }),
  m({ id: 'influencer_nocturne_music_tn', name: 'Nocturne Music', desc: 'Tunisian music production and media company releasing emerging Tunisian talent. Their YouTube channel is a launchpad for new Tunisian music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { yt: 'NocturneMusic', ig: 'nocturne_music_tn', fb: 'NocturneMusicTN' } }),
  m({ id: 'influencer_gold_music_tn', name: 'Gold Music TN', desc: 'Tunisian music label and YouTube channel known for releasing classic Tunisian pop and chaabi music to online audiences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { yt: 'GoldMusicTN', fb: 'GoldMusicTunisie' } }),
  m({ id: 'influencer_mazaj_music_tn', name: 'Mazaj Music', desc: 'Tunisian music entertainment channel on YouTube featuring exclusive live sessions, music videos, and interviews with Tunisian artists.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { yt: 'MazajMusicTN', ig: 'mazajmusic_tn', fb: 'MazajMusic' } }),
  m({ id: 'influencer_top_music_tn', name: 'Top Music TN', desc: 'Tunisian music channel sharing top charting Arabic and Tunisian songs. One of the most subscribed Tunisian music YouTube channels.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { yt: 'TopMusicTN', fb: 'TopMusicTunisie' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 21 (Musicians) ===\n');
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
