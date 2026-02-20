import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserStreak } from './entities/user-streak.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserStreak])],
  controllers: [],
  providers: [],
  exports: [],
})
export class ProgressModule {}
