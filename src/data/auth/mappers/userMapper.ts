import { UserModel } from '../models/userModel';
import { UserEntity } from '@/domain/auth/entities/userEntity';
import { Timestamp } from 'firebase/firestore';

export class UserMapper {
  static toEntity(model: UserModel): UserEntity {
    return {
      id: model.uid,
      email: model.email,
      displayName: model.display_name,
      avatarUrl: model.avatar_url,
      createdAt: model.created_at.toDate(),
    };
  }

  static toModel(entity: UserEntity): UserModel {
    return {
      uid: entity.id,
      email: entity.email,
      display_name: entity.displayName,
      avatar_url: entity.avatarUrl,
      created_at: Timestamp.fromDate(entity.createdAt),
    };
  }

  static fromFirebaseUser(firebaseUser: any): UserModel {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      display_name: firebaseUser.displayName || '',
      avatar_url: firebaseUser.photoURL || null,
      created_at: firebaseUser.metadata?.creationTime
        ? Timestamp.fromDate(new Date(firebaseUser.metadata.creationTime))
        : Timestamp.now(),
    };
  }
}
