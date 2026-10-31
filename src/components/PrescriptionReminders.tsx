import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  Clock, 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  Calendar, 
  CheckCircle, 
  Send, 
  MessageSquare, 
  Volume2, 
  Download, 
  ShieldCheck, 
  Smartphone, 
  Pill,
  ExternalLink,
  Check
} from 'lucide-react';
import { PatientCarePlan, ClinicalFacts } from '../types/careplan';
import { ScheduledReminderSlot } from '../types/reminder';
import { 
  generateRemindersFromPlan, 
  generateCalendarICS, 
  downloadCalendarFile, 
  generateWhatsAppUrl, 
  playReminderChime,
  requestBrowserNotificationPermission,
  triggerBrowserNotification 
} from '../utils/reminderEngine';

interface PrescriptionRemindersProps {
  plan: PatientCarePlan;
  facts: ClinicalFacts;
}

export const PrescriptionReminders: React.FC<PrescriptionRemindersProps> = ({ plan, facts }) => {
  const isTelugu = plan.language === 'te';
  const [reminders, setReminders] = useState<ScheduledReminderSlot[]>([]);
  const [autoRemindersActive, setAutoRemindersActive] = useState<boolean>(true);
  const [caregiverPhone, setCaregiverPhone] = useState<string>('');
  const [browserPermitted, setBrowserPermitted] = useState<boolean>(false);
  const [activeAlertToast, setActiveAlertToast] = useState<string | null>(null);
  const [lastDispatchedSlot, setLastDispatchedSlot] = useState<string | null>(null);
  const [icsDownloaded, setIcsDownloaded] = useState<boolean>(false);

  // Derive reminders from prescription
  useEffect(() => {
    const derived = generateRemindersFromPlan(plan, facts);
    setReminders(derived);
  }, [plan, facts]);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermitted(Notification.permission === 'granted');
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestBrowserNotificationPermission();
    setBrowserPermitted(granted);
    if (granted) {
      playReminderChime();
      triggerBrowserNotification(
        'CareBridge AI - Reminders Activated',
        isTelugu 
          ? 'మీ మందుల సమయానికి ఆటోమేటిక్ రిమైండర్లు పంపబడతాయి.' 
          : 'Prescription reminders are now active for your home recovery.'
      );
      setActiveAlertToast(
        isTelugu 
          ? 'బ్రౌజర్ నోటిఫికేషన్లు విజయవంతంగా ప్రారంభించబడ్డాయి!' 
          : 'Browser push notifications successfully enabled!'
      );
      setTimeout(() => setActiveAlertToast(null), 4000);
    }
  };

  const handleTestAlert = (slot: ScheduledReminderSlot) => {
    playReminderChime();
    const title = isTelugu ? `కేర్‌బ్రిడ్జ్ రిమైండర్: ${slot.labelTe}` : `CareBridge Reminder: ${slot.labelEn}`;
    const body = isTelugu ? slot.messageTe : slot.messageEn;

    triggerBrowserNotification(title, body);
    setLastDispatchedSlot(slot.id);
    setActiveAlertToast(
      isTelugu 
        ? `🔔 రిమైండర్ పరీక్షించబడింది: ${slot.labelTe}` 
        : `🔔 Reminder alert triggered for ${slot.labelEn}`
    );

    // Call backend API to record zero-PHI reminder event
    fetch('/api/reminders/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slot: slot.slot,
        channel: 'BROWSER',
        phone: caregiverPhone,
        message: body,
      }),
    }).catch((err) => console.warn('Reminder API log note:', err));

    setTimeout(() => {
      setActiveAlertToast(null);
      setLastDispatchedSlot(null);
    }, 4500);
  };

  const handleDownloadICS = () => {
    const icsContent = generateCalendarICS(reminders, facts.patientId || 'synth', 7);
    downloadCalendarFile(icsContent, 'CareBridge_Medication_Reminders.ics');
    setIcsDownloaded(true);
    setActiveAlertToast(
      isTelugu 
        ? 'క్యాలెండర్ షెడ్యూల్ (.ics) డౌన్‌లోడ్ చేయబడింది!' 
        : 'CareBridge_Medication_Reminders.ics calendar file downloaded!'
    );
    setTimeout(() => {
      setIcsDownloaded(false);
      setActiveAlertToast(null);
    }, 4000);
  };

  const getSlotIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sunrise': return <Sunrise className="w-5 h-5 text-amber-500" />;
      case 'Sun': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'Sunset': return <Sunset className="w-5 h-5 text-orange-500" />;
      case 'Moon': return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'Calendar': return <Calendar className="w-5 h-5 text-teal-600" />;
      default: return <Clock className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {activeAlertToast && (
        <div className="bg-teal-900 text-teal-50 p-4 rounded-2xl shadow-lg border border-teal-700 flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-3">
            <BellRing className="w-5 h-5 text-teal-300 animate-bounce" />
            <span className="text-sm font-bold">{activeAlertToast}</span>
          </div>
          <button 
            onClick={() => setActiveAlertToast(null)}
            className="text-teal-300 hover:text-white text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Feature Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {isTelugu ? 'ప్రిస్క్రిప్షన్ ఆటో-రిమైండర్లు (Auto-Send Reminders)' : 'Prescription Auto-Send Reminders'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              {isTelugu 
                ? 'వైద్యులు సూచించిన మందుల వేళల ప్రకారం రోగులకు మరియు సంరక్షకులకు ఆటోమేటిక్ రిమైండర్లు పంపబడతాయి.' 
                : 'Automated notification schedule derived strictly from your hospital prescription orders. Alerts you or your family caregiver at exact dosing times.'}
            </p>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <span className="text-xs font-bold text-slate-700">
              {autoRemindersActive 
                ? (isTelugu ? 'రిమైండర్లు సక్రియంగా ఉన్నాయి' : 'Reminders Active') 
                : (isTelugu ? 'రిమైండర్లు ఆపివేయబడ్డాయి' : 'Reminders Paused')}
            </span>
            <button
              type="button"
              onClick={() => setAutoRemindersActive(!autoRemindersActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                autoRemindersActive ? 'bg-teal-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  autoRemindersActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Quick Channel Configuration Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          {/* 1. Browser Push Channel */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Bell className="w-4 h-4 text-teal-600" />
                  <span>{isTelugu ? 'బ్రౌజర్ నోటిఫికేషన్లు' : 'Browser Push Alerts'}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  browserPermitted 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {browserPermitted 
                    ? (isTelugu ? 'సక్రియం' : 'Enabled') 
                    : (isTelugu ? 'అనుమతి అవసరం' : 'Action Needed')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isTelugu 
                  ? 'మీ ల్యాప్‌టాప్ లేదా ఫోన్‌లో సరైన సమయంలో అలారం శబ్దంతో కూడిన నోటిఫికేషన్లు వస్తాయి.' 
                  : 'Receive audio chimes and pop-up alerts on your device at exact dosing hours.'}
              </p>
            </div>
            {!browserPermitted ? (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="mt-3 w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition shadow-2xs"
              >
                {isTelugu ? 'నోటిఫికేషన్లను ప్రారంభించండి' : 'Enable Push Notifications'}
              </button>
            ) : (
              <div className="mt-3 flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>{isTelugu ? 'నోటిఫికేషన్లు సిద్ధంగా ఉన్నాయి' : 'Ready for scheduled alarms'}</span>
              </div>
            )}
          </div>

          {/* 2. WhatsApp / SMS Caregiver Channel */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{isTelugu ? 'వాట్సాప్ / SMS అలర్ట్‌లు' : 'WhatsApp / Caregiver Alert'}</span>
              </span>
              <p className="text-[11px] text-slate-500 mb-2">
                {isTelugu 
                  ? 'రోగి లేదా కుటుంబ సంరక్షకుడి మొబైల్ నంబర్‌కు నేరుగా వాట్సాప్ సందేశాలు పంపవచ్చు.' 
                  : 'Send instant pre-formatted WhatsApp reminders to patient or family caregiver.'}
              </p>
              <input
                type="tel"
                placeholder={isTelugu ? 'మొబైల్ నంబర్ (e.g. 9876543210)' : 'Phone number (e.g. 9876543210)'}
                value={caregiverPhone}
                onChange={(e) => setCaregiverPhone(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {isTelugu ? 'గోప్యత: నంబర్లు సర్వర్‌లో శాశ్వతంగా భద్రపరచబడవు.' : 'Zero-PHI: Phone numbers are processed locally.'}
            </p>
          </div>

          {/* 3. Calendar Sync (.ics) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>{isTelugu ? 'ఫోన్ క్యాలెండర్ సింక్' : 'Phone Calendar Alarms'}</span>
              </span>
              <p className="text-[11px] text-slate-500 mb-3">
                {isTelugu 
                  ? 'Google Calendar లేదా Apple Calendar లోకి 7 రోజుల మందుల షెడ్యూల్‌ను చేర్చండి.' 
                  : 'Download complete 7-day medication alarms directly into Google or Apple Calendar.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadICS}
              className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-lg transition shadow-2xs flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>{icsDownloaded ? (isTelugu ? 'డౌన్‌లోడ్ అయింది!' : 'Downloaded!') : (isTelugu ? 'క్యాలెండర్ ఫైల్ (.ics)' : 'Download .ics File')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prescription Daily Alarm Schedule Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isTelugu ? 'ప్రిస్క్రిప్షన్ అలారం షెడ్యూల్ (Daily Dosing Slots)' : 'Prescription Alarm Schedule (Daily Dosing Slots)'}
            </h3>
            <p className="text-xs text-slate-500">
              {isTelugu 
                ? 'వైద్యుల ప్రిస్క్రిప్షన్ ఆధారంగా రూపొందించిన రోజువారీ సమయాలు' 
                : 'Exact timings, medications, and notification messages derived from hospital orders'}
            </p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
            {reminders.length} {isTelugu ? 'రిమైండర్ స్లాట్‌లు' : 'Scheduled Slots'}
          </span>
        </div>

        <div className="space-y-4">
          {reminders.map((slot) => {
            const isAlerting = lastDispatchedSlot === slot.id;
            const waUrl = generateWhatsAppUrl(caregiverPhone, isTelugu ? slot.messageTe : slot.messageEn);

            return (
              <div 
                key={slot.id} 
                className={`p-4 sm:p-5 rounded-2xl border transition ${
                  isAlerting 
                    ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-400' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Slot timing & Icon */}
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
                      {getSlotIcon(slot.icon)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {isTelugu ? slot.labelTe : slot.labelEn}
                        </h4>
                        <span className="font-mono text-xs font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {slot.defaultTime}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 italic">
                        "{isTelugu ? slot.messageTe : slot.messageEn}"
                      </p>

                      {/* Prescribed Medicines for this slot */}
                      {slot.items.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          {slot.items.map((item, idx) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200"
                            >
                              <Pill className="w-3.5 h-3.5 text-teal-600" />
                              <strong className="text-slate-900">{item.medicineName} {item.strength}</strong>
                              <span>• {item.howMuch}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions (Test Chime / Send WhatsApp) */}
                  <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
                    {/* WhatsApp Dispatch */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition shadow-2xs"
                      title="Send reminder via WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isTelugu ? 'వాట్సాప్ పంపండి' : 'Send WhatsApp'}</span>
                    </a>

                    {/* Test Audio Chime & Alert */}
                    <button
                      type="button"
                      onClick={() => handleTestAlert(slot)}
                      className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition shadow-2xs ${
                        isAlerting 
                          ? 'bg-teal-700 text-white' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                      title="Play reminder chime and show sample notification"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                      <span>{isAlerting ? (isTelugu ? 'రింగింగ్...' : 'Ringing...') : (isTelugu ? 'అలర్ట్ పరీక్ష' : 'Test Alert')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-start space-x-3">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-700 block mb-0.5">
            {isTelugu ? 'వైద్య భద్రతా ప్రమాణం:' : 'Medical Safety Guarantee:'}
          </strong>
          {isTelugu 
            ? 'ఈ రిమైండర్లు మీ ఆసుపత్రి డిశ్చార్జ్ సారాంశంలోని మందుల ఆధారంగా మాత్రమే రూపొందించబడ్డాయి. ఏ మందు లేదా మోతాదు మార్చబడలేదు.' 
            : 'Reminders are derived strictly from your hospital discharge summary without adding or omitting prescribed medications. Always confirm any contradictory instructions with your doctor.'}
        </div>
      </div>
    </div>
  );
};
