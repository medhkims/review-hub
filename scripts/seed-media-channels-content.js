/**
 * Seed Tunisian TV channels, radio stations, news portals, and media outlets
 * directly into the new `media_channels` category.
 */
const admin = require('firebase-admin');
const sa = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

function m({ id, name, desc, sub_id, sub_name, loc, lat, lng, featured = false, contact = {} }) {
  return {
    id, name, description: desc,
    category_id: 'media_channels', category_name: 'Media & Channels',
    subcategory_id: sub_id, subcategory_name: sub_name,
    sub_categories: [sub_id],
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
    category_ratings: [
      { name: 'Content Quality', icon: 'video-check',   rating: 0 },
      { name: 'Reliability',     icon: 'shield-check',  rating: 0 },
      { name: 'Audience Reach',  icon: 'account-group', rating: 0 },
    ],
  };
}

const T = 'Tunis, Tunisia', TL = 36.8065, TG = 10.1815;
const S = 'Sfax, Tunisia',  SL = 34.7398, SG = 10.760;
const SO = 'Sousse, Tunisia', SOL = 35.8288, SOG = 10.640;

const MEDIA = [
  // ── TV Channels ───────────────────────────────────────────────────────────
  m({ id: 'media_wataniya1', name: 'Wataniya 1 (التلفزة التونسية)', desc: 'Tunisia\'s national public television channel. The oldest and most-watched channel in Tunisia covering news, politics, entertainment, and cultural programs.', sub_id: 'tv_channel', sub_name: 'TV Channel', loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'wataniya1_tv', fb: 'WataniyaTV', yt: 'WataniyaTV', tt: 'wataniya1_tv' } }),
  m({ id: 'media_wataniya2', name: 'Wataniya 2', desc: 'Tunisia\'s second national public television channel. Focuses on youth programming, sports, and cultural variety shows.', sub_id: 'tv_channel', sub_name: 'TV Channel', loc: T, lat: TL, lng: TG, contact: { ig: 'wataniya2_tv', fb: 'Wataniya2TV', yt: 'Wataniya2' } }),
  m({ id: 'media_zitouna_tv', name: 'Zitouna TV', desc: 'Tunisian Islamic television channel. Covers religious programming, Quran recitation, Islamic knowledge, and conservative family content.', sub_id: 'tv_channel', sub_name: 'TV Channel', loc: T, lat: TL, lng: TG, contact: { ig: 'zitounatv', fb: 'ZitounaTV', yt: 'ZitounaTV' } }),
  m({ id: 'media_telvza_tv', name: 'Telvza TV', desc: 'Tunisian private television channel known for entertainment programs, drama series, and reality shows popular with Tunisian audiences.', sub_id: 'tv_channel', sub_name: 'TV Channel', loc: T, lat: TL, lng: TG, contact: { ig: 'telvzatv', fb: 'TelvzaTV', yt: 'TelvzaTV' } }),
  m({ id: 'media_tunisna_tv', name: 'Tunisna TV', desc: 'Tunisian satellite television channel covering news and current affairs with a focus on political debates and social issues in Tunisia.', sub_id: 'tv_channel', sub_name: 'TV Channel', loc: T, lat: TL, lng: TG, contact: { ig: 'tunisna_tv', fb: 'TunisnaTV', yt: 'TunisnaTV' } }),
  m({ id: 'media_elhiwar_ettounsi', name: 'El Hiwar Ettounsi', desc: 'Popular Tunisian satellite TV channel. Famous for controversial talk shows, political debates, and entertainment programming broadcast from Tunis.', sub_id: 'tv_channel', sub_name: 'TV Channel', loc: T, lat: TL, lng: TG, contact: { ig: 'hiwar_ettounsi', fb: 'AlHiwarEttounsi', yt: 'AlHiwarEttounsi' } }),
  m({ id: 'media_alhanda_tv', name: 'Al Handa TV', desc: 'Tunisian television channel offering entertainment, drama, and variety programming for Tunisian and North African audiences.', sub_id: 'tv_channel', sub_name: 'TV Channel', loc: T, lat: TL, lng: TG, contact: { ig: 'alhandatv', fb: 'AlHandaTV', yt: 'AlHandaTV' } }),
  m({ id: 'media_m2rtv', name: 'M2R TV', desc: 'Tunisian private TV channel broadcasting entertainment, movies, and local Tunisian productions for a broad national audience.', sub_id: 'tv_channel', sub_name: 'TV Channel', loc: T, lat: TL, lng: TG, contact: { ig: 'm2rtv', fb: 'M2RTV', yt: 'M2RTV' } }),
  m({ id: 'media_sama_tn_tv', name: 'Sama TN', desc: 'Tunisian entertainment TV channel specializing in music videos, Arabic pop, and regional North African entertainment programming.', sub_id: 'tv_channel', sub_name: 'TV Channel', loc: T, lat: TL, lng: TG, contact: { ig: 'samatn_tv', fb: 'SamaTNTV', yt: 'SamaTNTV' } }),
  m({ id: 'media_karthago_tv', name: 'Karthago TV', desc: 'Tunisian music and entertainment television channel known for airing Tunisian and Arab music programs, video clips, and celebrity content.', sub_id: 'tv_channel', sub_name: 'TV Channel', loc: T, lat: TL, lng: TG, contact: { ig: 'karthago_tv', fb: 'KarthagoTV', yt: 'KarthagoTV' } }),
  m({ id: 'media_canal_sfax', name: 'Canal Sfax', desc: 'Regional Tunisian television channel based in Sfax. Serves the greater Sfax region with local news, cultural programming, and regional event coverage.', sub_id: 'tv_channel', sub_name: 'TV Channel', loc: S, lat: SL, lng: SG, contact: { ig: 'canal_sfax', fb: 'CanalSfax', yt: 'CanalSfax' } }),
  m({ id: 'media_tv_sousse', name: 'TV Sousse', desc: 'Regional television channel covering the Sahel coast region of Tunisia. Local news, cultural events, and community programming for Greater Sousse.', sub_id: 'tv_channel', sub_name: 'TV Channel', loc: SO, lat: SOL, lng: SOG, contact: { ig: 'tv_sousse', fb: 'TVSousse', yt: 'TVSousse' } }),

  // ── Radio Stations ────────────────────────────────────────────────────────
  m({ id: 'media_radio_nationale', name: 'Radio Nationale Tunisie', desc: 'Tunisia\'s official national public radio station. Broadcasts news, culture, and public affairs programs across the country on AM and FM frequencies.', sub_id: 'radio_station', sub_name: 'Radio Station', loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'radionationale_tn', fb: 'RadioNationaleTunisie', yt: 'RadioNationaleTunisie' } }),
  m({ id: 'media_radio_tunis', name: 'Radio Tunis', desc: 'Tunisian public radio channel serving the capital Tunis region. Mix of news, cultural programs, and local entertainment for the Greater Tunis area.', sub_id: 'radio_station', sub_name: 'Radio Station', loc: T, lat: TL, lng: TG, contact: { ig: 'radiotunis', fb: 'RadioTunis', yt: 'RadioTunis' } }),
  m({ id: 'media_shems_fm', name: 'Shems FM', desc: 'Popular Tunisian radio station specializing in Arab and international pop music. One of the most listened stations by young Tunisians alongside Mosaïque FM.', sub_id: 'radio_station', sub_name: 'Radio Station', loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'shemsfm', fb: 'ShemsFM', yt: 'ShemsFM', tt: 'shemsfm' } }),
  m({ id: 'media_radio_sfax', name: 'Radio Sfax', desc: 'Regional radio station serving Sfax and the surrounding governorates. Local news, cultural programming, and community information for southern Tunisia.', sub_id: 'radio_station', sub_name: 'Radio Station', loc: S, lat: SL, lng: SG, contact: { ig: 'radiosfax', fb: 'RadioSfax', yt: 'RadioSfax' } }),
  m({ id: 'media_radio_monastir', name: 'Radio Monastir', desc: 'Regional radio station for the Sahel region covering Monastir, Mahdia, and surrounding areas with local news and cultural content.', sub_id: 'radio_station', sub_name: 'Radio Station', loc: T, lat: 35.7643, lng: 10.8113, contact: { ig: 'radiomonastir', fb: 'RadioMonastir' } }),
  m({ id: 'media_radio_jeunes', name: 'Radio Jeunes Tunisie', desc: 'Tunisian public radio station targeting youth audiences. Music, interviews, and youth-focused programming from Tunis reaching the young generation.', sub_id: 'radio_station', sub_name: 'Radio Station', loc: T, lat: TL, lng: TG, contact: { ig: 'radiojeunes_tn', fb: 'RadioJeunesTunisie', yt: 'RadioJeunesTunisie' } }),
  m({ id: 'media_radio_culture', name: 'Radio Culture Tunisie', desc: 'Tunisian public cultural radio station dedicated to arts, literature, and intellectual programming. Voice of Tunisian cultural and artistic life on the airwaves.', sub_id: 'radio_station', sub_name: 'Radio Station', loc: T, lat: TL, lng: TG, contact: { ig: 'radioculture_tn', fb: 'RadioCultureTunisie', yt: 'RadioCultureTN' } }),
  m({ id: 'media_quran_radio_tn', name: 'Radio Coran Tunisie', desc: 'Tunisian public radio station broadcasting Quran recitation, Islamic lectures, and religious programming 24 hours a day.', sub_id: 'radio_station', sub_name: 'Radio Station', loc: T, lat: TL, lng: TG, contact: { ig: 'radiocorantn', fb: 'RadioCoranTunisie', yt: 'RadioCoranTunisie' } }),
  m({ id: 'media_hiwar_radio', name: 'Radio Hiwar', desc: 'Tunisian talk radio station specializing in political debates, social issues, and investigative journalism programs reaching audiences nationwide.', sub_id: 'radio_station', sub_name: 'Radio Station', loc: T, lat: TL, lng: TG, contact: { ig: 'radiohiwar', fb: 'RadioHiwar', yt: 'RadioHiwar' } }),
  m({ id: 'media_rtci', name: 'RTCI', desc: 'Tunisia\'s French-language public radio. Broadcasting news, culture, and entertainment in French serving Tunisia\'s francophone community since 1938.', sub_id: 'radio_station', sub_name: 'Radio Station', loc: T, lat: TL, lng: TG, contact: { ig: 'rtci_radio', fb: 'RTCIRadio', yt: 'RTCIRadio' } }),
  m({ id: 'media_zitouna_radio', name: 'Radio Zitouna FM', desc: 'Tunisian Islamic radio station. Broadcasts religious content, Quran recitation, Islamic education, and programming aligned with Islamic values.', sub_id: 'radio_station', sub_name: 'Radio Station', loc: T, lat: TL, lng: TG, contact: { ig: 'zitounafm', fb: 'ZitounaFM', yt: 'ZitounaFM' } }),

  // ── News Portals ──────────────────────────────────────────────────────────
  m({ id: 'media_businessnews_tn', name: 'BusinessNews.com.tn', desc: 'Leading Tunisian business and economic news portal. Covers the Tunisian economy, corporate news, stock market, and financial analysis in both Arabic and French.', sub_id: 'news_portal', sub_name: 'News Portal', loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'businessnews_tn', fb: 'BusinessNewsTN', tt: 'businessnews_tn' } }),
  m({ id: 'media_tunisienumerique', name: 'Tunisie Numérique', desc: 'Tunisian tech and digital news portal. Covers telecom, startups, IT industry, and digital transformation in Tunisia. Most-read tech media in the country.', sub_id: 'news_portal', sub_name: 'News Portal', loc: T, lat: TL, lng: TG, contact: { ig: 'tunisienumerique', fb: 'TunisieNumerique', tt: 'tunisienumerique' } }),
  m({ id: 'media_webdo_tn', name: 'Webdo Tunisie', desc: 'Tunisian news aggregator and portal covering politics, economics, and society. Very popular with Tunisians seeking quick access to national news updates.', sub_id: 'news_portal', sub_name: 'News Portal', loc: T, lat: TL, lng: TG, contact: { ig: 'webdo_tn', fb: 'WebdoTunisie', tt: 'webdo_tn' } }),
  m({ id: 'media_turess_tn', name: 'Turess', desc: 'Tunisian news and current affairs portal. Covers breaking Tunisian news with an engaged readership following Tunisian political and social developments.', sub_id: 'news_portal', sub_name: 'News Portal', loc: T, lat: TL, lng: TG, contact: { ig: 'turess_tn', fb: 'TuressNews', tt: 'turess_tn' } }),
  m({ id: 'media_huffpost_maghreb', name: 'HuffPost Maghreb', desc: 'Tunisian edition of HuffPost covering North African politics, society, and culture. One of the most read French-language media sites in North Africa.', sub_id: 'news_portal', sub_name: 'News Portal', loc: T, lat: TL, lng: TG, contact: { ig: 'huffpostmaghreb', fb: 'HuffPostMaghreb', tt: 'huffpostmaghreb' } }),
  m({ id: 'media_the_conversation_tn', name: 'Tap Agence Tunisie', desc: 'Tunisia\'s official state news agency (Agence Tunis Afrique Presse). The primary source for official Tunisian government communiqués and state news.', sub_id: 'news_portal', sub_name: 'News Portal', loc: T, lat: TL, lng: TG, contact: { ig: 'tap_agence_tunisie', fb: 'TAPAgenceTunisie', tt: 'tap_agence_tn' } }),

  // ── Newspapers & Magazines ────────────────────────────────────────────────
  m({ id: 'media_assabah_tn', name: 'Assabah', desc: 'One of Tunisia\'s oldest and most-read Arabic language daily newspapers. Covers politics, sports, culture, and social affairs in Tunisia since 1951.', sub_id: 'newspaper_magazine', sub_name: 'Newspaper & Magazine', loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'assabah_tn', fb: 'AssabahTunisie', tt: 'assabah_tn' } }),
  m({ id: 'media_lapresse_tn', name: 'La Presse de Tunisie', desc: 'Tunisia\'s historic French-language daily newspaper founded in 1936. Essential reading for Tunisia\'s francophone community and the most-read French paper in Tunisia.', sub_id: 'newspaper_magazine', sub_name: 'Newspaper & Magazine', loc: T, lat: TL, lng: TG, featured: true, contact: { ig: 'lapressedetunisie', fb: 'LaPressedeTunisie', tt: 'lapresse_tn', web: 'lapresse.tn' } }),
  m({ id: 'media_ech_chourouk', name: 'Ech Chourouk', desc: 'High-circulation Tunisian Arabic daily newspaper. Known for comprehensive coverage of Tunisian politics, football, and society with millions of readers.', sub_id: 'newspaper_magazine', sub_name: 'Newspaper & Magazine', loc: T, lat: TL, lng: TG, contact: { ig: 'echouroukonline', fb: 'EchouroukOnline', tt: 'echouroukonline' } }),
  m({ id: 'media_attounissiya', name: 'Attounissiya', desc: 'Tunisian newspaper known for its bold investigative reporting and candid coverage of Tunisian political and social affairs.', sub_id: 'newspaper_magazine', sub_name: 'Newspaper & Magazine', loc: T, lat: TL, lng: TG, contact: { ig: 'attounissiya_tn', fb: 'Attounissiya', tt: 'attounissiya' } }),
  m({ id: 'media_letemps_tn', name: 'Le Temps', desc: 'Tunisian French-language daily newspaper. Covers Tunisian and international news, economics, culture, and sports for French-speaking Tunisian readers.', sub_id: 'newspaper_magazine', sub_name: 'Newspaper & Magazine', loc: T, lat: TL, lng: TG, contact: { ig: 'letemps_tn', fb: 'LeTempsTunisie', web: 'letemps.com.tn' } }),
  m({ id: 'media_tunisnews', name: 'Tunis News', desc: 'Tunisian news portal and digital newspaper covering breaking news, politics, and daily life in Tunisia updated 24/7 in Arabic.', sub_id: 'news_portal', sub_name: 'News Portal', loc: T, lat: TL, lng: TG, contact: { ig: 'tunisnews_tn', fb: 'TunisNews', tt: 'tunisnews_tn' } }),
  m({ id: 'media_sport_tn_journal', name: 'Al Hamia (الهامة)', desc: 'Tunisian sports newspaper and media brand. The leading dedicated sports publication in Tunisia covering football, handball, athletics, and all Tunisian sports.', sub_id: 'newspaper_magazine', sub_name: 'Newspaper & Magazine', loc: T, lat: TL, lng: TG, contact: { ig: 'alhamia_sport', fb: 'AlHamia', tt: 'alhamia_tn' } }),

  // ── YouTube Channels (Media) ──────────────────────────────────────────────
  m({ id: 'media_tn_documentaires', name: 'Documentaires Tunisie', desc: 'Tunisian documentary YouTube channel producing high-quality documentaries about Tunisian history, culture, society, and current affairs in Arabic.', sub_id: 'youtube_channel', sub_name: 'YouTube Channel', loc: T, lat: TL, lng: TG, contact: { yt: 'DocumentairesTunisie', ig: 'documentaires_tunisie', fb: 'DocumentairesTunisie' } }),
  m({ id: 'media_balagh_news_tn', name: 'Balagh News', desc: 'Tunisian YouTube news channel producing investigative video reports and news analysis. Known for in-depth coverage of Tunisian political and economic affairs.', sub_id: 'youtube_channel', sub_name: 'YouTube Channel', loc: T, lat: TL, lng: TG, contact: { yt: 'BalagNewsTV', ig: 'balaghNews', fb: 'BalaghNews' } }),
  m({ id: 'media_al_anwar_tn_yt', name: 'Al Anwar TV', desc: 'Tunisian YouTube television channel covering cultural, artistic, and entertainment content produced in Tunisia for Arab and international audiences.', sub_id: 'youtube_channel', sub_name: 'YouTube Channel', loc: T, lat: TL, lng: TG, contact: { yt: 'AlAnwarTV', ig: 'alanwar_tv', fb: 'AlAnwarTV' } }),
  m({ id: 'media_tn_series_yt', name: 'Série TN', desc: 'Tunisian drama series YouTube channel streaming complete seasons of popular Tunisian TV dramas. One of the most watched Tunisian YouTube channels.', sub_id: 'youtube_channel', sub_name: 'YouTube Channel', loc: T, lat: TL, lng: TG, contact: { yt: 'SeriesTN', ig: 'serie_tn', fb: 'SeriesTN' } }),

  // ── Podcasts ──────────────────────────────────────────────────────────────
  m({ id: 'media_aswet_podcast', name: 'Aswet Podcast Network', desc: 'Tunisia\'s leading podcast network. Produces multiple Arabic-language podcasts covering culture, business, politics, and personal development for Tunisian audiences.', sub_id: 'podcast', sub_name: 'Podcast', loc: T, lat: TL, lng: TG, contact: { ig: 'aswet_podcast', fb: 'AswetPodcast', yt: 'AswetPodcast' } }),
  m({ id: 'media_3andna_podcast', name: '3andna Podcast', desc: 'Popular Tunisian cultural podcast discussing Tunisian society, social issues, and everyday life in a candid conversational format in Tunisian dialect.', sub_id: 'podcast', sub_name: 'Podcast', loc: T, lat: TL, lng: TG, contact: { ig: '3andna_podcast', yt: '3andnaPodcast', fb: '3andnaPodcast' } }),
  m({ id: 'media_taht_elmijhar', name: 'Taht El Mijhar', desc: 'Tunisian investigative podcast exposing corruption, social injustice, and political affairs in Tunisia. One of the most talked-about Tunisian podcasts.', sub_id: 'podcast', sub_name: 'Podcast', loc: T, lat: TL, lng: TG, contact: { ig: 'tahtelmijhar', fb: 'TahtElMijhar', yt: 'TahtElMijhar' } }),
];

async function run() {
  console.log('=== Seeding Tunisian Media & Channels content ===\n');
  let created = 0, skipped = 0;
  for (const item of MEDIA) {
    const ref = db.collection('businesses').doc(item.id);
    const snap = await ref.get();
    if (snap.exists) { console.log(`  ~ Skipped: ${item.name}`); skipped++; }
    else { const { id, ...data } = item; await ref.set(data); console.log(`  + ${item.name}`); created++; }
  }
  const total = await db.collection('businesses').where('category_id','==','media_channels').get();
  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
  console.log(`Total Media & Channels docs: ${total.size}`);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
