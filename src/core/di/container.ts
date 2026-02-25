import { NetworkInfoImpl } from '@/core/network/networkInfo';

// Auth
import { AuthRemoteDataSourceImpl } from '@/data/auth/datasources/authRemoteDataSource';
import { AuthLocalDataSourceImpl } from '@/data/auth/datasources/authLocalDataSource';
import { AuthRepositoryImpl } from '@/data/auth/repositories/authRepositoryImpl';
import { SignInUseCase } from '@/domain/auth/usecases/signInUseCase';
import { SignUpUseCase } from '@/domain/auth/usecases/signUpUseCase';
import { SignOutUseCase } from '@/domain/auth/usecases/signOutUseCase';
import { GetCurrentUserUseCase } from '@/domain/auth/usecases/getCurrentUserUseCase';
import { ChangePasswordUseCase } from '@/domain/auth/usecases/changePasswordUseCase';
import { SignInWithGoogleUseCase } from '@/domain/auth/usecases/signInWithGoogleUseCase';

// Settings
import { SettingsLocalDataSourceImpl } from '@/data/settings/datasources/settingsLocalDataSource';
import { SettingsRepositoryImpl } from '@/data/settings/repositories/settingsRepositoryImpl';
import { GetSettingsUseCase } from '@/domain/settings/usecases/getSettingsUseCase';
import { UpdateSettingsUseCase } from '@/domain/settings/usecases/updateSettingsUseCase';

// Profile
import { ProfileRemoteDataSourceImpl } from '@/data/profile/datasources/profileRemoteDataSource';
import { ProfileLocalDataSourceImpl } from '@/data/profile/datasources/profileLocalDataSource';
import { AvatarRemoteDataSourceImpl } from '@/data/profile/datasources/avatarRemoteDataSource';
import { ProfileRepositoryImpl } from '@/data/profile/repositories/profileRepositoryImpl';
import { GetProfileUseCase } from '@/domain/profile/usecases/getProfileUseCase';
import { UpdateProfileUseCase } from '@/domain/profile/usecases/updateProfileUseCase';
import { UpdateEmailUseCase } from '@/domain/profile/usecases/updateEmailUseCase';
import { UploadAvatarUseCase } from '@/domain/profile/usecases/uploadAvatarUseCase';
import { GetUserRoleUseCase } from '@/domain/profile/usecases/getUserRoleUseCase';
import { UpdateUserRoleUseCase } from '@/domain/profile/usecases/updateUserRoleUseCase';

// ---- Shared ----
const networkInfo = new NetworkInfoImpl();

// ---- Auth ----
const authRemoteDataSource = new AuthRemoteDataSourceImpl();
const authLocalDataSource = new AuthLocalDataSourceImpl();
const authRepository = new AuthRepositoryImpl(authRemoteDataSource, authLocalDataSource);

const signInUseCase = new SignInUseCase(authRepository);
const signUpUseCase = new SignUpUseCase(authRepository);
const signOutUseCase = new SignOutUseCase(authRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
const changePasswordUseCase = new ChangePasswordUseCase(authRepository);
const signInWithGoogleUseCase = new SignInWithGoogleUseCase(authRepository);

// ---- Settings ----
const settingsLocalDataSource = new SettingsLocalDataSourceImpl();
const settingsRepository = new SettingsRepositoryImpl(settingsLocalDataSource);

const getSettingsUseCase = new GetSettingsUseCase(settingsRepository);
const updateSettingsUseCase = new UpdateSettingsUseCase(settingsRepository);

// ---- Profile ----
const profileRemoteDataSource = new ProfileRemoteDataSourceImpl();
const profileLocalDataSource = new ProfileLocalDataSourceImpl();
const avatarRemoteDataSource = new AvatarRemoteDataSourceImpl();
const profileRepository = new ProfileRepositoryImpl(
  profileRemoteDataSource,
  profileLocalDataSource,
  avatarRemoteDataSource,
  networkInfo
);

const getProfileUseCase = new GetProfileUseCase(profileRepository);
const updateProfileUseCase = new UpdateProfileUseCase(profileRepository);
const updateEmailUseCase = new UpdateEmailUseCase(profileRepository);
const uploadAvatarUseCase = new UploadAvatarUseCase(profileRepository);
const getUserRoleUseCase = new GetUserRoleUseCase(profileRepository);
const updateUserRoleUseCase = new UpdateUserRoleUseCase(profileRepository);

// ---- Wishlist ----
import { WishlistRemoteDataSourceImpl } from '@/data/wishlist/datasources/wishlistRemoteDataSource';
import { WishlistLocalDataSourceImpl } from '@/data/wishlist/datasources/wishlistLocalDataSource';
import { WishlistRepositoryImpl } from '@/data/wishlist/repositories/wishlistRepositoryImpl';
import { GetWishlistUseCase } from '@/domain/wishlist/usecases/getWishlistUseCase';
import { AddToWishlistUseCase } from '@/domain/wishlist/usecases/addToWishlistUseCase';
import { RemoveFromWishlistUseCase } from '@/domain/wishlist/usecases/removeFromWishlistUseCase';

const wishlistRemoteDataSource = new WishlistRemoteDataSourceImpl();
const wishlistLocalDataSource = new WishlistLocalDataSourceImpl();
const wishlistRepository = new WishlistRepositoryImpl(
  wishlistRemoteDataSource,
  wishlistLocalDataSource,
  networkInfo
);

const getWishlistUseCase = new GetWishlistUseCase(wishlistRepository);
const addToWishlistUseCase = new AddToWishlistUseCase(wishlistRepository);
const removeFromWishlistUseCase = new RemoveFromWishlistUseCase(wishlistRepository);

// ---- Business ----
import { BusinessRemoteDataSourceImpl } from '@/data/business/datasources/businessRemoteDataSource';
import { BusinessLocalDataSourceImpl } from '@/data/business/datasources/businessLocalDataSource';
import { CategoryRemoteDataSourceImpl } from '@/data/business/datasources/categoryRemoteDataSource';
import { BusinessRepositoryImpl } from '@/data/business/repositories/businessRepositoryImpl';
import { CategoryRepositoryImpl } from '@/data/business/repositories/categoryRepositoryImpl';
import { GetFeaturedBusinessesUseCase } from '@/domain/business/usecases/getFeaturedBusinessesUseCase';
import { GetCategoriesUseCase } from '@/domain/business/usecases/getCategoriesUseCase';
import { SearchBusinessesUseCase } from '@/domain/business/usecases/searchBusinessesUseCase';
import { ToggleFavoriteUseCase } from '@/domain/business/usecases/toggleFavoriteUseCase';
import { GetBusinessesByCategoryUseCase } from '@/domain/business/usecases/getBusinessesByCategoryUseCase';
import { GetBusinessDetailUseCase } from '@/domain/business/usecases/getBusinessDetailUseCase';
import { GetBusinessReviewsUseCase } from '@/domain/business/usecases/getBusinessReviewsUseCase';
import { RegisterBusinessUseCase } from '@/domain/business/usecases/registerBusinessUseCase';
import { GetOwnerBusinessUseCase } from '@/domain/business/usecases/getOwnerBusinessUseCase';
import { UpdateBusinessUseCase } from '@/domain/business/usecases/updateBusinessUseCase';

const businessRemoteDataSource = new BusinessRemoteDataSourceImpl();
const businessLocalDataSource = new BusinessLocalDataSourceImpl();
const categoryRemoteDataSource = new CategoryRemoteDataSourceImpl();
const businessRepository = new BusinessRepositoryImpl(businessRemoteDataSource, businessLocalDataSource, networkInfo);
const categoryRepository = new CategoryRepositoryImpl(categoryRemoteDataSource);

const getFeaturedBusinessesUseCase = new GetFeaturedBusinessesUseCase(businessRepository);
const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
const searchBusinessesUseCase = new SearchBusinessesUseCase(businessRepository);
const toggleFavoriteUseCase = new ToggleFavoriteUseCase(businessRepository);
const getBusinessesByCategoryUseCase = new GetBusinessesByCategoryUseCase(businessRepository);
const getBusinessDetailUseCase = new GetBusinessDetailUseCase(businessRepository);
const getBusinessReviewsUseCase = new GetBusinessReviewsUseCase(businessRepository);
const registerBusinessUseCase = new RegisterBusinessUseCase(businessRepository);
const getOwnerBusinessUseCase = new GetOwnerBusinessUseCase(businessRepository);
const updateBusinessUseCase = new UpdateBusinessUseCase(businessRepository);

// ---- Chat ----
// TODO: Wire chat data sources → repository → use cases

export const container = {
  networkInfo,
  // Auth use cases
  signInUseCase,
  signUpUseCase,
  signOutUseCase,
  getCurrentUserUseCase,
  changePasswordUseCase,
  signInWithGoogleUseCase,
  // Settings use cases
  getSettingsUseCase,
  updateSettingsUseCase,
  // Profile use cases
  getProfileUseCase,
  updateProfileUseCase,
  updateEmailUseCase,
  uploadAvatarUseCase,
  getUserRoleUseCase,
  updateUserRoleUseCase,
  // Wishlist use cases
  getWishlistUseCase,
  addToWishlistUseCase,
  removeFromWishlistUseCase,
  // Business use cases
  getFeaturedBusinessesUseCase,
  getCategoriesUseCase,
  searchBusinessesUseCase,
  toggleFavoriteUseCase,
  getBusinessesByCategoryUseCase,
  getBusinessDetailUseCase,
  getBusinessReviewsUseCase,
  registerBusinessUseCase,
  getOwnerBusinessUseCase,
  updateBusinessUseCase,
};
