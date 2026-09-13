'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Baby,
  BookOpen,
  Dumbbell,
  Trophy,
  Target,
  Shield,
  LogOut,
  ChevronRight,
  ChevronLeft,
  User,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'نظرة عامة', id: 'nav-overview' },
  { href: '/admin/users', icon: Users, label: 'المستخدمون', id: 'nav-users' },
  { href: '/admin/children', icon: Baby, label: 'الأطفال', id: 'nav-children' },
  { href: '/admin/lessons', icon: BookOpen, label: 'الدروس', id: 'nav-lessons' },
  { href: '/admin/exercises', icon: Dumbbell, label: 'التمارين', id: 'nav-exercises' },
  { href: '/admin/badges', icon: Trophy, label: 'الشارات', id: 'nav-badges' },
  { href: '/admin/challenges', icon: Target, label: 'التحديات', id: 'nav-challenges' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      router.replace('/admin/login');
      return;
    }
    try {
      setAdminUser(JSON.parse(user));
    } catch {
      router.replace('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.replace('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          width: sidebarOpen ? '260px' : '72px',
        }}
      >
        {/* Logo */}
        <div style={styles.sidebarLogo}>
          <div style={styles.logoIconBox}>
            <Shield size={22} color="#C084FC" strokeWidth={1.5} />
          </div>
          {sidebarOpen && (
            <div style={styles.logoText}>
              <span style={styles.logoTitle}>Admin</span>
              <span style={styles.logoSub}>LearnWithAI</span>
            </div>
          )}
          <button
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={styles.toggleBtn}
            title={sidebarOpen ? 'طي الشريط الجانبي' : 'توسيع الشريط الجانبي'}
          >
            {sidebarOpen
              ? <ChevronRight size={14} color="rgba(255,255,255,0.5)" />
              : <ChevronLeft size={14} color="rgba(255,255,255,0.5)" />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                id={item.id}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                }}
                title={item.label}
              >
                <span style={styles.navIconWrap}>
                  <Icon
                    size={18}
                    color={isActive ? '#C084FC' : 'rgba(255,255,255,0.45)'}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                </span>
                {sidebarOpen && (
                  <span style={styles.navLabel}>{item.label}</span>
                )}
                {isActive && <span style={styles.activeBar} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {adminUser && (
          <div style={styles.sidebarFooter}>
            <div style={styles.adminAvatar}>
              <User size={16} color="rgba(255,255,255,0.6)" />
            </div>
            {sidebarOpen && (
              <div style={styles.adminInfo}>
                <span style={styles.adminName}>{adminUser.name}</span>
                <span style={styles.adminEmail}>{adminUser.email}</span>
              </div>
            )}
            <button
              id="logout-btn"
              onClick={handleLogout}
              style={styles.logoutBtn}
              title="تسجيل الخروج"
            >
              <LogOut size={15} color="#F87171" />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main
        style={{
          ...styles.main,
          marginRight: sidebarOpen ? '260px' : '72px',
        }}
      >
        {children}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0D1117',
    color: '#E6EDF3',
    fontFamily: "'Tajawal', 'Nunito', sans-serif",
    direction: 'rtl',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    background: 'rgba(22, 27, 42, 0.95)',
    backdropFilter: 'blur(20px)',
    borderLeft: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 100,
    overflowX: 'hidden',
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.25rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    minHeight: '68px',
  },
  logoIconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '0.75rem',
    background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  logoTitle: {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#C084FC',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  },
  logoSub: {
    fontSize: '0.68rem',
    color: 'rgba(255,255,255,0.3)',
    whiteSpace: 'nowrap',
  },
  toggleBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    padding: '0.3rem 0.35rem',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    padding: '1rem 0.75rem',
    flex: 1,
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.7rem 0.875rem',
    borderRadius: '0.875rem',
    color: 'rgba(255,255,255,0.55)',
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    position: 'relative',
    whiteSpace: 'nowrap',
  },
  navItemActive: {
    background: 'rgba(124,58,237,0.18)',
    color: '#C084FC',
  },
  navIconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '22px',
  },
  navLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: '20%',
    height: '60%',
    width: '3px',
    background: '#7C3AED',
    borderRadius: '0 3px 3px 0',
  },
  sidebarFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  adminAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  adminInfo: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  adminName: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#E6EDF3',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  adminEmail: {
    fontSize: '0.67rem',
    color: 'rgba(255,255,255,0.3)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.18)',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    padding: '0.45rem',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  main: {
    flex: 1,
    minHeight: '100vh',
    background: '#0D1117',
    transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'auto',
  },
};
