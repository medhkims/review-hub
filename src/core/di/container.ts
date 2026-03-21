// ---- Core ----
import { NetworkInfoImpl } from '@/core/network/networkInfo';

// ---- Auth ----
import { AuthRemoteDataSourceImpl } from '@/data/auth/datasources/authRemoteDataSource';
import { AuthLocalDataSourceImpl } from '@/data/auth/datasources/authLocalDataSource';
import { AuthRepositoryImpl } from '@/data/auth/repositories/authRepositoryImpl';
import { SignInUseCase } from '@/domain/auth/usecases/signInUseCase';
import { SignUpUseCase } from '@/domain/auth/usecases/signUpUseCase';
import { SignOutUseCase } from '@/domain/auth/usecases/signOutUseCase';
import { GetCurrentUserUseCase } from '@/domain/auth/usecases/getCurrentUserUseCase';
import { ChangePasswordUseCase } from '@/domain/auth/usecases/changePasswordUseCase';
import { SignInWithGoogleUseCase } from '@/domain/auth/usecases/signInWithGoogleUseCase';
import { SendPhoneOtpUseCase } from '@/domain/auth/usecases/sendPhoneOtpUseCase';
import { VerifyPhoneOtpUseCase } from '@/domain/auth/usecases/verifyPhoneOtpUseCase';

// ---- Settings ----
import { SettingsLocalDataSourceImpl } from '@/data/settings/datasources/settingsLocalDataSource';
import { SettingsRepositoryImpl } from '@/data/settings/repositories/settingsRepositoryImpl';
import { GetSettingsUseCase } from '@/domain/settings/usecases/getSettingsUseCase';
import { UpdateSettingsUseCase } from '@/domain/settings/usecases/updateSettingsUseCase';

// ---- Profile ----
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

// ---- Notifications ----
import { NotificationRemoteDataSourceImpl } from '@/data/notifications/datasources/notificationRemoteDataSource';
import { NotificationRepositoryImpl } from '@/data/notifications/repositories/notificationRepositoryImpl';
import { GetNotificationsUseCase } from '@/domain/notifications/usecases/getNotificationsUseCase';
import { MarkNotificationReadUseCase } from '@/domain/notifications/usecases/markNotificationReadUseCase';

// ---- Wishlist ----
import { WishlistRemoteDataSourceImpl } from '@/data/wishlist/datasources/wishlistRemoteDataSource';
import { WishlistLocalDataSourceImpl } from '@/data/wishlist/datasources/wishlistLocalDataSource';
import { WishlistRepositoryImpl } from '@/data/wishlist/repositories/wishlistRepositoryImpl';
import { GetWishlistUseCase } from '@/domain/wishlist/usecases/getWishlistUseCase';
import { AddToWishlistUseCase } from '@/domain/wishlist/usecases/addToWishlistUseCase';
import { RemoveFromWishlistUseCase } from '@/domain/wishlist/usecases/removeFromWishlistUseCase';

// ---- Business ----
import { BusinessRemoteDataSourceImpl } from '@/data/business/datasources/businessRemoteDataSource';
import { BusinessLocalDataSourceImpl } from '@/data/business/datasources/businessLocalDataSource';
import { CategoryRemoteDataSourceImpl } from '@/data/business/datasources/categoryRemoteDataSource';
import { CategoryFirestoreDataSourceImpl } from '@/data/business/datasources/categoryFirestoreDataSource';
import { BusinessRepositoryImpl } from '@/data/business/repositories/businessRepositoryImpl';
import { CategoryRepositoryImpl } from '@/data/business/repositories/categoryRepositoryImpl';
import { GetFeaturedBusinessesUseCase } from '@/domain/business/usecases/getFeaturedBusinessesUseCase';
import { GetNewBusinessesUseCase } from '@/domain/business/usecases/getNewBusinessesUseCase';
import { GetCategoriesUseCase } from '@/domain/business/usecases/getCategoriesUseCase';
import { SearchBusinessesUseCase } from '@/domain/business/usecases/searchBusinessesUseCase';
import { ToggleFavoriteUseCase } from '@/domain/business/usecases/toggleFavoriteUseCase';
import { GetBusinessesByCategoryUseCase } from '@/domain/business/usecases/getBusinessesByCategoryUseCase';
import { GetBusinessDetailUseCase } from '@/domain/business/usecases/getBusinessDetailUseCase';
import { GetBusinessReviewsUseCase } from '@/domain/business/usecases/getBusinessReviewsUseCase';
import { RegisterBusinessUseCase } from '@/domain/business/usecases/registerBusinessUseCase';
import { GetOwnerBusinessUseCase } from '@/domain/business/usecases/getOwnerBusinessUseCase';
import { UpdateBusinessUseCase } from '@/domain/business/usecases/updateBusinessUseCase';
import { GetActiveCategoriesUseCase } from '@/domain/business/usecases/getActiveCategoriesUseCase';
import { GetCategoriesForAdminUseCase } from '@/domain/business/usecases/getCategoriesForAdminUseCase';
import { AddCategoryUseCase } from '@/domain/business/usecases/addCategoryUseCase';
import { RemoveCategoryUseCase } from '@/domain/business/usecases/removeCategoryUseCase';
import { AddSubcategoryUseCase } from '@/domain/business/usecases/addSubcategoryUseCase';
import { RemoveSubcategoryUseCase } from '@/domain/business/usecases/removeSubcategoryUseCase';
import { UpdateCategoryUseCase } from '@/domain/business/usecases/updateCategoryUseCase';
import { UpdateSubcategoryUseCase } from '@/domain/business/usecases/updateSubcategoryUseCase';
import { SoftDeleteCategoryUseCase } from '@/domain/business/usecases/softDeleteCategoryUseCase';
import { SoftDeleteSubcategoryUseCase } from '@/domain/business/usecases/softDeleteSubcategoryUseCase';
import { RecoverCategoryUseCase } from '@/domain/business/usecases/recoverCategoryUseCase';
import { RecoverSubcategoryUseCase } from '@/domain/business/usecases/recoverSubcategoryUseCase';
import { GetDeletedCategoryItemsUseCase } from '@/domain/business/usecases/getDeletedCategoryItemsUseCase';
import { UpdateRatingCriteriaUseCase } from '@/domain/business/usecases/updateRatingCriteriaUseCase';
import { SoftDeleteRatingCriterionUseCase } from '@/domain/business/usecases/softDeleteRatingCriterionUseCase';
import { RecoverRatingCriterionUseCase } from '@/domain/business/usecases/recoverRatingCriterionUseCase';
import { FuzzySearchBusinessUseCase } from '@/domain/business/usecases/fuzzySearchBusinessUseCase';
import { SubmitBusinessUseCase } from '@/domain/business/usecases/submitBusinessUseCase';
import { CheckBusinessDuplicateUseCase } from '@/domain/business/usecases/checkBusinessDuplicateUseCase';
import { UploadBusinessImageUseCase } from '@/domain/business/usecases/uploadBusinessImageUseCase';
import { GetPendingBusinessesUseCase } from '@/domain/business/usecases/getPendingBusinessesUseCase';
import { GetApprovedBusinessesUseCase } from '@/domain/business/usecases/getApprovedBusinessesUseCase';
import { GetRejectedBusinessesUseCase } from '@/domain/business/usecases/getRejectedBusinessesUseCase';
import { AcceptBusinessUseCase } from '@/domain/business/usecases/acceptBusinessUseCase';
import { RejectBusinessUseCase } from '@/domain/business/usecases/rejectBusinessUseCase';
import { SuspendBusinessUseCase } from '@/domain/business/usecases/suspendBusinessUseCase';
import { ReApproveBusinessUseCase } from '@/domain/business/usecases/reApproveBusinessUseCase';
import { GetSuspendedBusinessesUseCase } from '@/domain/business/usecases/getSuspendedBusinessesUseCase';
import { IncrementSearchCountUseCase } from '@/domain/business/usecases/incrementSearchCountUseCase';
import { IncrementGlobalSearchCountUseCase } from '@/domain/business/usecases/incrementGlobalSearchCountUseCase';
import { ReportBusinessUseCase } from '@/domain/business/usecases/reportBusinessUseCase';

// ---- Ticket ----
import { TicketRemoteDataSourceImpl } from '@/data/ticket/datasources/ticketRemoteDataSource';
import { TicketRepositoryImpl } from '@/data/ticket/repositories/ticketRepositoryImpl';
import { GetTicketsUseCase } from '@/domain/ticket/usecases/getTicketsUseCase';
import { UpdateTicketStatusUseCase } from '@/domain/ticket/usecases/updateTicketStatusUseCase';

// ---- Feed ----
import { FeedRemoteDataSourceImpl } from '@/data/feed/datasources/feedRemoteDataSource';
import { FeedLocalDataSourceImpl } from '@/data/feed/datasources/feedLocalDataSource';
import { FeedRepositoryImpl } from '@/data/feed/repositories/feedRepositoryImpl';
import { GetPostsUseCase } from '@/domain/feed/usecases/getPostsUseCase';
import { CreatePostUseCase } from '@/domain/feed/usecases/createPostUseCase';
import { LikePostUseCase } from '@/domain/feed/usecases/likePostUseCase';

// ---- Reviews ----
import { ReviewRemoteDataSourceImpl } from '@/data/reviews/datasources/reviewRemoteDataSource';
import { ReviewRepositoryImpl } from '@/data/reviews/repositories/reviewRepositoryImpl';
import { CreateReviewUseCase } from '@/domain/reviews/usecases/createReviewUseCase';
import { GetUserReviewsUseCase } from '@/domain/reviews/usecases/getUserReviewsUseCase';
import { DeleteReviewUseCase } from '@/domain/reviews/usecases/deleteReviewUseCase';
import { GetPendingReviewsUseCase } from '@/domain/reviews/usecases/getPendingReviewsUseCase';
import { GetApprovedReviewsUseCase } from '@/domain/reviews/usecases/getApprovedReviewsUseCase';
import { GetRejectedReviewsUseCase } from '@/domain/reviews/usecases/getRejectedReviewsUseCase';
import { ApproveReviewUseCase } from '@/domain/reviews/usecases/approveReviewUseCase';
import { RejectReviewUseCase } from '@/domain/reviews/usecases/rejectReviewUseCase';

// ---- Chat ----
import { ChatRemoteDataSourceImpl } from '@/data/chat/datasources/chatRemoteDataSource';
import { ChatLocalDataSourceImpl } from '@/data/chat/datasources/chatLocalDataSource';
import { ChatRepositoryImpl } from '@/data/chat/repositories/chatRepositoryImpl';
import { GetConversationsUseCase } from '@/domain/chat/usecases/getConversationsUseCase';
import { GetMessagesUseCase } from '@/domain/chat/usecases/getMessagesUseCase';
import { SendMessageUseCase } from '@/domain/chat/usecases/sendMessageUseCase';

// ---- Category Defaults ----
import { CategoryDefaultRemoteDataSourceImpl } from '@/data/categoryDefaults/datasources/categoryDefaultRemoteDataSource';
import { CategoryDefaultRepositoryImpl } from '@/data/categoryDefaults/repositories/categoryDefaultRepositoryImpl';
import { GetCategoryDefaultsUseCase } from '@/domain/categoryDefaults/usecases/getCategoryDefaultsUseCase';
import { UpdateCategoryDefaultUseCase } from '@/domain/categoryDefaults/usecases/updateCategoryDefaultUseCase';

// ---- Banner ----
import { BannerRemoteDataSourceImpl } from '@/data/banner/datasources/bannerRemoteDataSource';
import { BannerRepositoryImpl } from '@/data/banner/repositories/bannerRepositoryImpl';
import { GetBannersUseCase } from '@/domain/banner/usecases/getBannersUseCase';
import { GetAllBannersUseCase } from '@/domain/banner/usecases/getAllBannersUseCase';
import { CreateBannerUseCase } from '@/domain/banner/usecases/createBannerUseCase';
import { UpdateBannerUseCase } from '@/domain/banner/usecases/updateBannerUseCase';
import { DeleteBannerUseCase } from '@/domain/banner/usecases/deleteBannerUseCase';

// ---- Admin ----
import { AdminRemoteDataSourceImpl } from '@/data/admin/datasources/adminRemoteDataSource';
import { AdminRepositoryImpl } from '@/data/admin/repositories/adminRepositoryImpl';
import { GetAdminDashboardStatsUseCase } from '@/domain/admin/usecases/getAdminDashboardStatsUseCase';
import { GetAdminCompanyListUseCase } from '@/domain/admin/usecases/getAdminCompanyListUseCase';
import { AdminInfoRemoteDataSourceImpl } from '@/data/admin/datasources/adminInfoRemoteDataSource';
import { AdminInfoRepositoryImpl } from '@/data/admin/repositories/adminInfoRepositoryImpl';
import { GetAdminInfoUseCase } from '@/domain/admin/usecases/getAdminInfoUseCase';
import { UpdateAdminInfoUseCase } from '@/domain/admin/usecases/updateAdminInfoUseCase';
import { UploadAdminPictureUseCase } from '@/domain/admin/usecases/uploadAdminPictureUseCase';

// ============================================================
// Instantiation
// ============================================================

const networkInfo = new NetworkInfoImpl();

// ---- Notifications (instantiated early — injected into business & review use cases) ----
const notificationRemoteDataSource = new NotificationRemoteDataSourceImpl();
const notificationRepository = new NotificationRepositoryImpl(notificationRemoteDataSource, networkInfo);

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
const sendPhoneOtpUseCase = new SendPhoneOtpUseCase(authRepository);
const verifyPhoneOtpUseCase = new VerifyPhoneOtpUseCase(authRepository);

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
const businessRemoteDataSource = new BusinessRemoteDataSourceImpl();
const businessLocalDataSource = new BusinessLocalDataSourceImpl();
const categoryRemoteDataSource = new CategoryRemoteDataSourceImpl();
const categoryFirestoreDataSource = new CategoryFirestoreDataSourceImpl();
const businessRepository = new BusinessRepositoryImpl(businessRemoteDataSource, businessLocalDataSource, networkInfo);
const categoryRepository = new CategoryRepositoryImpl(categoryRemoteDataSource, categoryFirestoreDataSource);

const getFeaturedBusinessesUseCase = new GetFeaturedBusinessesUseCase(businessRepository);
const getNewBusinessesUseCase = new GetNewBusinessesUseCase(businessRepository);
const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
const searchBusinessesUseCase = new SearchBusinessesUseCase(businessRepository);
const toggleFavoriteUseCase = new ToggleFavoriteUseCase(businessRepository);
const getBusinessesByCategoryUseCase = new GetBusinessesByCategoryUseCase(businessRepository);
const getBusinessDetailUseCase = new GetBusinessDetailUseCase(businessRepository);
const getBusinessReviewsUseCase = new GetBusinessReviewsUseCase(businessRepository);
const registerBusinessUseCase = new RegisterBusinessUseCase(businessRepository);
const getOwnerBusinessUseCase = new GetOwnerBusinessUseCase(businessRepository);
const updateBusinessUseCase = new UpdateBusinessUseCase(businessRepository);
const getActiveCategoriesUseCase = new GetActiveCategoriesUseCase(categoryRepository, businessRepository);
const getCategoriesForAdminUseCase = new GetCategoriesForAdminUseCase(categoryRepository);
const addCategoryUseCase = new AddCategoryUseCase(categoryRepository);
const removeCategoryUseCase = new RemoveCategoryUseCase(categoryRepository);
const addSubcategoryUseCase = new AddSubcategoryUseCase(categoryRepository);
const removeSubcategoryUseCase = new RemoveSubcategoryUseCase(categoryRepository);
const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);
const updateSubcategoryUseCase = new UpdateSubcategoryUseCase(categoryRepository);
const softDeleteCategoryUseCase = new SoftDeleteCategoryUseCase(categoryRepository);
const softDeleteSubcategoryUseCase = new SoftDeleteSubcategoryUseCase(categoryRepository);
const recoverCategoryUseCase = new RecoverCategoryUseCase(categoryRepository);
const recoverSubcategoryUseCase = new RecoverSubcategoryUseCase(categoryRepository);
const getDeletedCategoryItemsUseCase = new GetDeletedCategoryItemsUseCase(categoryRepository);
const updateRatingCriteriaUseCase = new UpdateRatingCriteriaUseCase(categoryRepository);
const softDeleteRatingCriterionUseCase = new SoftDeleteRatingCriterionUseCase(categoryRepository);
const recoverRatingCriterionUseCase = new RecoverRatingCriterionUseCase(categoryRepository);
const fuzzySearchBusinessUseCase = new FuzzySearchBusinessUseCase(businessRepository);
const submitBusinessUseCase = new SubmitBusinessUseCase(businessRepository);
const checkBusinessDuplicateUseCase = new CheckBusinessDuplicateUseCase(businessRepository);
const uploadBusinessImageUseCase = new UploadBusinessImageUseCase(businessRepository);
const getPendingBusinessesUseCase = new GetPendingBusinessesUseCase(businessRepository);
const getApprovedBusinessesUseCase = new GetApprovedBusinessesUseCase(businessRepository);
const getRejectedBusinessesUseCase = new GetRejectedBusinessesUseCase(businessRepository);
const acceptBusinessUseCase = new AcceptBusinessUseCase(businessRepository, notificationRepository);
const rejectBusinessUseCase = new RejectBusinessUseCase(businessRepository, notificationRepository);
const suspendBusinessUseCase = new SuspendBusinessUseCase(businessRepository, notificationRepository);
const reApproveBusinessUseCase = new ReApproveBusinessUseCase(businessRepository, notificationRepository);
const getSuspendedBusinessesUseCase = new GetSuspendedBusinessesUseCase(businessRepository);
const incrementSearchCountUseCase = new IncrementSearchCountUseCase(businessRepository);
const incrementGlobalSearchCountUseCase = new IncrementGlobalSearchCountUseCase(businessRepository);
const reportBusinessUseCase = new ReportBusinessUseCase(businessRepository);

// ---- Ticket ----
const ticketRemoteDataSource = new TicketRemoteDataSourceImpl();
const ticketRepository = new TicketRepositoryImpl(ticketRemoteDataSource);
const getTicketsUseCase = new GetTicketsUseCase(ticketRepository);
const updateTicketStatusUseCase = new UpdateTicketStatusUseCase(ticketRepository);

// ---- Feed ----
const feedRemoteDataSource = new FeedRemoteDataSourceImpl();
const feedLocalDataSource = new FeedLocalDataSourceImpl();
const feedRepository = new FeedRepositoryImpl(feedRemoteDataSource, feedLocalDataSource, networkInfo);

const getPostsUseCase = new GetPostsUseCase(feedRepository);
const createPostUseCase = new CreatePostUseCase(feedRepository);
const likePostUseCase = new LikePostUseCase(feedRepository);

// ---- Reviews ----
const reviewRemoteDataSource = new ReviewRemoteDataSourceImpl();
const reviewRepository = new ReviewRepositoryImpl(reviewRemoteDataSource);

const createReviewUseCase = new CreateReviewUseCase(reviewRepository);
const getUserReviewsUseCase = new GetUserReviewsUseCase(reviewRepository);
const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepository);
const getPendingReviewsUseCase = new GetPendingReviewsUseCase(reviewRepository);
const getApprovedReviewsUseCase = new GetApprovedReviewsUseCase(reviewRepository);
const getRejectedReviewsUseCase = new GetRejectedReviewsUseCase(reviewRepository);
const approveReviewUseCase = new ApproveReviewUseCase(reviewRepository, notificationRepository);
const rejectReviewUseCase = new RejectReviewUseCase(reviewRepository, notificationRepository);

// ---- Chat ----
const chatRemoteDataSource = new ChatRemoteDataSourceImpl();
const chatLocalDataSource = new ChatLocalDataSourceImpl();
const chatRepository = new ChatRepositoryImpl(chatRemoteDataSource, chatLocalDataSource, networkInfo);

const getConversationsUseCase = new GetConversationsUseCase(chatRepository);
const getMessagesUseCase = new GetMessagesUseCase(chatRepository);
const sendMessageUseCase = new SendMessageUseCase(chatRepository);

// ---- Category Defaults ----
const categoryDefaultRemoteDataSource = new CategoryDefaultRemoteDataSourceImpl();
const categoryDefaultRepository = new CategoryDefaultRepositoryImpl(categoryDefaultRemoteDataSource);
const getCategoryDefaultsUseCase = new GetCategoryDefaultsUseCase(categoryDefaultRepository);
const updateCategoryDefaultUseCase = new UpdateCategoryDefaultUseCase(categoryDefaultRepository);

// ---- Banner ----
const bannerRemoteDataSource = new BannerRemoteDataSourceImpl();
const bannerRepository = new BannerRepositoryImpl(bannerRemoteDataSource);

const getBannersUseCase = new GetBannersUseCase(bannerRepository);
const getAllBannersUseCase = new GetAllBannersUseCase(bannerRepository);
const createBannerUseCase = new CreateBannerUseCase(bannerRepository);
const updateBannerUseCase = new UpdateBannerUseCase(bannerRepository);
const deleteBannerUseCase = new DeleteBannerUseCase(bannerRepository);

// ---- Admin ----
const adminRemoteDataSource = new AdminRemoteDataSourceImpl();
const adminRepository = new AdminRepositoryImpl(adminRemoteDataSource);
const getAdminDashboardStatsUseCase = new GetAdminDashboardStatsUseCase(adminRepository);
const getAdminCompanyListUseCase = new GetAdminCompanyListUseCase(adminRepository);

// ---- Admin Info ----
const adminInfoRemoteDataSource = new AdminInfoRemoteDataSourceImpl();
const adminInfoRepository = new AdminInfoRepositoryImpl(adminInfoRemoteDataSource);
const getAdminInfoUseCase = new GetAdminInfoUseCase(adminInfoRepository);
const updateAdminInfoUseCase = new UpdateAdminInfoUseCase(adminInfoRepository);
const uploadAdminPictureUseCase = new UploadAdminPictureUseCase(adminInfoRepository);

// ---- Notifications (use cases) ----
const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationRepository);

export const container = {
  networkInfo,
  // Auth use cases
  signInUseCase,
  signUpUseCase,
  signOutUseCase,
  getCurrentUserUseCase,
  changePasswordUseCase,
  signInWithGoogleUseCase,
  sendPhoneOtpUseCase,
  verifyPhoneOtpUseCase,
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
  getNewBusinessesUseCase,
  getCategoriesUseCase,
  getActiveCategoriesUseCase,
  getCategoriesForAdminUseCase,
  addCategoryUseCase,
  removeCategoryUseCase,
  addSubcategoryUseCase,
  removeSubcategoryUseCase,
  updateCategoryUseCase,
  updateSubcategoryUseCase,
  softDeleteCategoryUseCase,
  softDeleteSubcategoryUseCase,
  recoverCategoryUseCase,
  recoverSubcategoryUseCase,
  getDeletedCategoryItemsUseCase,
  updateRatingCriteriaUseCase,
  softDeleteRatingCriterionUseCase,
  recoverRatingCriterionUseCase,
  searchBusinessesUseCase,
  toggleFavoriteUseCase,
  getBusinessesByCategoryUseCase,
  getBusinessDetailUseCase,
  getBusinessReviewsUseCase,
  registerBusinessUseCase,
  getOwnerBusinessUseCase,
  updateBusinessUseCase,
  fuzzySearchBusinessUseCase,
  submitBusinessUseCase,
  checkBusinessDuplicateUseCase,
  uploadBusinessImageUseCase,
  getPendingBusinessesUseCase,
  getApprovedBusinessesUseCase,
  getRejectedBusinessesUseCase,
  acceptBusinessUseCase,
  rejectBusinessUseCase,
  suspendBusinessUseCase,
  reApproveBusinessUseCase,
  getSuspendedBusinessesUseCase,
  incrementSearchCountUseCase,
  incrementGlobalSearchCountUseCase,
  reportBusinessUseCase,
  getTicketsUseCase,
  updateTicketStatusUseCase,
  // Feed use cases
  getPostsUseCase,
  createPostUseCase,
  likePostUseCase,
  // Review use cases
  createReviewUseCase,
  getUserReviewsUseCase,
  deleteReviewUseCase,
  getPendingReviewsUseCase,
  getApprovedReviewsUseCase,
  getRejectedReviewsUseCase,
  approveReviewUseCase,
  rejectReviewUseCase,
  // Chat use cases
  getConversationsUseCase,
  getMessagesUseCase,
  sendMessageUseCase,
  // Notification use cases
  getNotificationsUseCase,
  markNotificationReadUseCase,
  // Banner use cases
  getBannersUseCase,
  getAllBannersUseCase,
  createBannerUseCase,
  updateBannerUseCase,
  deleteBannerUseCase,
  // Admin use cases
  getAdminDashboardStatsUseCase,
  getAdminCompanyListUseCase,
  getAdminInfoUseCase,
  updateAdminInfoUseCase,
  uploadAdminPictureUseCase,
  // Category default use cases
  getCategoryDefaultsUseCase,
  updateCategoryDefaultUseCase,
};
