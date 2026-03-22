import { ProfileModel } from '../models/profileModel';
import { ProfileEntity, Gender } from '@/domain/profile/entities/profileEntity';
import { isValidRole, DEFAULT_ROLE } from '@/domain/profile/entities/userRole';
import { Timestamp } from 'firebase/firestore';

export class ProfileMapper {
  static toEntity(model: ProfileModel): ProfileEntity {
    return {
      id: model.id,
      userId: model.user_id,
      displayName: model.display_name,
      email: model.email,
      phoneNumber: model.phone_number,
      bio: model.bio,
      avatarUrl: model.avatar_url,
      followersCount: model.followers_count,
      followingCount: model.following_count,
      role: isValidRole(model.role) ? model.role : DEFAULT_ROLE,
      gender: (model.gender === 'male' || model.gender === 'female') ? model.gender as Gender : null,
      dateOfBirth: model.date_of_birth ? model.date_of_birth.toDate() : null,
      updatedAt: model.updated_at.toDate(),
      notificationsEnabled: model.notifications_enabled ?? true,
    };
  }

  static toModel(entity: ProfileEntity): Omit<ProfileModel, 'updated_at'> {
    return {
      id: entity.id,
      user_id: entity.userId,
      display_name: entity.displayName,
      email: entity.email,
      phone_number: entity.phoneNumber,
      bio: entity.bio,
      avatar_url: entity.avatarUrl,
      followers_count: entity.followersCount,
      following_count: entity.followingCount,
      role: entity.role,
      gender: entity.gender,
      date_of_birth: entity.dateOfBirth ? Timestamp.fromDate(entity.dateOfBirth) : null,
    };
  }

  static partialToModel(updates: Partial<ProfileEntity>): Partial<ProfileModel> {
    const model: Partial<ProfileModel> = {};

    if (updates.displayName !== undefined) model.display_name = updates.displayName;
    if (updates.email !== undefined) model.email = updates.email;
    if (updates.phoneNumber !== undefined) model.phone_number = updates.phoneNumber;
    if (updates.bio !== undefined) model.bio = updates.bio;
    if (updates.avatarUrl !== undefined) model.avatar_url = updates.avatarUrl;
    if (updates.followersCount !== undefined) model.followers_count = updates.followersCount;
    if (updates.followingCount !== undefined) model.following_count = updates.followingCount;
    if (updates.role !== undefined) model.role = updates.role;
    if (updates.gender !== undefined) model.gender = updates.gender;
    if (updates.dateOfBirth !== undefined) {
      model.date_of_birth = updates.dateOfBirth ? Timestamp.fromDate(updates.dateOfBirth) : null;
    }
    if (updates.notificationsEnabled !== undefined) model.notifications_enabled = updates.notificationsEnabled;

    return model;
  }
}
