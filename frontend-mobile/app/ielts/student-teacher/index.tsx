import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Clipboard,
} from 'react-native';
import { ConfirmDialog } from '@/components';
import { toast } from '@/components/ui/index';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, ROUTES } from '@/constants';
import { studentTeacherApi } from '@/services/ielts.api';
import { useAuth } from '@/contexts/AuthContext';

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ first, last, size = 44 }: { first?: string; last?: string; size?: number }) {
  const initials = `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
  return (
    <View style={[av.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[av.text, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}
const av = StyleSheet.create({
  circle: { backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontFamily: FONTS.bold },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function StudentTeacherScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);

  // Student tab state
  const [teacherIdInput, setTeacherIdInput] = useState('');
  const [linking, setLinking] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [unlinkTarget, setUnlinkTarget] = useState<{ id: string; name: string } | null>(null);

  // Teacher tab state
  const [students, setStudents] = useState<any[]>([]);

  // Copy teacher ID
  const [copied, setCopied] = useState(false);
  const copyId = () => {
    if (user?.id) {
      Clipboard.setString(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'student') {
        const data = await studentTeacherApi.getMyTeachers();
        setTeachers(data);
      } else {
        const data = await studentTeacherApi.getMyStudents();
        setStudents(data);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLink = async () => {
    if (!teacherIdInput.trim()) return;
    setLinking(true);
    try {
      await studentTeacherApi.linkTeacher(teacherIdInput.trim());
      setTeacherIdInput('');
      toast.success('Success', 'Successfully linked to teacher!');
      load();
    } catch (e: any) {
      toast.error('Error', e?.message || 'Failed to link teacher. Check the ID and try again.');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = (teacherId: string, name: string) => {
    setUnlinkTarget({ id: teacherId, name });
  };

  const confirmUnlink = async () => {
    if (!unlinkTarget) return;
    try {
      await studentTeacherApi.unlinkTeacher(unlinkTarget.id);
      load();
    } catch {
      toast.error('Error', 'Failed to unlink teacher.');
    } finally {
      setUnlinkTarget(null);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Student / Teacher</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {(['student', 'teacher'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={tab === 'student' ? 'school-outline' : 'people-outline'}
              size={16}
              color={activeTab === tab ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === 'student' ? 'Student Mode' : 'Teacher Mode'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── STUDENT TAB ─────────────────────────────────────────── */}
        {activeTab === 'student' && (
          <>
            <View style={s.infoBanner}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
              <Text style={s.infoText}>
                Link with your teacher by entering their Teacher ID below. They can then view your
                IELTS progress.
              </Text>
            </View>

            {/* Link teacher input */}
            <View style={s.card}>
              <Text style={s.cardTitle}>🔗 Link to a Teacher</Text>
              <Text style={s.cardSub}>Ask your teacher for their unique ID.</Text>
              <View style={s.linkRow}>
                <TextInput
                  style={s.idInput}
                  value={teacherIdInput}
                  onChangeText={setTeacherIdInput}
                  placeholder="Paste Teacher ID here…"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[s.linkBtn, (!teacherIdInput.trim() || linking) && { opacity: 0.5 }]}
                  onPress={handleLink}
                  disabled={!teacherIdInput.trim() || linking}
                  activeOpacity={0.8}
                >
                  {linking ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={s.linkBtnText}>Link</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* My teachers */}
            <Text style={s.sectionTitle}>My Teachers</Text>
            {loading ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
            ) : teachers.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyIcon}>🎓</Text>
                <Text style={s.emptyTitle}>No teachers linked yet</Text>
                <Text style={s.emptySub}>When you link with a teacher, they will appear here.</Text>
              </View>
            ) : (
              teachers.map((link) => {
                const t = link.teacher;
                const name =
                  [t.firstName, t.lastName].filter(Boolean).join(' ') || 'Unknown Teacher';
                return (
                  <View key={link.id} style={s.personRow}>
                    <Avatar first={t.firstName} last={t.lastName} />
                    <View style={s.personInfo}>
                      <Text style={s.personName}>{name}</Text>
                      <Text style={s.personEmail}>{t.email}</Text>
                    </View>
                    <TouchableOpacity
                      style={s.unlinkBtn}
                      onPress={() => handleUnlink(t.id, name)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle-outline" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </>
        )}

        {/* ── TEACHER TAB ─────────────────────────────────────────── */}
        {activeTab === 'teacher' && (
          <>
            {/* Teacher ID card */}
            <View style={[s.card, s.teacherIdCard]}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>🪪 Your Teacher ID</Text>
                <Text style={s.cardSub}>Share this with your students.</Text>
                <Text style={s.idDisplay} numberOfLines={1}>
                  {user?.id || '—'}
                </Text>
              </View>
              <TouchableOpacity onPress={copyId} style={s.copyBtn} activeOpacity={0.8}>
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={18}
                  color={copied ? '#16a34a' : COLORS.primary}
                />
                <Text style={[s.copyBtnText, copied && { color: '#16a34a' }]}>
                  {copied ? 'Copied!' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Student list */}
            <Text style={s.sectionTitle}>My Students</Text>
            {loading ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
            ) : students.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyIcon}>📋</Text>
                <Text style={s.emptyTitle}>No students linked yet</Text>
                <Text style={s.emptySub}>
                  Share your Teacher ID with students to see their progress here.
                </Text>
              </View>
            ) : (
              students.map((link) => {
                const st = link.student;
                const name =
                  [st.firstName, st.lastName].filter(Boolean).join(' ') || 'Unknown Student';
                const linkedDate = new Date(link.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <TouchableOpacity
                    key={link.id}
                    style={s.personRow}
                    onPress={() => router.push(ROUTES.ieltsStudentDetail(st.id) as any)}
                    activeOpacity={0.8}
                  >
                    <Avatar first={st.firstName} last={st.lastName} />
                    <View style={s.personInfo}>
                      <Text style={s.personName}>{name}</Text>
                      <Text style={s.personEmail}>{st.email}</Text>
                      <Text style={s.personMeta}>Linked {linkedDate}</Text>
                    </View>
                    <View style={s.viewStatsBtn}>
                      <Ionicons name="bar-chart-outline" size={14} color={COLORS.primary} />
                      <Text style={s.viewStatsBtnText}>Stats</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>
      <ConfirmDialog
        visible={!!unlinkTarget}
        onClose={() => setUnlinkTarget(null)}
        variant="destructive"
        title={`Unlink ${unlinkTarget?.name}?`}
        message="They will no longer see your progress."
        primaryAction={{
          title: 'Unlink',
          onPress: confirmUnlink,
        }}
        secondaryAction={{
          title: 'Cancel',
          onPress: () => setUnlinkTarget(null),
        }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary },
  scroll: { padding: SPACING.lg, paddingBottom: 60 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + '10',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  infoText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.text, lineHeight: 18 },
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  teacherIdCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  cardTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  cardSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginBottom: SPACING.md },
  linkRow: { flexDirection: 'row', gap: SPACING.sm },
  idInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  linkBtn: {
    height: 44,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkBtnText: { color: '#fff', fontFamily: FONTS.bold, fontSize: FONT_SIZES.sm },
  idDisplay: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: FONTS.bold,
    letterSpacing: 0.3,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '0D',
  },
  copyBtnText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.bold, color: COLORS.primary },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
  },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.md },
  emptyTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  personInfo: { flex: 1 },
  personName: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.text },
  personEmail: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  personMeta: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  unlinkBtn: { padding: 4 },
  viewStatsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.primary + '10',
    borderRadius: RADIUS.full,
  },
  viewStatsBtnText: { fontSize: 10, fontFamily: FONTS.bold, color: COLORS.primary },
});
