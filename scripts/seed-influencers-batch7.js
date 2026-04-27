/**
 * Seed Tunisian Influencers — Batch 7 (Wikipedia actors, singers, athletes, TV presenters + Modash discoveries)
 * Run with: node scripts/seed-influencers-batch7.js
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
const S = 'Sfax, Tunisia', SL = 34.7398, SG = 10.7600;
const SO = 'Sousse, Tunisia', SOL = 35.8288, SOG = 10.6405;

const INFLUENCERS = [
  // ============ ACTORS & ENTERTAINERS ============

  // Male actors (Wikipedia Tunisian male film/TV actors — not already seeded)
  m({ id: 'influencer_lotfi_abdelli', name: 'Lotfi Abdelli', desc: 'Celebrated Tunisian actor, comedian, and TV personality. One of Tunisia\'s most popular entertainers, known for sharp social commentary and comedy shows.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_fethi_haddaoui', name: 'Fethi Haddaoui', desc: 'Veteran Tunisian actor and director. One of the most recognizable faces in Tunisian cinema and television with decades of acclaimed performances.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_kamel_touati', name: 'Kamel Touati', desc: 'Beloved Tunisian comedian and actor famous for his roles in Tunisian television series. A household name in Tunisian entertainment.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_mahmoud_larnaout', name: 'Mahmoud Larnaout', desc: 'Tunisian actor and comedian known for his versatile roles in Tunisian film and television productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_hichem_rostom', name: 'Hichem Rostom', desc: 'Tunisian actor who has appeared in numerous Tunisian and Arab television series. Active on social media sharing behind-the-scenes content.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_sofiene_chaari', name: 'Sofiene Chaari', desc: 'Tunisian television actor known for his roles in popular Tunisian drama series. Regular presence on Tunisian TV screens.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_mohamed_akkari', name: 'Mohamed Akkari', desc: 'Tunisian television and film actor with appearances in well-known Tunisian productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_slim_mahfoudh', name: 'Slim Mahfoudh', desc: 'Tunisian actor known for his work in Tunisian film and television drama productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_mohamed_mrad', name: 'Mohamed Mrad', desc: 'Tunisian actor featured in various Tunisian television series and films.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_ghanem_zrelly', name: 'Ghanem Zrelly', desc: 'Tunisian actor with roles in Tunisian cinema and television. Known for his dramatic performances.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_majd_mastoura', name: 'Majd Mastoura', desc: 'Tunisian actor and filmmaker known for his work in Tunisian independent cinema. Active content creator.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_mohamed_zouaoui', name: 'Mohamed Zouaoui', desc: 'Tunisian actor who has appeared in multiple Tunisian television and film productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_abdellatif_kechiche', name: 'Abdellatif Kechiche', desc: 'Franco-Tunisian filmmaker and actor. Palme d\'Or winner at Cannes for "Blue is the Warmest Colour". One of the most acclaimed Tunisian-origin filmmakers.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'education'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_mehdi_hmili', name: 'Mehdi Hmili', desc: 'Tunisian filmmaker and producer. Known for critically acclaimed films representing Tunisian cinema at international festivals.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  // Female actresses (Wikipedia — not already seeded)
  m({ id: 'influencer_doria_achour', name: 'Doria Achour', desc: 'Tunisian actress and filmmaker known for her roles in Tunisian and international productions. Active on social media sharing her creative work.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_anissa_daoud', name: 'Anissa Daoud', desc: 'Tunisian actress with notable performances in Tunisian cinema. Known for her powerful dramatic roles.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_najla_ben_abdallah', name: 'Najla Ben Abdallah', desc: 'Tunisian actress featured in Tunisian television series and films. Growing social media presence.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_souhir_ben_amara', name: 'Souhir Ben Amara', desc: 'Tunisian actress known for her roles in popular Tunisian TV dramas. Beloved figure in Tunisian entertainment.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_kenza_fourati', name: 'Kenza Fourati', desc: 'Tunisian model and actress who has appeared in Sports Illustrated. One of Tunisia\'s most internationally recognized models.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_rim_riahi', name: 'Rim Riahi', desc: 'Tunisian actress known for her work in Tunisian drama series and films.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_samar_matoussi', name: 'Samar Matoussi', desc: 'Tunisian actress featured in Tunisian television and film productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_mariem_ben_chaabane', name: 'Mariem Ben Chaabane', desc: 'Tunisian actress with appearances in Tunisian cinema and TV. Active social media user sharing her creative projects.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_wajiha_jendoubi', name: 'Wajiha Jendoubi', desc: 'Tunisian actress and comedian known for her humorous roles in Tunisian TV productions.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_rim_el_benna', name: 'Rim El Benna', desc: 'Tunisian actress featured in Tunisian drama series and films.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_mouna_noureddine', name: 'Mouna Noureddine', desc: 'Tunisian actress known for her career spanning Tunisian television and cinema.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ============ SINGERS & MUSICIANS ============

  m({ id: 'influencer_ghalia_benali', name: 'Ghalia Benali', desc: 'Internationally acclaimed Tunisian singer, musician, and dancer. Known for blending traditional Arabic and world music. Performs globally.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_dorsaf_hamdani', name: 'Dorsaf Hamdani', desc: 'Tunisian singer known for performing classical Arabic music and the works of Fairouz. Active on social media with music content.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_shayma_helali', name: 'Shayma Helali', desc: 'Tunisian singer and actress known for popular Arabic songs. Active social media presence with millions of views on YouTube.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_sonia_mbarek', name: 'Sonia M\'barek', desc: 'Tunisian singer specializing in traditional Tunisian and Arabic music. Former Minister of Culture. Respected cultural figure in Tunisia.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_fatma_boussaha', name: 'Fatma Boussaha', desc: 'Tunisian singer known for her contributions to the Tunisian music scene with a unique vocal style.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_k2rhym', name: 'K2Rhym', desc: 'Tunisian rapper and hip-hop artist. One of the emerging voices in the Tunisian rap scene with growing social media following.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_nader_guirat', name: 'Nader Guirat', desc: 'Tunisian singer and musician creating contemporary Arabic music content.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_kacem_kefi', name: 'Kacem Kefi', desc: 'Tunisian singer known for his vocal performances in the contemporary Tunisian music scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_sabri_mosbah', name: 'Sabri Mosbah', desc: 'Tunisian singer and musician contributing to the Tunisian pop and Arabic music scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_ahmed_rebai', name: 'Ahmed Rebai', desc: 'Tunisian singer and actor with a career spanning music and television. Popular across Tunisian and Arab audiences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_ameur_chaali', name: 'Ameur Chaali', desc: 'Tunisian DJ and music producer. Creates electronic and dance music content popular with young Tunisian audiences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'ameurchaali' } }),

  m({ id: 'influencer_abdelkrim_bouzayein', name: 'Abdelkrim Bouzayein', desc: 'Tunisian R&B singer creating contemporary R&B and pop music content.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_maroua_issa', name: 'Maroua Issa', desc: 'Tunisian pop singer with growing social media following. Creates Arabic pop music content.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_anise_barka', name: 'Anise Barka', desc: 'Tunisian rapper and hip-hop artist contributing to the Tunisian rap scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_wadad', name: 'Wadad', desc: 'Tunisian singer known for her unique musical style blending traditional and modern elements.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_belgacem_bouguenna', name: 'Belgacem Bouguenna', desc: 'Tunisian singer performing traditional and modern Tunisian songs.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_khalil_j', name: 'Khalil J', desc: 'Tunisian hip-hop artist and rapper creating content in the Tunisian urban music scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'whoskalij' } }),

  // ============ TV PRESENTERS & JOURNALISTS ============

  m({ id: 'influencer_sonia_mabrouk', name: 'Sonia Mabrouk', desc: 'Franco-Tunisian journalist and TV presenter on CNews. One of the most prominent Tunisian media personalities in France. Author and public intellectual.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_afef_jnifen', name: 'Afef Jnifen', desc: 'Tunisian-Italian model, TV presenter, and philanthropist. Internationally known for hosting Italian TV and her humanitarian work.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_hedi_zaiem', name: 'Hedi Zaiem', desc: 'Tunisian TV show host and media personality. Well-known face on Tunisian television.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_kaouthar_bachraoui', name: 'Kaouthar Bachraoui', desc: 'Tunisian television presenter and journalist. Known figure in Tunisian broadcast media.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_nizar_chaari', name: 'Nizar Chaari', desc: 'Tunisian television presenter and media personality active on Tunisian TV channels.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'news_politics'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ============ OLYMPIC & PRO ATHLETES ============

  m({ id: 'influencer_mohamed_khalil_jendoubi', name: 'Mohamed Khalil Jendoubi', desc: 'Tunisian taekwondo athlete. Olympic silver medalist at Tokyo 2020, competing at Paris 2024. Tunisia\'s youngest Olympic medalist. Huge social media following.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_fares_ferjani', name: 'Farès Ferjani', desc: 'Tunisian fencer who won a silver medal at the 2024 Paris Olympics. Rising Tunisian sports star with growing social media presence.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),

  m({ id: 'influencer_ahmed_jaouadi', name: 'Ahmed Jaouadi', desc: 'Tunisian swimmer who represented Tunisia at the 2024 Paris Olympics. Prominent figure in Tunisian aquatic sports.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_firas_katoussi', name: 'Firas Katoussi', desc: 'Tunisian taekwondo athlete who competed at the 2024 Paris Olympics. Part of Tunisia\'s strong taekwondo tradition.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_ahmed_khelil', name: 'Ahmed Khelil', desc: 'Tunisian basketball player and sports content creator. Active on social media with 130K+ followers sharing basketball content.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'khelil_officiel5' } }),

  m({ id: 'influencer_omar_abada', name: 'Omar Abada', desc: 'Tunisian basketball player and sports content creator sharing basketball lifestyle content.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'abadaomar' } }),

  m({ id: 'influencer_yassine_chikhaoui', name: 'Yassine Chikhaoui', desc: 'Tunisian football legend known as one of the most technically gifted Tunisian players ever. Huge following among Tunisian sports fans.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_yassine_meriah', name: 'Yassine Meriah', desc: 'Tunisian professional footballer and national team player. Active on social media connecting with Tunisian fans.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_sabri_lamouchi', name: 'Sabri Lamouchi', desc: 'Tunisian football manager, current head coach of the Tunisia national team. Former professional player with an international career.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ============ GAMING & STREAMING ============

  m({ id: 'influencer_omar_mallek', name: 'Omar Mallek', desc: 'Tunisian gamer and streamer with 62K+ followers. Creates gaming content and streams on multiple platforms.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { ig: 'omarmallek2' } }),

  m({ id: 'influencer_nour_ben_youssef', name: 'Nour Ben Youssef', desc: 'Tunisian gaming content creator and streamer. Creates gaming and streaming content for Tunisian gaming community.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { ig: 'evilishbaby' } }),

  // ============ PHOTOGRAPHY & ART ============

  m({ id: 'influencer_mehdi_jenhani', name: 'Mehdi Jenhani', desc: 'Tunisian landscape photographer with 117K+ followers. Creates stunning photography of Tunisian landscapes and nature.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'travel'], loc: T, lat: TL, lng: TG, contact: { ig: 'jenhani_mahdi' } }),

  m({ id: 'influencer_skandar_wali', name: 'Skandar Wali', desc: 'Tunisian photographer with 40K+ followers. Creates photography content showcasing Tunisia and creative visual art.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'photo_skon' } }),

  m({ id: 'influencer_jy_art', name: 'JY-Art (Jihed Yahyaoui)', desc: 'Tunisian digital artist and illustrator creating original digital art and illustration content.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'jihed_yahyaoui_' } }),

  m({ id: 'influencer_mohamed_chermiti_photo', name: 'Mohamed Chermiti Photography', desc: 'Tunisian wedding and event photographer creating visual content and photography tips.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'chermitove' } }),

  m({ id: 'influencer_firas_timou', name: 'Firas Timou', desc: 'Tunisian photographer and lifestyle content creator sharing photography work and daily life content.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'timou_turner' } }),

  // ============ FASHION & LIFESTYLE ============

  m({ id: 'influencer_ali_karoui', name: 'Ali Karoui', desc: 'Tunisian fashion designer known internationally for his haute couture and bridal collections. Prominent figure in Tunisian fashion industry.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_firas_jaiem', name: 'Firas Jaiem', desc: 'Tunisian model with international presence. Shares fashion and lifestyle content on social media.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_hadil_boussada', name: 'Hadil Boussada', desc: 'Tunisian vlogger and content creator with 315K+ followers. Creates lifestyle vlogs and relatable content for Tunisian youth.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'ha5il_bs' } }),

  m({ id: 'influencer_wafa_blogger', name: 'Wafa', desc: 'Tunisian lifestyle blogger and content creator. Shares lifestyle, fashion, and personal development content.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle', 'fashion_beauty'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_zied_hakimi', name: 'Zied Hakimi', desc: 'Tunisian reality TV star and social media personality. Known for his entertaining content and TV appearances.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ============ MEDICAL / HEALTH / FITNESS ============

  m({ id: 'influencer_dr_aymen_hammami', name: 'Dr. Aymen Hammami', desc: 'Tunisian medical doctor and health content creator with 10K+ followers. Shares medical education and health tips content.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'dr_aymen_hammami' } }),

  m({ id: 'influencer_saber_zaanouni_fitness', name: 'Saber Zaanouni Fitness', desc: 'Tunisian dance and fitness instructor with 15K+ followers. Known as MC Dance, creates dance fitness and workout content.', sub_id: 'fitness_health', sub_name: 'Fitness & Health', subs: ['fitness_health', 'music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'mcdanceofficiel' } }),

  // ============ YOUTUBE & CONTENT CREATORS ============

  m({ id: 'influencer_stou', name: 'Stou', desc: 'Tunisian YouTube star creating entertaining video content. Popular among young Tunisian audiences with engaging storytelling.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ============ NEWS / POLITICS / ACTIVISM ============

  m({ id: 'influencer_slim_amamou', name: 'Slim Amamou', desc: 'Tunisian internet activist, blogger, and former Secretary of State for Youth and Sports. Prominent voice in Tunisian digital rights and tech activism.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'tech_gaming'], loc: T, lat: TL, lng: TG, contact: {} }),

  m({ id: 'influencer_beya_zardi', name: 'Beya Zardi', desc: 'Tunisian radio host and media personality. Known for her broadcasting career spanning decades in Tunisian media.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ============ MISC CONTENT CREATORS (Modash) ============

  m({ id: 'influencer_dali_gharsaly', name: 'Dali Gharsaly', desc: 'Tunisian content creator with 26K+ followers. Creates general lifestyle and entertainment content for Tunisian audiences.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'dali_gharsalli' } }),

  m({ id: 'influencer_wiem_gabsi', name: 'Wiem Gabsi', desc: 'Tunisian content creator sharing lifestyle and daily life content with her audience.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'wiemgabsii' } }),

  m({ id: 'influencer_mehdi_elloumi', name: 'Mehdi Elloumi', desc: 'Tunisian padel sports player and content creator. Shares sports content about padel tennis in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'mehdi_elloumii' } }),

  m({ id: 'influencer_hou_ssem', name: 'Hou Ssem', desc: 'Tunisian fashion and lifestyle content creator sharing style inspiration and daily content.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: '__hou__ssem' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 7 ===\n');
  let c = 0, s = 0;
  for (const biz of INFLUENCERS) {
    const { id, ...data } = biz;
    const ref = db.collection('businesses').doc(id);
    if ((await ref.get()).exists) { console.log(`  ~ SKIP: ${biz.name}`); s++; continue; }
    await ref.set({ ...data, created_at: admin.firestore.FieldValue.serverTimestamp(), updated_at: admin.firestore.FieldValue.serverTimestamp() });
    console.log(`  + ${biz.name} [${biz.sub_categories.join(', ')}]`);
    c++;
  }
  console.log(`\nDone! Created: ${c}, Skipped: ${s}, Total in batch: ${INFLUENCERS.length}`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
