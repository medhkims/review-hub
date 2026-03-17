import { User as FirebaseUser } from 'firebase/auth';
import { UserModel } from '../models/userModel';
import { UserEntity } from '@/domain/auth/entities/userEntity';
import { Timestamp } from 'firebase/firestore';

function mapProvider(providerId: string | undefined): UserEntity['provider'] {
  switch (providerId) {
    case 'google.com': return 'google';
    case 'facebook.com': return 'facebook';
    case 'apple.com': return 'apple';
    default: return 'email';
  }
}

export class UserMapper {
  static toEntity(model: UserModel): UserEntity {
    return {
      id: model.uid,
      email: model.email,
      displayName: model.display_name,
      avatarUrl: model.avatar_url,
      createdAt: model.created_at.toDate(),
      provider: mapProvider(model.provider),
    };
  }

  static toModel(entity: UserEntity): UserModel {
    return {
      uid: entity.id,
      email: entity.email,
      display_name: entity.displayName,
      avatar_url: entity.avatarUrl,
      created_at: Timestamp.fromDate(entity.createdAt),
      provider: entity.provider,
    };
  }

  static fromFirebaseUser(firebaseUser: FirebaseUser): UserModel {
    const providerId = firebaseUser.providerData?.[0]?.providerId;
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      display_name: firebaseUser.displayName || '',
      avatar_url: firebaseUser.photoURL || null,
      created_at: firebaseUser.metadata?.creationTime
        ? Timestamp.fromDate(new Date(firebaseUser.metadata.creationTime))
        : Timestamp.now(),
      provider: providerId,
    };
  }
}
