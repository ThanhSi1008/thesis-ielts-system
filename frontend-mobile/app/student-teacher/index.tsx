import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { studentTeacherApi } from '@/services/ielts.api';
import { EmptyState, SectionHeader, Button, Badge } from '@/components/ui';

type View_ = 'students' | 'teachers';

export default function StudentTeacherScreen() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<View_>('students');
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teacherIdInput, setTeacherIdInput] = useState('');
  const [linking, setLinking] = useState(false);

  const fetchData = async () => {
    try {
      const [studRes, teachRes] = await Promise.allSettled([
        studentTeacherApi.getMyStudents(),
        studentTeacherApi.getMyTeachers(),
      ]);
      if (studRes.status === 'fulfilled') setStudents(studRes.value);
      if (teachRes.status === 'fulfilled') setTeachers(teachRes.value);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLinkTeacher = async () => {
    if (!teacherIdInput.trim()) return;
    setLinking(true);
    try {
      await studentTeacherApi.linkTeacher(teacherIdInput.trim());
      Alert.alert('Success! 🎉', 'Teacher linked successfully.');
      setTeacherIdInput('');
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Could not link teacher. Check the ID and try again.');
    } finally { setLinking(false); }
  };

  const statusColor: Record<string, string> = {
    LINKED: COLORS.success, PENDING: COLORS.warning, REJECTED: COLORS.error,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student · Teacher</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Toggle */}
      <View style={styles.toggle}>
        {(['students', 'teachers'] as View_[]).map(v => (
          <TouchableOpacity
            key={v}
            style={[styles.toggleBtn, activeView === v && styles.toggleBtnActive]}
            onPress={() => setActiveView(v)}
          >
            <Text style={[styles.toggleLabel, activeView === v && styles.toggleLabelActive]}>
              {v === 'students' ? '🎓 My Students' : '👩‍🏫 My Teachers'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        >
          {/* Link Teacher form (only on teachers view) */}
          {activeView === 'teachers' && (
            <View style={styles.linkCard}>
              <Text style={styles.linkTitle}>Link a Teacher</Text>
              <Text style={styles.linkSub}>Ask your teacher for their user ID and enter it below.</Text>
              <View style={styles.linkRow}>
                <TextInput
                  style={styles.linkInput}
                  value={teacherIdInput}
                  onChangeText={setTeacherIdInput}
                  placeholder="Teacher ID…"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                />
                <Button title="Link" onPress={handleLinkTeacher} loading={linking} disabled={!teacherIdInput.trim()} size="md" />
              </View>
            </View>
          )}

          {/* List */}
          {activeView === 'students' ? (
            students.length === 0 ? (
              <EmptyState icon="🎓" title="No students yet" subtitle="Students who link to you will appear here." />
            ) : (
              <>
                <SectionHeader title="My Students" subtitle={`${students.length} linked`} />
                {students.map((link: any) => {
                  const student = link.student || link;
                  const name = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.email;
                  return (
                    <TouchableOpacity
                      key={link.id || student.id}
                      style={styles.personCard}
                      onPress={() => router.push(`/student-teacher/${student.id}` as any)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{(name[0] || '?').toUpperCase()}</Text>
                      </View>
                      <View style={styles.personInfo}>
                        <Text style={styles.personName}>{name}</Text>
                        <Text style={styles.personEmail}>{student.email}</Text>
                      </View>
                      <View style={styles.personRight}>
                        <Badge label={link.status || 'LINKED'} color={statusColor[link.status] ?? COLORS.success} />
                        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )
          ) : (
            teachers.length === 0 ? (
              <EmptyState icon="👩‍🏫" title="No teachers linked" subtitle="Use the form above to link your teacher." />
            ) : (
              <>
                <SectionHeader title="My Teachers" subtitle={`${teachers.length} linked`} />
                {teachers.map((link: any) => {
                  const teacher = link.teacher || link;
                  const name = [teacher.firstName, teacher.lastName].filter(Boolean).join(' ') || teacher.email;
                  return (
                    <View key={link.id || teacher.id} style={styles.personCard}>
                      <View style={[styles.avatar, { backgroundColor: '#7C3AED' + '20' }]}>
                        <Text style={[styles.avatarText, { color: '#7C3AED' }]}>{(name[0] || '?').toUpperCase()}</Text>
                      </View>
                      <View style={styles.personInfo}>
                        <Text style={styles.personName}>{name}</Text>
                        <Text style={styles.personEmail}>{teacher.email}</Text>
                      </View>
                      <Badge label={link.status || 'LINKED'} color={statusColor[link.status] ?? COLORS.success} />
                    </View>
                  );
                })}
              </>
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '700' },
  toggle: {
    flexDirection: 'row', padding: SPACING.md, gap: SPACING.sm,
    borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff',
  },
  toggleBtn: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.xl, backgroundColor: COLORS.surface },
  toggleBtnActive: { backgroundColor: COLORS.primary + '15' },
  toggleLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  toggleLabelActive: { color: COLORS.primary, fontWeight: '800' },
  linkCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  linkTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  linkSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  linkRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  linkInput: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZES.sm, color: COLORS.text,
  },
  personCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.md,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary + '20', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary },
  personInfo: { flex: 1 },
  personName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  personEmail: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  personRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
});
