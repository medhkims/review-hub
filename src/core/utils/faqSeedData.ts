import { FaqAudience } from '@/domain/faq/entities/faqEntity';

export interface FaqSeedItem {
  question: string;
  answer: string;
  order: number;
  audiences: FaqAudience[];
}

export const FAQ_SEED_DATA: FaqSeedItem[] = [
  // ─── USER ────────────────────────────────────────────────────────────────────
  {
    question: 'How do I write a review?',
    answer:
      'Find a business on the home screen or through search, open its profile, then tap "Write a Review". Choose a star rating from 1 to 5, write your experience, and tap Submit.',
    order: 1,
    audiences: ['user'],
  },
  {
    question: 'Can I edit or delete my review?',
    answer:
      'Yes. Go to My Reviews in your profile, find the review you want to change, and tap the Edit or Delete option. Deleted reviews are permanently removed.',
    order: 2,
    audiences: ['user'],
  },
  {
    question: 'Why was my review removed?',
    answer:
      'Reviews may be removed if they violate our community guidelines — such as offensive language, personal attacks, spam, or content that is unrelated to the business experience.',
    order: 3,
    audiences: ['user'],
  },
  {
    question: 'How is the overall star rating calculated?',
    answer:
      'The overall rating displayed on a business profile is the average of all approved reviews submitted by users. It updates automatically whenever a new review is added or removed.',
    order: 4,
    audiences: ['user'],
  },
  {
    question: 'Is my personal information visible to businesses?',
    answer:
      'Only your display name and profile photo are shown alongside your reviews. Your email address, phone number, and other contact details are always kept private.',
    order: 5,
    audiences: ['user'],
  },
  {
    question: 'How do I report a fake or misleading review?',
    answer:
      'Tap the flag icon on any review to submit a report. Describe the issue and our moderation team will investigate within 48 hours.',
    order: 6,
    audiences: ['user'],
  },
  {
    question: 'Can I search for businesses near my location?',
    answer:
      'Yes. Use the search bar on the home screen and make sure location permission is enabled in your device settings for the best nearby results.',
    order: 7,
    audiences: ['user'],
  },
  {
    question: 'What does the verification badge on a business mean?',
    answer:
      'A verification badge means the business has submitted official documents and been approved by our team. It indicates the listing is legitimate and the business information is confirmed.',
    order: 8,
    audiences: ['user'],
  },

  // ─── BUSINESS ────────────────────────────────────────────────────────────────
  {
    question: 'How do I claim my business profile?',
    answer:
      'Find your business in the app and tap "Claim This Business". You will be guided through an ownership verification process using your registered business email or phone number.',
    order: 1,
    audiences: ['business'],
  },
  {
    question: 'How can I respond to customer reviews?',
    answer:
      'Open the review you want to respond to and tap "Reply". Your response is public and visible to all users. Keep your reply professional and constructive.',
    order: 2,
    audiences: ['business'],
  },
  {
    question: 'Can I remove a negative review?',
    answer:
      'Businesses cannot remove reviews directly. However, you can flag any review that you believe violates our guidelines. Moderators will investigate and take action if appropriate.',
    order: 3,
    audiences: ['business'],
  },
  {
    question: 'How do I update my business information?',
    answer:
      'Go to your Business Profile, tap Edit, and update your name, address, opening hours, category, or photos. Changes are reflected immediately after saving.',
    order: 4,
    audiences: ['business'],
  },
  {
    question: 'How do I get my business verified with a badge?',
    answer:
      'Submit a verification request from your Business Profile settings. You will need to upload official documents such as a trade license or registration certificate. Our team reviews requests within 3–5 business days.',
    order: 5,
    audiences: ['business'],
  },
  {
    question: 'What happens if my business is reported?',
    answer:
      'Our moderation team will review the report. If the report is valid and guidelines have been violated, your listing may be temporarily suspended. You will be notified with the reason and given an opportunity to appeal.',
    order: 6,
    audiences: ['business'],
  },
  {
    question: 'Are reviews verified as genuine customer visits?',
    answer:
      'We verify that reviewers have a valid account, but we do not currently require proof of visit. Our systems automatically detect and flag suspicious review patterns such as coordinated spikes or duplicate submissions.',
    order: 7,
    audiences: ['business'],
  },
  {
    question: 'How can I improve my business ranking in search results?',
    answer:
      'Rankings are based on review quality, volume, recency, and profile completeness. There are no paid placements — encourage genuine customers to share their honest experiences.',
    order: 8,
    audiences: ['business'],
  },

  // ─── MODERATOR ───────────────────────────────────────────────────────────────
  {
    question: 'Where do I find pending reports and tickets?',
    answer:
      'Go to Admin Panel → Tickets to see all open support tickets. Go to Admin Panel → Verifications to see pending business verification requests. Both sections show the count of pending items in the badge.',
    order: 1,
    audiences: ['moderator'],
  },
  {
    question: 'What are the criteria for removing a review?',
    answer:
      'Remove a review if it contains: hate speech or personal attacks, spam or irrelevant content, a clear conflict of interest (e.g., competitor posting), fabricated experiences with no factual basis, or private personal information about a third party.',
    order: 2,
    audiences: ['moderator'],
  },
  {
    question: 'How do I approve or reject a business verification?',
    answer:
      'Open Admin Panel → Verifications and select a pending request. Review the submitted documents, then tap Approve (green) or Reject. When rejecting, provide a clear reason — it will be sent to the business owner.',
    order: 3,
    audiences: ['moderator'],
  },
  {
    question: 'How long should it take to process a reported item?',
    answer:
      'Aim to resolve standard reports within 48 hours. Reports involving harassment, illegal content, or account safety issues should be prioritized and handled as quickly as possible.',
    order: 4,
    audiences: ['moderator'],
  },
  {
    question: 'Can a business appeal a moderation decision?',
    answer:
      'Yes. Businesses can submit a support ticket to appeal a suspension or rejected verification. Review appeals thoroughly and, if the original decision was incorrect, reverse it and notify both parties.',
    order: 5,
    audiences: ['moderator'],
  },
  {
    question: 'What happens when a business is suspended?',
    answer:
      'The business listing is hidden from all searches and category pages. The business owner is notified by email with the reason for suspension and the steps required to reinstate the listing.',
    order: 6,
    audiences: ['moderator'],
  },
  {
    question: 'What content is absolutely prohibited on the platform?',
    answer:
      'The following are strictly prohibited: personal contact details (phone, address) published in reviews, illegal service solicitations, coordinated fake review campaigns, doxxing or threats against individuals, and content that promotes discrimination.',
    order: 7,
    audiences: ['moderator'],
  },
  {
    question: 'How do I handle a duplicate business listing?',
    answer:
      'Keep the listing with more reviews and verified information. Contact the owner of the duplicate listing to inform them, then archive or remove the duplicate. If unsure, escalate via a support ticket.',
    order: 8,
    audiences: ['moderator'],
  },
];
