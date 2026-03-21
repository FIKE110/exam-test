import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationTag } from './entities/notification.entity';
import {
  CreateNotificationDto,
  CreateNotificationForUserDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createDto: CreateNotificationForUserDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: createDto.userId,
      title: createDto.title,
      message: createDto.message,
      tag: createDto.tag || NotificationTag.GENERAL,
      actionUrl: createDto.actionUrl || null,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  async createBulk(
    userIds: string[],
    createDto: CreateNotificationDto,
  ): Promise<Notification[]> {
    const notifications = userIds.map((userId) =>
      this.notificationRepository.create({
        userId,
        title: createDto.title,
        message: createDto.message,
        tag: createDto.tag || NotificationTag.GENERAL,
        actionUrl: createDto.actionUrl || null,
        isRead: false,
      }),
    );

    return this.notificationRepository.save(notifications);
  }

  async findAllForUser(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      this.notificationRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        select: [
          'id',
          'title',
          'message',
          'tag',
          'isRead',
          'actionUrl',
          'createdAt',
        ],
      }),
      this.notificationRepository.count({
        where: { userId, isRead: false },
      }),
    ]);

    const data = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      messagePreview: this.truncateMessage(n.message),
      tag: n.tag,
      isRead: n.isRead,
      actionUrl: n.actionUrl,
      createdAt: n.createdAt,
    }));

    return {
      status: true,
      data,
      meta: {
        unreadCount,
        total: notifications.length,
      },
    };
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return result.affected || 0;
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);
  }

  private truncateMessage(message: string): string {
    const firstLine = message.split('\n')[0];
    return firstLine.length > 100
      ? `${firstLine.substring(0, 100)}...`
      : firstLine;
  }
}
