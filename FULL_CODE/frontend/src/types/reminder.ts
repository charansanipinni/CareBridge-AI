/**
 * CareBridge AI - Prescription Reminder Schema
 * Team: AVENGERS | Healthcare Track H2 | TalentAP Mega Hackathon 2026
 */

import { LanguageCode } from './careplan';

export type ReminderTimeSlot = 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'followup';

export type ReminderChannel = 'BROWSER' | 'WHATSAPP' | 'SMS' | 'CALENDAR';

export interface DoseReminderItem {
  id: string;
  medicineName: string;
  strength: string;
  howMuch: string;
  whenToTake: string;
  route: string;
  forHowLong: string;
  timingCategory: ReminderTimeSlot;
}

export interface ScheduledReminderSlot {
  id: string;
  slot: ReminderTimeSlot;
  labelEn: string;
  labelTe: string;
  defaultTime: string; // "08:00", "13:00", "18:00", "21:00"
  icon: 'Sunrise' | 'Sun' | 'Sunset' | 'Moon' | 'Calendar';
  items: DoseReminderItem[];
  messageEn: string;
  messageTe: string;
}

export interface ReminderSettings {
  enabled: boolean;
  channels: ReminderChannel[];
  caregiverPhone: string;
  caregiverName?: string;
  customTimes: {
    morning: string;
    afternoon: string;
    evening: string;
    bedtime: string;
  };
  language: LanguageCode;
}

export interface ReminderNotificationEvent {
  id: string;
  timestamp: string;
  slot: ReminderTimeSlot;
  medicineNames: string[];
  channel: ReminderChannel;
  status: 'SENT' | 'SIMULATED' | 'SCHEDULED' | 'FAILED';
  recipient?: string;
}
