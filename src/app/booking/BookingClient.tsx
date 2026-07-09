'use client';

import { useState, useEffect, useTransition } from 'react';
import { getAvailableSlots, createReservation } from '../actions/booking';
import styles from './booking.module.css';

type Slot = { time: string; available: boolean };

export default function BookingClient() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [cancelToken, setCancelToken] = useState('');
  const [error, setError] = useState('');
  const [agreePolicy, setAgreePolicy] = useState(false);
  
  // 今後14日間の日付を生成
  const nextDays = Array.from({length: 14}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // 翌日以降から予約可能とする
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 10);
    return localISOTime;
  });

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(nextDays[0]);
    }
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    setSelectedTime('');
    getAvailableSlots(selectedDate).then((s) => {
      setSlots(s);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError('日付と時間を選択してください。');
      return;
    }
    if (!agreePolicy) {
      setError('キャンセルポリシーに同意してください。');
      return;
    }
    
    setError('');
    const formData = new FormData(e.currentTarget);
    formData.append('date', selectedDate);
    formData.append('time', selectedTime);
    
    startTransition(async () => {
      try {
        const res = await createReservation(formData);
        if (res.success) {
          if (res.cancelToken) setCancelToken(res.cancelToken);
          setSuccess(true);
        }
      } catch (err: any) {
        setError(err.message || '予約の取得に失敗しました。');
      }
    });
  };

  if (success) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.checkIcon}>✓</div>
        <h2 className={styles.successTitle}>予約が完了しました</h2>
        <p className={styles.successDesc}>ご来店を心よりお待ちしております。<br/>当日はお気をつけてお越しください。</p>
        
        <div className={styles.tokenBox}>
          <h3>【重要】キャンセル用パスワード</h3>
          <p className={styles.tokenText}>{cancelToken}</p>
          <p className={styles.tokenNote}>WEBから予約をキャンセルする際に必要です。必ずメモ等にお控えください。<br/>（※前日までWEBキャンセル可能）</p>
        </div>

        <button onClick={() => window.location.href = '/'} className="btn btn-primary" style={{ marginTop: '20px' }}>
          トップページへ戻る
        </button>
      </div>
    );
  }

  const formatDisplayDate = (dStr: string) => {
    const d = new Date(dStr);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`;
  };

  return (
    <div className={styles.bookingContainer}>
      <h1 className={styles.pageTitle}>WEB予約</h1>
      <p className={styles.pageSubtitle}>ご希望の日時を選択してください。</p>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>1. 日付を選択</label>
          <div className={styles.dateSelector}>
            {nextDays.map(date => (
              <button 
                key={date}
                type="button" 
                className={`${styles.dateBtn} ${selectedDate === date ? styles.selectedDate : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                {formatDisplayDate(date)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>2. 時間を選択 <small>（○：空きあり / ×：満席）</small></label>
          <div className={styles.timeSelector}>
            {loading ? <p className={styles.loading}>読み込み中...</p> : 
             slots.length === 0 ? <p className={styles.noSlots}>この日は定休日です</p> :
             slots.map(slot => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                className={`${styles.timeBtn} ${selectedTime === slot.time ? styles.selectedTime : ''} ${!slot.available ? styles.disabledTime : ''}`}
                onClick={() => setSelectedTime(slot.time)}
              >
                {slot.time}
                <span className={styles.slotStatus}>{slot.available ? '○' : '×'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>3. お客様情報</label>
          <div className={styles.inputGroup}>
            <input type="text" name="name" placeholder="お名前（フルネーム）" required className={styles.input} />
            <input type="tel" name="phone" placeholder="電話番号（ハイフンなし可）" required className={styles.input} />
            <input type="email" name="email" placeholder="メールアドレス" required className={styles.input} />
          </div>
        </div>

        <div className={styles.policyBox}>
          <h4>キャンセルポリシー</h4>
          <p>前日までのキャンセルは無料です。当日の無断キャンセルは他のお客様のご迷惑となるためご遠慮ください。</p>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={agreePolicy} onChange={e => setAgreePolicy(e.target.checked)} />
            <span>キャンセルポリシーに同意する</span>
          </label>
        </div>
        
        <button type="submit" disabled={isPending || !selectedTime || !agreePolicy} className={`btn btn-primary ${styles.submitBtn}`}>
          {isPending ? '予約処理中...' : '予約を確定する'}
        </button>
      </form>
    </div>
  );
}
