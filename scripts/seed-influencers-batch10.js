/**
 * Seed Tunisian Influencers — Batch 10 (Music: classical, jazz, pop, rap, DJs)
 * Run with: node scripts/seed-influencers-batch10.js
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
const M = 'Monastir, Tunisia', ML = 35.7773, MG = 10.8262;

const INFLUENCERS = [
  // ====== WORLD / JAZZ / CLASSICAL ======
  m({ id: 'influencer_anouar_brahem', name: 'Anouar Brahem', desc: 'World-renowned Tunisian oud player and composer. His albums are released on ECM Records and he has performed globally. One of the greatest living Arab musicians.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_dhafer_youssef', name: 'Dhafer Youssef', desc: 'Internationally acclaimed Tunisian oud player, vocalist, and composer. Creates spiritual jazz music blending Arabic tradition with contemporary jazz.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_nawel_ben_kraiem', name: 'Nawel Ben Kraiem', desc: 'Tunisian-French jazz and world music singer. Known for her soulful voice and interpretations of classic Tunisian songs. Performs across Europe and the Arab world.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_zied_gharsa', name: 'Zied Gharsa', desc: 'Master of Malouf, the traditional Tunisian classical music. Keeper of Andalusian musical heritage and cultural icon in Tunisia.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_mounir_troudi', name: 'Mounir Troudi', desc: 'Tunisian musician and singer known for his mastery of traditional North African styles and collaborations with international artists.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_fadhel_jaziri', name: 'Fadhel Jaziri', desc: 'Legendary Tunisian theater director and musician. Created groundbreaking theatrical productions combining music and visual arts.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_amina_annabi', name: 'Amina Annabi', desc: 'Tunisian singer who represented France at Eurovision 1991 (co-winner). Known internationally for her unique fusion of Tunisian and European music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_saber_rebai_jr', name: 'Marwan Ali', desc: 'Tunisian contemporary singer creating modern Arabic pop and lifestyle content on social media.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_mehdi_ayachi', name: 'Mehdi Ayachi', desc: 'Tunisian singer and performer contributing to the contemporary Tunisian pop and Arabic music landscape.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_najoua_nemri', name: 'Najoua Nemri', desc: 'Franco-Tunisian pop singer known for hit French songs. One of the most commercially successful Tunisian-origin artists in French music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_amel_bent', name: 'Amel Bent', desc: 'Franco-Tunisian pop and soul singer. Multiple French music awards winner. One of the most successful Tunisian-origin artists in European pop.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_hedi_jouini', name: 'Hédi Jouini', desc: 'Legendary Tunisian singer known as the "grandfather of Tunisian song." His music remains beloved classics cherished by all generations of Tunisians.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_sonia_kallel', name: 'Sonia Kallel', desc: 'Tunisian singer popular in the Tunisian and Arab music scene. Creates emotional ballads and pop music content.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_emna_mahfoudh', name: 'Emna Mahfoudh', desc: 'Tunisian singer and actress with notable contributions to Tunisian music and entertainment.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_wafa_ben_ahmed', name: 'Wafa Ben Ahmed', desc: 'Tunisian singer creating Arabic pop and traditional Tunisian music content for social media audiences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_leila_haddad', name: 'Leila Haddad', desc: 'Tunisian singer and cultural artist contributing to contemporary Tunisian music and arts scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_amal_saad_ghrib', name: 'Amal Saad Ghrib', desc: 'Tunisian pop singer known for romantic Arabic songs. Popular across the Tunisian and North African music market.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_nawal_ghachem', name: 'Nawal Ghachem', desc: 'Tunisian singer known for her rich voice and performances of traditional and contemporary Tunisian music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_siwar_ben_amor', name: 'Siwar Ben Amor', desc: 'Tunisian contemporary singer creating Arabic pop content with a growing social media following.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ameni_lakhdar', name: 'Ameni Lakhdar', desc: 'Tunisian singer contributing to the Tunisian pop music scene with energetic performances and modern sound.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== RAPPERS / HIP-HOP ======
  m({ id: 'influencer_simba_la_rue', name: 'Simba La Rue', desc: 'Tunisian rapper part of the Maghrebi hip-hop scene. Creates socially conscious rap content addressing North African youth experiences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_awa_rapper', name: 'Awa', desc: 'Tunisian female rapper and hip-hop artist. One of the few prominent female voices in the Tunisian rap scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_laaazem', name: 'Laaazem', desc: 'Tunisian rapper and hip-hop artist known for his Tunisian dialect rap. Part of the vibrant underground Tunisian rap community.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_young_rz_rap', name: 'Young RZ', desc: 'Tunisian young rapper creating hip-hop content popular with Tunisian youth. Part of the new generation of Tunisian rap artists.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_bguira', name: 'Bguira', desc: 'Tunisian rapper and lyricist. Creates rap music rooted in Tunisian social realities and youth culture.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ala_yacoubi', name: 'Ala Yacoubi', desc: 'Tunisian music producer and beatmaker. Creates beats and music production content for the Tunisian hip-hop scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_colina', name: 'Colina', desc: 'Tunisian rapper known for catchy Tunisian dialect rap songs. Popular among young Tunisian music fans.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_elak', name: 'Elak', desc: 'Tunisian rapper contributing to the evolving Tunisian hip-hop scene with authentic street-level content.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== DJs / PRODUCERS ======
  m({ id: 'influencer_dj_costa', name: 'DJ Costa', desc: 'Tunisian DJ and electronic music producer. Creates dance and electronic music content popular at Tunisian events and clubs.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_dj_lucky', name: 'DJ Lucky', desc: 'Tunisian DJ known for performing at major Tunisian events. Shares music mixes and event content on social media.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_deep_vision', name: 'Deep Vision', desc: 'Tunisian electronic music DJ and producer. Creates deep house and electronic music content for Tunisian and North African audiences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_tunisian_beats', name: 'Zied Zouari', desc: 'Tunisian music producer and beatmaker creating original beats and production content for upcoming Tunisian artists.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),

  // ====== TRADITIONAL / REGIONAL MUSIC ======
  m({ id: 'influencer_fawzi_ben_gamra', name: 'Fawzi Ben Gamra', desc: 'Tunisian musician specializing in traditional Tunisian music. Performer of Malouf and other classical Tunisian musical traditions.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_saber_khmira', name: 'Saber Khmira', desc: 'Tunisian singer known for traditional folk and regional Tunisian music. Preserves and shares Tunisia\'s musical heritage.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: S, lat: SL, lng: SG, contact: {} }),
  m({ id: 'influencer_nabiha_karaouli', name: 'Nabiha Karaouli', desc: 'Tunisian singer known for her powerful voice in traditional and contemporary Tunisian music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_hassen_doss', name: 'Hassen Doss', desc: 'Tunisian actor and singer famous for his comedic songs and theatrical performances. Beloved entertainer across Tunisian generations.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, featured: true, contact: {} }),
  m({ id: 'influencer_ali_riahi', name: 'Ali Riahi', desc: 'Iconic Tunisian musician and composer. Pioneer of modern Tunisian music who shaped the sound of Tunisian song for decades.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_saliha', name: 'Saliha', desc: 'Legendary Tunisian singer considered one of the founding mothers of modern Tunisian music. Her songs remain timeless classics.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_oulaya_singer', name: 'Oulaya', desc: 'Tunisian actress and singer whose performances blend music with drama. Iconic figure in Tunisian classical entertainment.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_zakia_saad', name: 'Zakia Saad', desc: 'Tunisian singer known for traditional Tunisian and Arabic songs. Cultural figure in Tunisian music.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_naama', name: 'Naama', desc: 'Tunisian singer known for her unique voice and contributions to Tunisian music heritage.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_sabri_ben_yahia', name: 'Sabri Ben Yahia', desc: 'Tunisian contemporary singer and entertainer creating music and entertainment content for Tunisian audiences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_ramzi_ayedi', name: 'Ramzi Ayedi', desc: 'Tunisian singer and content creator known for his music videos and social media presence in the Tunisian music scene.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: M, lat: ML, lng: MG, contact: {} }),
  m({ id: 'influencer_wissem_amor', name: 'Wissem Amor', desc: 'Tunisian musician and composer creating original music content blending traditional Tunisian sounds with modern production.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_sofiane_ben_youssef', name: 'Sofiane Ben Youssef', desc: 'Tunisian music creator and performer sharing original compositions and music content on social media.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_chama_singer', name: 'Chama', desc: 'Tunisian pop singer with a modern sound. Creates upbeat music content popular with young Tunisian audiences.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_rania_bandeira', name: 'Rania Bandeira', desc: 'Tunisian singer known for her energetic performances and popular songs in the North African music market.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_amira_medini', name: 'Amira Medini', desc: 'Tunisian singer and performer creating Arabic pop music content with a dedicated social media following.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
  m({ id: 'influencer_senda_abassi', name: 'Senda Abassi', desc: 'Tunisian contemporary musician and singer. Combines traditional Tunisian influences with modern musical production.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: {} }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 10 (Music) ===\n');
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
