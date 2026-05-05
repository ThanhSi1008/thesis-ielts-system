'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications, AppNotification } from '@/contexts/NotificationContext';
import { Trophy, TrendingUp, Bell, Flame, Star, Info } from 'lucide-react';

import { EMOJI_ICON_MAP } from '@/app/profile/_components/AchievementsSection';

function NotificationIcon({ type, icon }: { type: string; icon?: string | null }) {
  if (icon?.startsWith('http')) return null; // handled by img below
  switch (type) {
    case 'ACHIEVEMENT':
      return icon === 'level_up'
        ? <TrendingUp className="w-5 h-5 text-primary" />
        : <Trophy className="w-5 h-5 text-amber-500" />;
    case 'STREAK':
      return <Flame className="w-5 h-5 text-orange-500" />;
    case 'XP':
      return <Star className="w-5 h-5 text-yellow-500" />;
    default:
      return <Info className="w-5 h-5 text-gray-400" />;
  }
}

// ─── Relative time formatter ──────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ─── Single notification row ──────────────────────────────────────────────────
function NotificationItem({ n, onClose }: { n: AppNotification; onClose: () => void }) {
  const router = useRouter();
  const { markAsRead, deleteNotification } = useNotifications();

  const handleClick = () => {
    if (!n.isRead) markAsRead(n.id);
    
    // Override older notifications that might just have '/profile' saved in the DB
    let destination = n.link;
    if (n.type === 'ACHIEVEMENT' && (!destination || destination === '/profile')) {
      destination = '/profile?tab=gamification';
    }
    
    if (destination) {
      router.push(destination);
      onClose();
    }
  };

  let displayTitle = n.title;
  let TitleIcon = null;

  for (const emoji of Object.keys(EMOJI_ICON_MAP)) {
    const normTitle = displayTitle.replace(/\uFE0F/g, '');
    const normEmoji = emoji.replace(/\uFE0F/g, '');
    
    if (normTitle.startsWith(normEmoji)) {
      TitleIcon = EMOJI_ICON_MAP[emoji];
      displayTitle = displayTitle.replace(/^[\p{Emoji}\s\uFE0F]+/u, '').trim();
      break;
    }
  }

  // Fallback if there's still a random emoji at the start
  displayTitle = displayTitle.replace(/^[\p{Emoji}\s\uFE0F]+/u, '').trim();

  return (
    <div
      className={`group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors
        ${n.isRead
          ? 'hover:bg-gray-50 dark:hover:bg-gray-800'
          : 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/15'
        }`}
      onClick={handleClick}
    >
      {/* Unread dot */}
      {!n.isRead && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      )}

      {/* Icon / Avatar */}
      <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 border border-amber-100 dark:border-amber-800 flex items-center justify-center shrink-0 overflow-hidden">
        {n.icon?.startsWith('http') ? (
          <img src={n.icon} alt="" className="w-full h-full object-cover" />
        ) : TitleIcon ? (
          <TitleIcon className="w-5 h-5" />
        ) : (
          <NotificationIcon type={n.type} icon={n.icon} />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${n.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
          {displayTitle || "Achievement Unlocked!"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{relativeTime(n.createdAt)}</p>
      </div>

      {/* Optional thumbnail */}
      {n.thumbnail && (
        <img
          src={n.thumbnail}
          alt=""
          className="w-16 h-10 rounded object-cover shrink-0 ml-1"
        />
      )}

      {/* Delete button — shown on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
        title="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Dropdown Panel ───────────────────────────────────────────────────────────
export default function NotificationDropdown() {
  const {
    notifications, isLoading, unreadCount,
    markAllAsRead, closeDropdown,
  } = useNotifications();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [closeDropdown]);

  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-[380px] rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl dark:shadow-black/50 z-50 overflow-hidden"
      style={{ top: '100%' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Notifications</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:opacity-80 font-medium transition-colors"
            >
              Mark all read
            </button>
          )}
          {/* Settings icon — placeholder */}
          <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[480px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="flex justify-center mb-3">
              <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">You're all caught up!</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">No notifications yet.</p>
          </div>
        ) : (
          notifications.map(n => (
            <NotificationItem key={n.id} n={n} onClose={closeDropdown} />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5 text-center">
          <button
            onClick={() => {
              closeDropdown();
              router.push('/profile?tab=gamification');
            }}
            className="text-sm text-primary hover:opacity-80 font-medium transition-colors"
          >
            See all notifications →
          </button>
        </div>
      )}
    </div>
  );
}
