import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/core/firebase/firebaseConfig';

// ── Fire-and-forget helpers — never throw, never block UI ─────────────────────

/** Called when a business appears in search results for a keyword (found=false)
 *  or when the user actually opens it from search (found=true / opened=true). */
export function trackKeywordEvent(
  businessId: string,
  keyword: string,
  opened: boolean,
  subcategory?: string,
): void {
  addDoc(collection(firestore, 'keyword_events'), {
    business_id: businessId,
    keyword:     keyword.toLowerCase().trim(),
    opened,
    subcategory: subcategory ?? null,
    created_at:  serverTimestamp(),
  }).catch(() => {});
}

/** Called when a user taps a contact / social-media button on a business profile. */
export function trackProfileClick(businessId: string, buttonType: string): void {
  addDoc(collection(firestore, 'profile_click_events'), {
    business_id: businessId,
    button_type: buttonType,
    created_at:  serverTimestamp(),
  }).catch(() => {});
}

/** Called when a business is shown in subcategory-filtered results (opened=false)
 *  or when the user taps a business card from a subcategory filter (opened=true). */
export function trackSubcategoryEvent(
  businessId: string,
  subcategory: string,
  opened: boolean,
): void {
  addDoc(collection(firestore, 'subcategory_events'), {
    business_id: businessId,
    subcategory,
    opened,
    created_at: serverTimestamp(),
  }).catch(() => {});
}

/** Called when a user taps a menu item on a business profile. */
export function trackMenuItemClick(
  businessId: string,
  itemId: string,
  itemName: string,
  categoryName: string,
): void {
  addDoc(collection(firestore, 'menu_item_click_events'), {
    business_id:   businessId,
    item_id:       itemId,
    item_name:     itemName,
    category_name: categoryName,
    created_at:    serverTimestamp(),
  }).catch(() => {});
}
