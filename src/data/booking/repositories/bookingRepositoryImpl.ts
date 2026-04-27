import { BookingRepository, CreateBookingParams } from '@/domain/booking/repositories/bookingRepository';
import { BookingConfigEntity } from '@/domain/booking/entities/bookingConfigEntity';
import { BookingRequestEntity, BookingStatus } from '@/domain/booking/entities/bookingRequestEntity';
import { BookingRemoteDataSource } from '../datasources/bookingRemoteDataSource';
import { BookingConfigMapper } from '../mappers/bookingConfigMapper';
import { BookingRequestMapper } from '../mappers/bookingRequestMapper';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';

export class BookingRepositoryImpl implements BookingRepository {
  constructor(private readonly remote: BookingRemoteDataSource) {}

  async getBookingConfig(businessId: string): Promise<Either<Failure, BookingConfigEntity | null>> {
    try {
      const model = await this.remote.getBookingConfig(businessId);
      return right(model ? BookingConfigMapper.toEntity(model) : null);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch booking config'));
    }
  }

  async updateBookingConfig(businessId: string, config: BookingConfigEntity): Promise<Either<Failure, void>> {
    try {
      await this.remote.updateBookingConfig(businessId, BookingConfigMapper.toModel(config));
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to update booking config'));
    }
  }

  async createBookingRequest(params: CreateBookingParams): Promise<Either<Failure, BookingRequestEntity>> {
    try {
      const model = await this.remote.createBookingRequest({
        business_id: params.businessId,
        business_name: params.businessName,
        user_id: params.userId,
        user_name: params.userName,
        date: params.date,
        time_slot: params.timeSlot,
        status: 'pending',
        note: params.note,
      });
      return right(BookingRequestMapper.toEntity(model));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to create booking'));
    }
  }

  async getBookingRequestsForBusiness(businessId: string): Promise<Either<Failure, BookingRequestEntity[]>> {
    try {
      const models = await this.remote.getBookingRequestsForBusiness(businessId);
      return right(models.map(BookingRequestMapper.toEntity));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch booking requests'));
    }
  }

  async getBookingRequestsForUser(userId: string): Promise<Either<Failure, BookingRequestEntity[]>> {
    try {
      const models = await this.remote.getBookingRequestsForUser(userId);
      return right(models.map(BookingRequestMapper.toEntity));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch user bookings'));
    }
  }

  async updateBookingRequestStatus(requestId: string, status: BookingStatus): Promise<Either<Failure, void>> {
    try {
      await this.remote.updateBookingRequestStatus(requestId, status);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to update booking status'));
    }
  }
}
