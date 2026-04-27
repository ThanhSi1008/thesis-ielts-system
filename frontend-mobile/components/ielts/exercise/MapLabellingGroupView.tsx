import React from 'react';
import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS } from '@/constants';
import { styles } from './styles';
import { ExplanationView } from './ExplanationView';
import { Ionicons } from '@expo/vector-icons';

export function MapLabellingGroupView({ group, answers, submitted, onAnswer }: any) {
  const isMapOrDiagram = ['map_labelling', 'plan_labelling', 'diagram_labelling'].includes(group.type);
  const qs = group.items || group.questions || [];
  const rawOptions = group.options || [];
  const labels = group.labels || rawOptions.map((o: any) => o.letter) || [];

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.groupType}>{group.type.replace(/_/g, ' ')}</Text>
      {(group.instructions || group.heading) && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>{group.instructions || group.heading}</Text>
        </View>
      )}

      {group.image_url && (
        <View style={{ alignItems: 'center', marginBottom: 16, backgroundColor: '#fff', padding: 8, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border }}>
          <Image 
            source={{ uri: group.image_url }} 
            style={{ width: '100%', height: 250 }} 
            resizeMode="contain" 
          />
        </View>
      )}

      {rawOptions.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.textMuted, marginTop: 4 }}>OPTIONS:</Text>
          {rawOptions.map((opt: any) => (
            <View key={opt.letter} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ fontWeight: 'bold', marginRight: 4 }}>{opt.letter}</Text>
              <Text style={{ color: COLORS.textMuted }}>· {opt.text}</Text>
            </View>
          ))}
        </View>
      )}

      {labels.length > 0 ? (
        <View style={{ backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
             <View style={{ flex: 2, padding: 12, borderRightWidth: 1, borderRightColor: COLORS.border }}><Text style={{ fontWeight: 'bold' }}>Question</Text></View>
             <View style={{ flex: 3, padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Text style={{ fontWeight: 'bold', width: '100%' }}>Options</Text>
             </View>
          </View>
          {qs.map((q: any, idx: number) => {
            const qNum = q.question_number;
            const sel = answers[qNum] ?? '';
            const isCorrect = submitted && sel.toUpperCase() === (q.answer || '').toUpperCase();
            
            return (
              <View key={qNum} style={{ borderBottomWidth: idx === qs.length - 1 ? 0 : 1, borderBottomColor: COLORS.border, padding: 12 }}>
                 <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={styles.qNumBadge}><Text style={styles.qNumBadgeText}>{qNum}</Text></View>
                    <Text style={{ flex: 1, marginLeft: 8, fontSize: FONT_SIZES.sm }}>{q.text}</Text>
                 </View>
                 <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {labels.map((lbl: string) => {
                       const isSelected = sel.toUpperCase() === lbl.toUpperCase();
                       const isActualAnswer = (q.answer || '').toUpperCase() === lbl.toUpperCase();
                       
                       let bg: string = '#fff';
                       let borderColor: string = COLORS.border;
                       let textColor: string = COLORS.text;
                       
                       if (submitted && isActualAnswer) { bg = '#DCFCE7'; borderColor = '#86EFAC'; textColor = '#16A34A'; }
                       else if (submitted && isSelected && !isCorrect) { bg = '#FEE2E2'; borderColor = '#FCA5A5'; textColor = '#DC2626'; }
                       else if (!submitted && isSelected) { bg = '#EFF6FF'; borderColor = '#3B82F6'; textColor = '#1D4ED8'; }
                       
                       return (
                         <TouchableOpacity
                           key={lbl}
                           style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: RADIUS.md, borderWidth: 1, backgroundColor: bg, borderColor }}
                           onPress={() => !submitted && onAnswer(qNum, lbl)}
                         >
                           <Text style={{ fontSize: FONT_SIZES.sm, color: textColor, fontWeight: isSelected ? '700' : '500' }}>{lbl}</Text>
                         </TouchableOpacity>
                       )
                    })}
                 </View>
                 {submitted && q.explanation && <ExplanationView explanation={q.explanation} isCorrect={isCorrect} />}
              </View>
            )
          })}
        </View>
      ) : (
        <View style={{ backgroundColor: '#F0F9FF', padding: 16, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#BAE6FD' }}>
          {qs.map((q: any) => {
            const qNum = q.question_number;
            const val = answers[qNum] ?? '';
            const correctArr = (q.acceptable_answers ?? [q.answer ?? '']).map((a: string) => a.toLowerCase().trim());
            const isCorrect = submitted && correctArr.includes(val.trim().toLowerCase());

            return (
              <View key={qNum} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <View style={styles.qNumBadge}><Text style={styles.qNumBadgeText}>{qNum}</Text></View>
                <Text style={{ marginLeft: 8, marginTop: 4, marginRight: 8, fontSize: FONT_SIZES.sm, fontWeight: '600' }}>{q.label_context || q.text}</Text>
                
                <View style={{ flex: 1, minWidth: 150 }}>
                  <TextInput
                    style={[
                      styles.input,
                      { paddingVertical: 6, paddingHorizontal: 10, minHeight: 36, marginTop: 0 },
                      submitted && isCorrect && { borderColor: '#86EFAC', backgroundColor: '#DCFCE7', color: '#16A34A' },
                      submitted && !isCorrect && { borderColor: '#FCA5A5', backgroundColor: '#FEE2E2', color: '#DC2626' },
                    ]}
                    value={val}
                    onChangeText={v => !submitted && onAnswer(qNum, v)}
                    editable={!submitted}
                    placeholder="Your answer"
                  />
                  {submitted && !isCorrect && (
                    <Text style={{ fontSize: FONT_SIZES.xs, color: '#16A34A', fontWeight: 'bold', marginTop: 4 }}>
                      → {q.answer}
                    </Text>
                  )}
                  {submitted && q.explanation && <ExplanationView explanation={q.explanation} isCorrect={isCorrect} />}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
