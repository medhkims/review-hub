import { ChatRepository } from '@/domain/chat/repositories/chatRepository';
import { ConversationEntity } from '@/domain/chat/entities/conversationEntity';
import { MessageEntity } from '@/domain/chat/entities/messageEntity';
import { ChatRemoteDataSource } from '../datasources/chatRemoteDataSource';
import { ChatLocalDataSource } from '../datasources/chatLocalDataSource';
import { ConversationMapper } from '../mappers/conversationMapper';
import { MessageMapper } from '../mappers/messageMapper';
import { NetworkInfo } from '@/core/network/networkInfo';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure, NetworkFailure } from '@/core/error/failures';
import { ServerException, NetworkException } from '@/core/error/exceptions';
import { auth } from '@/core/firebase/firebaseConfig';

export class ChatRepositoryImpl implements ChatRepository {
  constructor(
    private readonly remote: ChatRemoteDataSource,
    private readonly local: ChatLocalDataSource,
    private readonly network: NetworkInfo,
  ) {}

  async getConversations(): Promise<Either<Failure, ConversationEntity[]>> {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      return left(new ServerFailure('User not authenticated'));
    }

    try {
      const models = await this.remote.getConversations(userId);
      const entities = models.map(ConversationMapper.toEntity);

      await this.local.cacheConversations(models).catch(() => {
        // Ignore cache errors — do not fail the operation
      });

      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }

  async getMessages(conversationId: string): Promise<Either<Failure, MessageEntity[]>> {
    try {
      const models = await this.remote.getMessages(conversationId);
      const entities = models.map(MessageMapper.toEntity);

      await this.local.cacheMessages(conversationId, models).catch(() => {
        // Ignore cache errors — do not fail the operation
      });

      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }

  async sendMessage(
    conversationId: string,
    text: string,
  ): Promise<Either<Failure, MessageEntity>> {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      return left(new ServerFailure('User not authenticated'));
    }

    const isOnline = await this.network.isConnected();

    if (!isOnline) {
      return left(new NetworkFailure('Cannot send message while offline'));
    }

    try {
      const model = await this.remote.sendMessage(conversationId, userId, text);
      const entity = MessageMapper.toEntity(model);
      return right(entity);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }
}
