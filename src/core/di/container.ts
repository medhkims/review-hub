// ---- Core ----
import { NetworkInfoImpl } from '@/core/network/networkInfo';

// ---- Announcements ----
import { AnnouncementRemoteDataSourceImpl } from '@/data/announcement/datasources/announcementRemoteDataSource';
import { AnnouncementRepositoryImpl } from '@/data/announcement/repositories/announcementRepositoryImpl';
import { GetAnnouncementsUseCase } from '@/domain/announcement/usecases/getAnnouncementsUseCase';
import { CreateAnnouncementUseCase } from '@/domain/announcement/usecases/createAnnouncementUseCase';
import { DeleteAnnouncementUseCase } from '@/domain/announcement/usecases/deleteAnnouncementUseCase';

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
import { SendPasswordChangeEmailVerificationUseCase } from '@/domain/auth/usecases/sendPasswordChangeEmailVerificationUseCase';
import { SendEmailOtpUseCase } from '@/domain/auth/usecases/sendEmailOtpUseCase';
import { VerifyEmailOtpUseCase } from '@/domain/auth/usecases/verifyEmailOtpUseCase';
import { VerifyCurrentPasswordUseCase } from '@/domain/auth/usecases/verifyCurrentPasswordUseCase';
import { SendPasswordResetEmailUseCase } from '@/domain/auth/usecases/sendPasswordResetEmailUseCase';
import { DeleteAccountUseCase } from '@/domain/auth/usecases/deleteAccountUseCase';
import { ContinueAsGuestUseCase } from '@/domain/auth/usecases/continueAsGuestUseCase';

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
import { GetNearbyBusinessesUseCase } from '@/domain/business/usecases/getNearbyBusinessesUseCase';
import { GetTopRatedBusinessesUseCase } from '@/domain/business/usecases/getTopRatedBusinessesUseCase';
import { GetPopularByCategoryUseCase } from '@/domain/business/usecases/getPopularByCategoryUseCase';
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
import { ClaimBusinessUseCase } from '@/domain/business/usecases/claimBusinessUseCase';
import { GetHomeStatsUseCase } from '@/domain/business/usecases/getHomeStatsUseCase';
import { LikeReviewUseCase } from '@/domain/business/usecases/likeReviewUseCase';
import { UnlikeReviewUseCase } from '@/domain/business/usecases/unlikeReviewUseCase';
import { IncrementReviewViewUseCase } from '@/domain/business/usecases/incrementReviewViewUseCase';
import { GetReviewCommentsUseCase } from '@/domain/business/usecases/getReviewCommentsUseCase';
import { AddReviewCommentUseCase } from '@/domain/business/usecases/addReviewCommentUseCase';
import { AddCommentReplyUseCase } from '@/domain/business/usecases/addCommentReplyUseCase';
import { LikeCommentUseCase } from '@/domain/business/usecases/likeCommentUseCase';
import { UnlikeCommentUseCase } from '@/domain/business/usecases/unlikeCommentUseCase';
import { LikeReplyUseCase } from '@/domain/business/usecases/likeReplyUseCase';
import { UnlikeReplyUseCase } from '@/domain/business/usecases/unlikeReplyUseCase';
import { DislikeReviewUseCase } from '@/domain/business/usecases/dislikeReviewUseCase';
import { UndislikeReviewUseCase } from '@/domain/business/usecases/undislikeReviewUseCase';
import { DislikeCommentUseCase } from '@/domain/business/usecases/dislikeCommentUseCase';
import { UndislikeCommentUseCase } from '@/domain/business/usecases/undislikeCommentUseCase';
import { DislikeReplyUseCase } from '@/domain/business/usecases/dislikeReplyUseCase';
import { UndislikeReplyUseCase } from '@/domain/business/usecases/undislikeReplyUseCase';

// ---- Ticket ----
import { TicketRemoteDataSourceImpl } from '@/data/ticket/datasources/ticketRemoteDataSource';
import { TicketRepositoryImpl } from '@/data/ticket/repositories/ticketRepositoryImpl';
import { GetTicketsUseCase } from '@/domain/ticket/usecases/getTicketsUseCase';
import { UpdateTicketStatusUseCase } from '@/domain/ticket/usecases/updateTicketStatusUseCase';

// ---- Support Tickets ----
import { SupportTicketRemoteDataSourceImpl } from '@/data/support/datasources/supportTicketRemoteDataSource';
import { SupportTicketRepositoryImpl } from '@/data/support/repositories/supportTicketRepositoryImpl';
import { SubmitSupportTicketUseCase } from '@/domain/support/usecases/submitSupportTicketUseCase';
import { GetUserSupportTicketsUseCase } from '@/domain/support/usecases/getUserSupportTicketsUseCase';
import { GetAllSupportTicketsUseCase } from '@/domain/support/usecases/getAllSupportTicketsUseCase';
import { ReplyToSupportTicketUseCase } from '@/domain/support/usecases/replyToSupportTicketUseCase';

// ---- Feed ----
import { FeedRemoteDataSourceImpl } from '@/data/feed/datasources/feedRemoteDataSource';
import { FeedLocalDataSourceImpl } from '@/data/feed/datasources/feedLocalDataSource';
import { FeedRepositoryImpl } from '@/data/feed/repositories/feedRepositoryImpl';
import { GetPostsUseCase } from '@/domain/feed/usecases/getPostsUseCase';
import { CreatePostUseCase } from '@/domain/feed/usecases/createPostUseCase';
import { LikePostUseCase } from '@/domain/feed/usecases/likePostUseCase';

// ---- Business Owner Insights ----
import { BOInsightsRemoteDataSourceImpl } from '@/data/businessOwnerInsights/datasources/boInsightsRemoteDataSource';

// ---- Reviews ----
import { ReviewRemoteDataSourceImpl } from '@/data/reviews/datasources/reviewRemoteDataSource';
import { ReviewImageRemoteDataSourceImpl } from '@/data/reviews/datasources/reviewImageRemoteDataSource';
import { ReviewRepositoryImpl } from '@/data/reviews/repositories/reviewRepositoryImpl';
import { CreateReviewUseCase } from '@/domain/reviews/usecases/createReviewUseCase';
import { GetUserReviewsUseCase } from '@/domain/reviews/usecases/getUserReviewsUseCase';
import { DeleteReviewUseCase } from '@/domain/reviews/usecases/deleteReviewUseCase';
import { GetPendingReviewsUseCase } from '@/domain/reviews/usecases/getPendingReviewsUseCase';
import { GetApprovedReviewsUseCase } from '@/domain/reviews/usecases/getApprovedReviewsUseCase';
import { GetRejectedReviewsUseCase } from '@/domain/reviews/usecases/getRejectedReviewsUseCase';
import { ApproveReviewUseCase } from '@/domain/reviews/usecases/approveReviewUseCase';
import { RejectReviewUseCase } from '@/domain/reviews/usecases/rejectReviewUseCase';
import { GetReviewPhotoUrlsUseCase } from '@/domain/reviews/usecases/getReviewPhotoUrlsUseCase';

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

// ---- Verification ----
import { VerificationRemoteDataSourceImpl } from '@/data/verification/datasources/verificationRemoteDataSource';
import { VerificationRepositoryImpl } from '@/data/verification/repositories/verificationRepositoryImpl';
import { SubmitVerificationUseCase } from '@/domain/verification/usecases/submitVerificationUseCase';
import { GetUserVerificationUseCase } from '@/domain/verification/usecases/getUserVerificationUseCase';
import { GetPendingVerificationsUseCase } from '@/domain/verification/usecases/getPendingVerificationsUseCase';
import { UpdateVerificationStatusUseCase } from '@/domain/verification/usecases/updateVerificationStatusUseCase';
import { SendVerificationOtpUseCase } from '@/domain/verification/usecases/sendVerificationOtpUseCase';
import { VerifyVerificationOtpUseCase } from '@/domain/verification/usecases/verifyVerificationOtpUseCase';
import { GetVerificationsByStatusUseCase } from '@/domain/verification/usecases/getVerificationsByStatusUseCase';
import { ValidateIdCardUseCase } from '@/domain/verification/usecases/validateIdCardUseCase';
import { ExtractAndSaveCinUseCase } from '@/domain/verification/usecases/extractAndSaveCinUseCase';

// ---- Deals ----
import { DealRemoteDataSourceImpl } from '@/data/deals/datasources/dealRemoteDataSource';
import { DealRepositoryImpl } from '@/data/deals/repositories/dealRepositoryImpl';
import { GetActiveDealsUseCase } from '@/domain/deals/usecases/getActiveDealsUseCase';

// ---- Weekly Picks ----
import { WeeklyPickRemoteDataSourceImpl } from '@/data/weeklyPicks/datasources/weeklyPickRemoteDataSource';
import { WeeklyPickRepositoryImpl } from '@/data/weeklyPicks/repositories/weeklyPickRepositoryImpl';
import { GetWeeklyPicksUseCase } from '@/domain/weeklyPicks/usecases/getWeeklyPicksUseCase';
import { GetAllWeeklyPicksUseCase } from '@/domain/weeklyPicks/usecases/getAllWeeklyPicksUseCase';
import { CreateWeeklyPickUseCase } from '@/domain/weeklyPicks/usecases/createWeeklyPickUseCase';
import { DeleteWeeklyPickUseCase } from '@/domain/weeklyPicks/usecases/deleteWeeklyPickUseCase';

// ---- Recent Reviews ----
import { GetRecentReviewsUseCase } from '@/domain/business/usecases/getRecentReviewsUseCase';

// ---- FAQ ----
import { FaqRemoteDataSourceImpl } from '@/data/faq/datasources/faqRemoteDataSource';
import { FaqRepositoryImpl } from '@/data/faq/repositories/faqRepositoryImpl';
import { GetFaqsUseCase } from '@/domain/faq/usecases/getFaqsUseCase';
import { GetAdminFaqsUseCase } from '@/domain/faq/usecases/getAdminFaqsUseCase';
import { CreateFaqUseCase } from '@/domain/faq/usecases/createFaqUseCase';
import { UpdateFaqUseCase } from '@/domain/faq/usecases/updateFaqUseCase';
import { DeleteFaqUseCase } from '@/domain/faq/usecases/deleteFaqUseCase';

// ---- Booking ----
import { BookingRemoteDataSourceImpl } from '@/data/booking/datasources/bookingRemoteDataSource';
import { BookingRepositoryImpl } from '@/data/booking/repositories/bookingRepositoryImpl';
import { GetBookingConfigUseCase } from '@/domain/booking/usecases/getBookingConfigUseCase';
import { UpdateBookingConfigUseCase } from '@/domain/booking/usecases/updateBookingConfigUseCase';
import { CreateBookingRequestUseCase } from '@/domain/booking/usecases/createBookingRequestUseCase';
import { GetBusinessBookingRequestsUseCase } from '@/domain/booking/usecases/getBusinessBookingRequestsUseCase';
import { UpdateBookingRequestStatusUseCase } from '@/domain/booking/usecases/updateBookingRequestStatusUseCase';

// ---- Dispute ----
import { DisputeRemoteDataSourceImpl } from '@/data/dispute/datasources/disputeRemoteDataSource';
import { DisputeRepositoryImpl } from '@/data/dispute/repositories/disputeRepositoryImpl';
import { SubmitDisputeUseCase } from '@/domain/dispute/usecases/submitDisputeUseCase';
import { GetDisputesUseCase } from '@/domain/dispute/usecases/getDisputesUseCase';
import { ResolveDisputeUseCase } from '@/domain/dispute/usecases/resolveDisputeUseCase';

// ---- Admin ----
import { AdminRemoteDataSourceImpl } from '@/data/admin/datasources/adminRemoteDataSource';
import { AdminInsightsRemoteDataSourceImpl } from '@/data/admin/datasources/adminInsightsRemoteDataSource';
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
const sendPasswordChangeEmailVerificationUseCase = new SendPasswordChangeEmailVerificationUseCase(authRepository);
const sendEmailOtpUseCase = new SendEmailOtpUseCase(authRepository);
const verifyEmailOtpUseCase = new VerifyEmailOtpUseCase(authRepository);
const verifyCurrentPasswordUseCase = new VerifyCurrentPasswordUseCase(authRepository);
const sendPasswordResetEmailUseCase = new SendPasswordResetEmailUseCase(authRepository);
const deleteAccountUseCase = new DeleteAccountUseCase(authRepository);
const continueAsGuestUseCase = new ContinueAsGuestUseCase(authRepository);

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
const getNearbyBusinessesUseCase = new GetNearbyBusinessesUseCase(businessRepository);
const getTopRatedBusinessesUseCase = new GetTopRatedBusinessesUseCase(businessRepository);
const getPopularByCategoryUseCase = new GetPopularByCategoryUseCase(businessRepository);
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
const claimBusinessUseCase = new ClaimBusinessUseCase(businessRepository);
const getHomeStatsUseCase = new GetHomeStatsUseCase(businessRepository);
const likeReviewUseCase = new LikeReviewUseCase(businessRepository, notificationRepository);
const unlikeReviewUseCase = new UnlikeReviewUseCase(businessRepository);
const incrementReviewViewUseCase = new IncrementReviewViewUseCase(businessRepository);
const getReviewCommentsUseCase = new GetReviewCommentsUseCase(businessRepository);
const addReviewCommentUseCase = new AddReviewCommentUseCase(businessRepository, notificationRepository);
const addCommentReplyUseCase = new AddCommentReplyUseCase(businessRepository, notificationRepository);
const likeCommentUseCase = new LikeCommentUseCase(businessRepository, notificationRepository);
const unlikeCommentUseCase = new UnlikeCommentUseCase(businessRepository);
const likeReplyUseCase = new LikeReplyUseCase(businessRepository, notificationRepository);
const unlikeReplyUseCase = new UnlikeReplyUseCase(businessRepository);
const dislikeReviewUseCase = new DislikeReviewUseCase(businessRepository, notificationRepository);
const undislikeReviewUseCase = new UndislikeReviewUseCase(businessRepository);
const dislikeCommentUseCase = new DislikeCommentUseCase(businessRepository, notificationRepository);
const undislikeCommentUseCase = new UndislikeCommentUseCase(businessRepository);
const dislikeReplyUseCase = new DislikeReplyUseCase(businessRepository, notificationRepository);
const undislikeReplyUseCase = new UndislikeReplyUseCase(businessRepository);

// ---- Ticket ----
const ticketRemoteDataSource = new TicketRemoteDataSourceImpl();
const ticketRepository = new TicketRepositoryImpl(ticketRemoteDataSource);
const getTicketsUseCase = new GetTicketsUseCase(ticketRepository);
const updateTicketStatusUseCase = new UpdateTicketStatusUseCase(ticketRepository);

// ---- Support Tickets ----
const supportTicketRemoteDataSource = new SupportTicketRemoteDataSourceImpl();
const supportTicketRepository = new SupportTicketRepositoryImpl(supportTicketRemoteDataSource);
const submitSupportTicketUseCase = new SubmitSupportTicketUseCase(supportTicketRepository);
const getUserSupportTicketsUseCase = new GetUserSupportTicketsUseCase(supportTicketRepository);
const getAllSupportTicketsUseCase = new GetAllSupportTicketsUseCase(supportTicketRepository);
const replyToSupportTicketUseCase = new ReplyToSupportTicketUseCase(supportTicketRepository, notificationRepository);

// ---- Feed ----
const feedRemoteDataSource = new FeedRemoteDataSourceImpl();
const feedLocalDataSource = new FeedLocalDataSourceImpl();
const feedRepository = new FeedRepositoryImpl(feedRemoteDataSource, feedLocalDataSource, networkInfo);

const getPostsUseCase = new GetPostsUseCase(feedRepository);
const createPostUseCase = new CreatePostUseCase(feedRepository);
const likePostUseCase = new LikePostUseCase(feedRepository);

// ---- Reviews ----
// --- Business Owner Insights ---
const boInsightsDataSource = new BOInsightsRemoteDataSourceImpl();

const reviewRemoteDataSource = new ReviewRemoteDataSourceImpl();
const reviewImageDataSource = new ReviewImageRemoteDataSourceImpl();
const reviewRepository = new ReviewRepositoryImpl(reviewRemoteDataSource);

const createReviewUseCase = new CreateReviewUseCase(reviewRepository);
const getUserReviewsUseCase = new GetUserReviewsUseCase(reviewRepository);
const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepository);
const getPendingReviewsUseCase = new GetPendingReviewsUseCase(reviewRepository);
const getApprovedReviewsUseCase = new GetApprovedReviewsUseCase(reviewRepository);
const getRejectedReviewsUseCase = new GetRejectedReviewsUseCase(reviewRepository);
const approveReviewUseCase = new ApproveReviewUseCase(reviewRepository, notificationRepository);
const rejectReviewUseCase = new RejectReviewUseCase(reviewRepository, notificationRepository);
const getReviewPhotoUrlsUseCase = new GetReviewPhotoUrlsUseCase(reviewRepository);

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

// ---- Verification ----
const verificationRemoteDataSource = new VerificationRemoteDataSourceImpl();
const verificationRepository = new VerificationRepositoryImpl(verificationRemoteDataSource);
const submitVerificationUseCase = new SubmitVerificationUseCase(verificationRepository);
const getUserVerificationUseCase = new GetUserVerificationUseCase(verificationRepository);
const getPendingVerificationsUseCase = new GetPendingVerificationsUseCase(verificationRepository);
const updateVerificationStatusUseCase = new UpdateVerificationStatusUseCase(verificationRepository, notificationRepository);
const sendVerificationOtpUseCase = new SendVerificationOtpUseCase(verificationRepository);
const verifyVerificationOtpUseCase = new VerifyVerificationOtpUseCase(verificationRepository);
const getVerificationsByStatusUseCase = new GetVerificationsByStatusUseCase(verificationRepository);
const validateIdCardUseCase = new ValidateIdCardUseCase(verificationRepository);
const extractAndSaveCinUseCase = new ExtractAndSaveCinUseCase(verificationRepository);

// ---- Dispute ----
const disputeRemoteDataSource = new DisputeRemoteDataSourceImpl();
const disputeRepository = new DisputeRepositoryImpl(disputeRemoteDataSource);
const submitDisputeUseCase = new SubmitDisputeUseCase(disputeRepository);
const getDisputesUseCase = new GetDisputesUseCase(disputeRepository);
const resolveDisputeUseCase = new ResolveDisputeUseCase(disputeRepository);

// ---- Admin ----
const adminRemoteDataSource = new AdminRemoteDataSourceImpl();
const adminInsightsDataSource = new AdminInsightsRemoteDataSourceImpl();
const adminRepository = new AdminRepositoryImpl(adminRemoteDataSource);
const getAdminDashboardStatsUseCase = new GetAdminDashboardStatsUseCase(adminRepository);
const getAdminCompanyListUseCase = new GetAdminCompanyListUseCase(adminRepository);

// ---- Admin Info ----
const adminInfoRemoteDataSource = new AdminInfoRemoteDataSourceImpl();
const adminInfoRepository = new AdminInfoRepositoryImpl(adminInfoRemoteDataSource);
const getAdminInfoUseCase = new GetAdminInfoUseCase(adminInfoRepository);
const updateAdminInfoUseCase = new UpdateAdminInfoUseCase(adminInfoRepository);
const uploadAdminPictureUseCase = new UploadAdminPictureUseCase(adminInfoRepository);

// ---- FAQ ----
const faqRemoteDataSource = new FaqRemoteDataSourceImpl();
const faqRepository = new FaqRepositoryImpl(faqRemoteDataSource);
const getFaqsUseCase = new GetFaqsUseCase(faqRepository);
const getAdminFaqsUseCase = new GetAdminFaqsUseCase(faqRepository);
const createFaqUseCase = new CreateFaqUseCase(faqRepository);
const updateFaqUseCase = new UpdateFaqUseCase(faqRepository);
const deleteFaqUseCase = new DeleteFaqUseCase(faqRepository);

// ---- Deals ----
const dealRemoteDataSource = new DealRemoteDataSourceImpl();
const dealRepository = new DealRepositoryImpl(dealRemoteDataSource);
const getActiveDealsUseCase = new GetActiveDealsUseCase(dealRepository);

// ---- Weekly Picks ----
const weeklyPickRemoteDataSource = new WeeklyPickRemoteDataSourceImpl();
const weeklyPickRepository = new WeeklyPickRepositoryImpl(weeklyPickRemoteDataSource);
const getWeeklyPicksUseCase = new GetWeeklyPicksUseCase(weeklyPickRepository);
const getAllWeeklyPicksUseCase = new GetAllWeeklyPicksUseCase(weeklyPickRepository);
const createWeeklyPickUseCase = new CreateWeeklyPickUseCase(weeklyPickRepository);
const deleteWeeklyPickUseCase = new DeleteWeeklyPickUseCase(weeklyPickRepository);

// ---- Recent Reviews ----
const getRecentReviewsUseCase = new GetRecentReviewsUseCase(businessRepository);

// ---- Notifications (use cases) ----
const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationRepository);

// ---- Booking ----
const bookingRemoteDataSource = new BookingRemoteDataSourceImpl();
const bookingRepository = new BookingRepositoryImpl(bookingRemoteDataSource);
const getBookingConfigUseCase = new GetBookingConfigUseCase(bookingRepository);
const updateBookingConfigUseCase = new UpdateBookingConfigUseCase(bookingRepository);
const createBookingRequestUseCase = new CreateBookingRequestUseCase(bookingRepository);
const getBusinessBookingRequestsUseCase = new GetBusinessBookingRequestsUseCase(bookingRepository);
const updateBookingRequestStatusUseCase = new UpdateBookingRequestStatusUseCase(bookingRepository);

// ---- Announcements ----
const announcementRemote = new AnnouncementRemoteDataSourceImpl();
const announcementRepository = new AnnouncementRepositoryImpl(announcementRemote);
const getAnnouncementsUseCase = new GetAnnouncementsUseCase(announcementRepository);
const createAnnouncementUseCase = new CreateAnnouncementUseCase(announcementRepository);
const deleteAnnouncementUseCase = new DeleteAnnouncementUseCase(announcementRepository);

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
  sendPasswordChangeEmailVerificationUseCase,
  sendEmailOtpUseCase,
  verifyEmailOtpUseCase,
  verifyCurrentPasswordUseCase,
  sendPasswordResetEmailUseCase,
  deleteAccountUseCase,
  continueAsGuestUseCase,
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
  getNearbyBusinessesUseCase,
  getTopRatedBusinessesUseCase,
  getPopularByCategoryUseCase,
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
  claimBusinessUseCase,
  getHomeStatsUseCase,
  // Review interaction use cases
  likeReviewUseCase,
  unlikeReviewUseCase,
  incrementReviewViewUseCase,
  getReviewCommentsUseCase,
  addReviewCommentUseCase,
  addCommentReplyUseCase,
  likeCommentUseCase,
  unlikeCommentUseCase,
  likeReplyUseCase,
  unlikeReplyUseCase,
  dislikeReviewUseCase,
  undislikeReviewUseCase,
  dislikeCommentUseCase,
  undislikeCommentUseCase,
  dislikeReplyUseCase,
  undislikeReplyUseCase,
  getTicketsUseCase,
  updateTicketStatusUseCase,
  // Support Ticket use cases
  submitSupportTicketUseCase,
  getUserSupportTicketsUseCase,
  getAllSupportTicketsUseCase,
  replyToSupportTicketUseCase,
  // Feed use cases
  getPostsUseCase,
  createPostUseCase,
  likePostUseCase,
  // Review use cases
  reviewImageDataSource,
  createReviewUseCase,
  getUserReviewsUseCase,
  deleteReviewUseCase,
  getPendingReviewsUseCase,
  getApprovedReviewsUseCase,
  getRejectedReviewsUseCase,
  approveReviewUseCase,
  rejectReviewUseCase,
  getReviewPhotoUrlsUseCase,
  // Chat use cases
  getConversationsUseCase,
  getMessagesUseCase,
  sendMessageUseCase,
  // Notification use cases
  getNotificationsUseCase,
  markNotificationReadUseCase,
  notificationRepository,
  // Banner use cases
  getBannersUseCase,
  getAllBannersUseCase,
  createBannerUseCase,
  updateBannerUseCase,
  deleteBannerUseCase,
  // Admin use cases
  getAdminDashboardStatsUseCase,
  getAdminCompanyListUseCase,
  adminInsightsDataSource,
  getAdminInfoUseCase,
  updateAdminInfoUseCase,
  uploadAdminPictureUseCase,
  // Category default use cases
  getCategoryDefaultsUseCase,
  updateCategoryDefaultUseCase,
  // Verification use cases
  submitVerificationUseCase,
  getUserVerificationUseCase,
  getPendingVerificationsUseCase,
  updateVerificationStatusUseCase,
  sendVerificationOtpUseCase,
  verifyVerificationOtpUseCase,
  getVerificationsByStatusUseCase,
  validateIdCardUseCase,
  extractAndSaveCinUseCase,
  // Business Owner Insights data source
  boInsightsDataSource,
  // FAQ use cases
  getFaqsUseCase,
  getAdminFaqsUseCase,
  createFaqUseCase,
  updateFaqUseCase,
  deleteFaqUseCase,
  // Deals use cases
  getActiveDealsUseCase,
  // Weekly Picks use cases
  getWeeklyPicksUseCase,
  getAllWeeklyPicksUseCase,
  createWeeklyPickUseCase,
  deleteWeeklyPickUseCase,
  // Recent Reviews use case
  getRecentReviewsUseCase,
  // Dispute use cases
  submitDisputeUseCase,
  getDisputesUseCase,
  resolveDisputeUseCase,
  // Announcement use cases
  getAnnouncementsUseCase,
  createAnnouncementUseCase,
  deleteAnnouncementUseCase,
  // Booking use cases
  getBookingConfigUseCase,
  updateBookingConfigUseCase,
  createBookingRequestUseCase,
  getBusinessBookingRequestsUseCase,
  updateBookingRequestStatusUseCase,
};
