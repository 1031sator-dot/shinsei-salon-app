import { PrismaClient } from '@prisma/client';
import AdminDashboard from './AdminDashboard';
import LoginForm from './LoginForm';
import { auth } from '../../../auth';

const prisma = new PrismaClient();

export const metadata = {
  title: '管理画面 | ヘアーサロンSHINSEI',
  robots: 'noindex, nofollow', // 検索エンジンにインデックスさせない
};

export default async function AdminPage(props: { searchParams?: Promise<{ error?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const session = await auth();
  
  // 未ログインの場合はログインフォームを表示
  if (!session) {
    return <LoginForm errorMessage={searchParams.error} />;
  }

  // 過去分も含めて最新1000件を取得（負荷対策）
  const reservations = await prisma.reservation.findMany({
    where: { status: { in: ['CONFIRMED', 'CANCELLED'] } },
    orderBy: { date: 'desc' },
    take: 1000,
  });

  const settingsRecord = await prisma.settings.findFirst();
  const settingsObj = settingsRecord ? settingsRecord : {};

  // CRM検索用のスタンプデータ取得
  const kartes = await prisma.karte.findMany();

  return <AdminDashboard initialReservations={reservations} initialSettings={settingsObj} initialKartes={kartes} />;
}
