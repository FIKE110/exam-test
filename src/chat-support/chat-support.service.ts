import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket, TicketStatus } from './entities/support-ticket.entity';
import { SupportMessage } from './entities/support-ticket.entity';
import {
  CreateTicketDto,
  SendMessageDto,
  TicketResponseDto,
  MessageResponseDto,
  ConversationDto,
} from './dto/support.dto';

@Injectable()
export class ChatSupportService {
  private readonly supportResponses = [
    "Thank you for reaching out! I'm looking into your issue now. Could you please provide more details about the problem you're experiencing?",
    'I understand your concern. Let me check our system to find a solution for you. This might take a few moments.',
    "Thank you for your patience! I've reviewed your case. Here's what we can do to help resolve this issue...",
    "Great question! Here's how you can resolve this: First, try refreshing the page. If that doesn't work, clear your browser cache and try again.",
    "I see what's happening. This is a common issue that's usually resolved by updating your browser to the latest version.",
    'Thanks for reporting this! Our technical team has been notified and is working on a fix. You should see improvements shortly.',
    "That's a great point! Let me connect you with our study resources that might help. Have you tried our AI Study Assistant for this topic?",
    'I appreciate your detailed explanation. Based on your description, here are the steps to resolve this: 1) Go to settings, 2) Clear cache, 3) Restart the application.',
    "Welcome! I'm here to help. Let me quickly address your concern and provide you with the best solution possible.",
    "Excellent! You've found something important. Let me escalate this to our team to ensure we improve this for all users.",
  ];

  constructor(
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
    @InjectRepository(SupportMessage)
    private messageRepository: Repository<SupportMessage>,
  ) {}

  async createTicket(
    userId: string,
    dto: CreateTicketDto,
  ): Promise<TicketResponseDto> {
    const ticket = this.ticketRepository.create({
      userId,
      subject: dto.subject,
    });
    await this.ticketRepository.save(ticket);

    const initialMessage = this.messageRepository.create({
      ticketId: ticket.id,
      senderId: userId,
      message: dto.subject,
      isFromSupport: false,
    });
    await this.messageRepository.save(initialMessage);

    const autoReply = this.messageRepository.create({
      ticketId: ticket.id,
      senderId: 'system',
      message:
        'Thank you for contacting support! An agent will be with you shortly. In the meantime, our AI assistant can help answer common questions about the platform.',
      isFromSupport: true,
    });
    await this.messageRepository.save(autoReply);

    return this.toTicketResponse(ticket);
  }

  async sendMessage(
    userId: string,
    ticketId: string,
    dto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const message = this.messageRepository.create({
      ticketId,
      senderId: userId,
      message: dto.message,
      isFromSupport: false,
    });
    await this.messageRepository.save(message);

    ticket.updatedAt = new Date();
    await this.ticketRepository.save(ticket);

    const reply = this.messageRepository.create({
      ticketId,
      senderId: 'support',
      message: this.getRandomResponse(),
      isFromSupport: true,
    });
    await this.messageRepository.save(reply);

    return this.toMessageResponse(reply);
  }

  async getUserTickets(userId: string): Promise<TicketResponseDto[]> {
    const tickets = await this.ticketRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return tickets.map((t) => this.toTicketResponse(t));
  }

  async getConversation(
    userId: string,
    ticketId: string,
  ): Promise<ConversationDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, userId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const messages = await this.messageRepository.find({
      where: { ticketId },
      order: { sentAt: 'ASC' },
    });

    return {
      ticket: this.toTicketResponse(ticket),
      messages: messages.map((m) => this.toMessageResponse(m)),
    };
  }

  async closeTicket(
    userId: string,
    ticketId: string,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, userId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    ticket.status = TicketStatus.CLOSED;
    ticket.isResolved = true;
    ticket.resolvedAt = new Date();
    await this.ticketRepository.save(ticket);

    const closingMessage = this.messageRepository.create({
      ticketId,
      senderId: 'system',
      message:
        'This ticket has been closed. If you need further assistance, please create a new ticket. Thank you for using our support!',
      isFromSupport: true,
    });
    await this.messageRepository.save(closingMessage);

    return this.toTicketResponse(ticket);
  }

  private toTicketResponse(ticket: SupportTicket): TicketResponseDto {
    return {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      isResolved: ticket.isResolved,
      createdAt: ticket.createdAt,
      resolvedAt: ticket.resolvedAt || undefined,
    };
  }

  private toMessageResponse(message: SupportMessage): MessageResponseDto {
    return {
      id: message.id,
      ticketId: message.ticketId,
      senderId: message.senderId,
      message: message.message,
      isFromSupport: message.isFromSupport,
      sentAt: message.sentAt,
    };
  }

  private getRandomResponse(): string {
    return this.supportResponses[
      Math.floor(Math.random() * this.supportResponses.length)
    ];
  }
}
