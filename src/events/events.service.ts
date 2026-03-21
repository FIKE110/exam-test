import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import {
  CreateEventDto,
  UpdateEventDto,
  QueryEventDto,
  EventResponseDto,
  RegistrationResponseDto,
} from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private registrationRepository: Repository<EventRegistration>,
  ) {}

  async findAll(
    options: QueryEventDto,
    userId?: string,
  ): Promise<{
    data: EventResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    const { page = 1, limit = 20, eventType, search, upcomingOnly } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .where('event.is_active = :isActive', { isActive: true });

    if (eventType) {
      queryBuilder.andWhere('event.event_type = :eventType', { eventType });
    }

    if (search) {
      queryBuilder.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (upcomingOnly) {
      queryBuilder.andWhere('event.event_date > :now', { now: new Date() });
    }

    const [events, total] = await queryBuilder
      .orderBy('event.event_date', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    let userRegistrations: Set<string> = new Set();
    if (userId) {
      const registrations = await this.registrationRepository.find({
        where: { userId },
        select: ['eventId'],
      });
      userRegistrations = new Set(registrations.map((r) => r.eventId));
    }

    return {
      data: events.map((event) =>
        this.toResponseDto(event, userRegistrations.has(event.id)),
      ),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    let isRegistered = false;
    if (userId) {
      const registration = await this.registrationRepository.findOne({
        where: { eventId: id, userId },
      });
      isRegistered = !!registration;
    }

    return this.toResponseDto(event, isRegistered);
  }

  async create(createDto: CreateEventDto): Promise<EventResponseDto> {
    const event = this.eventRepository.create({
      ...createDto,
      eventDate: new Date(createDto.eventDate),
    });
    await this.eventRepository.save(event);

    return this.toResponseDto(event, false);
  }

  async update(
    id: string,
    updateDto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (updateDto.eventDate) {
      updateDto.eventDate = new Date(updateDto.eventDate) as any;
    }

    Object.assign(event, updateDto);
    await this.eventRepository.save(event);

    return this.toResponseDto(event, false);
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.isActive = false;
    await this.eventRepository.save(event);

    return { success: true };
  }

  async register(
    userId: string,
    eventId: string,
  ): Promise<RegistrationResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.isActive) {
      throw new BadRequestException('Event is no longer active');
    }

    if (event.eventDate < new Date()) {
      throw new BadRequestException('Event has already passed');
    }

    const existingRegistration = await this.registrationRepository.findOne({
      where: { eventId, userId },
    });

    if (existingRegistration) {
      throw new ConflictException('Already registered for this event');
    }

    if (event.maxAttendees > 0 && event.registeredCount >= event.maxAttendees) {
      throw new BadRequestException('Event is fully booked');
    }

    const registration = this.registrationRepository.create({
      eventId,
      userId,
      isConfirmed: true,
    });
    await this.registrationRepository.save(registration);

    event.registeredCount += 1;
    await this.eventRepository.save(event);

    return this.toRegistrationResponseDto(registration, event);
  }

  async unregister(
    userId: string,
    eventId: string,
  ): Promise<{ success: boolean }> {
    const registration = await this.registrationRepository.findOne({
      where: { eventId, userId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (event) {
      event.registeredCount = Math.max(0, event.registeredCount - 1);
      await this.eventRepository.save(event);
    }

    await this.registrationRepository.remove(registration);

    return { success: true };
  }

  async getMyRegistrations(userId: string): Promise<RegistrationResponseDto[]> {
    const registrations = await this.registrationRepository.find({
      where: { userId },
      relations: ['event'],
      order: { registeredAt: 'DESC' },
    });

    return registrations
      .filter((r) => r.event)
      .map((r) => this.toRegistrationResponseDto(r, r.event));
  }

  private toResponseDto(event: Event, isRegistered: boolean): EventResponseDto {
    const spotsRemaining =
      event.maxAttendees > 0
        ? Math.max(0, event.maxAttendees - event.registeredCount)
        : undefined;

    return {
      id: event.id,
      eventType: event.eventType,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      location: event.location,
      zoomLink: event.zoomLink,
      maxAttendees: event.maxAttendees,
      registeredCount: event.registeredCount,
      isActive: event.isActive,
      isRegistered,
      spotsRemaining,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  private toRegistrationResponseDto(
    registration: EventRegistration,
    event: Event,
  ): RegistrationResponseDto {
    return {
      id: registration.id,
      eventId: registration.eventId,
      eventTitle: event.title,
      eventType: event.eventType,
      eventDate: event.eventDate,
      zoomLink: event.zoomLink,
      location: event.location,
      isConfirmed: registration.isConfirmed,
      registeredAt: registration.registeredAt,
    };
  }
}
