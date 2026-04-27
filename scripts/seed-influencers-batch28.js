/**
 * Seed Tunisian Influencers — Batch 28
 * More real celebrities: footballers (incl. European stars), musicians, models, actors
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
  // ── Top European-Based Tunisian Footballers ────────────────────────────────
  m({ id: 'influencer_wissem_ben_yedder', name: 'Wissem Ben Yedder', desc: 'French-Tunisian striker who played for AS Monaco and Sevilla FC. One of the most prolific scorers in Ligue 1 and a Tunisian national team legend with a massive global fanbase.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: M, lat: ML, lng: MG, featured: true, contact: { ig: 'wessimbenyedder', fb: 'WissemBenYedder', tt: 'wessimbenyedder' } }),
  m({ id: 'influencer_adam_masina', name: 'Adam Masina', desc: 'Tunisian-Italian left-back who played for Watford and Udinese. Represents Tunisia internationally and is one of the most recognizable Tunisian players in European football.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'adammasina27', fb: 'AdamMasinaOfficial', tt: 'adammasina' } }),
  m({ id: 'influencer_nizar_trabelsi', name: 'Nizar Trabelsi', desc: 'Former Tunisian professional footballer who played for Borussia Dortmund and the Belgian league. Legendary figure in Tunisian football history.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'nizartrabelsi', fb: 'NizarTrabelsi' } }),
  m({ id: 'influencer_oussama_darragi', name: 'Oussama Darragi', desc: 'Tunisian midfielder who played in Belgium and the Tunisian domestic league. Regular presence in the national team with a loyal following among Tunisian football fans.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'oussamadarragi', fb: 'OussamaDarragi' } }),
  m({ id: 'influencer_khaled_mouelhi', name: 'Khaled Mouelhi', desc: 'Tunisian football legend and former Espérance de Tunis captain. Retired but extremely active on social media as a football pundit and brand ambassador in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'khaledmouelhi', fb: 'KhaledMouelhi' } }),
  m({ id: 'influencer_riadh_bouazizi', name: 'Riadh Bouazizi', desc: 'Tunisian football coach who managed Espérance de Tunis and Saudi clubs. Highly followed for his football insights and coaching philosophy shared on social media.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'riadhbouazizi_coach', fb: 'RiadhBouazizi' } }),
  m({ id: 'influencer_ben_romdhane_moh', name: 'Mohamed Ben Romdhane', desc: 'Young Tunisian footballer making waves in the European leagues. Active on social media documenting his professional journey and engaging with fans.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'mohamedbenromdhane', tt: 'mohamedbenromdhane' } }),
  m({ id: 'influencer_wissem_abdi', name: 'Wissem Abdi', desc: 'Tunisian professional footballer. Active on social media sharing football life, training content, and national team campaign moments with supporters.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'wissemabdi_official', fb: 'WissemAbdi' } }),

  // ── Models & Fashion Industry ──────────────────────────────────────────────
  m({ id: 'influencer_kenza_fourati', name: 'Kenza Fourati', desc: 'International Tunisian supermodel who has appeared in Sports Illustrated Swimsuit and major global fashion campaigns. One of Tunisia\'s most internationally recognized faces.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'kenzafourati', fb: 'KenzaFouratiModel', tt: 'kenzafourati' } }),
  m({ id: 'influencer_afef_jnifen', name: 'Afef Jnifen', desc: 'Legendary Tunisian supermodel and TV personality who had a celebrated international career in Italian media. Pioneer for Tunisian women in international fashion.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'afefjnifen', fb: 'AfefJnifen' } }),
  m({ id: 'influencer_rawya_tn_model', name: 'Rawya Ben Messaoud', desc: 'Tunisian fashion model and beauty influencer with growing international recognition. Shares editorial content, fashion campaigns, and personal lifestyle on Instagram.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'rawya_benmessaoud', fb: 'RawyaBenMessaoud' } }),
  m({ id: 'influencer_chaima_tn_model', name: 'Chaima Model TN', desc: 'Tunisian model and Instagram influencer known for elegant fashion content. Works with Tunisian designers and international brands with a strong social media following.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'chaima_model_tn', tt: 'chaima_model_tn', fb: 'ChaimaModelTN' } }),

  // ── Musicians (More) ───────────────────────────────────────────────────────
  m({ id: 'influencer_cheb_bilel', name: 'Cheb Bilel', desc: 'Popular Tunisian chaabi and pop singer. His catchy love songs in Tunisian dialect have earned him millions of streams and a devoted fanbase across North Africa.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'cheb_bilel_officiel', fb: 'ChebBilelOfficiel', yt: 'ChebBilelOfficial' } }),
  m({ id: 'influencer_cheb_houssem', name: 'Cheb Houssem', desc: 'Tunisian chaabi singer known for romantic songs mixing traditional Tunisian music with modern pop elements. Very popular on YouTube and social media.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'chebhoussem_official', fb: 'ChebHoussemOfficiel', yt: 'ChebHoussemOfficial' } }),
  m({ id: 'influencer_bilel_tacchini', name: 'Bilel Tacchini', desc: 'Tunisian rap and trap artist known for his fast-paced delivery and street authenticity. One of the rising stars of the new generation of Tunisian hip-hop.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'bilel_tacchini', tt: 'bileltacchini', yt: 'BilelTacchini' } }),
  m({ id: 'influencer_nessyou_music', name: 'Nessyou', desc: 'Tunisian rapper and drill music artist. Part of the new wave of Tunisian urban music artists gaining recognition on digital platforms across the Arab world.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'nessyou_official', tt: 'nessyou', yt: 'NessyouOfficial' } }),
  m({ id: 'influencer_lil_souissi', name: 'Lil Souissi', desc: 'Tunisian trap and rap artist from Sousse. His unique blend of Tunisian street culture and international trap music has built him a loyal youth following.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: SO, lat: SOL, lng: SOG, contact: { ig: 'lilsouissi', tt: 'lil_souissi', yt: 'LilSouissiOfficial' } }),
  m({ id: 'influencer_blo_music_tn', name: 'Blo', desc: 'Tunisian rapper known for provocative lyrics and consistent music releases. One of the most talked-about artists in the underground Tunisian rap scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'blo_tn', tt: 'blo_tn', yt: 'BloTNOfficial' } }),
  m({ id: 'influencer_bendir_man', name: 'Bendir Man', desc: 'Tunisian satirical musician and comedian whose song parodies mock political figures and social issues. His viral YouTube videos make him one of Tunisia\'s most unique entertainers.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'bendirman_officiel', fb: 'BendirMan', yt: 'BendirManOfficial' } }),
  m({ id: 'influencer_zouhir_bahri', name: 'Zouhair Bahri', desc: 'Tunisian blogger and web activist turned entertainer. Known for provocative social commentary and a massive Facebook following making him one of the most read Tunisians online.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'zouhairbahri', fb: 'ZouhairBahri', tt: 'zouhairbahri' } }),
  m({ id: 'influencer_melek_tn_singer', name: 'Melek Mathlouthi', desc: 'Young Tunisian singer and vocal talent who rose to fame through Arab Idol. Her powerful voice and charming personality have gained her a devoted Tunisian following.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'melekmathlouthi', fb: 'MelekMathlouthi', yt: 'MelekMathlouthiOfficial' } }),
  m({ id: 'influencer_wassim_tn_singer', name: 'Wassim', desc: 'Tunisian pop singer known for romantic Arabic songs. Regular releases on YouTube with strong performance on digital streaming platforms across the Arab world.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'wassim_singer_tn', fb: 'WassimSinger', yt: 'WassimOfficial' } }),

  // ── Actors & TV ───────────────────────────────────────────────────────────
  m({ id: 'influencer_amir_aati', name: 'Amir Aati', desc: 'Popular Tunisian actor known for comedy roles in Tunisian TV series. His natural comedic talent and warm persona have earned him a large fanbase on social media.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'amiraati_official', fb: 'AmirAati', tt: 'amiraati' } }),
  m({ id: 'influencer_ines_mabrouk', name: 'Ines Mabrouk', desc: 'Tunisian actress and content creator known for her roles in Tunisian drama productions. Shares acting work and personal lifestyle content with her followers.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'inesmabrouk_officielle', fb: 'InesMabrouk', tt: 'inesmabrouk' } }),
  m({ id: 'influencer_ahmed_hafiane', name: 'Ahmed Hafiane', desc: 'Veteran Tunisian actor with decades of experience in film and television. His nuanced performances have made him a beloved and respected figure in Tunisian arts.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'ahmedhafiane_actor', fb: 'AhmedHafiane' } }),
  m({ id: 'influencer_taha_tn_actor', name: 'Taha Tn', desc: 'Young Tunisian actor and content creator blending digital content with TV acting. Rising star active across all social platforms with a youthful following.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'taha_tn_actor', tt: 'taha_tn', fb: 'TahaTN' } }),
  m({ id: 'influencer_rym_ben_messaoud', name: 'Rym Ben Messaoud', desc: 'Tunisian actress and social media influencer. Known for her dramatic roles and candid personal content that connects her with a wide Tunisian audience.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'rymbenmessaoud', fb: 'RymBenMessaoud', tt: 'rymbenmessaoud' } }),

  // ── Olympic & Paralympic Heroes ────────────────────────────────────────────
  m({ id: 'influencer_ons_benhania', name: 'Oussama Ben Hania', desc: 'Tunisian Paralympic swimmer and multiple gold medalist. One of Tunisia\'s most decorated Paralympic athletes inspiring a generation with his incredible story.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'oussamabenhania_official', fb: 'OussamaBenHania' } }),
  m({ id: 'influencer_rihab_elloumi', name: 'Rihab Elloumi', desc: 'Tunisian Paralympic swimmer and world champion. Her gold medals at the IPC World Championships made her a national hero and inspiration for Tunisian youth.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'rihabelloumi_para', fb: 'RihabElloumi' } }),
  m({ id: 'influencer_walid_ktila', name: 'Walid Ktila', desc: 'Tunisian Paralympic sprinter and multiple world champion in T34 class. His speed records and championship titles have made him a global icon of Paralympic sport.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'walidktila_official', fb: 'WalidKtila' } }),
  m({ id: 'influencer_yassine_guenichi', name: 'Yassine Guenichi', desc: 'Tunisian Paralympic athlete competing in shot put and discus. Multiple Paralympic and World Championship medals cementing his place in Tunisian sport history.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'yassineguenichi', fb: 'YassineGuenichi' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 28 ===\n');
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
