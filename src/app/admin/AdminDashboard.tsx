'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteReservation, manualBlockSlot, getKarte, saveKarte, updateCancelPolicy } from '../actions/admin';
import { logoutAction } from '../actions/auth';
import styles from './admin.module.css';

export default function AdminDashboard({ initialReservations, initialSettings, initialKartes = [] }: { initialReservations: any[], initialSettings: Record<string, string>, initialKartes?: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('schedule');
  const [blockDate, setBlockDate] = useState('');
  const [blockTime, setBlockTime] = useState('10:00');
  const [blockMemo, setBlockMemo] = useState('電話予約');
  const [isBlocking, setIsBlocking] = useState(false);

  // カルテ用の状態
  const [karteModalOpen, setKarteModalOpen] = useState(false);
  const [karteCustomer, setKarteCustomer] = useState<any>(null);
  const [karteMemo, setKarteMemo] = useState('');
  const [karteFields, setKarteFields] = useState<{key: string, value: string}[]>([]);
  const [karteStamps, setKarteStamps] = useState(0);
  const [kartePhotos, setKartePhotos] = useState<string[]>([]);
  const [isKarteLoading, setIsKarteLoading] = useState(false);
  const [isKarteSaving, setIsKarteSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // CRM検索用の状態
  const [crmSearch, setCrmSearch] = useState('');

  // 設定用の状態
  const [policyText, setPolicyText] = useState(initialSettings?.cancelPolicy || '前日までのキャンセルは無料です。当日の無断キャンセルは他のお客様のご迷惑となるためご遠慮ください。');
  const [banners, setBanners] = useState<{image: string, link: string}[]>(() => {
    try {
      return JSON.parse(initialSettings?.banners || '[]');
    } catch {
      return [];
    }
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const formatDateTime = (d: Date) => {
    const date = new Date(d);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]}) ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleDelete = async (id: string) => {
    if (confirm('この予約をキャンセル（削除）しますか？')) {
      await deleteReservation(id);
      router.refresh();
    }
  };

  const handleManualBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate || !blockTime) return;
    setIsBlocking(true);
    try {
      await manualBlockSlot(blockDate, blockTime, blockMemo);
      alert('枠をブロックしました。');
      router.refresh();
    } catch (err: any) {
      alert('エラー: その枠はすでに埋まっている可能性があります。');
    }
    setIsBlocking(false);
  };

  const openKarte = async (customer: any) => {
    setKarteCustomer(customer);
    setKarteModalOpen(true);
    setIsKarteLoading(true);
    try {
      const data = await getKarte(customer.phone);
      if (data) {
        setKarteMemo(data.memo || '');
        setKarteFields(data.customFields && data.customFields.length > 0 ? data.customFields : []);
        setKarteStamps(data.stamps || 0);
        setKartePhotos(data.photos || []);
      } else {
        setKarteMemo('');
        setKarteFields([{ key: '', value: '' }]);
        setKarteStamps(0);
        setKartePhotos([]);
      }
    } catch (e) {
      console.error(e);
      alert('カルテの読み込みに失敗しました');
    }
    setIsKarteLoading(false);
  };

  const handleSaveKarte = async () => {
    if (!karteCustomer) return;
    setIsKarteSaving(true);
    try {
      const data = { 
        memo: karteMemo, 
        customFields: karteFields.filter(f => f.key.trim() !== ''),
        photos: kartePhotos
      };
      await saveKarte(karteCustomer.phone, data, karteStamps);
      alert('カルテを保存しました（暗号化済）');
      setKarteModalOpen(false);
      router.refresh(); // カルテのスタンプ数変更などをCRMに即時反映
    } catch (e) {
      alert('保存に失敗しました');
    }
    setIsKarteSaving(false);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateCancelPolicy(policyText);
      const { saveBanners } = await import('../actions/admin');
      await saveBanners(banners);
      alert('設定とバナーを保存しました。お客様の画面に即時反映されます。');
    } catch (e) {
      alert('保存に失敗しました');
    }
    setIsSavingSettings(false);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (banners.length >= 5) {
      alert('バナーは最大5枚までです。');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setBanners(prev => [...prev, { image: dataUrl, link: '' }]);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const updateBannerLink = (index: number, link: string) => {
    const newBanners = [...banners];
    newBanners[index].link = link;
    setBanners(newBanners);
  };

  const removeBanner = (index: number) => {
    const newBanners = [...banners];
    newBanners.splice(index, 1);
    setBanners(newBanners);
  };

  const addCustomField = () => setKarteFields([...karteFields, { key: '', value: '' }]);
  const updateCustomField = (index: number, key: string, value: string) => {
    const newFields = [...karteFields];
    newFields[index] = { key, value };
    setKarteFields(newFields);
  };
  const removeCustomField = (index: number) => {
    const newFields = [...karteFields];
    newFields.splice(index, 1);
    setKarteFields(newFields);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 圧縮
        setKartePhotos(prev => [...prev, dataUrl]);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // リセット
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...kartePhotos];
    newPhotos.splice(index, 1);
    setKartePhotos(newPhotos);
  };

  // スケジュール用（今日以降、かつ予約時間から3時間以内のもののみ表示し、キャンセルは除外）
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  
  const upcomingReservations = initialReservations
    .filter(r => r.status === 'CONFIRMED' && new Date(r.date) >= threeHoursAgo)
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // キャンセル履歴用（キャンセルステータスのもの）
  const cancelledReservations = initialReservations
    .filter(r => r.status === 'CANCELLED')
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // CRM用（全件から顧客をユニーク化、キャンセル数もカウント）
  const customerMap = new Map();
  initialReservations.forEach(res => {
    if (res.phone === '-') return;
    
    if (!customerMap.has(res.phone)) {
      customerMap.set(res.phone, { 
        name: res.name, 
        phone: res.phone, 
        email: res.email || '未登録', 
        count: res.status === 'CONFIRMED' ? 1 : 0, 
        cancelCount: res.status === 'CANCELLED' ? 1 : 0,
        lastVisit: res.date 
      });
    } else {
      const c = customerMap.get(res.phone);
      if (res.status === 'CONFIRMED') {
        c.count += 1;
        if (new Date(res.date) > new Date(c.lastVisit)) c.lastVisit = res.date;
      } else if (res.status === 'CANCELLED') {
        c.cancelCount += 1;
      }
      if (!c.email || c.email === '未登録') c.email = res.email;
    }
  });
  
  // キャンセル数が多い順、あるいは来店回数が多い順にソート
  const uniqueCustomers = Array.from(customerMap.values()).sort((a: any, b: any) => b.count - a.count);

  // 検索フィルタリング
  const filteredCustomers = uniqueCustomers.filter((c: any) => {
    const term = crmSearch.toLowerCase();
    if (!term) return true;
    if (c.name.toLowerCase().includes(term)) return true;
    if (c.phone.includes(term)) return true;
    if (c.email.toLowerCase().includes(term)) return true;
    
    // スタンプ数での検索
    const karte = initialKartes.find((k: any) => k.phone === c.phone);
    const stamps = karte?.stamps || 0;
    if (term === stamps.toString()) return true;
    
    return false;
  });

  return (
    <div className={styles.dashboardContainer}>
      <style>{`
        header.header { display: none !important; }
        footer.footer { display: none !important; }
        #google_translate_element { display: none !important; }
        
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .${styles.dashboardContainer} { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
          .${styles.adminHeader}, .${styles.tabContainer}, button, .${styles.actionButtons} { display: none !important; }
          .${styles.tabContent} { box-shadow: none !important; padding: 0 !important; }
          /* 改ページを防ぐ */
          .${styles.karteModal} { position: static !important; width: 100% !important; background: white !important; padding: 0 !important; box-shadow: none !important; }
          .${styles.modalOverlay} { position: static !important; background: transparent !important; }
        }
      `}</style>
      <header className={styles.adminHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className={styles.headerTitle}>
          <h1>SHINSEI 管理ダッシュボード</h1>
          <span className={styles.headerBadge}>Secure ERP</span>
        </div>
        <button onClick={() => logoutAction()} className={`btn btn-outline ${styles.noPrint}`} style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', padding: '5px 15px', fontSize: '0.9rem' }}>
          ログアウト
        </button>
      </header>
      
        <div className={styles.tabContainer}>
        <button className={`${styles.tabTrigger} ${activeTab === 'schedule' ? styles.activeTab : ''}`} onClick={() => setActiveTab('schedule')}>📅 予約スケジュール</button>
        <button className={`${styles.tabTrigger} ${activeTab === 'crm' ? styles.activeTab : ''}`} onClick={() => setActiveTab('crm')}>👥 顧客名簿 (CRM)</button>
        <button className={`${styles.tabTrigger} ${activeTab === 'cancelList' ? styles.activeTab : ''}`} onClick={() => setActiveTab('cancelList')}>🚫 キャンセル履歴</button>
        <button className={`${styles.tabTrigger} ${activeTab === 'settings' ? styles.activeTab : ''}`} onClick={() => setActiveTab('settings')}>⚙️ 店舗運営設定</button>
      </div>

      <div className={styles.contentArea}>
        
        {activeTab === 'schedule' && (
          <div className={styles.tabContent}>
            <div className={styles.blockPanel}>
              <h3>手動で枠をブロックする（電話予約・休憩など）</h3>
              <form onSubmit={handleManualBlock} className={styles.blockForm}>
                <input type="date" required value={blockDate} onChange={e => setBlockDate(e.target.value)} className={styles.inputSmall} />
                <select value={blockTime} onChange={e => setBlockTime(e.target.value)} className={styles.inputSmall}>
                  {[9,10,11,12,13,14,15,16,17,18].map(h => (
                    <option key={h} value={`${h.toString().padStart(2, '0')}:00`}>{h}:00</option>
                  ))}
                </select>
                <input type="text" placeholder="メモ（例：山田様 電話予約）" value={blockMemo} onChange={e => setBlockMemo(e.target.value)} className={styles.inputSmall} />
                <button type="submit" disabled={isBlocking} className={`btn btn-primary ${styles.blockBtn}`}>ブロック追加</button>
              </form>
            </div>

            <div className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>今後のご予約一覧（直近表示）</h2>
                <button onClick={() => window.print()} className={`btn btn-outline ${styles.noPrint}`} style={{ padding: '5px 15px', fontSize: '0.9rem', margin: 0 }}>🖨️ PDF保存・印刷</button>
              </div>
              <p className={styles.hint}>※予約時間を3時間過ぎたものは自動的に非表示になります。</p>
              {upcomingReservations.length === 0 ? (
                <div className={styles.empty}><p>現在、今後の予約は入っていません。</p></div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>日時</th>
                        <th>お名前</th>
                        <th>電話番号</th>
                        <th>メールアドレス</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingReservations.map((res: any) => (
                        <tr key={res.id} className={res.phone === '-' ? styles.rowManual : ''}>
                          <td><span className={styles.dateBadge}>{formatDateTime(res.date)}</span></td>
                          <td className={styles.nameCell}>{res.name} {res.phone !== '-' && '様'}</td>
                          <td>{res.phone}</td>
                          <td>{res.email || '-'}</td>
                          <td><button onClick={() => handleDelete(res.id)} className={styles.deleteBtn}>取消</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'crm' && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>顧客データ（来店回数順）</h2>
                <button onClick={() => window.print()} className={`btn btn-outline ${styles.noPrint}`} style={{ padding: '5px 15px', fontSize: '0.9rem', margin: 0 }}>🖨️ PDF保存・印刷</button>
              </div>
              <p className={styles.hint}>過去にWeb予約を利用したお客様の自動リストです。カルテを開いて詳細やスタンプを管理できます。</p>
              
              <div className="no-print" style={{ marginBottom: '20px' }}>
                <input 
                  type="text" 
                  placeholder="名前・電話番号・メール・スタンプ数で検索..." 
                  value={crmSearch} 
                  onChange={e => setCrmSearch(e.target.value)} 
                  className={styles.inputSmall} 
                  style={{ width: '100%', maxWidth: '400px' }} 
                />
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>お名前</th>
                      <th>電話番号</th>
                      <th>メールアドレス</th>
                      <th>総予約回数</th>
                      <th>キャンセル回数</th>
                      <th>最終来店予定日</th>
                      <th>カルテ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c: any) => (
                      <tr key={c.phone}>
                        <td className={styles.nameCell}>{c.name} 様</td>
                        <td>{c.phone}</td>
                        <td>{c.email}</td>
                        <td><span className={styles.countBadge}>{c.count} 回</span></td>
                        <td style={{ color: c.cancelCount > 0 ? 'red' : 'inherit', fontWeight: c.cancelCount > 0 ? 'bold' : 'normal' }}>
                          {c.cancelCount > 0 ? `${c.cancelCount} 回` : '0 回'}
                        </td>
                        <td>{formatDateTime(c.lastVisit)}</td>
                        <td>
                          <button onClick={() => openKarte(c)} className={styles.karteBtn}>
                            📝 カルテを開く
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cancelList' && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>キャンセル履歴・ブラックリスト</h2>
                <button onClick={() => window.print()} className={`btn btn-outline ${styles.noPrint}`} style={{ padding: '5px 15px', fontSize: '0.9rem', margin: 0 }}>🖨️ PDF保存・印刷</button>
              </div>
              <p className={styles.hint}>過去にキャンセルされた予約の履歴です。頻繁にキャンセルするお客様の特定に役立ちます。</p>
              {cancelledReservations.length === 0 ? (
                <div className={styles.empty}><p>現在、キャンセルされた予約はありません。</p></div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>キャンセルされた日時</th>
                        <th>お名前</th>
                        <th>電話番号</th>
                        <th>通算キャンセル回数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cancelledReservations.map((res: any) => {
                        const cInfo = customerMap.get(res.phone);
                        return (
                          <tr key={res.id}>
                            <td><span className={styles.dateBadge}>{formatDateTime(res.date)}</span></td>
                            <td className={styles.nameCell}>{res.name} {res.phone !== '-' && '様'}</td>
                            <td>{res.phone}</td>
                            <td style={{ color: 'red', fontWeight: 'bold' }}>{cInfo ? cInfo.cancelCount : 1} 回</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>店舗運営ポリシー設定</h2>
              <p className={styles.hint}>お客様の予約画面に表示されるキャンセルポリシーを変更できます。</p>
              
              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>キャンセルポリシー文章</label>
                <textarea 
                  value={policyText}
                  onChange={e => setPolicyText(e.target.value)}
                  className={styles.settingTextarea}
                  placeholder="ここに記載した文章が、お客様の予約確定前に表示されます。"
                />
              </div>

              <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

              <h3 style={{ marginBottom: '15px' }}>トップページ お知らせバナー（最大5枚）</h3>
              <p className={styles.hint} style={{ marginBottom: '15px' }}>お客様向けサイトのトップページに表示されるバナー画像です。画像は自動的に圧縮されて保存されます。</p>
              
              <div className={styles.bannerGrid}>
                {banners.map((banner, index) => (
                  <div key={index} className={styles.bannerItem}>
                    <div className={styles.bannerImgWrap}>
                      <img src={banner.image} alt={`バナー ${index + 1}`} className={styles.bannerPreview} />
                      <button onClick={() => removeBanner(index)} className={styles.removeBannerBtn}>✕</button>
                    </div>
                    <input 
                      type="url" 
                      placeholder="リンク先URL (任意)" 
                      value={banner.link} 
                      onChange={e => updateBannerLink(index, e.target.value)} 
                      className={styles.bannerLinkInput}
                    />
                  </div>
                ))}
              </div>
              
              {banners.length < 5 && (
                <label className="btn btn-outline" style={{ display: 'inline-block', marginTop: '10px', cursor: 'pointer' }}>
                  + バナー画像を追加する
                  <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
                </label>
              )}


              <button 
                onClick={handleSaveSettings} 
                disabled={isSavingSettings}
                className="btn btn-primary"
                style={{ marginTop: '15px' }}
              >
                {isSavingSettings ? '保存中...' : '設定を保存する'}
              </button>
            </div>
            
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>基本情報 (固定)</h2>
              <ul className={styles.settingsList}>
                <li><strong>予約用フリーコール:</strong> 0800-222-1058</li>
                <li><strong>営業時間:</strong> 09:00 - 19:00</li>
                <li><strong>定休日設定:</strong> 毎週月曜日、第2・第3火曜日</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {karteModalOpen && karteCustomer && (
        <div className={styles.modalOverlay}>
          <div className={styles.karteModalFull}>
            <div className={styles.modalHeader}>
              <div className={styles.headerLeft}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h2>電子カルテ: {karteCustomer.name} 様</h2>
                  <button onClick={() => window.print()} className={`btn btn-outline ${styles.noPrint}`} style={{ marginLeft: '15px', padding: '2px 10px', fontSize: '0.8rem' }}>🖨️ PDF保存</button>
                </div>
                <div className={styles.stampUI}>
                  <span>★ スタンプ数: </span>
                  <button onClick={() => setKarteStamps(Math.max(0, karteStamps - 1))} className={styles.stampBtn}>-</button>
                  <span className={styles.stampCount}>{karteStamps}</span>
                  <button onClick={() => setKarteStamps(karteStamps + 1)} className={styles.stampBtn}>+</button>
                  {karteStamps > 0 && karteStamps % 5 === 0 && <span className={styles.discountBadge}>🎉 割引対象（5の倍数）</span>}
                </div>
              </div>
              <button onClick={() => setKarteModalOpen(false)} className={styles.closeBtn}>✕</button>
            </div>
            
            {isKarteLoading ? (
              <div className={styles.loading}>暗号化データを読み込み中...</div>
            ) : (
              <div className={styles.modalBodyFull}>
                
                <div className={styles.karteLayout}>
                  <div className={styles.karteSidebar}>
                    <div className={styles.karteSection}>
                      <h3>基本情報</h3>
                      <p>電話番号: {karteCustomer.phone}</p>
                      <p>Web予約回数: {karteCustomer.count} 回</p>
                    </div>

                    <div className={styles.karteSection}>
                      <h3>カスタム項目（自由に増やせます）</h3>
                      {karteFields.map((field, index) => (
                        <div key={index} className={styles.customFieldRow}>
                          <input type="text" placeholder="項目名" value={field.key} onChange={(e) => updateCustomField(index, e.target.value, field.value)} className={styles.karteInputKey} />
                          <input type="text" placeholder="内容" value={field.value} onChange={(e) => updateCustomField(index, field.key, e.target.value)} className={styles.karteInputValue} />
                          <button onClick={() => removeCustomField(index)} className={styles.removeFieldBtn}>✕</button>
                        </div>
                      ))}
                      <button onClick={addCustomField} className={styles.addFieldBtn}>+ 項目を追加</button>
                    </div>
                  </div>

                  <div className={styles.karteMain}>
                    <div className={styles.karteSection} style={{ flex: 'none', height: '180px', display: 'flex', flexDirection: 'column' }}>
                      <h3>全体メモ（自由記述）</h3>
                      <textarea 
                        value={karteMemo} 
                        onChange={e => setKarteMemo(e.target.value)} 
                        placeholder="大きく見やすいテキストエリアです。"
                        className={styles.karteTextareaFull}
                      />
                    </div>

                    <div className={styles.karteSection} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <div className={styles.photoHeader}>
                        <h3>施術写真（自動圧縮・暗号化）</h3>
                        <label className={styles.photoUploadBtn}>
                          + 写真を追加する
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                        </label>
                      </div>
                      <div className={styles.photoGrid}>
                        {kartePhotos.map((photo, index) => (
                          <div key={index} className={styles.photoCard}>
                            <img 
                              src={photo} 
                              alt={`施術写真 ${index + 1}`} 
                              className={styles.photoImg} 
                              onClick={() => setSelectedImage(photo)}
                              style={{ cursor: 'pointer' }}
                            />
                            <button onClick={() => removePhoto(index)} className={styles.removePhotoBtn}>削除</button>
                          </div>
                        ))}
                        {kartePhotos.length === 0 && <p className={styles.hint}>写真は登録されていません。</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <span className={styles.securityBadge}>🔒 データはすべて暗号化されて安全に保存されます</span>
                  <button onClick={handleSaveKarte} disabled={isKarteSaving} className={`btn btn-primary ${styles.saveKarteBtn}`}>
                    {isKarteSaving ? '保存中...' : '暗号化して保存'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className={styles.lightboxOverlay} onClick={() => setSelectedImage(null)}>
          <div className={styles.lightboxContent}>
            <img src={selectedImage} alt="拡大写真" className={styles.lightboxImg} />
            <button className={styles.lightboxClose} onClick={() => setSelectedImage(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}
