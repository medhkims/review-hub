import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, FlatList, Pressable, Image, ActivityIndicator, Modal, ScrollView, Alert, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { BusinessDetailEntity } from '@/domain/business/entities/businessDetailEntity';
import { UserReviewEntity } from '@/domain/reviews/entities/userReviewEntity';
import { ProfileEntity } from '@/domain/profile/entities/profileEntity';
import { VerificationEntity, VerificationStatus } from '@/domain/verification/entities/verificationEntity';
import { colors } from '@/core/theme/colors';
import { container } from '@/core/di/container';
import { getCategoryDefaultCover } from '@/core/utils/categoryDefaultImages';
import { useCategoryDefaultStore } from '@/presentation/shared/store/categoryDefaultStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { AdminMenuButton } from '../components/AdminMenuButton';

type VerifyTab = 'company' | 'reviews' | 'moderator' | 'user';
type StatusFilter = 'pending' | 'approved' | 'declined' | 'suspended';
type SortBy = 'newest' | 'oldest' | 'flagged';

interface TabConfig {
  key: VerifyTab;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const TABS: TabConfig[] = [
  { key: 'company',   label: 'Company',   icon: 'office-building-outline' },
  { key: 'reviews',   label: 'Reviews',   icon: 'star-outline' },
  { key: 'moderator', label: 'Moderator', icon: 'shield-account-outline' },
  { key: 'user',      label: 'User',      icon: 'account-outline' },
];

export function PendingBusinessesScreen() {
  const { t } = useTranslation();
  const categoryDefaults = useCategoryDefaultStore((s) => s.defaults);
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<VerifyTab>('company');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [businesses, setBusinesses] = useState<BusinessDetailEntity[]>([]);
  const [approvedBusinesses, setApprovedBusinesses] = useState<BusinessDetailEntity[]>([]);
  const [rejectedBusinesses, setRejectedBusinesses] = useState<BusinessDetailEntity[]>([]);
  const [suspendedBusinesses, setSuspendedBusinesses] = useState<BusinessDetailEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [businessError, setBusinessError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [reApprovingId, setReApprovingId] = useState<string | null>(null);
  const [confirmBusiness, setConfirmBusiness] = useState<BusinessDetailEntity | null>(null);
  const [confirmRejectBusiness, setConfirmRejectBusiness] = useState<BusinessDetailEntity | null>(null);
  const [confirmSuspendBusiness, setConfirmSuspendBusiness] = useState<BusinessDetailEntity | null>(null);
  const [confirmReApproveBusiness, setConfirmReApproveBusiness] = useState<BusinessDetailEntity | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessDetailEntity | null>(null);
  const [businessOwner, setBusinessOwner] = useState<ProfileEntity | null>(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const fetchedOwnerIdRef = useRef<string | null>(null);

  // Reviews tab state
  const [pendingReviews, setPendingReviews] = useState<UserReviewEntity[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<UserReviewEntity[]>([]);
  const [rejectedReviews, setRejectedReviews] = useState<UserReviewEntity[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [actionReviewId, setActionReviewId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<UserReviewEntity | null>(null);
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(0);
  const [reviewAuthor, setReviewAuthor] = useState<ProfileEntity | null>(null);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [confirmReviewAction, setConfirmReviewAction] = useState<{ review: UserReviewEntity; action: 'approve' | 'decline' } | null>(null);
  const fetchedAuthorId = useRef<string | null>(null);

  // Sort & filter state (company tab)
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  // User verification tab state
  const [userVerifications, setUserVerifications] = useState<VerificationEntity[]>([]);
  const [pendingUserCount, setPendingUserCount] = useState(0);
  const [userVerificationsLoading, setUserVerificationsLoading] = useState(false);
  const [userVerificationsError, setUserVerificationsError] = useState<string | null>(null);
  const [userActionId, setUserActionId] = useState<string | null>(null);
  const [userRejectTarget, setUserRejectTarget] = useState<string | null>(null);
  const [userRejectReason, setUserRejectReason] = useState('');
  const [userIdCardVisible, setUserIdCardVisible] = useState<string | null>(null);

  // Per-tab pending counts for badges
  const tabBadges = useMemo<Record<VerifyTab, number>>(() => ({
    company: businesses.length,
    reviews: pendingReviews.length,
    moderator: 0,
    user: pendingUserCount,
  }), [businesses.length, pendingReviews.length]);

  const currentRawData = useMemo(() => {
    if (statusFilter === 'pending') return businesses;
    if (statusFilter === 'approved') return approvedBusinesses;
    if (statusFilter === 'declined') return rejectedBusinesses;
    return suspendedBusinesses;
  }, [statusFilter, businesses, approvedBusinesses, rejectedBusinesses, suspendedBusinesses]);

  const availableCategories = useMemo(() => {
    const catMap = new Map<string, string>();
    currentRawData.forEach((b) => {
      if (b.categoryId && b.categoryName) catMap.set(b.categoryId, b.categoryName);
    });
    return Array.from(catMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [currentRawData]);

  const filteredAndSortedData = useMemo(() => {
    let data = categoryFilter.length > 0
      ? currentRawData.filter((b) => categoryFilter.includes(b.categoryId))
      : currentRawData;
    if (sortBy === 'newest') {
      data = [...data].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === 'oldest') {
      data = [...data].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    } else {
      // flagged: most suspension count first, then newest
      data = [...data].sort(
        (a, b) =>
          (b.suspensionCount ?? 0) - (a.suspensionCount ?? 0) ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      );
    }
    return data;
  }, [currentRawData, categoryFilter, sortBy]);

  const loadPending = useCallback(async () => {
    setIsLoading(true);
    setBusinessError(null);
    const result = await container.getPendingBusinessesUseCase.execute();
    result.fold(
      (failure) => { setBusinesses([]); setBusinessError(failure.message); },
      (data) => setBusinesses(data),
    );
    setIsLoading(false);
  }, []);

  const loadPendingReviews = useCallback(async () => {
    setReviewsLoading(true);
    setReviewsError(null);
    const result = await container.getPendingReviewsUseCase.execute();
    result.fold(
      (failure) => { setPendingReviews([]); setReviewsError(failure.message); },
      (data) => setPendingReviews(data),
    );
    setReviewsLoading(false);
  }, []);

  const loadApproved = useCallback(async () => {
    setIsLoading(true);
    setBusinessError(null);
    const result = await container.getApprovedBusinessesUseCase.execute();
    result.fold(
      (failure) => { setApprovedBusinesses([]); setBusinessError(failure.message); },
      (data) => setApprovedBusinesses(data),
    );
    setIsLoading(false);
  }, []);

  const loadRejected = useCallback(async () => {
    setIsLoading(true);
    setBusinessError(null);
    const result = await container.getRejectedBusinessesUseCase.execute();
    result.fold(
      (failure) => { setRejectedBusinesses([]); setBusinessError(failure.message); },
      (data) => setRejectedBusinesses(data),
    );
    setIsLoading(false);
  }, []);

  const loadSuspended = useCallback(async () => {
    setIsLoading(true);
    setBusinessError(null);
    const result = await container.getSuspendedBusinessesUseCase.execute();
    result.fold(
      (failure) => { setSuspendedBusinesses([]); setBusinessError(failure.message); },
      (data) => setSuspendedBusinesses(data),
    );
    setIsLoading(false);
  }, []);

  const loadApprovedReviews = useCallback(async () => {
    setReviewsLoading(true);
    setReviewsError(null);
    const result = await container.getApprovedReviewsUseCase.execute();
    result.fold(
      (failure) => { setApprovedReviews([]); setReviewsError(failure.message); },
      (data) => setApprovedReviews(data),
    );
    setReviewsLoading(false);
  }, []);

  const loadRejectedReviews = useCallback(async () => {
    setReviewsLoading(true);
    setReviewsError(null);
    const result = await container.getRejectedReviewsUseCase.execute();
    result.fold(
      (failure) => { setRejectedReviews([]); setReviewsError(failure.message); },
      (data) => setRejectedReviews(data),
    );
    setReviewsLoading(false);
  }, []);

  const loadUserVerifications = useCallback(async (filter: StatusFilter) => {
    if (filter === 'suspended') { setUserVerifications([]); return; }
    const status: VerificationStatus = filter === 'declined' ? 'rejected' : filter as VerificationStatus;
    setUserVerificationsLoading(true);
    setUserVerificationsError(null);
    const result = await container.getVerificationsByStatusUseCase.execute(status);
    setUserVerificationsLoading(false);
    result.fold(
      (failure) => { setUserVerifications([]); setUserVerificationsError(failure.message); },
      (items) => {
        setUserVerifications(items);
        if (status === 'pending') setPendingUserCount(items.length);
      },
    );
  }, []);

  const handleApproveUser = useCallback(async (id: string) => {
    if (!currentUser) return;
    setUserActionId(id);
    const result = await container.updateVerificationStatusUseCase.execute(id, 'approved', currentUser.id);
    setUserActionId(null);
    result.fold(
      () => {},
      () => {
        setUserVerifications((prev) => prev.filter((v) => v.id !== id));
        setPendingUserCount((c) => Math.max(0, c - 1));
      },
    );
  }, [currentUser]);

  const handleRejectUser = useCallback(async () => {
    if (!userRejectTarget || !currentUser) return;
    const id = userRejectTarget;
    setUserActionId(id);
    const result = await container.updateVerificationStatusUseCase.execute(id, 'rejected', currentUser.id, userRejectReason.trim() || undefined);
    setUserActionId(null);
    setUserRejectTarget(null);
    setUserRejectReason('');
    result.fold(
      () => {},
      () => {
        setUserVerifications((prev) => prev.filter((v) => v.id !== id));
        setPendingUserCount((c) => Math.max(0, c - 1));
      },
    );
  }, [userRejectTarget, userRejectReason, currentUser]);

  useEffect(() => {
    setCategoryFilter([]);
    if (statusFilter === 'pending') loadPending();
    else if (statusFilter === 'approved') loadApproved();
    else if (statusFilter === 'declined') loadRejected();
    else loadSuspended();
  }, [statusFilter, loadPending, loadApproved, loadRejected, loadSuspended]);

  // Eager-load pending reviews and user verifications on mount for tab badges
  useEffect(() => { loadPendingReviews(); }, [loadPendingReviews]);
  useEffect(() => { loadUserVerifications('pending'); }, [loadUserVerifications]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      if (statusFilter === 'pending') loadPendingReviews();
      else if (statusFilter === 'approved') loadApprovedReviews();
      else loadRejectedReviews();
    }
    if (activeTab === 'user') {
      loadUserVerifications(statusFilter);
    }
  }, [activeTab, statusFilter, loadPendingReviews, loadApprovedReviews, loadRejectedReviews, loadUserVerifications]);

  useEffect(() => {
    if (!selectedReview) { setReviewAuthor(null); fetchedAuthorId.current = null; return; }
    if (fetchedAuthorId.current === selectedReview.userId) return;
    fetchedAuthorId.current = selectedReview.userId;
    setReviewAuthor(null);
    setAuthorLoading(true);
    container.getProfileUseCase.execute(selectedReview.userId).then((result) => {
      result.fold(() => {}, (profile) => setReviewAuthor(profile));
      setAuthorLoading(false);
    });
  }, [selectedReview]);

  useEffect(() => {
    if (!selectedBusiness) { setBusinessOwner(null); fetchedOwnerIdRef.current = null; return; }
    if (fetchedOwnerIdRef.current === selectedBusiness.ownerId) return;
    fetchedOwnerIdRef.current = selectedBusiness.ownerId;
    setBusinessOwner(null);
    setOwnerLoading(true);
    container.getProfileUseCase.execute(selectedBusiness.ownerId).then((result) => {
      result.fold(() => {}, (profile) => setBusinessOwner(profile));
      setOwnerLoading(false);
    });
  }, [selectedBusiness]);

  const handleAccept = useCallback((business: BusinessDetailEntity) => {
    setConfirmBusiness(business);
  }, []);

  const handleReject = useCallback((business: BusinessDetailEntity) => {
    setConfirmRejectBusiness(business);
  }, []);

  const handleConfirmAccept = useCallback(async () => {
    if (!confirmBusiness) return;
    const business = confirmBusiness;
    setConfirmBusiness(null);
    setAcceptingId(business.id);
    const result = await container.acceptBusinessUseCase.execute({
      businessId: business.id,
      ownerId: business.ownerId,
      businessName: business.name,
    });
    result.fold(
      () => {},
      () => {
        setBusinesses((prev) => prev.filter((b) => b.id !== business.id));
      },
    );
    setAcceptingId(null);
  }, [confirmBusiness]);

  const handleConfirmReject = useCallback(async () => {
    if (!confirmRejectBusiness) return;
    const business = confirmRejectBusiness;
    setConfirmRejectBusiness(null);
    setRejectingId(business.id);
    const result = await container.rejectBusinessUseCase.execute({
      businessId: business.id,
      ownerId: business.ownerId,
      businessName: business.name,
    });
    result.fold(
      () => {},
      () => {
        setBusinesses((prev) => prev.filter((b) => b.id !== business.id));
        setSelectedBusiness(null);
      },
    );
    setRejectingId(null);
  }, [confirmRejectBusiness]);

  const handleSuspend = useCallback((business: BusinessDetailEntity) => {
    setConfirmSuspendBusiness(business);
  }, []);

  const handleReApprove = useCallback((business: BusinessDetailEntity) => {
    setConfirmReApproveBusiness(business);
  }, []);

  const handleConfirmSuspend = useCallback(async () => {
    if (!confirmSuspendBusiness) return;
    const business = confirmSuspendBusiness;
    setConfirmSuspendBusiness(null);
    setSuspendingId(business.id);
    const result = await container.suspendBusinessUseCase.execute({
      businessId: business.id,
      ownerId: business.ownerId,
      businessName: business.name,
    });
    result.fold(
      () => {},
      () => {
        setApprovedBusinesses((prev) => prev.filter((b) => b.id !== business.id));
        setSelectedBusiness(null);
      },
    );
    setSuspendingId(null);
  }, [confirmSuspendBusiness]);

  const handleConfirmReApprove = useCallback(async () => {
    if (!confirmReApproveBusiness) return;
    const business = confirmReApproveBusiness;
    setConfirmReApproveBusiness(null);
    setReApprovingId(business.id);
    const result = await container.reApproveBusinessUseCase.execute({
      businessId: business.id,
      ownerId: business.ownerId,
      businessName: business.name,
    });
    result.fold(
      () => {},
      () => {
        setRejectedBusinesses((prev) => prev.filter((b) => b.id !== business.id));
        setSuspendedBusinesses((prev) => prev.filter((b) => b.id !== business.id));
        setSelectedBusiness(null);
      },
    );
    setReApprovingId(null);
  }, [confirmReApproveBusiness]);

  const handleApproveReview = useCallback((review: UserReviewEntity) => {
    setConfirmReviewAction({ review, action: 'approve' });
  }, []);

  const handleRejectReview = useCallback((review: UserReviewEntity) => {
    setConfirmReviewAction({ review, action: 'decline' });
  }, []);

  const handleConfirmReviewAction = useCallback(async () => {
    if (!confirmReviewAction) return;
    const { review, action } = confirmReviewAction;
    setConfirmReviewAction(null);
    setActionReviewId(review.id);
    const params = { reviewId: review.id, userId: review.userId, businessName: review.businessName };
    const result = action === 'approve'
      ? await container.approveReviewUseCase.execute(params)
      : await container.rejectReviewUseCase.execute(params);
    result.fold(
      () => Alert.alert('Error', `Failed to ${action} review`),
      () => {
        setPendingReviews((prev) => prev.filter((r) => r.id !== review.id));
        setSelectedReview(null);
      },
    );
    setActionReviewId(null);
  }, [confirmReviewAction]);

  const renderReviewItem = useCallback(({ item }: { item: UserReviewEntity }) => {
    const isActing = actionReviewId === item.id;
    const stars = Math.round(item.overallRating);
    const date = item.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    return (
      <Pressable
        onPress={() => { setPreviewPhotoIndex(0); setSelectedReview(item); }}
        accessibilityRole="none"
        accessibilityLabel={`View review for ${item.businessName}`}
        style={({ pressed }) => ({
          backgroundColor: colors.cardDark,
          borderRadius: 16,
          marginHorizontal: 20,
          marginVertical: 6,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.borderDark,
          opacity: pressed ? 0.85 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        })}
      >
        {/* Left: icon */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.midnight,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.borderDark,
          }}
        >
          <MaterialCommunityIcons name="account-outline" size={20} color={colors.textSlate400} />
        </View>

        {/* Center: meta */}
        <View style={{ flex: 1, gap: 3 }}>
          {/* Stars */}
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <MaterialCommunityIcons
                key={s}
                name={s <= stars ? 'star' : 'star-outline'}
                size={13}
                color={s <= stars ? '#F59E0B' : colors.textSlate600}
              />
            ))}
          </View>
          {/* Author placeholder (resolved in detail) */}
          <AppText style={{ fontSize: 12, color: colors.textSlate400 }} numberOfLines={1}>
            By {item.userId.slice(0, 8)}…
          </AppText>
          {/* Business */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name="office-building-outline" size={11} color={colors.textSlate600} />
            <AppText style={{ fontSize: 11, color: colors.textSlate600 }} numberOfLines={1}>
              {item.businessName}
            </AppText>
          </View>
          {/* Date */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name="calendar-outline" size={11} color={colors.textSlate600} />
            <AppText style={{ fontSize: 11, color: colors.textSlate600 }}>{date}</AppText>
          </View>
        </View>

        {/* Right: action buttons (pending only) or status badge */}
        {statusFilter === 'pending' ? (
          <View style={{ gap: 8 }}>
            <Pressable
              onPress={(e) => { e.stopPropagation(); handleApproveReview(item); }}
              disabled={isActing}
              accessibilityRole="button"
              accessibilityLabel="Approve review"
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.success,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed || isActing ? 0.6 : 1,
              })}
            >
              {isActing ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <MaterialCommunityIcons name="check" size={18} color={colors.white} />
              )}
            </Pressable>
            <Pressable
              onPress={(e) => { e.stopPropagation(); handleRejectReview(item); }}
              disabled={isActing}
              accessibilityRole="button"
              accessibilityLabel="Reject review"
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(239,68,68,0.12)',
                borderWidth: 1,
                borderColor: '#EF4444',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed || isActing ? 0.6 : 1,
              })}
            >
              <MaterialCommunityIcons name="close" size={18} color="#EF4444" />
            </Pressable>
          </View>
        ) : (
          <View style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: statusFilter === 'approved' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1,
            borderColor: statusFilter === 'approved' ? colors.success : '#EF4444',
          }}>
            <MaterialCommunityIcons
              name={statusFilter === 'approved' ? 'check' : 'close'}
              size={18}
              color={statusFilter === 'approved' ? colors.success : '#EF4444'}
            />
          </View>
        )}
      </Pressable>
    );
  }, [handleApproveReview, handleRejectReview, actionReviewId, statusFilter]);

  const renderItem = useCallback(({ item }: { item: BusinessDetailEntity }) => {
    const isValidUrl = (url: string | null | undefined) =>
      !!url && (url.startsWith('http://') || url.startsWith('https://'));

    const remote = item.categoryId ? categoryDefaults[item.categoryId] : undefined;
    const coverSource = isValidUrl(item.coverImageUrl)
      ? { uri: item.coverImageUrl! }
      : remote?.coverImageUrl
        ? { uri: remote.coverImageUrl }
        : (item.categoryId ? getCategoryDefaultCover(item.categoryId) : null);

    return (
      <Pressable
        onPress={() => setSelectedBusiness(item)}
        accessibilityRole="none"
        accessibilityLabel={`View details for ${item.name}`}
        style={({ pressed }) => ({
          backgroundColor: colors.cardDark,
          borderRadius: 16,
          marginHorizontal: 20,
          marginVertical: 8,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.borderDark,
          opacity: pressed ? 0.88 : 1,
        })}
      >
        {/* Cover */}
        <View style={{ height: 110, backgroundColor: colors.midnight }}>
          {coverSource ? (
            <Image
              source={coverSource}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              accessibilityLabel={item.name}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="store" size={40} color={colors.borderDark} />
            </View>
          )}
          {/* Status badge */}
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: statusFilter === 'approved' ? colors.success : statusFilter === 'declined' ? '#EF4444' : statusFilter === 'suspended' ? '#F97316' : '#F59E0B',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <MaterialCommunityIcons
              name={statusFilter === 'approved' ? 'check-circle-outline' : statusFilter === 'declined' ? 'close-circle-outline' : statusFilter === 'suspended' ? 'pause-circle-outline' : 'clock-outline'}
              size={12}
              color="#1C1917"
            />
            <AppText style={{ fontSize: 10, fontWeight: '700', color: '#1C1917' }}>
              {statusFilter === 'approved' ? 'Approved' : statusFilter === 'declined' ? 'Declined' : statusFilter === 'suspended' ? 'Suspended' : t('businessOwner.pendingBadge.buttonLabel')}
            </AppText>
          </View>
          {/* Logo */}
          {isValidUrl(item.logoUrl) && (
            <Image
              source={{ uri: item.logoUrl! }}
              style={{
                position: 'absolute',
                bottom: -18,
                left: 16,
                width: 36,
                height: 36,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: colors.cardDark,
              }}
              resizeMode="cover"
              accessibilityLabel={`${item.name} logo`}
            />
          )}
        </View>

        {/* Info row */}
        <View style={{ paddingHorizontal: 16, paddingTop: isValidUrl(item.logoUrl) ? 24 : 12, paddingBottom: 12, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white, flex: 1 }} numberOfLines={1}>{item.name}</AppText>
            {statusFilter === 'approved' && (item.suspensionCount ?? 0) > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                {(item.suspensionCount ?? 0) > 1 && (
                  <AppText style={{ fontSize: 11, fontWeight: '700', color: '#EF4444' }}>{item.suspensionCount}</AppText>
                )}
                <MaterialCommunityIcons name="flag" size={14} color="#EF4444" />
              </View>
            )}
          </View>
          <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>{item.categoryName}</AppText>
          {!!item.contact?.phone && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <MaterialCommunityIcons
                name={item.contact.phoneVerified ? 'phone-check' : 'phone-outline'}
                size={12}
                color={item.contact.phoneVerified ? colors.success : colors.textSlate500}
              />
              <AppText
                style={{ fontSize: 11, color: item.contact.phoneVerified ? colors.success : colors.textSlate500 }}
                numberOfLines={1}
              >
                {item.contact.phone}
              </AppText>
              {item.contact.phoneVerified && (
                <MaterialCommunityIcons name="check-circle" size={11} color={colors.success} />
              )}
            </View>
          )}
          {!!item.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <MaterialCommunityIcons name="map-marker-outline" size={12} color={colors.textSlate500} />
              <AppText style={{ fontSize: 11, color: colors.textSlate500 }} numberOfLines={1}>{item.location}</AppText>
            </View>
          )}
        </View>

        {/* Action buttons */}
        {statusFilter === 'pending' && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 14, flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={(e) => { e.stopPropagation(); handleReject(item); }}
              accessibilityLabel={t('admin.pendingBusinesses.reject')}
              accessibilityRole="button"
              disabled={rejectingId === item.id || acceptingId === item.id}
              style={({ pressed }) => ({
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 6, backgroundColor: colors.cardDark, borderWidth: 1, borderColor: '#EF4444',
                paddingVertical: 11, borderRadius: 12,
                opacity: pressed || rejectingId === item.id ? 0.7 : 1,
              })}
            >
              {rejectingId === item.id ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <MaterialCommunityIcons name="close-circle-outline" size={17} color="#EF4444" />
                  <AppText style={{ fontSize: 13, fontWeight: '700', color: '#EF4444' }}>{t('admin.pendingBusinesses.reject')}</AppText>
                </>
              )}
            </Pressable>
            <Pressable
              onPress={(e) => { e.stopPropagation(); handleAccept(item); }}
              accessibilityLabel={t('admin.pendingBusinesses.accept')}
              accessibilityRole="button"
              disabled={acceptingId === item.id || rejectingId === item.id}
              style={({ pressed }) => ({
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 8, backgroundColor: colors.success, paddingVertical: 11, borderRadius: 12,
                opacity: pressed || acceptingId === item.id ? 0.7 : 1,
              })}
            >
              {acceptingId === item.id ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle-outline" size={17} color={colors.white} />
                  <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.white }}>{t('admin.pendingBusinesses.accept')}</AppText>
                </>
              )}
            </Pressable>
          </View>
        )}
        {statusFilter === 'approved' && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="check-circle-outline" size={14} color={colors.success} />
            <AppText style={{ fontSize: 12, color: colors.success, fontWeight: '600', flex: 1 }}>Approved</AppText>
            <Pressable
              onPress={(e) => { e.stopPropagation(); handleSuspend(item); }}
              accessibilityRole="button"
              accessibilityLabel="Suspend business"
              disabled={suspendingId === item.id}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 5,
                backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1, borderColor: '#F97316',
                paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
                opacity: pressed || suspendingId === item.id ? 0.6 : 1,
              })}
            >
              {suspendingId === item.id ? (
                <ActivityIndicator size="small" color="#F97316" />
              ) : (
                <>
                  <MaterialCommunityIcons name="pause-circle-outline" size={15} color="#F97316" />
                  <AppText style={{ fontSize: 12, fontWeight: '700', color: '#F97316' }}>Suspend</AppText>
                </>
              )}
            </Pressable>
          </View>
        )}
        {(statusFilter === 'declined' || statusFilter === 'suspended') && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons
              name={statusFilter === 'declined' ? 'close-circle-outline' : 'pause-circle-outline'}
              size={14}
              color={statusFilter === 'declined' ? '#EF4444' : '#F97316'}
            />
            <AppText style={{ fontSize: 12, color: statusFilter === 'declined' ? '#EF4444' : '#F97316', fontWeight: '600', flex: 1 }}>
              {statusFilter === 'declined' ? 'Declined' : 'Suspended'}
            </AppText>
            <Pressable
              onPress={(e) => { e.stopPropagation(); handleReApprove(item); }}
              accessibilityRole="button"
              accessibilityLabel="Re-approve business"
              disabled={reApprovingId === item.id}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 5,
                backgroundColor: 'rgba(34,197,94,0.12)', borderWidth: 1, borderColor: colors.success,
                paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
                opacity: pressed || reApprovingId === item.id ? 0.6 : 1,
              })}
            >
              {reApprovingId === item.id ? (
                <ActivityIndicator size="small" color={colors.success} />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle-outline" size={15} color={colors.success} />
                  <AppText style={{ fontSize: 12, fontWeight: '700', color: colors.success }}>Re-approve</AppText>
                </>
              )}
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  }, [handleAccept, handleReject, handleSuspend, handleReApprove, acceptingId, rejectingId, suspendingId, reApprovingId, statusFilter, t, categoryDefaults]);

  const renderContent = () => {
    if (activeTab === 'company') {
      const retryFn = statusFilter === 'pending' ? loadPending : statusFilter === 'approved' ? loadApproved : statusFilter === 'declined' ? loadRejected : loadSuspended;
      const data = filteredAndSortedData;
      const baseEmptyLabel = statusFilter === 'pending'
        ? t('admin.pendingBusinesses.empty')
        : statusFilter === 'approved' ? 'No approved companies' : statusFilter === 'declined' ? 'No declined companies' : 'No suspended companies';
      const emptyLabel = categoryFilter.length > 0 ? 'No companies match these categories' : baseEmptyLabel;

      if (isLoading) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.neonPurple} />
          </View>
        );
      }
      if (businessError) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
            <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center' }}>
              {businessError}
            </AppText>
            <Pressable
              onPress={retryFn}
              accessibilityRole="button"
              accessibilityLabel="Retry"
              style={({ pressed }) => ({
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: colors.neonPurple,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.white }}>Retry</AppText>
            </Pressable>
          </View>
        );
      }
      if (data.length === 0) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <MaterialCommunityIcons name="check-all" size={48} color={colors.textSlate500} />
            <AppText style={{ fontSize: 16, color: colors.textSlate400, textAlign: 'center' }}>
              {emptyLabel}
            </AppText>
          </View>
        );
      }
      return (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    if (activeTab === 'reviews') {
      const retryFn = statusFilter === 'pending' ? loadPendingReviews : statusFilter === 'approved' ? loadApprovedReviews : loadRejectedReviews;
      const data = statusFilter === 'pending' ? pendingReviews : statusFilter === 'approved' ? approvedReviews : rejectedReviews;
      const emptyLabel = statusFilter === 'pending' ? 'No pending reviews'
        : statusFilter === 'approved' ? 'No approved reviews' : 'No declined reviews';

      if (reviewsLoading) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.neonPurple} />
          </View>
        );
      }
      if (reviewsError) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
            <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center' }}>
              {reviewsError}
            </AppText>
            <Pressable
              onPress={retryFn}
              accessibilityRole="button"
              accessibilityLabel="Retry"
              style={({ pressed }) => ({
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: colors.neonPurple,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.white }}>Retry</AppText>
            </Pressable>
          </View>
        );
      }
      if (data.length === 0) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <MaterialCommunityIcons name="star-check-outline" size={48} color={colors.textSlate500} />
            <AppText style={{ fontSize: 16, color: colors.textSlate400, textAlign: 'center' }}>
              {emptyLabel}
            </AppText>
          </View>
        );
      }
      return (
        <FlatList
          data={data}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    if (activeTab === 'user') {
      if (statusFilter === 'suspended') {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <MaterialCommunityIcons name="shield-check" size={48} color={colors.textSlate500} />
            <AppText style={{ fontSize: 16, color: colors.textSlate400, textAlign: 'center' }}>
              N/A for user verifications
            </AppText>
          </View>
        );
      }
      if (userVerificationsLoading) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.neonPurple} />
          </View>
        );
      }
      if (userVerificationsError) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
            <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center' }}>{userVerificationsError}</AppText>
            <Pressable
              onPress={() => loadUserVerifications(statusFilter)}
              accessibilityRole="button"
              accessibilityLabel="Retry"
              style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.neonPurple, opacity: pressed ? 0.7 : 1 })}
            >
              <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.white }}>Retry</AppText>
            </Pressable>
          </View>
        );
      }
      if (userVerifications.length === 0) {
        const emptyLabel = statusFilter === 'pending' ? 'No pending verification requests'
          : statusFilter === 'approved' ? 'No approved verifications' : 'No rejected verifications';
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <MaterialCommunityIcons name="shield-check" size={48} color={colors.textSlate500} />
            <AppText style={{ fontSize: 16, color: colors.textSlate400, textAlign: 'center' }}>{emptyLabel}</AppText>
          </View>
        );
      }
      return (
        <FlatList
          data={userVerifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: colors.cardDark, borderRadius: 14, borderWidth: 1, borderColor: colors.borderDark, overflow: 'hidden' }}>
              {/* User row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, paddingBottom: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(168,85,247,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name="account" size={20} color={colors.neonPurple} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>{item.fullName}</AppText>
                  <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>{item.userEmail}</AppText>
                </View>
                <View style={{
                  paddingHorizontal: 9, paddingVertical: 3, borderRadius: 9999,
                  backgroundColor: item.status === 'pending' ? 'rgba(251,191,36,0.15)' : item.status === 'approved' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)',
                  borderWidth: 1,
                  borderColor: item.status === 'pending' ? 'rgba(251,191,36,0.3)' : item.status === 'approved' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
                }}>
                  <AppText style={{ fontSize: 11, fontWeight: '600', color: item.status === 'pending' ? '#FBB024' : item.status === 'approved' ? colors.success : '#EF4444' }}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </AppText>
                </View>
              </View>
              {/* Details */}
              <View style={{ paddingHorizontal: 14, gap: 4, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="phone" size={13} color={colors.textSlate500} />
                  <AppText style={{ fontSize: 13, color: colors.textSlate300 }}>{item.phoneNumber}</AppText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="calendar" size={13} color={colors.textSlate500} />
                  <AppText style={{ fontSize: 13, color: colors.textSlate300 }}>
                    {item.submittedAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </AppText>
                </View>
                {item.reviewedAt ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialCommunityIcons name="check-circle-outline" size={13} color={colors.textSlate500} />
                    <AppText style={{ fontSize: 13, color: colors.textSlate300 }}>
                      Reviewed: {item.reviewedAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </AppText>
                  </View>
                ) : null}
                {item.rejectionReason ? (
                  <View style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 8, padding: 9, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', marginTop: 4 }}>
                    <AppText style={{ fontSize: 11, color: '#EF4444', fontWeight: '600', marginBottom: 2 }}>Rejection reason</AppText>
                    <AppText style={{ fontSize: 12, color: colors.textSlate300 }}>{item.rejectionReason}</AppText>
                  </View>
                ) : null}
              </View>
              {/* ID card preview */}
              <Pressable
                onPress={() => setUserIdCardVisible(item.id)}
                accessibilityRole="button"
                accessibilityLabel="View ID card"
                style={{ marginHorizontal: 14, marginBottom: item.status === 'pending' ? 10 : 14, borderRadius: 10, overflow: 'hidden', height: 110, borderWidth: 1, borderColor: colors.borderDark }}
              >
                <Image source={{ uri: item.idCardUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" accessibilityLabel="ID card" />
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <MaterialCommunityIcons name="eye" size={13} color={colors.white} />
                  <AppText style={{ fontSize: 12, color: colors.white }}>View ID Card</AppText>
                </View>
              </Pressable>
              {/* Actions — pending only */}
              {item.status === 'pending' ? (
                <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingBottom: 14 }}>
                  <Pressable
                    onPress={() => setUserRejectTarget(item.id)}
                    disabled={userActionId === item.id}
                    accessibilityRole="button"
                    accessibilityLabel="Reject"
                    style={{ flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)', alignItems: 'center' }}
                  >
                    <AppText style={{ fontSize: 13, fontWeight: '600', color: '#EF4444' }}>Reject</AppText>
                  </Pressable>
                  <Pressable
                    onPress={() => handleApproveUser(item.id)}
                    disabled={userActionId === item.id}
                    accessibilityRole="button"
                    accessibilityLabel="Approve"
                    style={{ flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {userActionId === item.id
                      ? <ActivityIndicator size="small" color={colors.success} />
                      : <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.success }}>Approve</AppText>}
                  </Pressable>
                </View>
              ) : null}
            </View>
          )}
        />
      );
    }

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <MaterialCommunityIcons name="tools" size={48} color={colors.textSlate600} />
        <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.textSlate400 }}>
          {TABS.find((tab) => tab.key === activeTab)?.label} Verification
        </AppText>
        <AppText style={{ fontSize: 13, color: colors.textSlate600 }}>Coming soon</AppText>
      </View>
    );
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
          gap: 12,
        }}
      >
        <AdminMenuButton />
        <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.white, flex: 1 }}>
          Verification
        </AppText>
        {activeTab === 'company' && (() => {
          const count = statusFilter === 'pending' ? businesses.length : statusFilter === 'approved' ? approvedBusinesses.length : statusFilter === 'declined' ? rejectedBusinesses.length : suspendedBusinesses.length;
          const bg = statusFilter === 'pending' ? '#F59E0B' : statusFilter === 'approved' ? colors.success : statusFilter === 'suspended' ? '#F97316' : '#EF4444';
          if (count === 0) return null;
          return (
            <View style={{ minWidth: 24, height: 24, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
              <AppText style={{ fontSize: 12, fontWeight: '700', color: '#1C1917' }}>{count}</AppText>
            </View>
          );
        })()}
        {activeTab === 'reviews' && (() => {
          const count = statusFilter === 'pending' ? pendingReviews.length : statusFilter === 'approved' ? approvedReviews.length : rejectedReviews.length;
          const bg = statusFilter === 'pending' ? '#F59E0B' : statusFilter === 'approved' ? colors.success : '#EF4444';
          if (count === 0) return null;
          return (
            <View style={{ minWidth: 24, height: 24, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
              <AppText style={{ fontSize: 12, fontWeight: '700', color: colors.white }}>{count}</AppText>
            </View>
          );
        })()}
      </View>

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        style={{ flexGrow: 0, marginBottom: 12 }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          const count = tabBadges[tab.key];
          return (
            <Pressable
              key={tab.key}
              onPress={() => { setActiveTab(tab.key); setStatusFilter('pending'); }}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: active }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 22,
                borderWidth: 1,
                backgroundColor: active ? colors.neonPurple : colors.cardDark,
                borderColor: active ? colors.neonPurple : colors.borderDark,
              }}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={15}
                color={active ? colors.white : colors.textSlate400}
              />
              <AppText style={{
                fontSize: 13,
                fontWeight: active ? '700' : '500',
                color: active ? colors.white : colors.textSlate400,
              }}>
                {tab.label}
              </AppText>
              {count > 0 && (
                <View
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: active ? '#FFFFFF' : '#EF4444',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <AppText style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: active ? '#EF4444' : '#FFFFFF',
                    lineHeight: 13,
                  }}>
                    {count > 99 ? '99+' : String(count)}
                  </AppText>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Status Filter Buttons */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8 }}>
        {([
          { key: 'pending' as StatusFilter, label: 'Pending', icon: 'clock-outline' as const, color: '#F59E0B' },
          { key: 'approved' as StatusFilter, label: 'Approved', icon: 'check-circle-outline' as const, color: colors.success },
          { key: 'declined' as StatusFilter, label: 'Declined', icon: 'close-circle-outline' as const, color: '#EF4444' },
          { key: 'suspended' as StatusFilter, label: 'Suspended', icon: 'pause-circle-outline' as const, color: '#F97316' },
        ]).map((btn) => {
          const active = statusFilter === btn.key;
          return (
            <Pressable
              key={btn.key}
              onPress={() => setStatusFilter(btn.key)}
              accessibilityRole="button"
              accessibilityLabel={btn.label}
              accessibilityState={{ selected: active }}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                paddingVertical: 9,
                borderRadius: 12,
                borderWidth: 1,
                backgroundColor: active ? `${btn.color}20` : colors.cardDark,
                borderColor: active ? btn.color : colors.borderDark,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <MaterialCommunityIcons name={btn.icon} size={14} color={active ? btn.color : colors.textSlate500} />
              <AppText style={{ fontSize: 12, fontWeight: active ? '700' : '500', color: active ? btn.color : colors.textSlate500 }}>
                {btn.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {/* Sort & Category Filter Toolbar (company tab only) */}
      {activeTab === 'company' && (
        <View style={{ paddingHorizontal: 20, marginBottom: 4 }}>
          {/* Sort button + active category chip row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              onPress={() => setShowSortMenu(true)}
              accessibilityRole="button"
              accessibilityLabel="Sort options"
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: colors.cardDark,
                borderWidth: 1,
                borderColor: sortBy !== 'newest' ? colors.neonPurple : colors.borderDark,
                paddingHorizontal: 11,
                paddingVertical: 7,
                borderRadius: 10,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <MaterialCommunityIcons
                name={sortBy === 'flagged' ? 'flag' : sortBy === 'oldest' ? 'sort-calendar-ascending' : 'sort-calendar-descending'}
                size={13}
                color={sortBy !== 'newest' ? colors.neonPurple : colors.textSlate400}
              />
              <AppText style={{ fontSize: 12, color: sortBy !== 'newest' ? colors.neonPurple : colors.textSlate400, fontWeight: sortBy !== 'newest' ? '700' : '500' }}>
                {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Flagged'}
              </AppText>
              <MaterialCommunityIcons name="chevron-down" size={13} color={sortBy !== 'newest' ? colors.neonPurple : colors.textSlate500} />
            </Pressable>

            {/* Category filter button */}
            <Pressable
              onPress={() => setShowCategoryMenu(true)}
              accessibilityRole="button"
              accessibilityLabel="Filter by category"
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: categoryFilter.length > 0 ? 'rgba(139,92,246,0.15)' : colors.cardDark,
                borderWidth: 1,
                borderColor: categoryFilter.length > 0 ? colors.neonPurple : colors.borderDark,
                paddingHorizontal: 11,
                paddingVertical: 7,
                borderRadius: 10,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <MaterialCommunityIcons
                name="tag-outline"
                size={13}
                color={categoryFilter.length > 0 ? colors.neonPurple : colors.textSlate400}
              />
              <AppText
                style={{ fontSize: 12, color: categoryFilter.length > 0 ? colors.neonPurple : colors.textSlate400, fontWeight: categoryFilter.length > 0 ? '700' : '500' }}
                numberOfLines={1}
              >
                {categoryFilter.length === 0
                  ? 'Category'
                  : categoryFilter.length === 1
                    ? (availableCategories.find((c) => c.id === categoryFilter[0])?.name ?? 'Category')
                    : `${categoryFilter.length} Categories`}
              </AppText>
              <MaterialCommunityIcons name="chevron-down" size={13} color={categoryFilter.length > 0 ? colors.neonPurple : colors.textSlate500} />
            </Pressable>

            {/* Clear category filter */}
            {categoryFilter.length > 0 && (
              <Pressable
                onPress={() => setCategoryFilter([])}
                accessibilityRole="button"
                accessibilityLabel="Clear category filter"
                style={({ pressed }) => ({
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: 'rgba(239,68,68,0.12)',
                  borderWidth: 1,
                  borderColor: '#EF4444',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <MaterialCommunityIcons name="close" size={14} color="#EF4444" />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Content */}
      {renderContent()}

      {/* Business Detail Modal */}
      <Modal
        visible={!!selectedBusiness}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBusiness(null)}
      >
        {selectedBusiness && (() => {
          const biz = selectedBusiness;
          const isValidUrl = (url: string | null | undefined) =>
            !!url && (url.startsWith('http://') || url.startsWith('https://'));
          const days: Array<{ key: string; label: string }> = [
            { key: 'monday', label: 'Mon' }, { key: 'tuesday', label: 'Tue' },
            { key: 'wednesday', label: 'Wed' }, { key: 'thursday', label: 'Thu' },
            { key: 'friday', label: 'Fri' }, { key: 'saturday', label: 'Sat' },
            { key: 'sunday', label: 'Sun' },
          ];

          return (
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
              <View
                style={{
                  backgroundColor: colors.cardDark,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  maxHeight: '94%',
                  borderTopWidth: 1,
                  borderColor: colors.borderDark,
                }}
              >
                {/* Handle */}
                <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                  <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.textSlate600 }} />
                </View>

                {/* Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderDark,
                    gap: 10,
                  }}
                >
                  <Pressable
                    onPress={() => setSelectedBusiness(null)}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    style={({ pressed }) => ({
                      width: 34, height: 34, borderRadius: 17,
                      backgroundColor: colors.midnight,
                      alignItems: 'center', justifyContent: 'center',
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <MaterialCommunityIcons name="close" size={18} color={colors.textSlate400} />
                  </Pressable>
                  <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, flex: 1 }}>
                    Company Details
                  </AppText>
                  <View
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 4,
                      backgroundColor: statusFilter === 'approved' ? 'rgba(34,197,94,0.15)' : statusFilter === 'declined' ? 'rgba(239,68,68,0.15)' : statusFilter === 'suspended' ? 'rgba(249,115,22,0.15)' : 'rgba(245,158,11,0.15)',
                      borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
                      borderWidth: 1,
                      borderColor: statusFilter === 'approved' ? colors.success : statusFilter === 'declined' ? '#EF4444' : statusFilter === 'suspended' ? '#F97316' : '#F59E0B',
                    }}
                  >
                    <MaterialCommunityIcons
                      name={statusFilter === 'approved' ? 'check-circle-outline' : statusFilter === 'declined' ? 'close-circle-outline' : statusFilter === 'suspended' ? 'pause-circle-outline' : 'clock-outline'}
                      size={11}
                      color={statusFilter === 'approved' ? colors.success : statusFilter === 'declined' ? '#EF4444' : statusFilter === 'suspended' ? '#F97316' : '#F59E0B'}
                    />
                    <AppText style={{ fontSize: 11, fontWeight: '700', color: statusFilter === 'approved' ? colors.success : statusFilter === 'declined' ? '#EF4444' : statusFilter === 'suspended' ? '#F97316' : '#F59E0B' }}>
                      {statusFilter === 'approved' ? 'Approved' : statusFilter === 'declined' ? 'Declined' : statusFilter === 'suspended' ? 'Suspended' : 'Pending'}
                    </AppText>
                  </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, padding: 20 }}>

                  {/* Cover Image */}
                  <View>
                    <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, letterSpacing: 0.8, marginBottom: 8 }}>
                      COVER PHOTO
                    </AppText>
                    <View style={{ borderRadius: 14, overflow: 'hidden', height: 170, backgroundColor: colors.midnight }}>
                      {isValidUrl(biz.coverImageUrl) ? (
                        <Image
                          source={{ uri: biz.coverImageUrl! }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                          accessibilityLabel={`${biz.name} cover`}
                        />
                      ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <MaterialCommunityIcons name="image-off-outline" size={36} color={colors.textSlate600} />
                          <AppText style={{ fontSize: 12, color: colors.textSlate600 }}>No cover photo</AppText>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Logo / Profile Picture */}
                  <View>
                    <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, letterSpacing: 0.8, marginBottom: 8 }}>
                      PROFILE PICTURE
                    </AppText>
                    <View
                      style={{
                        backgroundColor: colors.midnight, borderRadius: 14,
                        padding: 16, borderWidth: 1, borderColor: colors.borderDark,
                        flexDirection: 'row', alignItems: 'center', gap: 14,
                      }}
                    >
                      {isValidUrl(biz.logoUrl) ? (
                        <Image
                          source={{ uri: biz.logoUrl! }}
                          style={{ width: 72, height: 72, borderRadius: 16, borderWidth: 2, borderColor: colors.borderDark }}
                          resizeMode="cover"
                          accessibilityLabel={`${biz.name} logo`}
                        />
                      ) : (
                        <View
                          style={{
                            width: 72, height: 72, borderRadius: 16,
                            backgroundColor: colors.cardDark,
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: 1, borderColor: colors.borderDark,
                          }}
                        >
                          <MaterialCommunityIcons name="store-outline" size={32} color={colors.textSlate600} />
                        </View>
                      )}
                      <View style={{ flex: 1, gap: 3 }}>
                        <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }}>{biz.name}</AppText>
                        <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>
                          {isValidUrl(biz.logoUrl) ? 'Logo uploaded' : 'No logo uploaded'}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* Name + Category + Location */}
                  <View
                    style={{
                      backgroundColor: colors.midnight, borderRadius: 14,
                      padding: 14, gap: 8, borderWidth: 1, borderColor: colors.borderDark,
                    }}
                  >
                    <AppText style={{ fontSize: 18, fontWeight: '800', color: colors.white }}>{biz.name}</AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <View
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 4,
                          backgroundColor: colors.cardDark, borderRadius: 8,
                          paddingHorizontal: 8, paddingVertical: 4,
                        }}
                      >
                        <MaterialCommunityIcons name="tag-outline" size={12} color={colors.neonPurple} />
                        <AppText style={{ fontSize: 12, color: colors.neonPurple, fontWeight: '600' }}>{biz.categoryName}</AppText>
                      </View>
                      {biz.subCategories?.map((sub) => (
                        <View
                          key={sub}
                          style={{
                            backgroundColor: colors.cardDark, borderRadius: 8,
                            paddingHorizontal: 8, paddingVertical: 4,
                          }}
                        >
                          <AppText style={{ fontSize: 11, color: colors.textSlate400 }}>{sub}</AppText>
                        </View>
                      ))}
                    </View>
                    {!!biz.location && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.textSlate400} />
                        <AppText style={{ fontSize: 13, color: colors.textSlate400 }}>{biz.location}</AppText>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name="calendar-outline" size={12} color={colors.textSlate600} />
                        <AppText style={{ fontSize: 11, color: colors.textSlate600 }}>
                          {biz.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* Description */}
                  {!!biz.description && (
                    <View
                      style={{
                        backgroundColor: colors.midnight, borderRadius: 14,
                        padding: 14, gap: 6, borderWidth: 1, borderColor: colors.borderDark,
                      }}
                    >
                      <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, letterSpacing: 0.8 }}>
                        DESCRIPTION
                      </AppText>
                      <AppText style={{ fontSize: 13, color: colors.white, lineHeight: 21 }}>{biz.description}</AppText>
                    </View>
                  )}

                  {/* Owner */}
                  <View
                    style={{
                      backgroundColor: colors.midnight, borderRadius: 14,
                      padding: 14, gap: 8, borderWidth: 1, borderColor: colors.borderDark,
                    }}
                  >
                    <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, letterSpacing: 0.8 }}>
                      OWNER
                    </AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      {ownerLoading ? (
                        <View
                          style={{
                            width: 44, height: 44, borderRadius: 22,
                            backgroundColor: colors.cardDark,
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <ActivityIndicator size="small" color={colors.neonPurple} />
                        </View>
                      ) : businessOwner?.avatarUrl ? (
                        <Image
                          source={{ uri: businessOwner.avatarUrl }}
                          style={{ width: 44, height: 44, borderRadius: 22 }}
                          resizeMode="cover"
                          accessibilityLabel={businessOwner.displayName}
                        />
                      ) : (
                        <View
                          style={{
                            width: 44, height: 44, borderRadius: 22,
                            backgroundColor: colors.neonPurple + '25',
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: 1, borderColor: colors.neonPurple + '50',
                          }}
                        >
                          <MaterialCommunityIcons name="account" size={22} color={colors.neonPurple} />
                        </View>
                      )}
                      <View style={{ flex: 1, gap: 3 }}>
                        <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }} numberOfLines={1}>
                          {businessOwner?.displayName ?? (ownerLoading ? '...' : 'Unknown User')}
                        </AppText>
                        <AppText style={{ fontSize: 11, color: colors.textSlate600 }} numberOfLines={1}>
                          UID: {biz.ownerId}
                        </AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <MaterialCommunityIcons
                            name={biz.isOwnerVerified ? 'check-circle' : 'alert-circle-outline'}
                            size={13}
                            color={biz.isOwnerVerified ? colors.success : '#F59E0B'}
                          />
                          <AppText style={{ fontSize: 12, color: biz.isOwnerVerified ? colors.success : '#F59E0B' }}>
                            {biz.isOwnerVerified ? 'Verified Owner' : 'Unverified Owner'}
                          </AppText>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Contact */}
                  {(biz.contact.phone || biz.contact.email || biz.contact.website ||
                    biz.contact.instagramHandle || biz.contact.facebookName || biz.contact.tiktokHandle) && (
                    <View
                      style={{
                        backgroundColor: colors.midnight, borderRadius: 14,
                        padding: 14, gap: 10, borderWidth: 1, borderColor: colors.borderDark,
                      }}
                    >
                      <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, letterSpacing: 0.8 }}>
                        CONTACT
                      </AppText>
                      {[
                        { icon: 'phone-outline' as const, value: biz.contact.phone },
                        { icon: 'email-outline' as const, value: biz.contact.email },
                        { icon: 'web' as const, value: biz.contact.website },
                        { icon: 'instagram' as const, value: biz.contact.instagramHandle ? `@${biz.contact.instagramHandle}` : null },
                        { icon: 'facebook' as const, value: biz.contact.facebookName },
                        { icon: 'music-note' as const, value: biz.contact.tiktokHandle ? `@${biz.contact.tiktokHandle}` : null },
                      ].filter((row) => !!row.value).map((row) => (
                        <View key={row.icon} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <MaterialCommunityIcons name={row.icon} size={16} color={colors.textSlate400} />
                          <AppText style={{ fontSize: 13, color: colors.white, flex: 1 }} numberOfLines={1}>
                            {row.value}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Opening Hours */}
                  {biz.openingHoursVisible && biz.openingHours && (
                    <View
                      style={{
                        backgroundColor: colors.midnight, borderRadius: 14,
                        padding: 14, gap: 10, borderWidth: 1, borderColor: colors.borderDark,
                      }}
                    >
                      <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, letterSpacing: 0.8 }}>
                        OPENING HOURS
                      </AppText>
                      {days.map(({ key, label }) => {
                        const day = biz.openingHours![key as keyof typeof biz.openingHours];
                        if (!day) return null;
                        return (
                          <View key={key} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <AppText style={{ fontSize: 12, color: colors.textSlate500, width: 36 }}>{label}</AppText>
                            {day.isOpen ? (
                              <AppText style={{ fontSize: 12, color: colors.white }}>
                                {day.openTime} – {day.closeTime}
                              </AppText>
                            ) : (
                              <AppText style={{ fontSize: 12, color: colors.textSlate600 }}>Closed</AppText>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Delivery */}
                  {biz.deliveryServices.filter((d) => d.isActive).length > 0 && (
                    <View
                      style={{
                        backgroundColor: colors.midnight, borderRadius: 14,
                        padding: 14, gap: 10, borderWidth: 1, borderColor: colors.borderDark,
                      }}
                    >
                      <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, letterSpacing: 0.8 }}>
                        DELIVERY SERVICES
                      </AppText>
                      {biz.deliveryServices.filter((d) => d.isActive).map((d) => (
                        <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <MaterialCommunityIcons name="moped-outline" size={16} color={colors.textSlate400} />
                          <AppText style={{ fontSize: 13, color: colors.white }}>{d.name}</AppText>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Context-aware action button */}
                  {statusFilter === 'pending' && (
                    <Pressable
                      onPress={() => { setSelectedBusiness(null); handleAccept(biz); }}
                      accessibilityLabel={t('admin.pendingBusinesses.accept')}
                      accessibilityRole="button"
                      disabled={acceptingId === biz.id}
                      style={({ pressed }) => ({
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                        gap: 8, backgroundColor: colors.success,
                        paddingVertical: 15, borderRadius: 14,
                        opacity: pressed || acceptingId === biz.id ? 0.7 : 1,
                        marginBottom: 8,
                      })}
                    >
                      {acceptingId === biz.id ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="check-circle-outline" size={20} color={colors.white} />
                          <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }}>{t('admin.pendingBusinesses.accept')}</AppText>
                        </>
                      )}
                    </Pressable>
                  )}
                  {statusFilter === 'approved' && (
                    <Pressable
                      onPress={() => { setSelectedBusiness(null); handleSuspend(biz); }}
                      accessibilityLabel="Suspend business"
                      accessibilityRole="button"
                      disabled={suspendingId === biz.id}
                      style={({ pressed }) => ({
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                        gap: 8, backgroundColor: 'rgba(249,115,22,0.12)',
                        borderWidth: 1.5, borderColor: '#F97316',
                        paddingVertical: 15, borderRadius: 14,
                        opacity: pressed || suspendingId === biz.id ? 0.7 : 1,
                        marginBottom: 8,
                      })}
                    >
                      {suspendingId === biz.id ? (
                        <ActivityIndicator size="small" color="#F97316" />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="pause-circle-outline" size={20} color="#F97316" />
                          <AppText style={{ fontSize: 15, fontWeight: '700', color: '#F97316' }}>Suspend Business</AppText>
                        </>
                      )}
                    </Pressable>
                  )}
                  {(statusFilter === 'declined' || statusFilter === 'suspended') && (
                    <Pressable
                      onPress={() => { setSelectedBusiness(null); handleReApprove(biz); }}
                      accessibilityLabel="Re-approve business"
                      accessibilityRole="button"
                      disabled={reApprovingId === biz.id}
                      style={({ pressed }) => ({
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                        gap: 8, backgroundColor: colors.success,
                        paddingVertical: 15, borderRadius: 14,
                        opacity: pressed || reApprovingId === biz.id ? 0.7 : 1,
                        marginBottom: 8,
                      })}
                    >
                      {reApprovingId === biz.id ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="check-circle-outline" size={20} color={colors.white} />
                          <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }}>Re-approve Business</AppText>
                        </>
                      )}
                    </Pressable>
                  )}

                </ScrollView>
              </View>
            </View>
          );
        })()}
      </Modal>

      {/* Review Detail Modal */}
      <Modal
        visible={!!selectedReview}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReview(null)}
      >
        {selectedReview && (() => {
          const review = selectedReview;
          const isActing = actionReviewId === review.id;
          const stars = Math.round(review.overallRating);
          const formattedDate = review.createdAt.toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
          });

          return (
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
              <View
                style={{
                  backgroundColor: colors.cardDark,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  maxHeight: '92%',
                  borderTopWidth: 1,
                  borderColor: colors.borderDark,
                }}
              >
                {/* Handle bar */}
                <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                  <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.textSlate600 }} />
                </View>

                {/* Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderDark,
                    gap: 10,
                  }}
                >
                  <Pressable
                    onPress={() => setSelectedReview(null)}
                    accessibilityRole="button"
                    accessibilityLabel="Close review detail"
                    style={({ pressed }) => ({
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: colors.midnight,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <MaterialCommunityIcons name="close" size={18} color={colors.textSlate400} />
                  </Pressable>
                  <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, flex: 1 }}>
                    Review Details
                  </AppText>
                  {/* Pending badge */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: 'rgba(245,158,11,0.15)',
                      borderRadius: 10,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderWidth: 1,
                      borderColor: '#F59E0B',
                    }}
                  >
                    <MaterialCommunityIcons name="clock-outline" size={11} color="#F59E0B" />
                    <AppText style={{ fontSize: 11, fontWeight: '700', color: '#F59E0B' }}>Pending</AppText>
                  </View>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ padding: 20, gap: 20 }}
                >
                  {/* Business Info */}
                  <View
                    style={{
                      backgroundColor: colors.midnight,
                      borderRadius: 14,
                      padding: 14,
                      gap: 8,
                      borderWidth: 1,
                      borderColor: colors.borderDark,
                    }}
                  >
                    <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, letterSpacing: 0.8 }}>
                      BUSINESS
                    </AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          backgroundColor: colors.cardDark,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MaterialCommunityIcons name="office-building-outline" size={20} color={colors.textSlate400} />
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }}>
                          {review.businessName}
                        </AppText>
                        <AppText style={{ fontSize: 11, color: colors.textSlate600 }} numberOfLines={1}>
                          ID: {review.businessId}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* Author Info */}
                  <View
                    style={{
                      backgroundColor: colors.midnight,
                      borderRadius: 14,
                      padding: 14,
                      gap: 8,
                      borderWidth: 1,
                      borderColor: colors.borderDark,
                    }}
                  >
                    <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, letterSpacing: 0.8 }}>
                      WRITTEN BY
                    </AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      {/* Avatar */}
                      {authorLoading ? (
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: colors.cardDark,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ActivityIndicator size="small" color={colors.neonPurple} />
                        </View>
                      ) : reviewAuthor?.avatarUrl ? (
                        <Image
                          source={{ uri: reviewAuthor.avatarUrl }}
                          style={{ width: 44, height: 44, borderRadius: 22 }}
                          resizeMode="cover"
                          accessibilityLabel={reviewAuthor.displayName}
                        />
                      ) : (
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: colors.neonPurple + '25',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: colors.neonPurple + '50',
                          }}
                        >
                          <MaterialCommunityIcons name="account" size={22} color={colors.neonPurple} />
                        </View>
                      )}
                      {/* Name + UID */}
                      <View style={{ flex: 1, gap: 2 }}>
                        <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }} numberOfLines={1}>
                          {reviewAuthor?.displayName ?? (authorLoading ? '...' : 'Unknown User')}
                        </AppText>
                        <AppText style={{ fontSize: 11, color: colors.textSlate600 }} numberOfLines={1}>
                          UID: {review.userId}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* Rating + Date */}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: colors.midnight,
                        borderRadius: 14,
                        padding: 14,
                        gap: 6,
                        borderWidth: 1,
                        borderColor: colors.borderDark,
                        alignItems: 'center',
                      }}
                    >
                      <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, letterSpacing: 0.8 }}>
                        RATING
                      </AppText>
                      <AppText style={{ fontSize: 28, fontWeight: '800', color: '#F59E0B' }}>
                        {review.overallRating.toFixed(1)}
                      </AppText>
                      <View style={{ flexDirection: 'row', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <MaterialCommunityIcons
                            key={s}
                            name={s <= stars ? 'star' : 'star-outline'}
                            size={14}
                            color={s <= stars ? '#F59E0B' : colors.textSlate600}
                          />
                        ))}
                      </View>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: colors.midnight,
                        borderRadius: 14,
                        padding: 14,
                        gap: 6,
                        borderWidth: 1,
                        borderColor: colors.borderDark,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MaterialCommunityIcons name="calendar-outline" size={22} color={colors.textSlate400} />
                      <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, letterSpacing: 0.8 }}>
                        DATE
                      </AppText>
                      <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.white, textAlign: 'center' }}>
                        {formattedDate}
                      </AppText>
                    </View>
                  </View>

                  {/* Review Text */}
                  {!!review.reviewText && (
                    <View
                      style={{
                        backgroundColor: colors.midnight,
                        borderRadius: 14,
                        padding: 14,
                        gap: 8,
                        borderWidth: 1,
                        borderColor: colors.borderDark,
                      }}
                    >
                      <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, letterSpacing: 0.8 }}>
                        REVIEW TEXT
                      </AppText>
                      <AppText style={{ fontSize: 14, color: colors.white, lineHeight: 22 }}>
                        {review.reviewText}
                      </AppText>
                    </View>
                  )}

                  {/* Photos */}
                  {review.photoUrls.length > 0 && (
                    <View style={{ gap: 10 }}>
                      <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, letterSpacing: 0.8 }}>
                        PHOTOS ({review.photoUrls.length})
                      </AppText>
                      {/* Main preview */}
                      <Image
                        source={{ uri: review.photoUrls[previewPhotoIndex] }}
                        style={{ width: '100%', height: 220, borderRadius: 14 }}
                        resizeMode="cover"
                        accessibilityLabel={`Review photo ${previewPhotoIndex + 1}`}
                      />
                      {/* Thumbnail strip */}
                      {review.photoUrls.length > 1 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                          {review.photoUrls.map((url, idx) => (
                            <Pressable
                              key={idx}
                              onPress={() => setPreviewPhotoIndex(idx)}
                              accessibilityRole="button"
                              accessibilityLabel={`View photo ${idx + 1}`}
                              style={({ pressed }) => ({
                                marginRight: 8,
                                opacity: pressed ? 0.7 : 1,
                              })}
                            >
                              <Image
                                source={{ uri: url }}
                                style={{
                                  width: 64,
                                  height: 64,
                                  borderRadius: 10,
                                  borderWidth: 2,
                                  borderColor: idx === previewPhotoIndex ? colors.neonPurple : 'transparent',
                                }}
                                resizeMode="cover"
                                accessibilityLabel={`Thumbnail ${idx + 1}`}
                              />
                            </Pressable>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 8 }}>
                    <Pressable
                      onPress={() => handleRejectReview(review)}
                      disabled={isActing}
                      accessibilityRole="button"
                      accessibilityLabel="Reject review"
                      style={({ pressed }) => ({
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        paddingVertical: 14,
                        borderRadius: 14,
                        borderWidth: 1.5,
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239,68,68,0.08)',
                        opacity: pressed || isActing ? 0.6 : 1,
                      })}
                    >
                      {isActing ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="close-circle-outline" size={18} color="#EF4444" />
                          <AppText style={{ fontSize: 14, fontWeight: '700', color: '#EF4444' }}>Decline</AppText>
                        </>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={() => handleApproveReview(review)}
                      disabled={isActing}
                      accessibilityRole="button"
                      accessibilityLabel="Approve review"
                      style={({ pressed }) => ({
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        paddingVertical: 14,
                        borderRadius: 14,
                        backgroundColor: colors.success,
                        opacity: pressed || isActing ? 0.6 : 1,
                      })}
                    >
                      {isActing ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.white} />
                          <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>Approve</AppText>
                        </>
                      )}
                    </Pressable>
                  </View>
                </ScrollView>
              </View>
            </View>
          );
        })()}
      </Modal>

      {/* Review Action Confirmation Modal */}
      <Modal
        visible={!!confirmReviewAction}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmReviewAction(null)}
      >
        {confirmReviewAction && (
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                backgroundColor: colors.cardDark,
                borderRadius: 20,
                width: '100%',
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colors.borderDark,
              }}
            >
              {/* Icon header */}
              <View
                style={{
                  alignItems: 'center',
                  paddingTop: 28,
                  paddingBottom: 16,
                  backgroundColor: confirmReviewAction.action === 'approve'
                    ? 'rgba(34,197,94,0.08)'
                    : 'rgba(239,68,68,0.08)',
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: confirmReviewAction.action === 'approve'
                      ? 'rgba(34,197,94,0.15)'
                      : 'rgba(239,68,68,0.12)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialCommunityIcons
                    name={confirmReviewAction.action === 'approve' ? 'check-circle' : 'close-circle'}
                    size={30}
                    color={confirmReviewAction.action === 'approve' ? colors.success : '#EF4444'}
                  />
                </View>
              </View>

              {/* Body */}
              <View style={{ paddingHorizontal: 24, paddingBottom: 8, paddingTop: 12, gap: 6 }}>
                <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.white, textAlign: 'center' }}>
                  {confirmReviewAction.action === 'approve' ? 'Approve Review?' : 'Decline Review?'}
                </AppText>
                <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center', lineHeight: 20 }}>
                  {confirmReviewAction.action === 'approve'
                    ? `This review will be published for "${confirmReviewAction.review.businessName}" and will affect its rating.`
                    : `This review will be declined and hidden from "${confirmReviewAction.review.businessName}".`}
                </AppText>
              </View>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: colors.borderDark, marginTop: 16 }} />

              {/* Buttons */}
              <View style={{ flexDirection: 'row' }}>
                <Pressable
                  onPress={() => setConfirmReviewAction(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                  style={({ pressed }) => ({
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 16,
                    opacity: pressed ? 0.6 : 1,
                    borderRightWidth: 1,
                    borderRightColor: colors.borderDark,
                  })}
                >
                  <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.textSlate400 }}>
                    Cancel
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={handleConfirmReviewAction}
                  accessibilityRole="button"
                  accessibilityLabel={confirmReviewAction.action === 'approve' ? 'Confirm approve' : 'Confirm decline'}
                  style={({ pressed }) => ({
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 16,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <AppText
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: confirmReviewAction.action === 'approve' ? colors.success : '#EF4444',
                    }}
                  >
                    {confirmReviewAction.action === 'approve' ? 'Approve' : 'Decline'}
                  </AppText>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* Accept Confirmation Modal */}
      <Modal
        visible={!!confirmBusiness}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmBusiness(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderRadius: 20,
              width: '100%',
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.borderDark,
            }}
          >
            {/* Modal icon header */}
            <View
              style={{
                alignItems: 'center',
                paddingTop: 28,
                paddingBottom: 16,
                backgroundColor: 'rgba(34,197,94,0.08)',
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: 'rgba(34,197,94,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="check-circle" size={30} color={colors.success} />
              </View>
            </View>

            {/* Modal body */}
            <View style={{ paddingHorizontal: 24, paddingBottom: 8, paddingTop: 4, gap: 6 }}>
              <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.white, textAlign: 'center' }}>
                {t('admin.pendingBusinesses.acceptTitle')}
              </AppText>
              <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center', lineHeight: 20 }}>
                {t('admin.pendingBusinesses.acceptConfirm', { name: confirmBusiness?.name ?? '' })}
              </AppText>
            </View>

            {/* Business name chip */}
            {!!confirmBusiness?.name && (
              <View style={{ alignItems: 'center', paddingBottom: 4 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: colors.midnight,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: colors.borderDark,
                  }}
                >
                  <MaterialCommunityIcons name="office-building-outline" size={14} color={colors.textSlate400} />
                  <AppText style={{ fontSize: 13, color: colors.white, fontWeight: '600' }}>
                    {confirmBusiness.name}
                  </AppText>
                </View>
              </View>
            )}

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: colors.borderDark, marginTop: 16 }} />

            {/* Action buttons */}
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                onPress={() => setConfirmBusiness(null)}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 16,
                  opacity: pressed ? 0.6 : 1,
                  borderRightWidth: 1,
                  borderRightColor: colors.borderDark,
                })}
              >
                <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.textSlate400 }}>
                  {t('common.cancel')}
                </AppText>
              </Pressable>
              <Pressable
                onPress={handleConfirmAccept}
                accessibilityRole="button"
                accessibilityLabel={t('admin.pendingBusinesses.accept')}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 16,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.success }}>
                  {t('admin.pendingBusinesses.accept')}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Suspend Business Confirmation Modal */}
      <Modal
        visible={!!confirmSuspendBusiness}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmSuspendBusiness(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 20, width: '100%', overflow: 'hidden', borderWidth: 1, borderColor: colors.borderDark }}>
            <View style={{ alignItems: 'center', paddingTop: 28, paddingBottom: 16, backgroundColor: 'rgba(249,115,22,0.08)' }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(249,115,22,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="pause-circle" size={30} color="#F97316" />
              </View>
            </View>
            <View style={{ paddingHorizontal: 24, paddingBottom: 8, paddingTop: 4, gap: 6 }}>
              <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.white, textAlign: 'center' }}>Suspend Business?</AppText>
              <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center', lineHeight: 20 }}>
                {`"${confirmSuspendBusiness?.name ?? ''}" will be suspended and hidden from the platform.`}
              </AppText>
            </View>
            {!!confirmSuspendBusiness?.name && (
              <View style={{ alignItems: 'center', paddingBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.midnight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.borderDark }}>
                  <MaterialCommunityIcons name="office-building-outline" size={14} color={colors.textSlate400} />
                  <AppText style={{ fontSize: 13, color: colors.white, fontWeight: '600' }}>{confirmSuspendBusiness.name}</AppText>
                </View>
              </View>
            )}
            <View style={{ height: 1, backgroundColor: colors.borderDark, marginTop: 16 }} />
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                onPress={() => setConfirmSuspendBusiness(null)}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                style={({ pressed }) => ({ flex: 1, alignItems: 'center', paddingVertical: 16, opacity: pressed ? 0.6 : 1, borderRightWidth: 1, borderRightColor: colors.borderDark })}
              >
                <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.textSlate400 }}>{t('common.cancel')}</AppText>
              </Pressable>
              <Pressable
                onPress={handleConfirmSuspend}
                accessibilityRole="button"
                accessibilityLabel="Confirm suspend"
                style={({ pressed }) => ({ flex: 1, alignItems: 'center', paddingVertical: 16, opacity: pressed ? 0.6 : 1 })}
              >
                <AppText style={{ fontSize: 15, fontWeight: '700', color: '#F97316' }}>Suspend</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Re-approve Business Confirmation Modal */}
      <Modal
        visible={!!confirmReApproveBusiness}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmReApproveBusiness(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 20, width: '100%', overflow: 'hidden', borderWidth: 1, borderColor: colors.borderDark }}>
            <View style={{ alignItems: 'center', paddingTop: 28, paddingBottom: 16, backgroundColor: 'rgba(34,197,94,0.08)' }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(34,197,94,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="check-circle" size={30} color={colors.success} />
              </View>
            </View>
            <View style={{ paddingHorizontal: 24, paddingBottom: 8, paddingTop: 4, gap: 6 }}>
              <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.white, textAlign: 'center' }}>Re-approve Business?</AppText>
              <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center', lineHeight: 20 }}>
                {`"${confirmReApproveBusiness?.name ?? ''}" will be approved and made live on the platform again.`}
              </AppText>
            </View>
            {!!confirmReApproveBusiness?.name && (
              <View style={{ alignItems: 'center', paddingBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.midnight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.borderDark }}>
                  <MaterialCommunityIcons name="office-building-outline" size={14} color={colors.textSlate400} />
                  <AppText style={{ fontSize: 13, color: colors.white, fontWeight: '600' }}>{confirmReApproveBusiness.name}</AppText>
                </View>
              </View>
            )}
            <View style={{ height: 1, backgroundColor: colors.borderDark, marginTop: 16 }} />
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                onPress={() => setConfirmReApproveBusiness(null)}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                style={({ pressed }) => ({ flex: 1, alignItems: 'center', paddingVertical: 16, opacity: pressed ? 0.6 : 1, borderRightWidth: 1, borderRightColor: colors.borderDark })}
              >
                <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.textSlate400 }}>{t('common.cancel')}</AppText>
              </Pressable>
              <Pressable
                onPress={handleConfirmReApprove}
                accessibilityRole="button"
                accessibilityLabel="Confirm re-approve"
                style={({ pressed }) => ({ flex: 1, alignItems: 'center', paddingVertical: 16, opacity: pressed ? 0.6 : 1 })}
              >
                <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.success }}>Re-approve</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Business Confirmation Modal */}
      <Modal
        visible={!!confirmRejectBusiness}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmRejectBusiness(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderRadius: 20,
              width: '100%',
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.borderDark,
            }}
          >
            {/* Modal icon header */}
            <View
              style={{
                alignItems: 'center',
                paddingTop: 28,
                paddingBottom: 16,
                backgroundColor: 'rgba(239,68,68,0.08)',
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: 'rgba(239,68,68,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="close-circle" size={30} color="#EF4444" />
              </View>
            </View>

            {/* Modal body */}
            <View style={{ paddingHorizontal: 24, paddingBottom: 8, paddingTop: 4, gap: 6 }}>
              <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.white, textAlign: 'center' }}>
                {t('admin.pendingBusinesses.rejectTitle')}
              </AppText>
              <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center', lineHeight: 20 }}>
                {t('admin.pendingBusinesses.rejectConfirm', { name: confirmRejectBusiness?.name ?? '' })}
              </AppText>
            </View>

            {/* Business name chip */}
            {!!confirmRejectBusiness?.name && (
              <View style={{ alignItems: 'center', paddingBottom: 4 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: colors.midnight,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: colors.borderDark,
                  }}
                >
                  <MaterialCommunityIcons name="office-building-outline" size={14} color={colors.textSlate400} />
                  <AppText style={{ fontSize: 13, color: colors.white, fontWeight: '600' }}>
                    {confirmRejectBusiness.name}
                  </AppText>
                </View>
              </View>
            )}

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: colors.borderDark, marginTop: 16 }} />

            {/* Action buttons */}
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                onPress={() => setConfirmRejectBusiness(null)}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 16,
                  opacity: pressed ? 0.6 : 1,
                  borderRightWidth: 1,
                  borderRightColor: colors.borderDark,
                })}
              >
                <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.textSlate400 }}>
                  {t('common.cancel')}
                </AppText>
              </Pressable>
              <Pressable
                onPress={handleConfirmReject}
                accessibilityRole="button"
                accessibilityLabel={t('admin.pendingBusinesses.reject')}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 16,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <AppText style={{ fontSize: 15, fontWeight: '700', color: '#EF4444' }}>
                  {t('admin.pendingBusinesses.reject')}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Filter Modal */}
      <Modal
        visible={showCategoryMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryMenu(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => setShowCategoryMenu(false)}
          accessibilityRole="none"
          accessibilityLabel="Close category filter"
        >
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: 32,
              borderTopWidth: 1,
              borderColor: colors.borderDark,
              maxHeight: '70%',
            }}
          >
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.textSlate600 }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
              <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, flex: 1 }}>
                Filter by Category
                {categoryFilter.length > 0 && (
                  <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.neonPurple }}>{`  (${categoryFilter.length})`}</AppText>
                )}
              </AppText>
              {categoryFilter.length > 0 && (
                <Pressable
                  onPress={() => setCategoryFilter([])}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all"
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginRight: 12 })}
                >
                  <AppText style={{ fontSize: 13, color: '#EF4444', fontWeight: '600' }}>Clear all</AppText>
                </Pressable>
              )}
              <Pressable
                onPress={() => setShowCategoryMenu(false)}
                accessibilityRole="button"
                accessibilityLabel="Done"
                style={({ pressed }) => ({
                  backgroundColor: colors.neonPurple,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 10,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.white }}>Done</AppText>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {availableCategories.map((cat) => {
                const active = categoryFilter.includes(cat.id);
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryFilter(
                      active
                        ? categoryFilter.filter((id) => id !== cat.id)
                        : [...categoryFilter, cat.id],
                    )}
                    accessibilityRole="checkbox"
                    accessibilityLabel={cat.name}
                    accessibilityState={{ checked: active }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      backgroundColor: active ? 'rgba(139,92,246,0.1)' : 'transparent',
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: active ? colors.neonPurple : colors.textSlate500,
                        backgroundColor: active ? colors.neonPurple : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {active && <MaterialCommunityIcons name="check" size={14} color={colors.white} />}
                    </View>
                    <MaterialCommunityIcons
                      name="tag-outline"
                      size={18}
                      color={active ? colors.neonPurple : colors.textSlate400}
                    />
                    <AppText style={{ fontSize: 15, color: active ? colors.neonPurple : colors.white, fontWeight: active ? '700' : '400', flex: 1 }}>
                      {cat.name}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Sort Menu Modal */}
      <Modal
        visible={showSortMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => setShowSortMenu(false)}
          accessibilityRole="none"
          accessibilityLabel="Close sort menu"
        >
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: 32,
              borderTopWidth: 1,
              borderColor: colors.borderDark,
            }}
          >
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.textSlate600 }} />
            </View>
            <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, paddingHorizontal: 20, paddingVertical: 12 }}>
              Sort By
            </AppText>
            {(
              [
                { key: 'newest' as SortBy, label: 'Newest First', icon: 'sort-calendar-descending' },
                { key: 'oldest' as SortBy, label: 'Oldest First', icon: 'sort-calendar-ascending' },
                { key: 'flagged' as SortBy, label: 'Most Flagged First', icon: 'flag' },
              ] as { key: SortBy; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[]
            ).map((opt) => {
              const active = sortBy === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => { setSortBy(opt.key); setShowSortMenu(false); }}
                  accessibilityRole="button"
                  accessibilityLabel={opt.label}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    backgroundColor: active ? 'rgba(139,92,246,0.1)' : 'transparent',
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <MaterialCommunityIcons
                    name={opt.icon}
                    size={20}
                    color={active ? colors.neonPurple : colors.textSlate400}
                  />
                  <AppText style={{ fontSize: 15, color: active ? colors.neonPurple : colors.white, fontWeight: active ? '700' : '400', flex: 1 }}>
                    {opt.label}
                  </AppText>
                  {active && <MaterialCommunityIcons name="check" size={18} color={colors.neonPurple} />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      {/* User verification — Reject Modal */}
      <Modal visible={userRejectTarget !== null} transparent animationType="fade" onRequestClose={() => { setUserRejectTarget(null); setUserRejectReason(''); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.borderDark }}>
            <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.white, marginBottom: 6 }}>Reject Verification</AppText>
            <AppText style={{ fontSize: 14, color: colors.textSlate400, marginBottom: 14 }}>
              Please provide a reason for rejecting this verification request.
            </AppText>
            <TextInput
              value={userRejectReason}
              onChangeText={setUserRejectReason}
              placeholder="Reason for rejection (optional)"
              placeholderTextColor={colors.textSlate500}
              multiline
              numberOfLines={3}
              accessibilityLabel="Rejection reason"
              style={{ backgroundColor: colors.midnight, borderWidth: 1, borderColor: colors.borderDark, borderRadius: 10, padding: 12, color: colors.white, fontSize: 14, marginBottom: 20, minHeight: 80, textAlignVertical: 'top' }}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => { setUserRejectTarget(null); setUserRejectReason(''); }}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.borderDark, alignItems: 'center' }}
              >
                <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.textSlate400 }}>Cancel</AppText>
              </Pressable>
              <Pressable
                onPress={handleRejectUser}
                disabled={userActionId === userRejectTarget}
                accessibilityRole="button"
                accessibilityLabel="Reject"
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' }}
              >
                {userActionId === userRejectTarget
                  ? <ActivityIndicator size="small" color={colors.white} />
                  : <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.white }}>Reject</AppText>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* User verification — Full-screen ID card viewer */}
      {userIdCardVisible !== null && (() => {
        const item = userVerifications.find((v) => v.id === userIdCardVisible);
        if (!item) return null;
        return (
          <Modal visible transparent animationType="fade" onRequestClose={() => setUserIdCardVisible(null)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' }}>
              <Pressable
                onPress={() => setUserIdCardVisible(null)}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 }}
              >
                <MaterialCommunityIcons name="close" size={28} color={colors.white} />
              </Pressable>
              <Image source={{ uri: item.idCardUrl }} style={{ width: '90%', height: '60%' }} resizeMode="contain" accessibilityLabel="ID card" />
            </View>
          </Modal>
        );
      })()}
    </ScreenLayout>
  );
}
