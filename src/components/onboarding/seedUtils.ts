import { scheduledMessageTemplates } from './seedData';

export function buildScheduledMessages(userId: string, dealId: string) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month, day);

    return {
      user_id: userId,
      deal_id: dealId,
      message: scheduledMessageTemplates[index % scheduledMessageTemplates.length],
      scheduled_date: date.toISOString().split('T')[0],
      scheduled_time: '09:00',
      sent: day < today.getDate(),
    };
  });
}