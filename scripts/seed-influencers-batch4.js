/**
 * Seed Tunisian Influencers — Batch 4
 *
 * Adds ~100+ more Tunisian influencers from Famous Birthdays lists, music artists,
 * and additional TikTok/Instagram creators.
 * Run with: node scripts/seed-influencers-batch4.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

function m({ id, name, description, sub_id, sub_name, subs, loc, lat, lng, featured = false, contact = {} }) {
  return {
    id, name, description,
    category_id: 'influencer', category_name: 'Influencer',
    subcategory_id: sub_id, subcategory_name: sub_name, sub_categories: subs,
    location: loc, latitude: lat, longitude: lng,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0,
    is_featured: featured, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: contact.phone||null, email: contact.email||null, website: contact.website||null, instagram_handle: contact.ig||null, facebook_name: contact.fb||null, tiktok_handle: contact.tt||null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [{stars:5,percentage:0},{stars:4,percentage:0},{stars:3,percentage:0},{stars:2,percentage:0},{stars:1,percentage:0}],
    category_ratings: [{name:'Content Quality',icon:'video-check',rating:0},{name:'Authenticity',icon:'shield-check',rating:0},{name:'Engagement',icon:'heart-multiple',rating:0}],
  };
}

const T = 'Tunis, Tunisia', TLat = 36.8065, TLng = 10.1815;

const INFLUENCERS = [

  // ═══ INSTAGRAM STARS (from Famous Birthdays) ═══════════════════════════════

  m({ id: 'influencer_meriem_debbagh', name: 'Meriem Debbagh', description: 'Tunisian fashion influencer, lifestyle personality, Instagram star, and television presenter. Known as "The one & only Tunisian Icon & Queen" with massive social media following.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'food_lifestyle'], loc: T, lat: TLat, lng: TLng, featured: true, contact: { ig: '7qmdc' } }),

  m({ id: 'influencer_donia_somrani', name: 'Donia Somrani', description: 'Tunisian Instagram star and content creator. Creates lifestyle and fashion content for her Tunisian and Arab following.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: { ig: 'doniasomrani' } }),

  m({ id: 'influencer_sarra_cherif', name: 'Sarra Cherif', description: 'Tunisian Instagram star with 978K followers. Makeup enthusiast, founder of S2O Dynasty, and actress in El Fitna (2025) and Fallujah (2023). Based on the French Riviera.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'comedy_entertainment'], loc: 'French Riviera, France', lat: 43.7102, lng: 7.2620, contact: { ig: 'sarra__cherif' } }),

  m({ id: 'influencer_mariem_sabbagh', name: 'Mariem Sabbagh', description: 'Tunisian influencer, fine arts professional, creative director, and TV host with 311K Instagram followers. Creates content at the intersection of art and media.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'music_art'], loc: T, lat: TLat, lng: TLng, contact: { ig: 'mariemsabbagh' } }),

  m({ id: 'influencer_chaima_taleb', name: 'Chaima Taleb', description: 'Tunisian Instagram star and content creator. Known for fashion and lifestyle content on social media.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_amira_khouaja', name: 'Amira Khouaja', description: 'Tunisian Instagram star creating lifestyle and beauty content for her growing Tunisian audience.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_ghada_chaka', name: 'Ghada Chaka', description: 'Tunisian Instagram star and content creator sharing fashion and lifestyle inspiration with her followers.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_mariam_ayari', name: 'Mariam Ayari', description: 'Tunisian Instagram star creating lifestyle content. Part of the growing Tunisian influencer community.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_areej_ayari', name: 'Areej Ayari', description: 'Tunisian Instagram star known for being one half of the online collective Sisters Diary, sharing photos and glimpses from her family and life.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting', 'food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_fares_abdeddayem', name: 'Fares Abdeddayem', description: 'Tunisian Instagram star with 717K followers. Passionate about modeling and acting, creates fashion and lifestyle content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: { ig: 'abdeddayem.fares', tt: 'fares.abdeddayem' } }),

  m({ id: 'influencer_yasmeen_ayari', name: 'Yasmeen Ayari', description: 'Tunisian Instagram star and content creator. Shares lifestyle and fashion content with her followers.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_aicha_fehri', name: 'Aicha Fehri', description: 'Tunisian Instagram star and young content creator sharing fashion and lifestyle content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_sana_hadidi', name: 'Sana Hadidi', description: 'Tunisian Instagram star creating lifestyle and beauty content for her audience.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_hela_azouz', name: 'Hela Azouz', description: 'Tunisian Instagram star and content creator sharing fashion, beauty, and lifestyle content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_sabrine_taleb', name: 'Sabrine Taleb', description: 'Tunisian Instagram star known for her lifestyle and fashion content on social media.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_saida_haouari', name: 'Saida Haouari', description: 'Tunisian Instagram star and content creator sharing lifestyle content with her followers.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_aya_naccache', name: 'Aya Naccache', description: 'Tunisian Instagram star creating diverse lifestyle and beauty content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_ahlem_fekih', name: 'Ahlem Fekih', description: 'Tunisian actor and model with 3M Instagram followers. One of the top 10 Instagram influencers in Tunisia, known for acting and modeling content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'comedy_entertainment'], loc: T, lat: TLat, lng: TLng, featured: true, contact: { ig: 'fekih.ahlem' } }),

  m({ id: 'influencer_sahar_mallouli', name: 'Sahar Mallouli', description: 'Tunisian Instagram star and content creator known in the Tunisian influencer community.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_oumayma_ben_hafsia', name: 'Oumayma Ben Hafsia', description: 'Tunisian Instagram star with an active presence creating reels and lifestyle content.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_oumaima_mouissii', name: 'Oumaima Mouissii', description: 'Tunisian Instagram star creating content for her growing audience.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_najla_qebibo', name: 'Najla Qebibo', description: 'Tunisian Instagram star and content creator sharing lifestyle content.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_abir_azl', name: 'Abir Azl', description: 'Tunisian Instagram star creating beauty and lifestyle content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_kenza_chiha', name: 'Kenza Chiha', description: 'Tunisian Instagram star and content creator sharing lifestyle and fashion inspiration.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_mohamed_choukani', name: 'Mohamed Choukani', description: 'Tunisian Instagram star creating diverse content for his followers.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_olfa_kaabi', name: 'Olfa Kaabi', description: 'Tunisian Instagram star known for lifestyle content and social media presence.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_sherazade_fahri', name: 'Sherazade Fahri', description: 'Tunisian Instagram star creating fashion and lifestyle content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_lynda_toumy', name: 'Lynda Toumy', description: 'Tunisian Instagram star and content creator.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_lina_khouili', name: 'Lina Khouili', description: 'Tunisian Instagram star creating lifestyle and fashion content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_saoussen_masmoudi', name: 'Saoussen Masmoudi', description: 'Tunisian Instagram star and lifestyle content creator.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_molka_bo', name: 'Molka Bo', description: 'Tunisian Instagram star creating engaging content for her followers.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_itsnotmariem', name: 'ItsNotMariem', description: 'Tunisian Instagram star with a creative content approach and unique personal brand.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_najla_chtourou', name: 'Najla Chtourou', description: 'Tunisian Instagram star creating lifestyle content.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_raya_bouallegue', name: 'Raya Bouallegue', description: 'Tunisian Instagram star and content creator.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_samar_bouderbala', name: 'Samar Bouderbala', description: 'Tunisian Instagram star creating fashion and lifestyle content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_amina_khedhir', name: 'Amina Khedhir', description: 'Tunisian Instagram star and lifestyle content creator.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  // ═══ TIKTOK STARS (from Famous Birthdays) ══════════════════════════════════

  m({ id: 'influencer_merwan_benamor', name: 'Merwan Benamor', description: 'Tunisian TikTok star creating entertaining content for his followers.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_nawres_briki', name: 'Nawres Briki', description: 'Tunisian TikTok star known for engaging and creative content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_zayneb_bargaoui', name: 'Zayneb Bargaoui', description: 'Tunisian TikTok star creating diverse content for the Tunisian TikTok community.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_atef_wallahcbon', name: 'Atef Wallahcbon', description: 'Tunisian TikTok star known for comedy and entertainment content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_eya_fattouh', name: 'Eya Fattouh', description: 'Tunisian TikTok star creating lifestyle and entertainment content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_fadwa_gharbi', name: 'Fadwa Gharbi', description: 'Tunisian TikTok star and content creator sharing entertaining videos.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_nada_abid', name: 'Nada Abid', description: 'Tunisian TikTok star creating engaging content for her followers.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_jaweher_dr', name: 'Jaweher Dr', description: 'Tunisian TikTok star and content creator known in the Tunisian TikTok scene.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: { tt: 'jaweher.dr' } }),

  m({ id: 'influencer_hajer_ksouri', name: 'Hajer Ksouri', description: 'Tunisian TikTok star creating diverse content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_ritej_ayedi', name: 'Ritej Ayedi', description: 'Tunisian TikTok star known for creative and engaging content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_nourhen_hourcheni', name: 'Nourhen Hourcheni', description: 'Tunisian TikTok star among the top TikTokers in Tunisia. Creates trending content with strong engagement.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: { tt: 'nourhenhourcheni' } }),

  m({ id: 'influencer_sayeef_baalty', name: 'Sayeef Baalty', description: 'Tunisian TikTok star creating entertaining content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_tass_tasnim', name: 'Tass Tasnim', description: 'Tunisian TikTok star and content creator.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_louai_arda', name: 'Louai Arda', description: 'Tunisian TikTok star creating diverse content for his audience.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_eya_cherni', name: 'Eya Cherni', description: 'Tunisian TikTok star creating engaging lifestyle and entertainment content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_emna_ayoub', name: 'Emna Ayoub', description: 'Tunisian TikTok star and content creator sharing entertaining videos.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_shaima_bouraoui', name: 'Shaïma Bouraoui', description: 'Tunisian TikTok star creating diverse and engaging content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_montaha_antar', name: 'Montaha Antar', description: 'Tunisian TikTok star and content creator.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_marwa_zouinekh', name: 'Marwa Ep Zouinekh', description: 'Tunisian TikTok star creating lifestyle and entertainment content.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_yosra_ben_aicha', name: 'Yosra Ben Aicha', description: 'Tunisian TikTok star and content creator.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  // ═══ MUSIC ARTISTS ═════════════════════════════════════════════════════════

  m({ id: 'influencer_lotfi_bouchnak', name: 'Lotfi Bouchnak', description: "Legendary Tunisian singer, oud player, and composer. Widely recognized as one of the best tenors in the Arab world, often called Tunisia's Pavarotti.", sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TLat, lng: TLng, featured: true, contact: {} }),

  m({ id: 'influencer_emel_mathlouthi', name: 'Emel Mathlouthi', description: 'Tunisian singer-songwriter who rose to prominence during the Tunisian Revolution. Her song "Kelmti Horra" became an anthem of the revolution. Performed at the Nobel Peace Prize ceremony 2015.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'news_politics'], loc: T, lat: TLat, lng: TLng, featured: true, contact: { ig: 'eaborsa' } }),

  m({ id: 'influencer_amina_fakhet', name: 'Amina Fakhet', description: 'Tunisian singer known for her powerful voice and dynamic stage presence. Has a diverse repertoire including both traditional Tunisian songs and contemporary pieces.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_manel_amara_singer', name: 'Manel Amara (Singer)', description: 'Tunisian music artist and entertainer with YouTube presence. Creates music and entertainment content blending Tunisian and modern Arabic styles.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  // ═══ ADDITIONAL NOTABLE CREATORS ═══════════════════════════════════════════

  m({ id: 'influencer_lady_samara_tt', name: 'Lady Samara (TikTok)', description: 'Tunisian TikTok creator known for hashtag challenges and general content. Active participant in the Tunisian TikTok community.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: { tt: 'lady.samara' } }),

  m({ id: 'influencer_dhe_krahosni', name: 'Dhe Krahosni', description: 'Tunisian Instagram star and content creator with a notable following.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_nadsoons', name: 'Nadsoons', description: 'Tunisian Instagram star creating unique content for her followers.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_mayssa_ferchichi_style', name: 'Mayssa Ferchichi (Style)', description: 'Tunisian TV host and content consultant known as @tripstyleblog. Offers style and travel advice with a focus on Tunisian fashion and destinations.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'travel'], loc: T, lat: TLat, lng: TLng, contact: { ig: 'tripstyleblog' } }),

  m({ id: 'influencer_sufyan_alhussein', name: 'Sufyan Alhussein', description: 'Tunisian TikTok star creating content for his audience.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_warda_omri', name: 'Warda Omri', description: 'Tunisian cooking and food content creator ranked #3 on Favikon Instagram and TikTok. Shares traditional Tunisian recipes with couscous, mloukhia, and cultural food content.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'family_parenting'], loc: T, lat: TLat, lng: TLng, featured: true, contact: {} }),

  m({ id: 'influencer_audiolaby', name: 'Audiolaby', description: 'Tunisian audio and music YouTube channel with 2.19M subscribers. Creates audio content and music compilations for Arabic-speaking audiences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  m({ id: 'influencer_7h_studio', name: '7H Studio', description: 'Tunisian entertainment YouTube channel with 2.23M subscribers. Produces creative entertainment content for Tunisian and Arab audiences.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'music_art'], loc: T, lat: TLat, lng: TLng, contact: {} }),

  // ═══ MORE TIKTOK NOTABLE NAMES ═════════════════════════════════════════════

  m({ id: 'influencer_minyar_khalifaa', name: 'Minyar Khalifaa', description: 'One of the top TikTok influencers in Tunisia. Creates trending content with strong engagement and a large Tunisian following.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: { tt: 'minyar_khalifaa' } }),

  m({ id: 'influencer_omar_tiktook', name: 'Omar Tiktook', description: 'Popular Tunisian TikTok creator among the top influencers in Tunisia for engagement and follower count.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: { tt: 'omar_tiktook' } }),

  m({ id: 'influencer_tn_offficiel', name: 'TN Officiel', description: 'Popular Tunisian TikTok account among the top TikTok influencers in Tunisia.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'news_politics'], loc: T, lat: TLat, lng: TLng, contact: { tt: 'tn_offficiel' } }),

  m({ id: 'influencer_triteroussema', name: 'Triteroussema', description: 'Tunisian TikTok creator among the top influencers in Tunisia for April 2026.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: { tt: 'triteroussema' } }),

  m({ id: 'influencer_maaya_official', name: 'Maaya Official', description: 'Tunisian TikTok star creating diverse content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: { tt: 'maayaaofficial' } }),

  m({ id: 'influencer_nourelhoudanaoui', name: 'Nour El Houda Naoui', description: 'Tunisian TikTok star and content creator.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TLat, lng: TLng, contact: { tt: 'nourelhoudanaoui' } }),
];

// ── Seed ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 4 ===\n');
  let created = 0, skipped = 0;
  for (const biz of INFLUENCERS) {
    const { id, ...data } = biz;
    const ref = db.collection('businesses').doc(id);
    if ((await ref.get()).exists) { console.log(`  ~ SKIP: ${biz.name}`); skipped++; continue; }
    await ref.set({ ...data, created_at: admin.firestore.FieldValue.serverTimestamp(), updated_at: admin.firestore.FieldValue.serverTimestamp() });
    console.log(`  + ${biz.name} [${biz.sub_categories.join(', ')}]`);
    created++;
  }
  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}, Total in batch: ${INFLUENCERS.length}`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
