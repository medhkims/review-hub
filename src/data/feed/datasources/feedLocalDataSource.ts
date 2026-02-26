export interface FeedLocalDataSource {
  // Future: local caching for posts
  clearCache(): Promise<void>;
}

export class FeedLocalDataSourceImpl implements FeedLocalDataSource {
  async clearCache(): Promise<void> {
    // Stub for future caching implementation
  }
}
