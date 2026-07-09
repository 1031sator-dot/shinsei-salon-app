import BookingClient from './BookingClient';

export const metadata = {
  title: 'WEB予約 | ヘアーサロンSHINSEI',
};

export default function BookingPage() {
  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px', minHeight: '100vh' }}>
      <BookingClient />
    </div>
  );
}
