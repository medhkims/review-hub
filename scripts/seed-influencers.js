/**
 * Seed Tunisian Influencers
 *
 * Adds Tunisian social media influencers to Firestore under the "influencer" category.
 * Each influencer can have multiple subcategories.
 *
 * Uses the Firebase Web SDK (same approach as seed-firestore.ts).
 *
 * Run with: node scripts/seed-influencers.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const INFLUENCERS = [
  // ── Fashion & Beauty ──────────────────────────────────────────────────────

  {
    id: 'influencer_dorra_zarrouk',
    name: 'Dorra Zarrouk',
    description:
      'Tunisian actress and fashion icon with over 17 million Instagram followers. Known for luxury lifestyle content, high-end brand collaborations, and representing Tunisian glamour on the international stage.',
    category_id: 'influencer',
    category_name: 'Influencer',
    subcategory_id: 'fashion_beauty',
    subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty', 'comedy_entertainment'],
    location: 'Tunis, Tunisia',
    latitude: 36.8065,
    longitude: 10.1815,
    cover_image_url: null,
    logo_url: null,
    rating: 0,
    review_count: 0,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    status: 'active',
    is_verified: false,
    contact: {
      phone: null,
      email: null,
      website: null,
      instagram_handle: 'dorra_zarrouk',
      facebook_name: 'DorraZarroukOfficial',
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ],
    category_ratings: [
      { name: 'Content Quality', icon: 'video-check', rating: 0 },
      { name: 'Authenticity', icon: 'shield-check', rating: 0 },
      { name: 'Engagement', icon: 'heart-multiple', rating: 0 },
    ],
  },

  {
    id: 'influencer_hend_sabri',
    name: 'Hend Sabri',
    description:
      'Award-winning Tunisian actress with 3.8+ million Instagram followers. Blends entertainment with lifestyle content and social advocacy, representing Tunisian culture on international screens.',
    category_id: 'influencer',
    category_name: 'Influencer',
    subcategory_id: 'fashion_beauty',
    subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty', 'comedy_entertainment'],
    location: 'Tunis, Tunisia',
    latitude: 36.8065,
    longitude: 10.1815,
    cover_image_url: null,
    logo_url: null,
    rating: 0,
    review_count: 0,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    status: 'active',
    is_verified: false,
    contact: {
      phone: null,
      email: null,
      website: null,
      instagram_handle: 'hendsabri',
      facebook_name: 'HendSabryOfficial',
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ],
    category_ratings: [
      { name: 'Content Quality', icon: 'video-check', rating: 0 },
      { name: 'Authenticity', icon: 'shield-check', rating: 0 },
      { name: 'Engagement', icon: 'heart-multiple', rating: 0 },
    ],
  },

  {
    id: 'influencer_rym_saidi',
    name: 'Rym Saidi Breidy',
    description:
      'Tunisian-Lebanese international model with 2.4+ million Instagram followers. Represents major fashion brands while showcasing Tunisian culture and Mediterranean style.',
    category_id: 'influencer',
    category_name: 'Influencer',
    subcategory_id: 'fashion_beauty',
    subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty', 'travel'],
    location: 'Tunis, Tunisia',
    latitude: 36.8065,
    longitude: 10.1815,
    cover_image_url: null,
    logo_url: null,
    rating: 0,
    review_count: 0,
    is_featured: false,
    is_open: true,
    owner_id: 'system',
    status: 'active',
    is_verified: false,
    contact: {
      phone: null,
      email: null,
      website: null,
      instagram_handle: 'rymsaidibreidy',
      facebook_name: null,
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ],
    category_ratings: [
      { name: 'Content Quality', icon: 'video-check', rating: 0 },
      { name: 'Authenticity', icon: 'shield-check', rating: 0 },
      { name: 'Engagement', icon: 'heart-multiple', rating: 0 },
    ],
  },

  {
    id: 'influencer_marwa_agrebi',
    name: 'Marwa Agrebi',
    description:
      'Prominent Tunisian beauty influencer, actress, and TV host with 3.5 million Instagram followers. Known for beauty tips, fashion content, and brand collaborations across North Africa.',
    category_id: 'influencer',
    category_name: 'Influencer',
    subcategory_id: 'fashion_beauty',
    subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty', 'food_lifestyle'],
    location: 'Tunis, Tunisia',
    latitude: 36.8065,
    longitude: 10.1815,
    cover_image_url: null,
    logo_url: null,
    rating: 0,
    review_count: 0,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    status: 'active',
    is_verified: false,
    contact: {
      phone: null,
      email: null,
      website: null,
      instagram_handle: 'marwa_agrebi_',
      facebook_name: null,
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ],
    category_ratings: [
      { name: 'Content Quality', icon: 'video-check', rating: 0 },
      { name: 'Authenticity', icon: 'shield-check', rating: 0 },
      { name: 'Engagement', icon: 'heart-multiple', rating: 0 },
    ],
  },

  {
    id: 'influencer_fatma_bali',
    name: 'Fatma Bali',
    description:
      'Tunisian fashion influencer with 500K+ Instagram followers. Known for modest fashion inspirations, local brand partnerships, and promoting Tunisian designers.',
    category_id: 'influencer',
    category_name: 'Influencer',
    subcategory_id: 'fashion_beauty',
    subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty'],
    location: 'Tunis, Tunisia',
    latitude: 36.8065,
    longitude: 10.1815,
    cover_image_url: null,
    logo_url: null,
    rating: 0,
    review_count: 0,
    is_featured: false,
    is_open: true,
    owner_id: 'system',
    status: 'active',
    is_verified: false,
    contact: {
      phone: null,
      email: null,
      website: null,
      instagram_handle: 'fatmabltn',
      facebook_name: null,
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ],
    category_ratings: [
      { name: 'Content Quality', icon: 'video-check', rating: 0 },
      { name: 'Authenticity', icon: 'shield-check', rating: 0 },
      { name: 'Engagement', icon: 'heart-multiple', rating: 0 },
    ],
  },

  {
    id: 'influencer_ziad_ben_houri',
    name: 'Ziad Ben Houri',
    description:
      'One of the most artsy Tunisian fashionistas on Instagram. Known for creative fashion photography, bold styling choices, and celebrating Tunisian artistry through fashion.',
    category_id: 'influencer',
    category_name: 'Influencer',
    subcategory_id: 'fashion_beauty',
    subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty', 'music_art'],
    location: 'Tunis, Tunisia',
    latitude: 36.8065,
    longitude: 10.1815,
    cover_image_url: null,
    logo_url: null,
    rating: 0,
    review_count: 0,
    is_featured: false,
    is_open: true,
    owner_id: 'system',
    status: 'active',
    is_verified: false,
    contact: {
      phone: null,
      email: null,
      website: null,
      instagram_handle: 'benhouriazied',
      facebook_name: null,
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ],
    category_ratings: [
      { name: 'Content Quality', icon: 'video-check', rating: 0 },
      { name: 'Authenticity', icon: 'shield-check', rating: 0 },
      { name: 'Engagement', icon: 'heart-multiple', rating: 0 },
    ],
  },

  {
    id: 'influencer_khouloud_moalla',
    name: 'Khouloud Moalla',
    description:
      'Tunisian marketing professional at Makeup Forever. Shares personal life and professional beauty insights on Instagram, covering event styling, motherhood, and beauty industry trends.',
    category_id: 'influencer',
    category_name: 'Influencer',
    subcategory_id: 'fashion_beauty',
    subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty', 'family_parenting'],
    location: 'Tunis, Tunisia',
    latitude: 36.8065,
    longitude: 10.1815,
    cover_image_url: null,
    logo_url: null,
    rating: 0,
    review_count: 0,
    is_featured: false,
    is_open: true,
    owner_id: 'system',
    status: 'active',
    is_verified: false,
    contact: {
      phone: null,
      email: null,
      website: null,
      instagram_handle: 'khouloud_moalla',
      facebook_name: null,
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ],
    category_ratings: [
      { name: 'Content Quality', icon: 'video-check', rating: 0 },
      { name: 'Authenticity', icon: 'shield-check', rating: 0 },
      { name: 'Engagement', icon: 'heart-multiple', rating: 0 },
    ],
  },

  {
    id: 'influencer_ryma_ben_aissa',
    name: 'Ryma Ben Aissa',
    description:
      'Tunisian lifestyle and family influencer on Instagram. Shares cool ideas and content showcasing her happy family lifestyle, parenting tips, and Tunisian daily life.',
    category_id: 'influencer',
    category_name: 'Influencer',
    subcategory_id: 'fashion_beauty',
    subcategory_name: 'Fashion & Beauty',
    sub_categories: ['fashion_beauty', 'family_parenting', 'food_lifestyle'],
    location: 'Tunis, Tunisia',
    latitude: 36.8065,
    longitude: 10.1815,
    cover_image_url: null,
    logo_url: null,
    rating: 0,
    review_count: 0,
    is_featured: false,
    is_open: true,
    owner_id: 'system',
    status: 'active',
    is_verified: false,
    contact: {
      phone: null,
      email: null,
      website: null,
      instagram_handle: 'rymabenaissa',
      facebook_name: null,
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ],
    category_ratings: [
      { name: 'Content Quality', icon: 'video-check', rating: 0 },
      { name: 'Authenticity', icon: 'shield-check', rating: 0 },
      { name: 'Engagement', icon: 'heart-multiple', rating: 0 },
    ],
  },

  // ── Comedy & Entertainment ────────────────────────────────────────────────

  {
    id: 'influencer_nidhal_saadi',
    name: 'Nidhal Saadi',
    description:
      'Tunisian actor and comedian with 3 million Instagram followers. One of the most popular comedic content creators in Tunisia, known for viral skits, parodies, and live shows.',
    category_id: 'influencer',
    category_name: 'Influencer',
    subcategory_id: 'comedy_entertainment',
    subcategory_name: 'Comedy & Entertainment',
    sub_categories: ['comedy_entertainment'],
    location: 'Tunis, Tunisia',
    latitude: 36.8065,
    longitude: 10.1815,
    cover_image_url: null,
    logo_url: null,
    rating: 0,
    review_count: 0,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    status: 'active',
    is_verified: false,
    contact: {
      phone: null,
      email: null,
      website: null,
      instagram_handle: 'nidhal.saadi.officiel',
      facebook_name: 'NidhalSaadiOfficiel',
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ],
    category_ratings: [
      { name: 'Content Quality', icon: 'video-check', rating: 0 },
      { name: 'Authenticity', icon: 'shield-check', rating: 0 },
      { name: 'Engagement', icon: 'heart-multiple', rating: 0 },
    ],
  },

  {
    id: 'influencer_douha_laribi',
    name: 'Douha Laribi',
    description:
      'Tunisian TikTok star and social media influencer with over 19 million TikTok followers and 390 million likes. Known for engaging content centered on fashion, beauty, lifestyle, humor, and celebrating Tunisian heritage.',
    category_id: 'influencer',
    category_name: 'Influencer',
    subcategory_id: 'comedy_entertainment',
    subcategory_name: 'Comedy & Entertainment',
    sub_categories: ['comedy_entertainment', 'fashion_beauty', 'food_lifestyle'],
    location: 'Tunis, Tunisia',
    latitude: 36.8065,
    longitude: 10.1815,
    cover_image_url: null,
    logo_url: null,
    rating: 0,
    review_count: 0,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    status: 'active',
    is_verified: false,
    contact: {
      phone: null,
      email: null,
      website: null,
      instagram_handle: '_douhalaribi__',
      facebook_name: null,
      tiktok_handle: 'douhalaribiii',
    },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ],
    category_ratings: [
      { name: 'Content Quality', icon: 'video-check', rating: 0 },
      { name: 'Authenticity', icon: 'shield-check', rating: 0 },
      { name: 'Engagement', icon: 'heart-multiple', rating: 0 },
    ],
  },

  {
    id: 'influencer_boulhech',
    name: 'Boulhech (Hachem Gaddouch)',
    description:
      'Tunisian humorist, actor, and web content creator active since 2017. Creates comedy content with parodies, animations, and sketches on YouTube. One of the pioneers of Tunisian YouTube comedy.',
    category_id: 'influencer',
    category_name: 'Influencer',
    subcategory_id: 'comedy_entertainment',
    subcategory_name: 'Comedy & Entertainment',
    sub_categories: ['comedy_entertainment'],
    location: 'Tunis, Tunisia',
    latitude: 36.8065,
    longitude: 10.1815,
    cover_image_url: null,
    logo_url: null,
    rating: 0,
    review_count: 0,
    is_featured: false,
    is_open: true,
    owner_id: 'system',
    status: 'active',
    is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'boulhech', facebook_name: 'Boulhech', tiktok_handle: null },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_ferjani_safi',
    name: 'Ferjani Safi',
    description: 'Tunisian content creator based in Belgium. Specializes in freestyle football and humorous videos with a significant following on TikTok and Instagram.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment',
    sub_categories: ['comedy_entertainment', 'sports'],
    location: 'Brussels, Belgium', latitude: 50.8503, longitude: 4.3517,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: false, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'ferjanisafi', facebook_name: null, tiktok_handle: 'ferjanisafi' },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_malek_oueslati',
    name: 'Malek Oueslati',
    description: 'Prominent Tunisian social media personality based in Dubai with 3.8M TikTok and 2.5M Instagram followers. Covers modeling, lifestyle, and brand collaborations.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment',
    sub_categories: ['comedy_entertainment', 'fashion_beauty', 'food_lifestyle'],
    location: 'Dubai, UAE', latitude: 25.2048, longitude: 55.2708,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: true, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'malek_oueslati_of', facebook_name: 'malekoueslati.off', tiktok_handle: 'malek_oueslati_of' },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_nael_le_ziente',
    name: 'Nael Le Ziente',
    description: 'Tunisian content creator known for engaging TikTok and Instagram posts featuring humor, personal anecdotes, and lifestyle content.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment',
    sub_categories: ['comedy_entertainment', 'food_lifestyle'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: false, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'naelleziente', facebook_name: null, tiktok_handle: 'naelleziente' },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_hamma_stories',
    name: 'Hamma Stories',
    description: 'Tunisian TikTok creator known for humor and cultural references from Tunisia and Algeria. Creates comedic skits and popular culture commentary.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment',
    sub_categories: ['comedy_entertainment'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: false, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: null, facebook_name: null, tiktok_handle: 'hamma_stories' },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_racha_ben_maouia',
    name: 'Racha Ben Maouia',
    description: 'Tunisian actress and digital manager. Active on Instagram sharing lifestyle, fashion, and behind-the-scenes content.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment',
    sub_categories: ['comedy_entertainment', 'fashion_beauty'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: false, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'rachabenmaouia_', facebook_name: null, tiktok_handle: null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_youssef_zaghbib',
    name: 'Youssef Zaghbib (Adhreb Aandi)',
    description: 'Tunisian content creator known as "Adhreb Aandi". Creates popular interview-style content in a car with influencers and celebrities.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment',
    sub_categories: ['comedy_entertainment'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: false, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'adhreb_aandi', facebook_name: null, tiktok_handle: null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  // ── Tech & Gaming ─────────────────────────────────────────────────────────

  {
    id: 'influencer_lord_ahmed',
    name: 'LORD Ahmed',
    description: "Tunisia's biggest YouTube success story with 16.5M subscribers. FreeFire gaming + 3D animations featuring Messi and Ronaldo. Massive MENA following.",
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'tech_gaming', subcategory_name: 'Tech & Gaming',
    sub_categories: ['tech_gaming', 'comedy_entertainment'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: true, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'lord_ahmed_official', facebook_name: null, tiktok_handle: null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_7chich',
    name: '7chich',
    description: 'Tunisian gaming entertainer and YouTuber with 1M+ subscribers. Posts humor, pranks, and family-friendly gaming videos across Instagram and TikTok.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'tech_gaming', subcategory_name: 'Tech & Gaming',
    sub_categories: ['tech_gaming', 'comedy_entertainment'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: false, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: '7chich', facebook_name: null, tiktok_handle: '7chich' },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_bnl',
    name: 'BNL (Oussema Elloumi)',
    description: 'Tunisian professional gamer and streamer specializing in Garena Free Fire. Recognized as a special guest at major gaming events.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'tech_gaming', subcategory_name: 'Tech & Gaming',
    sub_categories: ['tech_gaming'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: false, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'bnl.yt', facebook_name: 'Gaming BnL', tiktok_handle: null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_skander_karaa',
    name: 'Skander Karaa',
    description: 'Tunisian tech reviewer and digital entrepreneur with 310K+ followers. Focuses on smartphones, gadgets, and digital trends.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'tech_gaming', subcategory_name: 'Tech & Gaming',
    sub_categories: ['tech_gaming', 'education'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: false, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'skanderkaraa', facebook_name: null, tiktok_handle: null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  // ── Music & Art ───────────────────────────────────────────────────────────

  {
    id: 'influencer_balti',
    name: 'Balti (Mohamed Salah Balti)',
    description: 'One of the most influential figures in Tunisian rap with 7M+ YouTube subs. His hit "Ya Lili" amassed 776M views. Pioneer of Tunisian hip-hop.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art', 'comedy_entertainment'],
    location: 'Sulayman, Tunisia', latitude: 36.6954, longitude: 10.4907,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: true, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'balaborsa', facebook_name: 'thisizbalti', tiktok_handle: null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_samara',
    name: 'Samara (Samah Riahi)',
    description: 'Tunisian hip-hop artist with 5.84M YouTube subs and 2.96B total views. Hit "Galbi" received 153M views. Blends traditional Tunisian sounds with modern rap.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art'],
    location: 'Menzel Bourguiba, Tunisia', latitude: 37.1539, longitude: 9.7919,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: true, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'samaraofficial_', facebook_name: null, tiktok_handle: 'ladysamara' },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_eya_daghnouj',
    name: 'Eya Daghnouj',
    description: 'Tunisian singer known for captivating performances and covers of popular Arabic songs on TikTok.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'music_art', subcategory_name: 'Music & Art',
    sub_categories: ['music_art', 'comedy_entertainment'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: false, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'eya_daghnouj', facebook_name: null, tiktok_handle: 'eya_daghnouj' },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  // ── Sports ────────────────────────────────────────────────────────────────

  {
    id: 'influencer_hannibal_mejbri',
    name: 'Hannibal Mejbri',
    description: 'Tunisian professional footballer for Burnley FC and Tunisia national team. Adidas athlete with 1M+ Instagram followers.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'sports', subcategory_name: 'Sports',
    sub_categories: ['sports', 'fitness_health'],
    location: 'Burnley, UK', latitude: 53.7890, longitude: -2.2483,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: true, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'hannibal.mj', facebook_name: null, tiktok_handle: null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_ons_jabeur',
    name: 'Ons Jabeur',
    description: 'Tunisian professional tennis player and Global Ambassador for the World Food Programme. 1M+ Instagram followers. Trailblazer for Arab and African tennis.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'sports', subcategory_name: 'Sports',
    sub_categories: ['sports', 'fitness_health'],
    location: 'Ksar Hellal, Tunisia', latitude: 35.6467, longitude: 10.8950,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: true, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'onsjabeur', facebook_name: 'OnsJabeurOfficial', tiktok_handle: null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  // ── Food & Lifestyle ──────────────────────────────────────────────────────

  {
    id: 'influencer_oumaima_taleb',
    name: 'Oumaima Taleb',
    description: 'One of the most popular Tunisian influencers on Instagram with 4.9M subscribers. Known for lifestyle and beauty content showcasing Tunisian culture.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle',
    sub_categories: ['food_lifestyle', 'fashion_beauty'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: true, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'oumaima_taleb', facebook_name: null, tiktok_handle: null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_manel_amara',
    name: 'Manel Amara',
    description: 'Popular Tunisian influencer with 3.5M Instagram followers. Known for lifestyle content and fashion inspiration.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle',
    sub_categories: ['food_lifestyle', 'fashion_beauty'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: false, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'manelamara', facebook_name: null, tiktok_handle: null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  {
    id: 'influencer_jouda_jaballah',
    name: 'Jouda Jaballah',
    description: 'Tunisian TikTok creator from Sfax showcasing rural life, local markets, and regional dishes through relatable videos.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle',
    sub_categories: ['food_lifestyle', 'travel'],
    location: 'Sfax, Tunisia', latitude: 34.7406, longitude: 10.7603,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: false, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: null, facebook_name: null, tiktok_handle: 'jouda_jaballah' },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  // ── Education & Tips ──────────────────────────────────────────────────────

  {
    id: 'influencer_hichem_dn',
    name: 'Hichem DN',
    description: 'The standout education influencer in Tunisia with nearly 3M subscribers. Creates educational content for the Arabic-speaking audience.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'education', subcategory_name: 'Education & Tips',
    sub_categories: ['education'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: true, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'hichem.dn', facebook_name: null, tiktok_handle: null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },

  // ── Fitness & Health ──────────────────────────────────────────────────────

  {
    id: 'influencer_zeus_ch',
    name: 'Zeus CH',
    description: 'Tunisian certified fitness instructor and personal trainer. Former handball player turned fitness content creator on Instagram.',
    category_id: 'influencer', category_name: 'Influencer', subcategory_id: 'fitness_health', subcategory_name: 'Fitness & Health',
    sub_categories: ['fitness_health', 'sports'],
    location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0, is_featured: false, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: null, email: null, website: null, instagram_handle: 'zeus_ch', facebook_name: null, tiktok_handle: null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [ { stars: 5, percentage: 0 }, { stars: 4, percentage: 0 }, { stars: 3, percentage: 0 }, { stars: 2, percentage: 0 }, { stars: 1, percentage: 0 } ],
    category_ratings: [ { name: 'Content Quality', icon: 'video-check', rating: 0 }, { name: 'Authenticity', icon: 'shield-check', rating: 0 }, { name: 'Engagement', icon: 'heart-multiple', rating: 0 } ],
  },
];

// ── Seed Functions ──────────────────────────────────────────────────────────

async function ensureInfluencerCategory() {
  console.log('Ensuring "influencer" category exists in Firestore...');
  const catRef = db.collection('categories').doc('influencer');
  const catSnap = await catRef.get();

  if (!catSnap.exists) {
    await catRef.set({
      name: 'Influencer',
      icon: 'account-star',
      sort_order: 15,
      subcategories: [
        { id: 'fashion_beauty', name: 'Fashion & Beauty', category_id: 'influencer' },
        { id: 'food_lifestyle', name: 'Food & Lifestyle', category_id: 'influencer' },
        { id: 'tech_gaming', name: 'Tech & Gaming', category_id: 'influencer' },
        { id: 'fitness_health', name: 'Fitness & Health', category_id: 'influencer' },
        { id: 'travel', name: 'Travel', category_id: 'influencer' },
        { id: 'comedy_entertainment', name: 'Comedy & Entertainment', category_id: 'influencer' },
        { id: 'education', name: 'Education & Tips', category_id: 'influencer' },
        { id: 'business_finance', name: 'Business & Finance', category_id: 'influencer' },
        { id: 'music_art', name: 'Music & Art', category_id: 'influencer' },
        { id: 'sports', name: 'Sports', category_id: 'influencer' },
        { id: 'family_parenting', name: 'Family & Parenting', category_id: 'influencer' },
        { id: 'news_politics', name: 'News & Politics', category_id: 'influencer' },
        { id: 'other', name: 'Other', category_id: 'influencer' },
      ],
      rating_criteria: [
        { key: 'content_quality', label: 'Content Quality', icon: 'video-check' },
        { key: 'authenticity', label: 'Authenticity', icon: 'shield-check' },
        { key: 'engagement', label: 'Engagement', icon: 'heart-multiple' },
      ],
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('  + Created "influencer" category with all subcategories');
  } else {
    const data = catSnap.data() || {};
    const subs = Array.isArray(data.subcategories) ? data.subcategories : [];
    const existing = subs.map((s) => s.id);
    const newSubs = [
      { id: 'music_art', name: 'Music & Art', category_id: 'influencer' },
      { id: 'sports', name: 'Sports', category_id: 'influencer' },
      { id: 'family_parenting', name: 'Family & Parenting', category_id: 'influencer' },
      { id: 'news_politics', name: 'News & Politics', category_id: 'influencer' },
    ].filter((s) => !existing.includes(s.id));

    if (newSubs.length > 0) {
      await catRef.update({
        subcategories: [...subs, ...newSubs],
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  + Added ${newSubs.length} new subcategories: ${newSubs.map((s) => s.name).join(', ')}`);
    } else {
      console.log('  Category exists with all subcategories, skipping.');
    }
  }
}

async function seedInfluencers() {
  console.log('\nSeeding Tunisian influencers...\n');

  for (const biz of INFLUENCERS) {
    const { id, ...data } = biz;
    await db.collection('businesses').doc(id).set({
      ...data,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  + ${biz.name} — ${biz.location} [${biz.sub_categories.join(', ')}]`);
  }

  console.log(`\nSeeded ${INFLUENCERS.length} influencers.`);
}

async function main() {
  console.log('=== Seeding Tunisian Influencers ===\n');

  try {
    await ensureInfluencerCategory();
    await seedInfluencers();
    console.log('\nDone!');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }

  process.exit(0);
}

main();
