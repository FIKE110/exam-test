import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainService } from './domain.service';
import { DomainController } from './domain.controller';
import { Profession } from './entities/profession.entity';
import { Sector } from './entities/sector.entity';
import { ExamType } from './entities/exam-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profession, Sector, ExamType])],
  controllers: [DomainController],
  providers: [DomainService],
  exports: [DomainService],
})
export class DomainModule {}
