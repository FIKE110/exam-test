import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Profession } from './entities/profession.entity';
import { Sector } from './entities/sector.entity';
import { ExamType } from './entities/exam-type.entity';

@Injectable()
export class DomainService {
  constructor(
    @InjectRepository(Profession)
    private professionRepository: Repository<Profession>,
    @InjectRepository(Sector)
    private sectorRepository: Repository<Sector>,
    @InjectRepository(ExamType)
    private examTypeRepository: Repository<ExamType>,
  ) {}

  async getAllProfessions(): Promise<Profession[]> {
    return this.professionRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async getProfessionById(id: string): Promise<Profession> {
    const profession = await this.professionRepository.findOne({
      where: { id, isActive: true },
    });
    if (!profession) {
      throw new NotFoundException('Profession not found');
    }
    return profession;
  }

  async getAllSectors(): Promise<Sector[]> {
    return this.sectorRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async getSectorById(id: string): Promise<Sector> {
    const sector = await this.sectorRepository.findOne({
      where: { id, isActive: true },
    });
    if (!sector) {
      throw new NotFoundException('Sector not found');
    }
    return sector;
  }

  async getAllExamTypes(): Promise<ExamType[]> {
    return this.examTypeRepository.find({
      where: { isActive: true },
      relations: ['sector'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async getExamTypesBySector(sectorId: string): Promise<ExamType[]> {
    return this.examTypeRepository.find({
      where: { sectorId, isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async getExamTypesByIds(ids: string[]): Promise<ExamType[]> {
    return this.examTypeRepository.find({
      where: { id: In(ids), isActive: true },
    });
  }

  async getExamTypeById(id: string): Promise<ExamType> {
    const examType = await this.examTypeRepository.findOne({
      where: { id, isActive: true },
      relations: ['sector'],
    });
    if (!examType) {
      throw new NotFoundException('Exam type not found');
    }
    return examType;
  }

  async validateExamTypesBelongToSector(
    examTypeIds: string[],
    sectorId: string,
  ): Promise<boolean> {
    const examTypes = await this.examTypeRepository.find({
      where: { id: In(examTypeIds), isActive: true },
    });

    if (examTypes.length !== examTypeIds.length) {
      return false;
    }

    return examTypes.every((et) => et.sectorId === sectorId);
  }
}
