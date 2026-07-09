'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// 日本時間のDateオブジェクトを安全に取得するヘルパー
function toJST(date: Date | string) {
  const d = new Date(date);
  const jstFormatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  const parts = jstFormatter.formatToParts(d);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';
  return {
    year: parseInt(getPart('year'), 10),
    month: parseInt(getPart('month'), 10),
    day: parseInt(getPart('day'), 10),
    hour: parseInt(getPart('hour'), 10),
    minute: parseInt(getPart('minute'), 10),
  };
}

// 定休日判定ロジック
function isClosed(dateObj: { year: number, month: number, day: number }, closedDaysStr: string) {
  const d = new Date(dateObj.year, dateObj.month - 1, dateObj.day);
  const dayOfWeek = d.getDay();
  const dayOfMonth = d.getDate();
  
  const closedDays = closedDaysStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  
  if (closedDays.includes(dayOfWeek)) return true;
  
  // 店舗独自の特別ルール（第2・第3火曜日）
  if (dayOfWeek === 2 && dayOfMonth >= 8 && dayOfMonth <= 21) {
    return true;
  }
  return false;
}

export async function getAvailableSlots(dateString: string) {
  const settings = await prisma.settings.findFirst();
  const businessHoursStr = settings?.businessHours || "09:00-19:00";
  const [startStr, endStr] = businessHoursStr.split('-');
  const startHour = parseInt(startStr.split(':')[0], 10) || 9;
  const endHour = parseInt(endStr.split(':')[0], 10) || 19;
  
  const date = new Date(dateString);
  const jstDate = toJST(date);
  
  if (isClosed(jstDate, settings?.closedDays || "1")) {
    return [];
  }
  
  const startOfDay = new Date(dateString + 'T00:00:00+09:00');
  const endOfDay = new Date(dateString + 'T23:59:59+09:00');
  
  const existingReservations = await prisma.reservation.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      status: 'CONFIRMED'
    }
  });

  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    const slotTime = `${hour.toString().padStart(2, '0')}:00`;
    const isBooked = existingReservations.some(res => {
      const resJst = toJST(res.date);
      return resJst.hour === hour;
    });
    
    slots.push({
      time: slotTime,
      available: !isBooked
    });
  }
  
  return slots;
}

export async function createReservation(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const dateStr = formData.get('date') as string;
  const timeStr = formData.get('time') as string;
  
  if (!name || !phone || !email || !dateStr || !timeStr) {
    throw new Error('すべての項目を入力してください。');
  }
  
  const dateTimeString = `${dateStr}T${timeStr}:00+09:00`;
  const bookingDate = new Date(dateTimeString);
  const jstBooking = toJST(bookingDate);
  
  // サーバーサイドでの厳格なバリデーション
  const settings = await prisma.settings.findFirst();
  if (isClosed(jstBooking, settings?.closedDays || "1")) {
    throw new Error('指定された日付は定休日です。');
  }
  
  const businessHoursStr = settings?.businessHours || "09:00-19:00";
  const [startStr, endStr] = businessHoursStr.split('-');
  const startHour = parseInt(startStr.split(':')[0], 10) || 9;
  const endHour = parseInt(endStr.split(':')[0], 10) || 19;
  
  if (jstBooking.hour < startHour || jstBooking.hour >= endHour) {
    throw new Error('指定された時間は営業時間外です。');
  }
  
  // 重複チェック
  const existing = await prisma.reservation.findFirst({
    where: { date: bookingDate, status: 'CONFIRMED' }
  });
  
  if (existing) {
    throw new Error('申し訳ありません。この時間はすでに予約が埋まっています。');
  }

  // 1人1件までの未来予約制限
  const now = new Date();
  const futureReservation = await prisma.reservation.findFirst({
    where: {
      OR: [{ phone }, { email }],
      date: { gt: now },
      status: 'CONFIRMED'
    }
  });

  if (futureReservation) {
    throw new Error('すでに今後のご予約が入っています。複数枠の確保はできません。');
  }

  const cancelToken = Math.floor(1000 + Math.random() * 9000).toString();
  
  await prisma.reservation.create({
    data: {
      name,
      phone,
      email,
      cancelToken,
      date: bookingDate,
      status: 'CONFIRMED'
    }
  });
  
  revalidatePath('/admin');
  revalidatePath('/booking');
  
  return { success: true, cancelToken };
}
