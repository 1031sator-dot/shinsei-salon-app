'use client';

import { useState, useTransition } from 'react';
import { cancelReservation } from '../actions/cancel';
import styles from './cancel.module.css';

export default function CancelClient() {
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !token) {
      setError('すべての項目を入力してください。');
      return;
    }

    if (!confirm('本当にご予約をキャンセルしますか？\n（この操作は取り消せません）')) {
      return;
    }

    setError('');
    startTransition(async () => {
      try {
        const res = await cancelReservation(phone, token);
        if (res.success) {
          setSuccess(true);
        }
      } catch (err: any) {
        setError(err.message || 'キャンセル処理に失敗しました。');
      }
    });
  };

  if (success) {
    return (
      <div className={styles.cancelContainer}>
        <div className={styles.successBox}>
          <div className={styles.checkIcon}>✓</div>
          <h2>予約のキャンセルが完了しました。</h2>
          <p>またのご利用を心よりお待ちしております。</p>
          <button onClick={() => window.location.href = '/'} className="btn btn-outline" style={{ marginTop: '20px' }}>
            トップページへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cancelContainer}>
      <h1 className={styles.pageTitle}>ご予約の確認・キャンセル</h1>
      
      <div className={styles.infoBox}>
        <p><strong>【WEBキャンセルの受付について】</strong></p>
        <p>WEBからのキャンセル手続きは、<strong>ご予約日時の24時間前まで</strong>可能です。それ以降のキャンセルにつきましては、お手数ですが直接店舗（0800-222-1058）までお電話をお願いいたします。</p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleCancel} className={styles.cancelForm}>
        <div className={styles.formGroup}>
          <label className={styles.label}>ご登録の電話番号</label>
          <input 
            type="tel" 
            placeholder="例: 09012345678" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            required 
            className={styles.input} 
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>キャンセル用パスワード（4桁）</label>
          <input 
            type="text" 
            placeholder="予約完了時に表示された4桁の数字" 
            value={token} 
            onChange={e => setToken(e.target.value)} 
            required 
            maxLength={4}
            className={styles.input} 
          />
        </div>

        <button type="submit" disabled={isPending} className={`btn btn-primary ${styles.cancelBtn}`}>
          {isPending ? '処理中...' : '予約をキャンセルする'}
        </button>
        
        <button type="button" onClick={() => window.location.href = '/'} className={`btn btn-outline ${styles.backBtn}`}>
          トップページへ戻る
        </button>
      </form>
    </div>
  );
}
