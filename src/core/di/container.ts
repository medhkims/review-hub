import { NetworkInfoImpl } from '@/core/network/networkInfo';

// ---- Shared ----
const networkInfo = new NetworkInfoImpl();

// ---- Auth ----
// TODO: Wire auth data sources → repository → use cases

// ---- Profile ----
// TODO: Wire profile data sources → repository → use cases

// ---- Chat ----
// TODO: Wire chat data sources → repository → use cases

// ---- Feed ----
// TODO: Wire feed data sources → repository → use cases

// ---- Settings ----
// TODO: Wire settings data sources → repository → use cases

export const container = {
  networkInfo,
  // TODO: Export all use cases here
};
