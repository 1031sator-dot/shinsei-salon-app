'use server';

import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { encryptData, decryptData } from '../../lib/encryption';

const prisma = new PrismaClient();

import { auth } from '../../../auth';

export async function deleteReservation(id: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const res = await prisma.reservation.findUnique({ where: { id } });
  if (res && res.name.startsWith('【手動追加】')) {
    await prisma.reservation.delete({ where: { id } });
  } else if (res) {
    await prisma.reservation.update({ where: { id }, data: { status: 'CANCELLED' } });
  }
  revalidatePath('/admin');
  // カレンダーにも反映させるため
  revalidatePath('/booking');
}

export async function manualBlockSlot(dateString: string, timeString: string, memo: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const dateTimeString = `${dateString}T${timeString}:00+09:00`;
  const bookingDate = new Date(dateTimeString);
  
  await prisma.reservation.create({
    data: {
      name: `【手動追加】${memo}`,
      phone: '-',
      date: bookingDate,
      status: 'CONFIRMED'
    }
  });
  
  revalidatePath('/admin');
  revalidatePath('/booking');
}

export async function getKarte(phone: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const karte = await prisma.karte.findUnique({
    where: { phone }
  });

  if (!karte) return null;

  const decrypted = decryptData(karte.encryptedData);
  try {
    const parsed = JSON.parse(decrypted);
    return { ...parsed, stamps: karte.stamps };
  } catch (e) {
    // 古いデータ形式のフォールバック
    return { memo: decrypted, customFields: [], stamps: karte.stamps };
  }
}

export async function saveKarte(phone: string, data: any, stamps: number = 0) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const jsonString = JSON.stringify(data);
  const encryptedData = encryptData(jsonString);

  await prisma.karte.upsert({
    where: { phone },
    update: { encryptedData, stamps },
    create: { phone, encryptedData, stamps }
  });
  
  revalidatePath('/admin');
}

export async function updateCancelPolicy(policyText: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const settings = await prisma.settings.findFirst();
  if (settings) {
    await prisma.settings.update({
      where: { id: settings.id },
      data: { cancelPolicy: policyText }
    });
  } else {
    await prisma.settings.create({
      data: { cancelPolicy: policyText }
    });
  }
  
  revalidatePath('/admin');
  revalidatePath('/booking');
}

export async function getBanners() {
  const settings = await prisma.settings.findFirst();
  if (!settings || !settings.banners) return [];
  try {
    return JSON.parse(settings.banners);
  } catch (e) {
    return [];
  }
}

export async function saveBanners(banners: any[]) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const settings = await prisma.settings.findFirst();
  if (settings) {
    await prisma.settings.update({
      where: { id: settings.id },
      data: { banners: JSON.stringify(banners) }
    });
  } else {
    await prisma.settings.create({
      data: { banners: JSON.stringify(banners) }
    });
  }
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}
