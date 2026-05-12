import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';

// ─── Mock data ─────────────────────────────────────────────────
const POSTS = [
  {
    id: 1, type: 'SCORE_ACHIEVEMENT',
    user: { name: 'Linh Nguyen', initial: 'L', color: '#4CAF50' },
    time: '2h ago',
    content: "Just got my IELTS Writing score back. Months of Task 2 practice finally paid off! 🎉",
    achievement: { skill: 'Writing', score: 8.0, color: '#FF9800', label: 'Well above average' },
    likes: 34, comments: 12,
  },
  {
    id: 2, type: 'STUDY_TIP',
    user: { name: 'Minh Tran', initial: 'M', color: '#2196F3' },
    time: '4h ago',
    content: "3 things that boosted my Reading score:\n\n① Skim the questions before the passage\n② Process of elimination for True/False/NG\n③ 20 min hard cap per passage — no exceptions",
    likes: 67, comments: 23,
  },
  {
    id: 3, type: 'POST',
    user: { name: 'Thu Pham', initial: 'T', color: '#F44336' },
    time: '6h ago',
    content: "Starting Stage 3 Advanced today. The difficulty jump is real 😅 Anyone have tips for Academic Task 2 structure?",
    likes: 28, comments: 8,
  },
  {
    id: 4, type: 'SCORE_ACHIEVEMENT',
    user: { name: 'Duc Le', initial: 'D', color: '#7c3aed' },
    time: '1d ago',
    content: "Finally cracked 8.5 in Listening after 3 months of daily shadowing. The AI feedback made the difference.",
    achievement: { skill: 'Listening', score: 8.5, color: '#2196F3', label: 'Exceptional score' },
    likes: 89, comments: 31,
  },
  {
    id: 5, type: 'STUDY_TIP',
    user: { name: 'Mai Nguyen', initial: 'M', color: '#FF9800' },
    time: '2d ago',
    content: "Speaking 6.0 → 7.5 in 3 months: record every session and listen back. You'll catch hesitation patterns you didn't know you had.",
    likes: 156, comments: 47,
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'Minh Tran',   initial: 'M', color: '#2196F3', score: 9.0,  streak: 45 },
  { rank: 2, name: 'Thu Pham',    initial: 'T', color: '#F44336', score: 8.5,  streak: 32 },
  { rank: 3, name: 'Duc Le',      initial: 'D', color: '#7c3aed', score: 8.5,  streak: 28 },
  { rank: 4, name: 'Linh (You)',  initial: 'L', color: '#FFC600', score: 8.0,  streak: 7,  isMe: true },
  { rank: 5, name: 'Mai Nguyen',  initial: 'M', color: '#FF9800', score: 7.5,  streak: 15 },
  { rank: 6, name: 'Hoang Vu',    initial: 'H', color: '#4CAF50', score: 7.5,  streak: 12 },
  { rank: 7, name: 'An Pham',     initial: 'A', color: '#64748b', score: 7.0,  scoreDisplay: '7.0', streak: 9  },
];

// ─── Shared components ─────────────────────────────────────────
function Avatar({ initial, color, size = 38 }: { initial: string; color: string; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color + '1a', borderColor: color + '33', borderWidth: 2,
      alignItems: 'center', justifyContent: 'center'
    }}>
      <Text style={{ fontFamily: 'Farro-Bold', fontSize: size * 0.38, color }}>
        {initial}
      </Text>
    </View>
  );
}

function HexBadge({ score, color, size = 54 }: { score: number; color: string; size?: number }) {
  // Fallback to rounded square for React Native without SVG
  return (
    <View style={{ 
      width: size, height: size, 
      backgroundColor: color + '28', 
      borderRadius: 16,
      alignItems: 'center', justifyContent: 'center'
    }}>
      <View style={{
        width: size * 0.78, height: size * 0.78,
        backgroundColor: color,
        borderRadius: 12,
        alignItems: 'center', justifyContent: 'center'
      }}>
        <Text style={{ color: '#fff', fontFamily: 'Farro-Bold', fontSize: size * 0.25 }}>
          {score.toFixed(1)}
        </Text>
      </View>
    </View>
  );
}

function TypePill({ type }: { type: string }) {
  if (type === 'STUDY_TIP') {
    return (
      <View style={[styles.pill, { backgroundColor: 'rgba(255,198,0,.18)' }]}>
        <Ionicons name="bulb" size={10} color="#92650a" />
        <Text style={[styles.pillText, { color: '#92650a' }]}>STUDY TIP</Text>
      </View>
    );
  }
  if (type === 'SCORE_ACHIEVEMENT') {
    return (
      <View style={[styles.pill, { backgroundColor: 'rgba(76,175,80,.12)' }]}>
        <Ionicons name="trophy" size={10} color="#2e7d32" />
        <Text style={[styles.pillText, { color: '#2e7d32' }]}>ACHIEVEMENT</Text>
      </View>
    );
  }
  return null;
}

// ─── Post card ─────────────────────────────────────────────────
function PostCard({ post, liked, onLike }: { post: any; liked: boolean; onLike: () => void }) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Avatar initial={post.user.initial} color={post.user.color} />
        <View style={styles.postUserMeta}>
          <View style={styles.postUserRow}>
            <Text style={styles.postUserName}>{post.user.name}</Text>
            {post.type !== 'POST' && <TypePill type={post.type} />}
          </View>
          <Text style={styles.postTime}>{post.time}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {post.achievement && (
        <View style={[styles.achievementBlock, { backgroundColor: post.achievement.color + '12', borderColor: post.achievement.color + '28' }]}>
          <HexBadge score={post.achievement.score} color={post.achievement.color} />
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.achieveSkill, { color: post.achievement.color }]}>{post.achievement.skill}</Text>
            <Text style={styles.achieveScore}>
              {post.achievement.score.toFixed(1)} <Text style={styles.achieveMax}>/ 9.0</Text>
            </Text>
            <Text style={styles.achieveLabel}>{post.achievement.label}</Text>
          </View>
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity onPress={onLike} style={styles.actionBtn}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={16} color={liked ? "#ef4444" : "#9ca3af"} />
          <Text style={[styles.actionText, { color: liked ? "#ef4444" : "#9ca3af" }]}>{post.likes + (liked ? 1 : 0)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={16} color="#9ca3af" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="share-outline" size={18} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="bookmark-outline" size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Create post box ────────────────────────────────────────────
function CreatePostBox() {
  return (
    <View style={styles.createBox}>
      <View style={styles.createRow}>
        <Avatar initial="L" color="#FFC600" size={34} />
        <Text style={styles.createPlaceholder}>Share with the community…</Text>
        <TouchableOpacity style={styles.postBtn}>
          <Text style={styles.postBtnText}>POST</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.createTools}>
        {[
          { icon: 'image-outline', label: 'Photo' },
          { icon: 'bar-chart-outline', label: 'Poll' },
          { icon: 'happy-outline', label: 'Emoji' }
        ].map((tool, idx) => (
          <TouchableOpacity key={idx} style={styles.toolBtn}>
            <Ionicons name={tool.icon as any} size={16} color="#FFC600" />
            <Text style={styles.toolText}>{tool.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Leaderboard ───────────────────────────────────────────────
const RANK_COLOR: Record<number, string> = { 1: '#FFC600', 2: '#94a3b8', 3: '#cd7f32' };

function LeaderboardView() {
  const top3 = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const colH: Record<number, number> = { 1: 90, 2: 68, 3: 52 };

  return (
    <View style={styles.leaderboardContainer}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardPeriod}>May 2026 · All Skills</Text>
        <View style={styles.top10Badge}>
          <Ionicons name="trophy" size={12} color="#92650a" />
          <Text style={styles.top10Text}>TOP 10</Text>
        </View>
      </View>

      <View style={styles.podiumContainer}>
        {podiumOrder.map(user => {
          const col = RANK_COLOR[user.rank];
          const isFirst = user.rank === 1;
          const avatarSize = isFirst ? 52 : 44;
          return (
            <View key={user.rank} style={styles.podiumItem}>
              {isFirst ? <Text style={{ fontSize: 20, marginBottom: 2 }}>👑</Text> : <View style={{ height: 26 }} />}
              <View style={{ position: 'relative' }}>
                <View style={[styles.podiumAvatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize/2, backgroundColor: user.color + '20', borderColor: col }]}>
                  <Text style={[styles.podiumInitial, { color: user.color, fontSize: avatarSize * 0.37 }]}>{user.initial}</Text>
                </View>
                <View style={[styles.podiumRankBadge, { backgroundColor: col }]}>
                  <Text style={[styles.podiumRankText, { color: isFirst ? '#212529' : '#fff' }]}>{user.rank}</Text>
                </View>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{user.name.split(' ')[0]}</Text>
              <Text style={[styles.podiumScore, { color: col }]}>{user.score.toFixed(1)}</Text>
              <View style={[styles.podiumBlock, { height: colH[user.rank], backgroundColor: col + (isFirst ? '28' : '18'), borderColor: col + '35' }]}>
                <Text style={[styles.podiumBlockText, { color: col + 'aa', fontSize: isFirst ? 26 : 20 }]}>{user.rank}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.rankList}>
        {rest.map(user => (
          <View key={user.rank} style={[styles.rankItem, user.isMe && styles.rankItemMe]}>
            <Text style={styles.rankNum}>#{user.rank}</Text>
            <Avatar initial={user.initial} color={user.color} size={34} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.rankName}>{user.name}</Text>
              <View style={styles.streakRow}>
                <Ionicons name="flame" size={12} color="#f97316" />
                <Text style={styles.streakText}>{user.streak} day streak</Text>
              </View>
            </View>
            <Text style={styles.rankScore}>{user.score.toFixed(1)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────
export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const [likedPosts, setLikedPosts] = useState(new Set<number>());

  const allTabs = [
    { id: 'all',          icon: 'albums-outline', label: 'All Posts'     },
    { id: 'tips',         icon: 'bulb-outline',   label: 'Study Tips'    },
    { id: 'achievements', icon: 'trophy-outline', label: 'Achievements'  },
    { id: 'leaderboard',  icon: 'bar-chart-outline', label: 'Leaderboard' },
  ];

  const filtered = useMemo(() => {
    if (activeTab === 'tips')         return POSTS.filter(p => p.type === 'STUDY_TIP');
    if (activeTab === 'achievements') return POSTS.filter(p => p.type === 'SCORE_ACHIEVEMENT');
    return POSTS;
  }, [activeTab]);

  const toggleLike = (id: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSubtitle}>LEXON</Text>
            <Text style={styles.headerTitle}>Community</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
              <Ionicons name="create" size={20} color="#212529" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
          {allTabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity 
                key={tab.id} 
                onPress={() => setActiveTab(tab.id)}
                style={[styles.filterTab, active && styles.filterTabActive]}
              >
                <Ionicons name={tab.icon as any} size={14} color={active ? '#212529' : '#64748b'} />
                <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab !== 'leaderboard' && <CreatePostBox />}

        {activeTab === 'leaderboard' ? (
          <LeaderboardView />
        ) : (
          <View style={{ gap: 10 }}>
            {filtered.map(post => (
              <PostCard
                key={post.id}
                post={post}
                liked={likedPosts.has(post.id)}
                onLike={() => toggleLike(post.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: 'rgba(248,249,250,0.97)',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  headerSubtitle: { fontFamily: 'Farro-Bold', fontSize: 10, color: '#9ca3af', letterSpacing: 1 },
  headerTitle: { fontFamily: 'Farro-Bold', fontSize: 24, color: '#212529' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center'
  },
  filterTabs: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0',
  },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterTabText: { fontFamily: 'Farro-Bold', fontSize: 13, color: '#64748b' },
  filterTabTextActive: { color: '#212529' },
  
  content: { padding: 16, paddingBottom: 30 },
  
  createBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 12,
  },
  createRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  createPlaceholder: { flex: 1, fontFamily: 'Farro-Medium', fontSize: 14, color: '#9ca3af' },
  postBtn: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  postBtnText: { fontFamily: 'Farro-Bold', fontSize: 12, color: '#212529' },
  createTools: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  toolBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 16 },
  toolText: { fontFamily: 'Farro-Bold', fontSize: 13, color: COLORS.primary },
  
  postCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  postUserMeta: { flex: 1, marginLeft: 10 },
  postUserRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  postUserName: { fontFamily: 'Farro-Bold', fontSize: 15, color: '#212529' },
  postTime: { fontFamily: 'Farro-Medium', fontSize: 12, color: '#9ca3af', marginTop: 2 },
  postContent: { fontFamily: 'Farro-Regular', fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 12 },
  
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 12 },
  pillText: { fontFamily: 'Farro-Bold', fontSize: 10, letterSpacing: 0.5 },
  
  achievementBlock: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  achieveSkill: { fontFamily: 'Farro-Bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  achieveScore: { fontFamily: 'Farro-Bold', fontSize: 22, color: '#212529' },
  achieveMax: { fontSize: 13, color: '#94a3b8' },
  achieveLabel: { fontFamily: 'Farro-Medium', fontSize: 13, color: '#64748b', marginTop: 2 },
  
  postActions: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f9fafb' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 16 },
  actionText: { fontFamily: 'Farro-Bold', fontSize: 13, color: '#9ca3af' },
  iconBtn: { padding: 4, marginLeft: 8 },

  leaderboardContainer: { paddingBottom: 10 },
  leaderboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  leaderboardPeriod: { fontFamily: 'Farro-Bold', fontSize: 13, color: '#64748b' },
  top10Badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,198,0,.14)', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  top10Text: { fontFamily: 'Farro-Bold', fontSize: 11, color: '#92650a' },
  
  podiumContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10, marginBottom: 24 },
  podiumItem: { alignItems: 'center', gap: 4 },
  podiumAvatar: { borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  podiumInitial: { fontFamily: 'Farro-Bold' },
  podiumRankBadge: { position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#f8f9fa', alignItems: 'center', justifyContent: 'center' },
  podiumRankText: { fontFamily: 'Farro-Bold', fontSize: 10 },
  podiumName: { fontFamily: 'Farro-Bold', fontSize: 12, color: '#212529', marginTop: 4, maxWidth: 80, textAlign: 'center' },
  podiumScore: { fontFamily: 'Farro-Bold', fontSize: 14 },
  podiumBlock: { width: 90, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  podiumBlockText: { fontFamily: 'Farro-Bold' },
  
  rankList: { gap: 8 },
  rankItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#f0f0f0' },
  rankItemMe: { backgroundColor: 'rgba(255,198,0,.08)', borderColor: 'rgba(255,198,0,.45)' },
  rankNum: { width: 26, textAlign: 'center', fontFamily: 'Farro-Bold', fontSize: 13, color: '#9ca3af' },
  rankName: { fontFamily: 'Farro-Bold', fontSize: 14, color: '#212529' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  streakText: { fontFamily: 'Farro-Bold', fontSize: 12, color: '#64748b' },
  rankScore: { fontFamily: 'Farro-Bold', fontSize: 16, color: '#212529', marginLeft: 10 },
});
