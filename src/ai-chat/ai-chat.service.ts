import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIChatSession } from './entities/ai-chat-session.entity';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIResponse {
  reply: string;
  sessionId: string;
  messageCount: number;
}

@Injectable()
export class AiChatService {
  private readonly academicResponses = [
    "That's an excellent question! Let me explain this concept in detail. Understanding this topic is crucial for your exam preparation. The key points to remember are the fundamental principles that form the foundation of this subject area.",
    "Great question! In academic terms, this relates to the core concepts you need to master. Here's how I would approach this: First, identify the main principles involved. Second, understand how they interconnect. Third, practice applying them to different scenarios.",
    "I see you're working hard on your studies! Let me break this down for you. This topic builds on several important concepts that you should review: the foundational principles, their practical applications, and how they appear in exam questions.",
    "That's a common point of confusion, but don't worry! The key is to understand the underlying mechanism. Think of it this way: just like solving a puzzle, each piece connects to the next. Once you see how they fit together, it becomes much clearer.",
    "Excellent thinking! You're asking the right questions for exam success. Here's my academic perspective: This concept is often tested because it demonstrates understanding of the fundamental principles. Make sure you can explain it in your own words.",
    "I'm glad you asked this! This is a topic that many students find challenging. Let me provide a structured approach: Start with the basics, then gradually move to more complex applications. Remember, exams often test your understanding, not just memorization.",
    "That's a thoughtful question! In preparation for professional exams, this area is particularly important. The best way to master it is through practice questions and understanding the 'why' behind each concept, not just the 'what'.",
    'Perfect question for exam preparation! Let me clarify: this concept operates on several key principles. I recommend creating a summary sheet with the main points, then testing yourself regularly. Consistent practice is the key to success!',
    "Excellent inquiry! This topic is fundamental to your field. Here's what you need to know: the core principles, how they apply in practice, and common exam variations. Don't forget to review related topics as well for a complete understanding.",
    "I'm here to help you succeed! This question shows you're thinking critically. My advice: break down the problem, identify what's being asked, and then apply the relevant principles. With practice, this approach will become second nature.",
    "That's exactly the kind of analytical thinking needed for exam success! Let me provide some academic context: this concept is typically covered in major exam syllabi. Understanding both theory and application will give you an edge.",
    "Great observation! This is a topic that rewards deep understanding. Here's my recommendation: create visual aids like diagrams or charts, practice with past questions, and explain concepts to others. Teaching is one of the best ways to learn!",
    'Wonderful question! In academic study, this area requires careful attention. My approach would be: 1) Review the theory thoroughly, 2) Look at practical examples, 3) Practice application questions, 4) Review any mistakes. Repetition builds mastery!',
    "That's a smart question to ask! For exam preparation, I suggest a multi-faceted approach: read the material, take notes in your own words, create flashcards for key terms, and test yourself regularly. Consistency is key!",
    "Excellent! You're building a strong foundation for your exams. Here's my academic insight: this topic connects to several other areas, so understanding these relationships will help you see the bigger picture. Questions often test these connections.",
  ];

  private readonly greetings = [
    "Hello! I'm your AI study assistant. I can help explain concepts, clarify doubts, and guide your exam preparation. What would you like to learn about today?",
    "Hi there! Ready to help you with your studies. Whether you need explanations, examples, or practice tips, I'm here to support your learning journey. What's on your mind?",
    "Welcome! I'm your academic companion for exam preparation. I can help break down complex topics, provide examples, and test your understanding. What would you like to explore?",
  ];

  constructor(
    @InjectRepository(AIChatSession)
    private chatSessionRepository: Repository<AIChatSession>,
  ) {}

  async chat(userId: string, prompt: string): Promise<AIResponse> {
    const normalizedPrompt = prompt.toLowerCase().trim();

    let session: AIChatSession | null = null;

    const recentSessions = await this.chatSessionRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      take: 1,
    });

    if (recentSessions.length > 0) {
      session = recentSessions[0];
    } else {
      session = this.chatSessionRepository.create({
        userId,
        title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
        messages: [],
      });
      await this.chatSessionRepository.save(session);
    }

    const isGreeting = this.isGreeting(normalizedPrompt);
    const reply = isGreeting
      ? this.getRandomItem(this.greetings)
      : this.getRandomItem(this.academicResponses);

    session.messages.push(
      { role: 'user', content: prompt, timestamp: new Date().toISOString() },
      {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      },
    );
    session.updatedAt = new Date();
    await this.chatSessionRepository.save(session);

    return {
      reply,
      sessionId: session.id,
      messageCount: session.messages.length,
    };
  }

  async getSessionHistory(
    userId: string,
    sessionId: string,
  ): Promise<AIChatSession> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    return session;
  }

  async getUserSessions(userId: string): Promise<AIChatSession[]> {
    return this.chatSessionRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  private isGreeting(text: string): boolean {
    const greetingPatterns = [
      'hello',
      'hi',
      'hey',
      'good morning',
      'good afternoon',
      'good evening',
      'howdy',
      'greetings',
    ];
    return greetingPatterns.some((pattern) => text.includes(pattern));
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
