'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function cancelReservation(phone: string, token: string) {
  if (!phone || !token) {
    throw new Error('電話番号とパスワードを入力してください。');
  }

  // 未来の予約を探す
  const now = new Date();
  const res = await prisma.reservation.findFirst({
    where: {
      phone: phone,
      cancelToken: token,
      status: 'CONFIRMED',
      date: { gt: now }
    }
  });

  if (!res) {
    throw new Error('該当する予約が見つかりません。情報が間違っているか、すでにキャンセルされています。');
  }

  // 24時間以内のキャンセルチェック
  const timeDiff = res.date.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  if (hoursDiff < 24) {
    throw new Error('ご予約日時まで24時間を切っているため、WEBからのキャンセルはできません。お手数ですが、直接お電話にてご連絡ください。');
  }

  // キャンセル処理（削除せずステータス更新）
  await prisma.reservation.update({
    where: { id: res.id },
    data: { status: 'CANCELLED' }
  });

  revalidatePath('/admin');
  revalidatePath('/booking');
  revalidatePath('/cancel');

  return { success: true };
}
