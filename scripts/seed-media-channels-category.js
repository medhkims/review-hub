/**
 * 1. Seeds the new `media_channels` category to Firestore.
 * 2. Migrates all TV channels, radio stations, news portals, and YouTube
 *    media channels from `influencer` category to `media_channels`.
 */
const admin = require('firebase-admin');
const sa = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// ─── New category definition ─────────────────────────────────────────────────
const MEDIA_CHANNELS_CATEGORY = {
  id: 'media_channels',
  name: 'Media & Channels',
  icon: 'television-play',
  sort_order: 16,
  subcategories: [
    { id: 'tv_channel',          name: 'TV Channel',           category_id: 'media_channels' },
    { id: 'radio_station',       name: 'Radio Station',        category_id: 'media_channels' },
    { id: 'news_portal',         name: 'News Portal',          category_id: 'media_channels' },
    { id: 'newspaper_magazine',  name: 'Newspaper & Magazine', category_id: 'media_channels' },
    { id: 'youtube_channel',     name: 'YouTube Channel',      category_id: 'media_channels' },
    { id: 'podcast',             name: 'Podcast',              category_id: 'media_channels' },
    { id: 'streaming_platform',  name: 'Streaming Platform',   category_id: 'media_channels' },
    { id: 'other',               name: 'Other',                category_id: 'media_channels' },
  ],
  rating_criteria: [
    { key: 'content_quality', label: 'Content Quality', icon: 'video-check' },
    { key: 'reliability',     label: 'Reliability',     icon: 'shield-check' },
    { key: 'audience_reach',  label: 'Audience Reach',  icon: 'account-group' },
  ],
  is_deleted: false,
};

// ─── Documents to migrate (doc_id → new subcategory) ─────────────────────────
const MIGRATIONS = [
  // TV Channels
  { id: 'influencer_nessma_tv',          sub_id: 'tv_channel',         sub_name: 'TV Channel' },
  { id: 'influencer_hannibal_tv_tn',     sub_id: 'tv_channel',         sub_name: 'TV Channel' },
  { id: 'influencer_alhiwar_ettounsi',   sub_id: 'tv_channel',         sub_name: 'TV Channel' },
  { id: 'influencer_attessiatv',         sub_id: 'tv_channel',         sub_name: 'TV Channel' },
  { id: 'influencer_tct_tv',             sub_id: 'tv_channel',         sub_name: 'TV Channel' },
  { id: 'influencer_tunisie_sport_tv',   sub_id: 'tv_channel',         sub_name: 'TV Channel' },

  // Radio Stations
  { id: 'influencer_mosaique_fm',        sub_id: 'radio_station',      sub_name: 'Radio Station' },
  { id: 'influencer_express_fm',         sub_id: 'radio_station',      sub_name: 'Radio Station' },
  { id: 'influencer_jawhara_fm',         sub_id: 'radio_station',      sub_name: 'Radio Station' },
  { id: 'influencer_ifm_radio',          sub_id: 'radio_station',      sub_name: 'Radio Station' },

  // News Portals
  { id: 'influencer_nawaat_blog',        sub_id: 'news_portal',        sub_name: 'News Portal' },
  { id: 'influencer_inkyfada_press',     sub_id: 'news_portal',        sub_name: 'News Portal' },
  { id: 'influencer_wmc_media',          sub_id: 'news_portal',        sub_name: 'News Portal' },
  { id: 'influencer_kapitalis_media',    sub_id: 'news_portal',        sub_name: 'News Portal' },

  // Newspapers & Magazines
  { id: 'influencer_leaders_tn',         sub_id: 'newspaper_magazine', sub_name: 'Newspaper & Magazine' },
  { id: 'influencer_realites_tn',        sub_id: 'newspaper_magazine', sub_name: 'Newspaper & Magazine' },

  // YouTube Media Channels
  { id: 'influencer_gold_music_tn',      sub_id: 'youtube_channel',    sub_name: 'YouTube Channel' },
  { id: 'influencer_nocturne_music_tn',  sub_id: 'youtube_channel',    sub_name: 'YouTube Channel' },
  { id: 'influencer_mazaj_music_tn',     sub_id: 'youtube_channel',    sub_name: 'YouTube Channel' },
  { id: 'influencer_top_music_tn',       sub_id: 'youtube_channel',    sub_name: 'YouTube Channel' },
  { id: 'influencer_football_tn_yt',     sub_id: 'youtube_channel',    sub_name: 'YouTube Channel' },
  { id: 'influencer_rap_tn_yt',          sub_id: 'youtube_channel',    sub_name: 'YouTube Channel' },
  { id: 'influencer_malouf_tn_yt',       sub_id: 'youtube_channel',    sub_name: 'YouTube Channel' },
  { id: 'influencer_cinema_tn_yt',       sub_id: 'youtube_channel',    sub_name: 'YouTube Channel' },
  { id: 'influencer_music_tn_page',      sub_id: 'youtube_channel',    sub_name: 'YouTube Channel' },
];

const NEW_RATING_CRITERIA = [
  { name: 'Content Quality', icon: 'video-check',   rating: 0 },
  { name: 'Reliability',     icon: 'shield-check',  rating: 0 },
  { name: 'Audience Reach',  icon: 'account-group', rating: 0 },
];

async function run() {
  // ── Step 1: Seed the category ──────────────────────────────────────────────
  console.log('=== Step 1: Seeding media_channels category ===');
  const catRef = db.collection('categories').doc('media_channels');
  const catSnap = await catRef.get();
  if (catSnap.exists) {
    console.log('  Category already exists — updating...');
    await catRef.set(MEDIA_CHANNELS_CATEGORY, { merge: true });
  } else {
    await catRef.set(MEDIA_CHANNELS_CATEGORY);
    console.log('  ✓ Category created: media_channels');
  }

  // Also bump `other` category sort_order to 17
  await db.collection('categories').doc('other').set({ sort_order: 17 }, { merge: true });
  console.log('  ✓ other category sort_order → 17');

  // ── Step 2: Migrate documents ─────────────────────────────────────────────
  console.log('\n=== Step 2: Migrating TV/Radio/News docs from influencer → media_channels ===');
  let migrated = 0, notFound = 0;

  for (const item of MIGRATIONS) {
    const ref = db.collection('businesses').doc(item.id);
    const snap = await ref.get();
    if (!snap.exists) {
      console.log(`  ? Not found: ${item.id}`);
      notFound++;
      continue;
    }
    await ref.update({
      category_id:      'media_channels',
      category_name:    'Media & Channels',
      subcategory_id:   item.sub_id,
      subcategory_name: item.sub_name,
      sub_categories:   [item.sub_id],
      category_ratings: NEW_RATING_CRITERIA,
    });
    console.log(`  ✓ Migrated: ${snap.data().name} → ${item.sub_name}`);
    migrated++;
  }

  // ── Step 3: Final counts ──────────────────────────────────────────────────
  console.log('\n=== Step 3: Verification ===');
  const [influencerSnap, mediaSnap] = await Promise.all([
    db.collection('businesses').where('category_id', '==', 'influencer').get(),
    db.collection('businesses').where('category_id', '==', 'media_channels').get(),
  ]);
  console.log(`  Influencer docs remaining : ${influencerSnap.size}`);
  console.log(`  Media & Channels docs     : ${mediaSnap.size}`);
  console.log(`\nDone! Migrated: ${migrated}, Not found: ${notFound}`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
