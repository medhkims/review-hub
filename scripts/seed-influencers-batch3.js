/**
 * Seed Tunisian Influencers — Batch 3
 *
 * Adds ~90 more Tunisian influencers across all categories.
 * Run with: node scripts/seed-influencers-batch3.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function makeInfluencer({ id, name, description, subcategory_id, subcategory_name, sub_categories, location, latitude, longitude, is_featured = false, contact = {} }) {
  return {
    id, name, description,
    category_id: 'influencer', category_name: 'Influencer',
    subcategory_id, subcategory_name, sub_categories,
    location, latitude, longitude,
    cover_image_url: null, logo_url: null, rating: 0, review_count: 0,
    is_featured, is_open: true, owner_id: 'system', status: 'active', is_verified: false,
    contact: { phone: contact.phone || null, email: contact.email || null, website: contact.website || null, instagram_handle: contact.instagram_handle || null, facebook_name: contact.facebook_name || null, tiktok_handle: contact.tiktok_handle || null },
    delivery_services: [], menu_categories: [],
    rating_distribution: [{ stars: 5, percentage: 0 },{ stars: 4, percentage: 0 },{ stars: 3, percentage: 0 },{ stars: 2, percentage: 0 },{ stars: 1, percentage: 0 }],
    category_ratings: [{ name: 'Content Quality', icon: 'video-check', rating: 0 },{ name: 'Authenticity', icon: 'shield-check', rating: 0 },{ name: 'Engagement', icon: 'heart-multiple', rating: 0 }],
  };
}

const INFLUENCERS = [

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTORS & TV PERSONALITIES
  // ═══════════════════════════════════════════════════════════════════════════

  makeInfluencer({ id: 'influencer_dhafer_labidine', name: "Dhafer L'Abidine", description: 'Tunisian actor and former professional soccer player with 4.1M Instagram followers. Appeared in Children of Men, Sex and the City 2, and Centurion. Brand ambassador for Cartier.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment', 'fashion_beauty', 'sports'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: 'dhaferlabidine' } }),

  makeInfluencer({ id: 'influencer_aicha_ben_ahmed', name: 'Aicha Ben Ahmed', description: 'Tunisian actress with 2.7M Instagram and 1.3M TikTok followers. Known for The Money (2019), Renegades (2018), and Newton\'s Cradle (2021). Won Best Actress at Al Hoceima Film Festival 2016.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment', 'fashion_beauty'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: 'aichabahmed' } }),

  makeInfluencer({ id: 'influencer_maram_ben_aziza', name: 'Maram Ben Aziza', description: 'Tunisian actress, model, and entrepreneur with 2.6M Instagram followers. Best known for her role as Selima in the series Maktoub. Major social media influencer and brand collaborator.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment', 'fashion_beauty'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: 'marambenazizaofficial' } }),

  makeInfluencer({ id: 'influencer_dareen_haddad', name: 'Dareen Haddad', description: 'Tunisian actress with 3.4M Instagram followers. Known for her roles in Arab drama series and films. One of the most followed Tunisian actresses on social media.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment', 'fashion_beauty'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: 'dareen_haddad' } }),

  makeInfluencer({ id: 'influencer_samia_trabelsi', name: 'Samia Trabelsi', description: 'Tunisian actress with 2.2M Instagram and 657K TikTok followers. Known for Another Life (2016), Eish Hayatak (2019), and Mesh Rayhin fi Dahyah (2017).', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment', 'fashion_beauty'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'samiatrabelsiii' } }),

  makeInfluencer({ id: 'influencer_atia_aicha', name: 'Atia Aicha', description: 'Tunisian actress with 3.2M Instagram followers. Popular across the Arab world for her TV and film roles, with strong social media engagement.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: 'atiaaichaofficial' } }),

  makeInfluencer({ id: 'influencer_samira_magroun', name: 'Samira Magroun Zain', description: 'Tunisian actress known for curating a gorgeous Instagram feed. Active in Tunisian TV and film, sharing behind-the-scenes content and fashion looks.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment', 'fashion_beauty'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'samiramagroun' } }),

  makeInfluencer({ id: 'influencer_nassim_ziadia', name: 'Nassim Ziadia', description: 'Tunisian actor and lifestyle influencer. Shares content blending his acting career with daily lifestyle, fashion, and personal moments.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment', 'food_lifestyle'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'nasseem_ziadia' } }),

  makeInfluencer({ id: 'influencer_nejib_belkadhi', name: 'Nejib Belkadhi', description: 'Tunisian filmmaker, producer, and actor. Known for his contributions to Tunisian cinema and creative storytelling on social media.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment', 'music_art'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'nejibbelkadhi' } }),

  makeInfluencer({ id: 'influencer_riomadon', name: 'Riomadon', description: 'Tunisian comedy content creator ranking 3rd in Tunisia with over 6.1M followers on TikTok and YouTube combined. Creates viral comedy skits and entertainment content.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: {} }),

  makeInfluencer({ id: 'influencer_gafsi_berwile', name: 'Gafsi Berwile', description: 'Tunisian comedian and YouTuber known for comedic videos, sketches, and commentary. Has a significant following with high engagement on his humorous posts.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Gafsa, Tunisia', latitude: 34.4250, longitude: 8.7842, contact: {} }),

  makeInfluencer({ id: 'influencer_saad_jmal', name: 'Saad Jmal', description: 'Tunisian YouTuber known for comedy and social commentary. Creates entertaining videos discussing Tunisian culture and current events.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: {} }),

  makeInfluencer({ id: 'influencer_samy_chaffai', name: 'Samy Chaffai', description: 'Tunisian film director, PhD film student, and top-ranked TikToker in Tunisia (93.5 Favikon score). Producer at Teleported Production, creates filmmaking and inspirational content.', subcategory_id: 'content_creator', subcategory_name: 'Content Creator', sub_categories: ['content_creator', 'filmmaker'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { tiktok_handle: 'samychaffai' } }),

  makeInfluencer({ id: 'influencer_fidaal', name: 'Fidaal Ben Zareb', description: 'Tunisian TikTok creator known for cross-North Africa content around fortune/fate memes. Prominent in Tunisia, Algeria, and Morocco, collaborating with regional creators.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'fidaal' } }),

  makeInfluencer({ id: 'influencer_rafika_aouaay', name: 'Rafika Aouaay', description: 'Tunisian TikTok creator with 1.3M+ followers. Known for engaging and humorous content featuring relatable videos, cultural references, and comedic skits.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'rafika_aouaay' } }),

  makeInfluencer({ id: 'influencer_kiki_messaoudi', name: 'Kiki Messaoudi', description: 'Tunisian TikTok comedian and entertainer. Creates comedy and entertainment content popular among Tunisian audiences.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'kikimessaoudi' } }),

  makeInfluencer({ id: 'influencer_amroush', name: 'Amroush', description: 'Tunisian TikTok creator known for humor and relationship content. Creates relatable videos about daily life and relationships in Tunisia.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'amroush_tn' } }),

  makeInfluencer({ id: 'influencer_im_alien', name: 'Im Alien', description: 'Tunisian entertainment content creator with 682K Instagram followers. Creates diverse entertainment content popular in the Tunisian digital space.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'im_alien.02' } }),

  makeInfluencer({ id: 'influencer_hagani', name: 'Hagani', description: 'Tunisian content creator with 2.3M TikTok followers. Known for TikTok challenges, vlogs, and engaging lifestyle content.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment', 'food_lifestyle'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { tiktok_handle: 'hagani' } }),

  // ═══════════════════════════════════════════════════════════════════════════
  // MUSIC & ART (more)
  // ═══════════════════════════════════════════════════════════════════════════

  makeInfluencer({ id: 'influencer_latifa', name: 'Latifa', description: 'Iconic Tunisian pop singer and actress residing in Egypt with 3.5M Instagram followers. Winner of World Music Awards 2004 for Best Selling Artist in the Middle East — the first Tunisian to receive this award.', subcategory_id: 'music_art', subcategory_name: 'Music & Art', sub_categories: ['music_art'], location: 'Cairo, Egypt', latitude: 30.0444, longitude: 31.2357, is_featured: true, contact: { instagram_handle: 'latifaofficial' } }),

  makeInfluencer({ id: 'influencer_zaza_show', name: 'Zaza Show (Zeineb Sawen)', description: 'Tunisian singer, performer, and composer with 2.4M Instagram and 570K TikTok followers. Graduated from University of Sfax in business before pursuing music in 2010.', subcategory_id: 'music_art', subcategory_name: 'Music & Art', sub_categories: ['music_art'], location: 'Sfax, Tunisia', latitude: 34.7406, longitude: 10.7603, is_featured: true, contact: { instagram_handle: 'zaza_show_' } }),

  makeInfluencer({ id: 'influencer_ghali', name: 'Ghali Amdouni', description: 'Italian rapper of Tunisian origins with 3.6M Instagram and 1.6M TikTok followers. Known for humanitarian work saving migrants in the Mediterranean. Major international hip-hop artist.', subcategory_id: 'music_art', subcategory_name: 'Music & Art', sub_categories: ['music_art'], location: 'Milan, Italy', latitude: 45.4642, longitude: 9.1900, is_featured: true, contact: { instagram_handle: 'ghali' } }),

  makeInfluencer({ id: 'influencer_emp1re', name: 'EMP1RE', description: 'Top-ranked Tunisian YouTuber (85.9 Favikon score) creating hip-hop and rap music content. Known for engaging music videos and collaborations in the Tunisian rap scene.', subcategory_id: 'music_art', subcategory_name: 'Music & Art', sub_categories: ['music_art'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: {} }),

  makeInfluencer({ id: 'influencer_mouka', name: 'Mouka', description: 'Tunisian rapper and music creator on YouTube. Produces rap and hip-hop content contributing to the growing Tunisian music scene.', subcategory_id: 'music_art', subcategory_name: 'Music & Art', sub_categories: ['music_art'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: {} }),

  makeInfluencer({ id: 'influencer_marco_mahmoud', name: 'Marco Mahmoud', description: 'Tunisian rapper known for hip-hop and drill music. Creates engaging music videos and actively promotes his work on YouTube and Instagram.', subcategory_id: 'music_art', subcategory_name: 'Music & Art', sub_categories: ['music_art'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: {} }),

  makeInfluencer({ id: 'influencer_ala', name: 'A.L.A', description: 'Tunisian music artist with 2.6M YouTube subscribers. One of the biggest names in Tunisian entertainment and hip-hop music.', subcategory_id: 'music_art', subcategory_name: 'Music & Art', sub_categories: ['music_art'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: 'a.l.a_official' } }),

  makeInfluencer({ id: 'influencer_nour_kamar', name: 'Nour Kamar', description: 'Tunisian music artist with 657K Instagram followers. Creates music content and engages actively with fans on social media.', subcategory_id: 'music_art', subcategory_name: 'Music & Art', sub_categories: ['music_art'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'nourkamarofficiel' } }),

  makeInfluencer({ id: 'influencer_wadii_art', name: 'Wadii Art', description: 'Tunisian artist with 868K Instagram followers. Founder of Seven Collectives, creates art-focused content showcasing creative talent from Tunisia.', subcategory_id: 'music_art', subcategory_name: 'Music & Art', sub_categories: ['music_art'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'wadii_art' } }),

  // ═══════════════════════════════════════════════════════════════════════════
  // FASHION & BEAUTY (more)
  // ═══════════════════════════════════════════════════════════════════════════

  makeInfluencer({ id: 'influencer_ons_hm', name: 'Ons Hm', description: 'Tunisian beauty and lifestyle YouTuber focusing on skincare, makeup, and fashion tutorials. Ranked in Favikon top 20 Instagram influencers in Tunisia.', subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty', sub_categories: ['fashion_beauty'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'onshm' } }),

  makeInfluencer({ id: 'influencer_yassin_ben_gamra', name: 'Yassin Ben Gamra', description: 'One of the top stylish Tunisian men on Instagram. Known for sophisticated fashion content and representing Tunisian men\'s fashion scene.', subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty', sub_categories: ['fashion_beauty'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'yassinebengamra' } }),

  makeInfluencer({ id: 'influencer_bochra_chedly', name: 'Bochra Chedly', description: 'Tunisian lifestyle and beauty influencer with 810K Instagram followers. Shares beauty tips, lifestyle content, and fashion inspiration.', subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty', sub_categories: ['fashion_beauty', 'food_lifestyle'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'bochrachedly' } }),

  makeInfluencer({ id: 'influencer_ambrine_beauty', name: 'Ambrine Beauty', description: 'Tunisian beauty influencer with 604K Instagram followers. Creates makeup tutorials, beauty reviews, and skincare content for Tunisian audiences.', subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty', sub_categories: ['fashion_beauty'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'ambrinebeauty' } }),

  makeInfluencer({ id: 'influencer_fatma_bou_oun', name: 'Fatma Bou Oun', description: 'Tunisian fashion, beauty, and motherhood influencer. Creates content about fashion, beauty tips, and life as a mother in Tunisia.', subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty', sub_categories: ['fashion_beauty', 'family_parenting'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'fatma_bou_oun' } }),

  makeInfluencer({ id: 'influencer_yassouk', name: 'Yassouk', description: 'Tunisian TikTok beauty and lifestyle creator. Shares life experiences, beauty tutorials, unboxings, and daily vlogs between Dubai and Tunisia.', subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty', sub_categories: ['fashion_beauty', 'food_lifestyle'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'yassouk' } }),

  makeInfluencer({ id: 'influencer_inlabi_ines', name: 'Inlabi Ines', description: 'Tunisian fashion and lifestyle TikTok creator. Known for trendy fashion content and lifestyle videos popular among young Tunisian audiences.', subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty', sub_categories: ['fashion_beauty', 'food_lifestyle'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'inlabi' } }),

  makeInfluencer({ id: 'influencer_yousr_fg', name: 'Yousr FG', description: 'Tunisian lifestyle influencer with 1.5M Instagram and 1.2M TikTok followers. Creates diverse lifestyle content with a strong Tunisian following.', subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty', sub_categories: ['fashion_beauty', 'food_lifestyle'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: 'yousr.fg' } }),

  makeInfluencer({ id: 'influencer_azza_slimene', name: 'Azza Slimene', description: 'Tunisian model, actress, and activist. Ambassador for No More Plastic and FIDH, promoting sustainability and women\'s empowerment alongside modeling and TikTok content.', subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty', sub_categories: ['fashion_beauty', 'news_politics'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'azzaslimene' } }),

  makeInfluencer({ id: 'influencer_yousra_mannai', name: 'Yousra Mannai', description: 'Tunisian theater actress, fashion, beauty, and art influencer. Creates content at the intersection of performing arts and fashion.', subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty', sub_categories: ['fashion_beauty', 'music_art'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'yousra_mannai' } }),

  makeInfluencer({ id: 'influencer_malouka_iren', name: 'Malouka Iren', description: 'Tunisian-German lifestyle influencer with 1.2M followers. Owner of Miren Shop, creates lifestyle and fashion content between Germany and Tunisia.', subcategory_id: 'fashion_beauty', subcategory_name: 'Fashion & Beauty', sub_categories: ['fashion_beauty', 'food_lifestyle'], location: 'Germany', latitude: 51.1657, longitude: 10.4515, is_featured: true, contact: { instagram_handle: 'malouka_iren__official' } }),

  makeInfluencer({ id: 'influencer_belkis_ksri', name: 'Beki Ksri', description: 'Tunisian video blogger with 2.9M Instagram and 1.8M TikTok followers. One of the most popular content creators in Tunisia with massive cross-platform reach.', subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle', sub_categories: ['food_lifestyle', 'fashion_beauty'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: 'beki_ksri' } }),

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOD & LIFESTYLE (more)
  // ═══════════════════════════════════════════════════════════════════════════

  makeInfluencer({ id: 'influencer_foudecakes', name: 'Foudecakes', description: 'Tunisian food, prank, and experience creator with 2.6M Instagram followers. One of the most followed food content creators in Tunisia.', subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle', sub_categories: ['food_lifestyle', 'comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: 'foudecakes' } }),

  makeInfluencer({ id: 'influencer_koul_time', name: 'Koul Time', description: 'Tunisian food reviewer and vlogger with 1.1M Instagram followers. Creates food review content, eating challenges, and culinary vlogs across Tunisia.', subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle', sub_categories: ['food_lifestyle'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: 'koul_time' } }),

  makeInfluencer({ id: 'influencer_asma_khalil', name: 'Asma Khalil', description: 'Tunisian culture, cuisine, and family content creator. Shares authentic Tunisian culture, traditional recipes, and family-oriented content.', subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle', sub_categories: ['food_lifestyle', 'family_parenting'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'asmakhalil' } }),

  makeInfluencer({ id: 'influencer_ghada_achref', name: 'Ghada Achref', description: 'Tunisian lifestyle influencer with 1.7M Instagram followers. Creates diverse lifestyle content connecting with a wide Tunisian audience.', subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle', sub_categories: ['food_lifestyle'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: 'ghada.achref' } }),

  makeInfluencer({ id: 'influencer_olfa_cuisine', name: 'Olfa', description: 'Tunisian home cook and YouTube creator sharing easy and diverse recipes focusing on Tunisian cuisine, with quick recipes, cooking tips, and personal culinary insights.', subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle', sub_categories: ['food_lifestyle'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: {} }),

  makeInfluencer({ id: 'influencer_syrine_zanina', name: 'Syrine Zanina', description: 'Tunisian YouTube creator focused on family and cooking content. Shares family life vlogs alongside Tunisian recipe tutorials and cooking tips.', subcategory_id: 'food_lifestyle', subcategory_name: 'Food & Lifestyle', sub_categories: ['food_lifestyle', 'family_parenting'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: {} }),

  // ═══════════════════════════════════════════════════════════════════════════
  // TRAVEL & CULTURE
  // ═══════════════════════════════════════════════════════════════════════════

  makeInfluencer({ id: 'influencer_fahmi_selmi', name: 'Fahmi Selmi', description: 'Tunisian travel and culture YouTuber. Creates content exploring Tunisia and various countries, featuring stories about the Tunisian diaspora, local traditions, and travel adventures.', subcategory_id: 'travel', subcategory_name: 'Travel', sub_categories: ['travel', 'food_lifestyle'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'mezianissimi' } }),

  makeInfluencer({ id: 'influencer_mayssa_abdelkefi', name: 'Mayssa Abdelkefi', description: 'Tunisian travel and lifestyle TikTok creator. Shares travel experiences and lifestyle content showcasing destinations in Tunisia and beyond.', subcategory_id: 'travel', subcategory_name: 'Travel', sub_categories: ['travel', 'food_lifestyle'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'mayssaabdelkefi1' } }),

  // ═══════════════════════════════════════════════════════════════════════════
  // TECH & GAMING (more)
  // ═══════════════════════════════════════════════════════════════════════════

  makeInfluencer({ id: 'influencer_ameer_slow', name: 'Ameer Slow', description: 'Tunisian gaming YouTuber with 4.21M subscribers. One of the biggest gaming content creators in Tunisia, creating entertainment and gaming videos.', subcategory_id: 'tech_gaming', subcategory_name: 'Tech & Gaming', sub_categories: ['tech_gaming', 'comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: {} }),

  makeInfluencer({ id: 'influencer_ghaith_bacha', name: 'Ghaith Ouerdiane Bacha', description: 'Tunisian gaming YouTuber specializing in FIFA content. Creates gaming videos, FIFA gameplay, and football-related gaming entertainment.', subcategory_id: 'tech_gaming', subcategory_name: 'Tech & Gaming', sub_categories: ['tech_gaming', 'sports'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: {} }),

  makeInfluencer({ id: 'influencer_unitech_tunisia', name: 'Unitech Tunisia', description: 'Tunisian tech content creator with 905K Instagram followers. Reviews technology, gadgets, and digital trends for Tunisian tech enthusiasts.', subcategory_id: 'tech_gaming', subcategory_name: 'Tech & Gaming', sub_categories: ['tech_gaming'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'unitechtunisia' } }),

  // ═══════════════════════════════════════════════════════════════════════════
  // EDUCATION (more)
  // ═══════════════════════════════════════════════════════════════════════════

  makeInfluencer({ id: 'influencer_3ich_english', name: '3ich English', description: 'Tunisian education influencer with 2.2M Instagram followers. Creates English-language educational content for Arabic-speaking audiences, one of the biggest education accounts in Tunisia.', subcategory_id: 'education', subcategory_name: 'Education & Tips', sub_categories: ['education'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: '3ichenglish' } }),

  makeInfluencer({ id: 'influencer_ayoub_meftah', name: 'Ayoub Meftah', description: 'Tunisian content creator focused on Islamic teachings and moral guidance. Creates educational and spiritual content for Tunisian and Arabic-speaking audiences.', subcategory_id: 'education', subcategory_name: 'Education & Tips', sub_categories: ['education'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { instagram_handle: 'ayoub_meftah' } }),

  // ═══════════════════════════════════════════════════════════════════════════
  // FITNESS & HEALTH (more)
  // ═══════════════════════════════════════════════════════════════════════════

  makeInfluencer({ id: 'influencer_ela_ben_salem', name: 'Ela Ben Salem', description: 'Tunisian fitness and calisthenics TikTok creator. Known for impressive calisthenics routines and fitness content inspiring young Tunisians to exercise.', subcategory_id: 'fitness_health', subcategory_name: 'Fitness & Health', sub_categories: ['fitness_health', 'sports'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'elabensalem' } }),

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERAL / LIFESTYLE / MULTI-CATEGORY
  // ═══════════════════════════════════════════════════════════════════════════

  makeInfluencer({ id: 'influencer_9ron9oss', name: '9ron9oss', description: 'Tunisian content creator with 1.4M Instagram followers. Creates general lifestyle and entertainment content popular with Tunisian audiences.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment', 'food_lifestyle'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: '9ron9oss' } }),

  makeInfluencer({ id: 'influencer_raouf_bkhelif', name: 'Raouf Bkhelif', description: 'Tunisian content creator with 1.2M Instagram followers. Creates diverse content engaging with Tunisian culture and lifestyle topics.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, is_featured: true, contact: { instagram_handle: 'raoufbkhelif' } }),

  makeInfluencer({ id: 'influencer_hamza_belloumi', name: 'Hamza Belloumi', description: 'Tunisian media producer and presenter. Known for investigative programs on TV and radio, now creating documentary and media content on YouTube.', subcategory_id: 'news_politics', subcategory_name: 'News & Politics', sub_categories: ['news_politics', 'education'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: {} }),

  // ═══════════════════════════════════════════════════════════════════════════
  // TIKTOK CREATORS (Carthage Magazine list)
  // ═══════════════════════════════════════════════════════════════════════════

  makeInfluencer({ id: 'influencer_nader_jerbi', name: 'Nader Jerbi', description: 'Tunisian TikTok creator known for comedy and news parody content. Creates entertaining takes on current events and news from a Tunisian perspective.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment', 'news_politics'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'naderjerbi' } }),

  makeInfluencer({ id: 'influencer_ch_dhekra', name: 'Ch Dhekra', description: 'Tunisian TikTok creator known for trending and general content. One of the popular Tunisian TikTokers featured by Carthage Magazine.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'ch.dhekra' } }),

  makeInfluencer({ id: 'influencer_ahmed_sehli', name: 'Ahmed Sehli', description: 'Tunisian TikTok creator known for duets and comedy content. Creates entertaining collaborative videos and humorous skits.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'sahli_ahmed' } }),

  makeInfluencer({ id: 'influencer_ghofran_khmiri', name: 'Ghofran Khmiri', description: 'Tunisian TikTok creator making diverse content. Popular among Tunisian TikTok audiences for engaging and relatable videos.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'ghofkhmiri' } }),

  makeInfluencer({ id: 'influencer_rahma_laribi', name: 'Rahma Laribi', description: 'Tunisian TikTok creator known for participating in viral challenges. Creates trendy challenge content and entertainment videos.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'rahmalaribi_' } }),

  makeInfluencer({ id: 'influencer_imen_khedher', name: 'Imen Khedher', description: 'Tunisian TikTok humor creator. Known for comedic content and funny skits that resonate with Tunisian audiences.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'khedherimen' } }),

  makeInfluencer({ id: 'influencer_fratelo_lazher', name: 'Fratelo Lazher', description: 'Tunisian TikTok creator known for creative slow-motion video content. Creates visually impressive videos using slow-motion effects.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment', 'music_art'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'fratelo_lazhar' } }),

  makeInfluencer({ id: 'influencer_rania_doghri', name: 'Rania Doghri', description: 'Tunisian TikTok creator known for dance and challenge content. Creates engaging dance videos and participates in trending TikTok challenges.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'raniadoghri34' } }),

  makeInfluencer({ id: 'influencer_nour_barkouki', name: 'Nour Barkouki', description: 'Tunisian TikTok creator making diverse content. Popular in the Tunisian TikTok community for relatable and entertaining videos.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'nourbarkouki' } }),

  makeInfluencer({ id: 'influencer_balkiss_hmidi', name: 'Balkiss Hmidi', description: 'Tunisian TikTok creator known for challenge participation content. Creates trending challenge videos and entertainment content.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'balkiss.hmidi' } }),

  makeInfluencer({ id: 'influencer_ichrak_hamdi', name: 'Ichrak Hamdi', description: 'Tunisian TikTok entertainment creator. Produces engaging entertainment content for the Tunisian digital audience.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'ichrak_hamdi' } }),

  makeInfluencer({ id: 'influencer_amal_fathi', name: 'Amal Fathi', description: 'Tunisian TikTok creator focused on music and entertainment content. Creates engaging music-related videos on TikTok and Instagram.', subcategory_id: 'music_art', subcategory_name: 'Music & Art', sub_categories: ['music_art', 'comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'amalfathi1' } }),

  makeInfluencer({ id: 'influencer_hajer_rouigui', name: 'Hajer Rouigui', description: 'Tunisian TikTok creator making diverse content. Featured among the most famous Tunisian TikTokers by Carthage Magazine.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'hajerrouigui1' } }),

  makeInfluencer({ id: 'influencer_asma_naggara', name: 'Asma Naggara', description: 'Tunisian TikTok creator making general entertainment content. Part of the growing Tunisian TikTok creator community.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'asmang6' } }),

  makeInfluencer({ id: 'influencer_emine_djappa', name: 'Emine Djappa', description: 'Tunisian TikTok creator making general content. Featured among popular Tunisian TikTokers for engaging and relatable videos.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'emine_djappa_officiel' } }),

  makeInfluencer({ id: 'influencer_yosra_sdiri', name: 'Yosra Sdiri', description: 'Tunisian TikTok creator known for slow-motion content. Creates creative and visually appealing slow-motion videos on TikTok.', subcategory_id: 'comedy_entertainment', subcategory_name: 'Comedy & Entertainment', sub_categories: ['comedy_entertainment'], location: 'Tunis, Tunisia', latitude: 36.8065, longitude: 10.1815, contact: { tiktok_handle: 'sdiriyosra' } }),
];

// ── Seed Function ────────────────────────────────────────────────────────────

async function seedInfluencers() {
  console.log('=== Seeding Tunisian Influencers — Batch 3 ===\n');
  let created = 0, skipped = 0;

  for (const biz of INFLUENCERS) {
    const { id, ...data } = biz;
    const docRef = db.collection('businesses').doc(id);
    const existing = await docRef.get();
    if (existing.exists) { console.log(`  ~ SKIP: ${biz.name}`); skipped++; continue; }
    await docRef.set({ ...data, created_at: admin.firestore.FieldValue.serverTimestamp(), updated_at: admin.firestore.FieldValue.serverTimestamp() });
    console.log(`  + ${biz.name} [${biz.sub_categories.join(', ')}]`);
    created++;
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}, Total in batch: ${INFLUENCERS.length}`);
}

async function main() {
  try { await seedInfluencers(); } catch (err) { console.error('Seed failed:', err); process.exit(1); }
  process.exit(0);
}

main();
