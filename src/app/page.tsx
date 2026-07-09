import styles from './page.module.css';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { AnimatedScissors, AnimatedSignPole, AnimatedShaver } from '../components/AnimatedCharacters';
import BannerCarousel from '../components/BannerCarousel';

const prisma = new PrismaClient();

export default async function Home() {
  const settingsRecord = await prisma.settings.findFirst();
  let banners: {image: string, link: string}[] = [];
  if (settingsRecord && settingsRecord.banners) {
    try {
      banners = JSON.parse(settingsRecord.banners);
    } catch(e) {}
  }

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            プライベート理容室
          </h1>
          <p className={styles.subtitle}>さいたま市見沼区七里・ヘアーサロンSHINSEI</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
            <Link href="/booking" className={`btn btn-primary ${styles.heroBtn}`} style={{ margin: 0 }}>
              WEB予約はこちら
            </Link>
            <Link href="/cancel" className={`btn btn-outline`} style={{ margin: 0, background: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'white' }}>
              予約の確認・キャンセル
            </Link>
          </div>
        </div>
      </section>

      {/* Banners Section */}
      {banners.length > 0 && (
        <section className={styles.bannerSection} style={{ padding: '20px 0', background: '#fdfbf7' }}>
          <BannerCarousel banners={banners} />
        </section>
      )}

      {/* Concept Section */}
      <section id="concept" className={styles.section} style={{ overflow: 'hidden' }}>
        <div className="container">
          <div className={styles.sectionHeaderFlex}>
            <div>
              <span className={styles.sectionSubtitle}>Concept</span>
              <h2 className={styles.sectionTitle}>SHINSEIのこだわり</h2>
            </div>
            <div style={{ marginTop: '20px', paddingRight: '10px' }}>
              <AnimatedScissors />
            </div>
          </div>
          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <div className={styles.conceptIcon}>✂️</div>
              <h3>完全マンツーマン</h3>
              <p>最初から最後まで、熟練のオーナーが責任を持って担当いたします。他のお客様を気にすることなく、リラックスした時間をお過ごしください。</p>
            </div>
            <div className={styles.conceptCard}>
              <div className={styles.conceptIcon}>☕</div>
              <h3>癒やしの空間</h3>
              <p>日常の喧騒から離れ、心からくつろげる落ち着いた空間。髪を切るだけでなく、リフレッシュできる時間を提供します。</p>
            </div>
            <div className={styles.conceptCard}>
              <div className={styles.conceptIcon}>✨</div>
              <h3>安定した技術と接客</h3>
              <p>長年の経験に裏打ちされた確かな技術で、お客様一人ひとりの骨格や髪質、ライフスタイルに合わせた最適なスタイルをご提案します。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className={`${styles.section} ${styles.bgLight}`} style={{ overflow: 'hidden' }}>
        <div className="container">
          <div className={styles.sectionHeaderFlex}>
            <div style={{ paddingLeft: '10px' }}>
              <AnimatedShaver />
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={styles.sectionSubtitle}>Menu</span>
              <h2 className={styles.sectionTitle}>メニュー・料金</h2>
            </div>
          </div>
          <div className={styles.menuList}>
            <div className={styles.menuItem}>
              <div className={styles.menuInfo}>
                <h3>総合調髪</h3>
                <p>カット・顔剃り・シャンプー・ブロー</p>
              </div>
              <div className={styles.menuPrice}>¥4,500</div>
            </div>
            <div className={styles.menuItem}>
              <div className={styles.menuInfo}>
                <h3>カット＆シャンプー</h3>
                <p>顔剃りなしのコース</p>
              </div>
              <div className={styles.menuPrice}>¥3,800</div>
            </div>
            <div className={styles.menuItem}>
              <div className={styles.menuInfo}>
                <h3>白髪染め（カット込）</h3>
                <p>丁寧なカラーリングとカットのセット</p>
              </div>
              <div className={styles.menuPrice}>¥7,500〜</div>
            </div>
          </div>
          <p className={styles.menuNote}>※料金は税込価格の目安です。詳細はお問い合わせください。</p>
        </div>
      </section>
      
      {/* Access Section */}
      <section id="access" className={styles.section} style={{ overflow: 'hidden' }}>
        <div className="container">
          <div className={styles.sectionHeaderFlex}>
            <div>
              <span className={styles.sectionSubtitle}>Access</span>
              <h2 className={styles.sectionTitle}>店舗情報</h2>
            </div>
            <div style={{ paddingRight: '20px' }}>
              <AnimatedSignPole />
            </div>
          </div>
          <div className={styles.accessContent}>
            <div className={styles.accessInfo}>
              <div className={styles.infoRow}>
                <strong>店舗名</strong>
                <span>ヘアーサロンSHINSEI</span>
              </div>
              <div className={styles.infoRow}>
                <strong>住所</strong>
                <span>
                  <a href="https://maps.app.goo.gl/mfV2tZtRcuye1JLi6" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit' }}>
                    〒337-0016 埼玉県さいたま市見沼区
                  </a>
                  <br/>（七里駅から徒歩10分）
                </span>
              </div>
              <div className={styles.infoRow}>
                <strong>営業時間</strong>
                <span>09:00 - 19:00</span>
              </div>
              <div className={styles.infoRow}>
                <strong>電話番号（予約用フリーコール）</strong>
                <span>0800-222-1058</span>
              </div>
              <div className={styles.infoRow}>
                <strong>定休日</strong>
                <span>毎週月曜日、第2・第3火曜日（連休）</span>
              </div>
              <div className={styles.infoRow}>
                <strong>駐車場</strong>
                <span>あり（店舗前）</span>
              </div>
            </div>
            <div className={styles.map}>
              <a 
                href="https://maps.app.goo.gl/mfV2tZtRcuye1JLi6" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ display: 'block', width: '100%', cursor: 'pointer' }}
              >
                <iframe 
                  src="https://maps.google.com/maps?q=埼玉県さいたま市見沼区&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  style={{ border: 0, aspectRatio: '1 / 1', borderRadius: '8px', pointerEvents: 'none' }} 
                  allowFullScreen 
                  loading="lazy">
                </iframe>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Review Section */}
      <section className={`${styles.section} ${styles.bgLight}`} style={{ padding: '40px 0', borderTop: '1px solid #e8dcc4' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h2 style={{ color: '#5d4037', fontSize: '1.4rem', marginBottom: '15px' }}>ご来店いただいたお客様へ</h2>
          <p style={{ color: '#555', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '20px' }}>
            いつもSHINSEIをご利用いただき誠にありがとうございます。<br/>
            お客様にとってより心地よい空間づくりのため、皆様のお声を大切にしております。もし当店の施術やサービスにご満足いただけましたら、ぜひご感想をお寄せいただけますと幸いです。
          </p>
          <a 
            href="https://share.google/hTxpf1rHtETO1Z7TF" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary"
            style={{ 
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              padding: '15px 30px',
              backgroundColor: '#4285F4',
              borderColor: '#4285F4',
              color: 'white',
              boxShadow: '0 4px 15px rgba(66, 133, 244, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>⭐️</span> Googleマップに感想を書く
          </a>
        </div>
      </section>

      {/* Floating Action Button for Mobile */}
      <div className={styles.fabContainer}>
        <Link href="/booking" className={`btn btn-primary ${styles.fab}`}>
          WEBで予約する
        </Link>
      </div>
    </div>
  );
}
