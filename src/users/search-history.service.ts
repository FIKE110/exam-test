import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSearchHistory } from './entities/user-search-history.entity';

@Injectable()
export class SearchHistoryService {
  constructor(
    @InjectRepository(UserSearchHistory)
    private searchHistoryRepository: Repository<UserSearchHistory>,
  ) {}

  async addSearch(
    userId: string,
    query: string,
    type = 'course',
  ): Promise<void> {
    const existing = await this.searchHistoryRepository.findOne({
      where: { userId, query, type },
    });

    if (existing) {
      existing.createdAt = new Date();
      await this.searchHistoryRepository.save(existing);
    } else {
      const search = this.searchHistoryRepository.create({
        userId,
        query,
        type,
      });
      await this.searchHistoryRepository.save(search);
    }

    await this.cleanupOldSearches(userId);
  }

  async getRecentSearches(userId: string, limit = 10): Promise<string[]> {
    const searches = await this.searchHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['query'],
    });

    return searches.map((s) => s.query);
  }

  async clearSearchHistory(userId: string): Promise<void> {
    await this.searchHistoryRepository.delete({ userId });
  }

  async deleteSearch(userId: string, query: string): Promise<void> {
    await this.searchHistoryRepository.delete({ userId, query });
  }

  private async cleanupOldSearches(userId: string): Promise<void> {
    const searches = await this.searchHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (searches.length > 50) {
      const toDelete = searches.slice(50);
      await this.searchHistoryRepository.remove(toDelete);
    }
  }
}
