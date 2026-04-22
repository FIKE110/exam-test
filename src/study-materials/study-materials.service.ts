import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyMaterial } from './entities/study-material.entity';
import {
  CreateStudyMaterialDto,
  UpdateStudyMaterialDto,
  QueryStudyMaterialDto,
  StudyMaterialResponseDto,
} from './dto/study-material.dto';
import { UploadService } from '../upload/services/upload.service';

@Injectable()
export class StudyMaterialsService {
  constructor(
    @InjectRepository(StudyMaterial)
    private studyMaterialRepository: Repository<StudyMaterial>,
    private uploadService: UploadService,
  ) {}

  async findAll(options: QueryStudyMaterialDto) {
    const { page = 1, limit = 20, courseId, search, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.studyMaterialRepository
      .createQueryBuilder('material')
      .leftJoinAndSelect('material.course', 'course');

    if (courseId) {
      queryBuilder.andWhere('material.course_id = :courseId', { courseId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(material.title ILIKE :search OR material.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const allowedSortFields = ['title', 'created_at', 'average_rating', 'thumbs_up_count'];
    const orderField = sortBy && allowedSortFields.includes(sortBy) ? `material.${sortBy}` : 'material.created_at';
    const orderDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const [materials, total] = await queryBuilder
      .orderBy(orderField, orderDirection)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: materials.map((material) => this.toResponseDto(material)),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<StudyMaterialResponseDto> {
    const material = await this.studyMaterialRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!material) {
      throw new NotFoundException('Study material not found');
    }

    return this.toResponseDto(material);
  }

  async create(
    createDto: CreateStudyMaterialDto,
  ): Promise<StudyMaterialResponseDto> {
    const material = this.studyMaterialRepository.create(createDto);
    await this.studyMaterialRepository.save(material);

    const saved = await this.studyMaterialRepository.findOne({
      where: { id: material.id },
      relations: ['course'],
    });

    return this.toResponseDto(saved!);
  }

  async update(
    id: string,
    updateDto: UpdateStudyMaterialDto,
  ): Promise<StudyMaterialResponseDto> {
    const material = await this.studyMaterialRepository.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Study material not found');
    }

    Object.assign(material, updateDto);
    await this.studyMaterialRepository.save(material);

    const updated = await this.studyMaterialRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    return this.toResponseDto(updated!);
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const material = await this.studyMaterialRepository.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Study material not found');
    }

    await this.studyMaterialRepository.remove(material);

    return { success: true };
  }

  async addReaction(id: string): Promise<StudyMaterialResponseDto> {
    const material = await this.studyMaterialRepository.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Study material not found');
    }

    material.thumbsUpCount += 1;
    await this.studyMaterialRepository.save(material);

    const updated = await this.studyMaterialRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    return this.toResponseDto(updated!);
  }

  async addRating(
    id: string,
    rating: number,
  ): Promise<StudyMaterialResponseDto> {
    const material = await this.studyMaterialRepository.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Study material not found');
    }

    const currentTotal = material.averageRating * material.ratingCount;
    material.ratingCount += 1;
    material.averageRating =
      Math.round(((currentTotal + rating) / material.ratingCount) * 100) / 100;

    await this.studyMaterialRepository.save(material);

    const updated = await this.studyMaterialRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    return this.toResponseDto(updated!);
  }

  private toResponseDto(material: StudyMaterial): StudyMaterialResponseDto {
    return {
      id: material.id,
      courseId: material.courseId,
      courseTitle: material.course?.title,
      title: material.title,
      description: material.description,
      content: material.content,
      link: material.link,
      coverImageUrl: material.coverImageUrl,
      thumbsUpCount: material.thumbsUpCount,
      averageRating: Number(material.averageRating),
      ratingCount: material.ratingCount,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    };
  }

  async updateCoverImage(
    id: string,
    coverImageUrl: string,
  ): Promise<StudyMaterialResponseDto> {
    const material = await this.studyMaterialRepository.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Study material not found');
    }

    material.coverImageUrl = coverImageUrl;
    await this.studyMaterialRepository.save(material);

    const updated = await this.studyMaterialRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    return this.toResponseDto(updated!);
  }
}
