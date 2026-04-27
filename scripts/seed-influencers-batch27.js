/**
 * Seed Tunisian Influencers — Batch 27
 * TV channels, radio stations, media outlets, more entertainers, niche creators
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
  // ── TV Channels & Media Brands ────────────────────────────────────────────
  m({ id: 'influencer_mosaique_fm', name: 'Mosaïque FM', desc: 'Tunisia\'s most listened-to radio station with a massive social media following. Political, cultural, and entertainment programming reaching millions of Tunisians daily.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'mosaiquefm', fb: 'MosaiqueOfm', tt: 'mosaiquefm', yt: 'MosaiqueFm' } }),
  m({ id: 'influencer_express_fm', name: 'Express FM', desc: 'Tunisian business and economic news radio with strong social presence. The go-to source for Tunisian financial news, stock market updates, and economic analysis.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'business_finance'], loc: T, lat: TL, lng: TG, contact: { ig: 'expressfm_tn', fb: 'RadioExpressFM', tt: 'expressfm_tn', yt: 'ExpressFM' } }),
  m({ id: 'influencer_jawhara_fm', name: 'Jawhara FM', desc: 'Popular Tunisian entertainment radio station known for music programs, celebrity interviews, and high-energy morning shows. Very active on social media.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'jawharafm', fb: 'JawharaFM', tt: 'jawharafm', yt: 'JawharaFM' } }),
  m({ id: 'influencer_ifm_radio', name: 'IFM Radio', desc: 'Tunisian radio station with large social media following known for political talk shows and news coverage of Tunisian affairs.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, contact: { ig: 'ifmradio', fb: 'IFMradio', tt: 'ifmradio', yt: 'IFMRadioTunisie' } }),
  m({ id: 'influencer_nessma_tv', name: 'Nessma TV', desc: 'Major Tunisian and North African television network. Known for popular drama series, reality shows, and news programming with massive social media reach.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'nessmatv', fb: 'NessmaTV', tt: 'nessmatv', yt: 'NessmaTV' } }),
  m({ id: 'influencer_hannibal_tv_tn', name: 'Hannibal TV', desc: 'Private Tunisian television channel with popular entertainment and news programming. Strong social media presence with millions of followers across platforms.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment', 'news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'hannibaltv_officiel', fb: 'HannibalTV', tt: 'hannibaltv', yt: 'HannibalTV' } }),
  m({ id: 'influencer_alhiwar_ettounsi', name: 'Al Hiwar Ettounsi', desc: 'Popular Tunisian satellite TV channel known for political talk shows and entertainment. One of the most watched Tunisian channels with major social media reach.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'hiwar_ettounsi', fb: 'AlHiwarEttounsi', tt: 'hiwarttounsi', yt: 'AlHiwarEttounsi' } }),
  m({ id: 'influencer_attessia_tv', name: 'Attessia TV', desc: 'Tunisian television channel broadcasting news, sports, and cultural programs. Popular for live sports coverage and political debates with strong online presence.', sub_id: 'news_politics', sub_name: 'News & Politics', subs: ['news_politics', 'sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'attessiatv', fb: 'AttessiaTV', yt: 'AttessiaTV' } }),
  m({ id: 'influencer_tct_tv', name: 'TCT Tunisie', desc: 'Tunisian cultural and arts television channel. Focuses on Tunisian heritage, cinema, music, and cultural programming. Strong following among culturally engaged Tunisians.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'tct_tunisie', fb: 'TCTTunisie', yt: 'TCTTunisie' } }),

  // ── More Entertainers & Creators ──────────────────────────────────────────
  m({ id: 'influencer_sabri_mosbah', name: 'Sabri Mosbah', desc: 'Tunisian singer and media personality known for catchy pop songs. His energetic performances and social media presence make him a staple of Tunisian entertainment.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'sabrimosbah', fb: 'SabriMosbah', yt: 'SabriMosbahOfficial' } }),
  m({ id: 'influencer_hichem_mbi', name: 'Hichem Mbi', desc: 'Tunisian comedian and theater actor who translates his stage performances into viral social media content. Known for sharp social commentary through comedy.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'hichem_mbi', fb: 'HichemMbi', tt: 'hichemMbi' } }),
  m({ id: 'influencer_sarra_hamdi_actress', name: 'Sarra Hamdi', desc: 'Tunisian actress active in Ramadan drama productions and social media. Known for dramatic roles and personal fashion content that keeps her followers engaged year-round.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'sarrahamdi_officiel', fb: 'SarraHamdi', tt: 'sarrahamdi' } }),
  m({ id: 'influencer_med_ali_nait', name: 'Med Ali Naït', desc: 'Tunisian comedy content creator specializing in observational humor about Tunisian society, politics, and social media trends. Fast-growing digital following.', sub_id: 'comedy_entertainment', sub_name: 'Comedy & Entertainment', subs: ['comedy_entertainment'], loc: T, lat: TL, lng: TG, contact: { ig: 'medalinait', tt: 'med_ali_nait', yt: 'MedAliNait' } }),

  // ── Car & Tech Reviews ────────────────────────────────────────────────────
  m({ id: 'influencer_auto_review_tn_yt', name: 'Auto Review TN', desc: 'Tunisian automotive content creator reviewing cars available in Tunisia. Covers new models, used car advice, and Tunisian auto market trends on YouTube.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { yt: 'AutoReviewTN', ig: 'autoreview_tn', fb: 'AutoReviewTN' } }),
  m({ id: 'influencer_moto_tn', name: 'Moto TN', desc: 'Tunisian motorcycle lifestyle content creator. Reviews bikes, documents road trips across Tunisia, and covers the growing Tunisian biker community on social media.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming', 'travel'], loc: T, lat: TL, lng: TG, contact: { ig: 'moto_tn_official', yt: 'MotoTN', fb: 'MotoTN' } }),
  m({ id: 'influencer_tech_unboxing_tn', name: 'Unboxing TN', desc: 'Tunisian tech unboxing channel on YouTube. Reviews and unboxes the latest smartphones, headphones, and gadgets for the Tunisian consumer market.', sub_id: 'tech_gaming', sub_name: 'Tech & Gaming', subs: ['tech_gaming'], loc: T, lat: TL, lng: TG, contact: { yt: 'UnboxingTN', ig: 'unboxing_tn', fb: 'UnboxingTN' } }),

  // ── Environment & Sustainability ───────────────────────────────────────────
  m({ id: 'influencer_green_tn', name: 'Green Tunisia', desc: 'Tunisian environmental awareness content creator. Documents plastic pollution in Tunisian seas, deforestation, and promotes sustainable living in North Africa.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { ig: 'green_tunisia', fb: 'GreenTunisia', tt: 'greentunisia' } }),
  m({ id: 'influencer_eco_tn_activist', name: 'Éco Tunisie', desc: 'Tunisian environmental NGO and digital content creator raising awareness about climate change and marine conservation affecting Tunisia\'s coastlines.', sub_id: 'education', sub_name: 'Education & Tips', subs: ['education'], loc: T, lat: TL, lng: TG, contact: { ig: 'ecotunisie', fb: 'EcoTunisie', yt: 'EcoTunisie' } }),

  // ── Weddings & Events ─────────────────────────────────────────────────────
  m({ id: 'influencer_wedding_tn', name: 'Wedding Tunisie', desc: 'Tunisia\'s leading wedding content account. Covers bridal fashion, wedding venues, reception décor, and the elaborate traditions of Tunisian wedding celebrations.', sub_id: 'family_parenting', sub_name: 'Family & Parenting', subs: ['family_parenting', 'fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'wedding_tunisie', fb: 'WeddingTunisie', tt: 'weddingtunisie' } }),
  m({ id: 'influencer_bridal_tunis', name: 'Bridal Tunis', desc: 'Tunisian bridal fashion and wedding planning influencer. Showcases Tunisian designer wedding dresses, bridal makeup trends, and wedding venue reviews.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'family_parenting'], loc: T, lat: TL, lng: TG, contact: { ig: 'bridal_tunis', fb: 'BridalTunis', tt: 'bridaltunis' } }),
  m({ id: 'influencer_photographer_wedding_tn', name: 'Wedding Photo TN', desc: 'Tunisian wedding photographer and visual content creator. Known for capturing the beauty of Tunisian weddings — from the Lila night to the khoua ceremony.', sub_id: 'music_art', sub_name: 'Music & Art', subs: ['music_art', 'family_parenting'], loc: T, lat: TL, lng: TG, contact: { ig: 'weddingphoto_tn', fb: 'WeddingPhotoTN' } }),

  // ── Sports Niche ──────────────────────────────────────────────────────────
  m({ id: 'influencer_padel_tn', name: 'Padel Tunisia', desc: 'Tunisia\'s fastest growing racket sport community on social media. Covers padel tournaments, club openings, and the explosion of padel culture in Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'padel_tunisia', fb: 'PadelTunisia', tt: 'padeltunisia' } }),
  m({ id: 'influencer_running_tn', name: 'Running TN', desc: 'Tunisian running community page covering road races, trail running, and the growing Tunisian marathon culture. Motivates thousands of Tunisian runners daily.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'fitness_health'], loc: T, lat: TL, lng: TG, contact: { ig: 'running_tn', fb: 'RunningTN', tt: 'runningtn' } }),
  m({ id: 'influencer_surf_tn', name: 'Surf Tunisia', desc: 'Tunisian surf and watersports community documenting the growing surf culture on Tunisia\'s northern and western Mediterranean coast.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports', 'travel'], loc: T, lat: 37.1, lng: 9.5, contact: { ig: 'surf_tunisia', fb: 'SurfTunisia', tt: 'surftunisia' } }),
  m({ id: 'influencer_karate_tn', name: 'Karaté Tunisie', desc: 'Tunisian national karate federation social media page and community account. Covers national championships, international medals, and karate training content.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'karate_tunisie', fb: 'KarateTunisie', tt: 'karatetunisie' } }),
  m({ id: 'influencer_judo_tn', name: 'Judo Tunisie', desc: 'Tunisian judo community and federation content page. Celebrates Tunisian judokas competing internationally and promotes the sport among Tunisian youth.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'judo_tunisie', fb: 'JudoTunisie', tt: 'judotunisie' } }),
  m({ id: 'influencer_taekwondo_tn', name: 'Taekwondo Tunisie', desc: 'Tunisian taekwondo news and community page. Covers national team performances, world championship results, and local taekwondo clubs across Tunisia.', sub_id: 'sports', sub_name: 'Sports', subs: ['sports'], loc: T, lat: TL, lng: TG, contact: { ig: 'taekwondo_tunisie', fb: 'TaekwondoTunisie' } }),

  // ── Fashion Industry Pros ──────────────────────────────────────────────────
  m({ id: 'influencer_azzedine_alaia_legacy', name: 'Fondation Azzedine Alaïa', desc: 'Foundation preserving the legacy of legendary Tunisian fashion designer Azzedine Alaïa. Shares archival fashion content and promotes his iconic couture house.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'fondation_alaia', fb: 'FondationAlaïa', web: 'fondazionealaia.it' } }),
  m({ id: 'influencer_tunisian_fashion_week', name: 'Fashion Week Tunis', desc: 'Official social media of Tunis Fashion Week. Showcases Tunisian and international designers in an annual showcase of North African fashion excellence.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty'], loc: T, lat: TL, lng: TG, contact: { ig: 'fashionweektunis', fb: 'FashionWeekTunis', tt: 'fashionweektunis' } }),
  m({ id: 'influencer_imed_alibi_fashion', name: 'Imed Alibi', desc: 'Award-winning Tunisian fashion designer. His contemporary Tunisian-inspired couture has been shown internationally earning him recognition in global fashion media.', sub_id: 'fashion_beauty', sub_name: 'Fashion & Beauty', subs: ['fashion_beauty', 'music_art'], loc: T, lat: TL, lng: TG, contact: { ig: 'imed_alibi_officiel', fb: 'ImedAlibiCreateur' } }),

  // ── More Niche Creators ────────────────────────────────────────────────────
  m({ id: 'influencer_realestate_tn', name: 'Immobilier TN', desc: 'Tunisian real estate content creator sharing property market analysis, house tours, and investment advice for buying property in Tunisia.', sub_id: 'business_finance', sub_name: 'Business & Finance', subs: ['business_finance'], loc: T, lat: TL, lng: TG, contact: { ig: 'immobilier_tn', fb: 'ImmobilierTN', tt: 'immobiliertn', yt: 'ImmobilierTN' } }),
  m({ id: 'influencer_diy_crafts_tn', name: 'DIY Tunisie', desc: 'Tunisian home crafts and DIY content creator. Shares hand-made decoration tutorials inspired by Tunisian artisan traditions and modern interior trends.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'diy_tunisie', tt: 'diytunisie', yt: 'DIYTunisie' } }),
  m({ id: 'influencer_animals_tn', name: 'Animaux Tunisie', desc: 'Tunisian pet and animal content creator. Covers pet care, animal adoption in Tunisia, and campaigns for animal welfare across the country.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'animaux_tunisie', fb: 'AnimauxTunisie', tt: 'animauxtunisie' } }),
  m({ id: 'influencer_garden_tn', name: 'Jardinage Tunisie', desc: 'Tunisian gardening and urban farming content creator. Teaches Tunisians how to grow their own food in small urban spaces and apartment balconies.', sub_id: 'food_lifestyle', sub_name: 'Food & Lifestyle', subs: ['food_lifestyle'], loc: T, lat: TL, lng: TG, contact: { ig: 'jardinage_tunisie', fb: 'JardinageTunisie', yt: 'JardinageTunisie' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Influencers — Batch 27 ===\n');
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
