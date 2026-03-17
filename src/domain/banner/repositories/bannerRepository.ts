import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { BannerEntity } from '../entities/bannerEntity';

export interface CreateBannerParams {
  title: string;
  description: string;
  content: string;
  imageUri: string;
  mimeType?: string;
  isActive: boolean;
  isClickable: boolean;
  sortOrder: number;
}

export interface UpdateBannerParams {
  title?: string;
  description?: string;
  content?: string;
  imageUri?: string;
  mimeType?: string;
  isActive?: boolean;
  isClickable?: boolean;
  sortOrder?: number;
}

export interface BannerRepository {
  getBanners(): Promise<Either<Failure, BannerEntity[]>>;
  getAllBanners(): Promise<Either<Failure, BannerEntity[]>>;
  createBanner(params: CreateBannerParams): Promise<Either<Failure, BannerEntity>>;
  updateBanner(id: string, params: UpdateBannerParams): Promise<Either<Failure, BannerEntity>>;
  deleteBanner(id: string): Promise<Either<Failure, void>>;
}
