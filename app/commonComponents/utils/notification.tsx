import { CheckCircle, XCircle, Clock } from 'lucide-react';

export function getStatusIcon(message: string) {
  if (!message) return <Clock className="h-4 w-4 text-gray-400" />;

  const lower = message.toLowerCase();

  if (lower.includes('approved')) {
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  } else if (lower.includes('rejected') || lower.includes('denied')) {
    return <XCircle className="h-4 w-4 text-red-500" />;
  } else {
    return <Clock className="h-4 w-4 text-gray-400" />;
  }
}

export function pickNotifDate(notif: any): Date {
    return new Date(notif.createdAt || notif.date || Date.now());
  }
  
  export function formatRelative(date: Date): string {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  export function formatFull(date: Date): string {
    return date.toLocaleString(); 
  }
  