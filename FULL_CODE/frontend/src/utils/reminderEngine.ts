/**
 * CareBridge AI - Prescription Reminder Engine
 * Automatically derives scheduled alarms from hospital prescription orders.
 * Supports Web Notifications, WhatsApp/SMS messaging templates, and iCalendar (.ics) exports.
 * Team: AVENGERS | Healthcare Track H2 | TalentAP Mega Hackathon 2026
 */

import { PatientCarePlan, ClinicalFacts, PatientMedicationInstruction } from '../types/careplan';
import { ScheduledReminderSlot, DoseReminderItem, ReminderTimeSlot } from '../types/reminder';

/**
 * Determine the appropriate daily time slots for a medication based on timing and frequency text.
 */
export function categorizeMedicationSlots(med: PatientMedicationInstruction): ReminderTimeSlot[] {
  const when = (med.whenToTake || '').toLowerCase();
  const freq = (med.howMuch || '').toLowerCase();
  const slots: Set<ReminderTimeSlot> = new Set();

  // Explicit timing words
  if (when.includes('morning') || when.includes('breakfast') || when.includes('am') || when.includes('empty stomach') || when.includes('ఉదయం') || when.includes('అల్పాహారం')) {
    slots.add('morning');
  }
  if (when.includes('afternoon') || when.includes('lunch') || when.includes('noon') || when.includes('మధ్యాహ్నం') || when.includes('భోజనం')) {
    slots.add('afternoon');
  }
  if (when.includes('evening') || when.includes('dinner') || when.includes('సాయంత్రం')) {
    slots.add('evening');
  }
  if (when.includes('night') || when.includes('bedtime') || when.includes('hs') || when.includes('రాత్రి') || when.includes('పడుకునే')) {
    slots.add('bedtime');
  }

  // Frequency heuristics if timing not explicitly split
  if (slots.size === 0) {
    if (when.includes('twice') || when.includes('bd') || when.includes('1-0-1') || when.includes('రెండు సార్లు')) {
      slots.add('morning');
      slots.add('evening');
    } else if (when.includes('thrice') || when.includes('tds') || when.includes('tid') || when.includes('1-1-1') || when.includes('మూడు సార్లు')) {
      slots.add('morning');
      slots.add('afternoon');
      slots.add('evening');
    } else if (when.includes('four times') || when.includes('qid') || when.includes('every 6 hours') || when.includes('నొప్పి ఉన్నప్పుడు')) {
      slots.add('morning');
      slots.add('afternoon');
      slots.add('evening');
      slots.add('bedtime');
    } else {
      // Default once daily: morning
      slots.add('morning');
    }
  }

  return Array.from(slots);
}

/**
 * Derive structured daily reminder slots directly from the patient care plan.
 */
export function generateRemindersFromPlan(
  plan: PatientCarePlan,
  facts: ClinicalFacts
): ScheduledReminderSlot[] {
  const isTelugu = plan.language === 'te';

  const morningItems: DoseReminderItem[] = [];
  const afternoonItems: DoseReminderItem[] = [];
  const eveningItems: DoseReminderItem[] = [];
  const bedtimeItems: DoseReminderItem[] = [];

  // Group medications into respective daily alarm slots
  plan.medications.forEach((med) => {
    const assignedSlots = categorizeMedicationSlots(med);

    assignedSlots.forEach((slot) => {
      const item: DoseReminderItem = {
        id: `${med.id}-${slot}`,
        medicineName: med.medicineName,
        strength: med.strength !== 'Not specified in source' ? med.strength : '',
        howMuch: med.howMuch,
        whenToTake: med.whenToTake,
        route: med.route,
        forHowLong: med.forHowLong,
        timingCategory: slot,
      };

      if (slot === 'morning') morningItems.push(item);
      if (slot === 'afternoon') afternoonItems.push(item);
      if (slot === 'evening') eveningItems.push(item);
      if (slot === 'bedtime') bedtimeItems.push(item);
    });
  });

  const slots: ScheduledReminderSlot[] = [];

  // 1. Morning Slot
  if (morningItems.length > 0) {
    const medNames = morningItems.map((m) => `${m.medicineName} ${m.strength}`.trim()).join(', ');
    slots.push({
      id: 'slot-morning',
      slot: 'morning',
      labelEn: 'Morning Dose (Breakfast)',
      labelTe: 'ఉదయం మందులు (అల్పాహారం)',
      defaultTime: '08:00',
      icon: 'Sunrise',
      items: morningItems,
      messageEn: `⏰ CareBridge Morning Reminder: Time for your morning medications (${medNames}). Follow meal guidelines and recover safely!`,
      messageTe: `⏰ కేర్‌బ్రిడ్జ్ ఉదయం రిమైండర్: మీ ఉదయపు మందులు (${medNames}) తీసుకోవలసిన సమయం అయింది. భోజన సూచనలను పాటించండి!`,
    });
  }

  // 2. Afternoon Slot
  if (afternoonItems.length > 0) {
    const medNames = afternoonItems.map((m) => `${m.medicineName} ${m.strength}`.trim()).join(', ');
    slots.push({
      id: 'slot-afternoon',
      slot: 'afternoon',
      labelEn: 'Afternoon Dose (Lunch)',
      labelTe: 'మధ్యాహ్నం మందులు (భోజనం)',
      defaultTime: '13:00',
      icon: 'Sun',
      items: afternoonItems,
      messageEn: `⏰ CareBridge Afternoon Reminder: Time for your midday dose (${medNames}). Drink adequate water!`,
      messageTe: `⏰ కేర్‌బ్రిడ్జ్ మధ్యాహ్నం రిమైండర్: మీ మధ్యాహ్నపు మందులు (${medNames}) తీసుకోవలసిన సమయం అయింది. మంచి నీరు త్రాగండి!`,
    });
  }

  // 3. Evening Slot
  if (eveningItems.length > 0) {
    const medNames = eveningItems.map((m) => `${m.medicineName} ${m.strength}`.trim()).join(', ');
    slots.push({
      id: 'slot-evening',
      slot: 'evening',
      labelEn: 'Evening Dose (Dinner)',
      labelTe: 'సాయంత్రం మందులు (రాత్రి భోజనం)',
      defaultTime: '18:00',
      icon: 'Sunset',
      items: eveningItems,
      messageEn: `⏰ CareBridge Evening Reminder: Time for your evening medications (${medNames}). Take after dinner as prescribed.`,
      messageTe: `⏰ కేర్‌బ్రిడ్జ్ సాయంత్రం రిమైండర్: మీ సాయంత్రపు మందులు (${medNames}) తీసుకోవలసిన సమయం అయింది. వైద్యులు సూచించినట్లు తీసుకోండి.`,
    });
  }

  // 4. Bedtime Slot
  if (bedtimeItems.length > 0) {
    const medNames = bedtimeItems.map((m) => `${m.medicineName} ${m.strength}`.trim()).join(', ');
    slots.push({
      id: 'slot-bedtime',
      slot: 'bedtime',
      labelEn: 'Bedtime Dose (Night)',
      labelTe: 'పడుకునే ముందు మందులు',
      defaultTime: '21:00',
      icon: 'Moon',
      items: bedtimeItems,
      messageEn: `⏰ CareBridge Bedtime Reminder: Time for your night medications (${medNames}) before sleeping. Have a restful recovery!`,
      messageTe: `⏰ కేర్‌బ్రిడ్జ్ రాత్రి రిమైండర్: పడుకునే ముందు తీసుకోవలసిన మందులు (${medNames}). ప్రశాంతంగా విశ్రాంతి తీసుకోండి!`,
    });
  }

  // 5. Follow-up Appointment Slot
  if (plan.followUp && plan.followUp.timingDisplay && plan.followUp.timingDisplay !== 'Not specified in source') {
    slots.push({
      id: 'slot-followup',
      slot: 'followup',
      labelEn: 'Doctor Review Appointment',
      labelTe: 'వైద్యుల తదుపరి సమీక్ష',
      defaultTime: '09:00',
      icon: 'Calendar',
      items: [],
      messageEn: `📅 CareBridge Appointment Reminder: Upcoming review with ${plan.followUp.departmentOrDoctor} scheduled for ${plan.followUp.timingDisplay}. Remember to bring your hospital discharge papers!`,
      messageTe: `📅 కేర్‌బ్రిడ్జ్ అపాయింట్‌మెంట్ రిమైండర్: ${plan.followUp.timingDisplay} నాడు ${plan.followUp.departmentOrDoctor} వద్ద మీ వైద్య సమీక్ష ఉంది. డిశ్చార్జ్ పత్రాలను వెంట తీసుకెళ్లండి!`,
    });
  }

  return slots;
}

/**
 * Generate iCalendar (.ics) format file string for importing into Google/Apple/Outlook calendars.
 */
export function generateCalendarICS(
  slots: ScheduledReminderSlot[],
  patientId: string,
  daysCount = 7
): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const now = new Date();
  const dtStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

  let icsEvents = '';

  slots.forEach((slot, sIdx) => {
    if (slot.slot === 'followup') return;

    const [hoursStr, minsStr] = slot.defaultTime.split(':');
    const hours = parseInt(hoursStr, 10) || 8;
    const mins = parseInt(minsStr, 10) || 0;

    for (let day = 0; day < daysCount; day++) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + day);
      eventDate.setHours(hours, mins, 0, 0);

      const endDate = new Date(eventDate.getTime() + 15 * 60000); // 15 min duration

      const dtStart = `${eventDate.getFullYear()}${pad(eventDate.getMonth() + 1)}${pad(eventDate.getDate())}T${pad(eventDate.getHours())}${pad(eventDate.getMinutes())}00`;
      const dtEnd = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

      const medSummary = slot.items.map((i) => `${i.medicineName} (${i.howMuch})`).join('; ');

      icsEvents += `
BEGIN:VEVENT
UID:carebridge-${patientId || 'synth'}-slot-${slot.id}-d${day}-${Date.now()}@carebridge.ai
DTSTAMP:${dtStamp}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:CareBridge Medicine Reminder: ${slot.labelEn}
DESCRIPTION:${slot.messageEn}\\nMedications: ${medSummary}
BEGIN:VALARM
TRIGGER:-PT5M
ACTION:DISPLAY
DESCRIPTION:Time to take your prescribed medicines
END:VALARM
END:VEVENT`;
    }
  });

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CareBridge AI//Prescription Reminder Engine//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:CareBridge Medication Schedule
X-WR-TIMEZONE:Asia/Kolkata${icsEvents}
END:VCALENDAR`;
}

/**
 * Download the generated .ics calendar file.
 */
export function downloadCalendarFile(icsContent: string, filename = 'CareBridge_Medication_Reminders.ics'): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format a WhatsApp click-to-chat URL with pre-filled prescription reminder text.
 */
export function generateWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  return cleanPhone.length >= 10
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`
    : `https://api.whatsapp.com/send?text=${encodedMsg}`;
}

/**
 * Play a gentle medical reminder chime using the browser Web Audio API.
 * Uses clean synthesis so zero external sound assets or network requests are needed.
 */
export function playReminderChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic two-tone chime (D5 = 587.33Hz -> A5 = 880Hz)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(587.33, now);
    osc2.frequency.exponentialRampToValueAtTime(880.0, now + 0.15);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.85);
    osc2.stop(now + 0.85);
  } catch (err) {
    console.warn('AudioContext chime error:', err);
  }
}

/**
 * Request browser Web Notification API permission.
 */
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

/**
 * Trigger an instant browser notification if granted.
 */
export function triggerBrowserNotification(title: string, body: string): boolean {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'carebridge-medication-alert',
      });
      return true;
    } catch (e) {
      console.warn('Browser notification dispatch failed:', e);
      return false;
    }
  }
  return false;
}
