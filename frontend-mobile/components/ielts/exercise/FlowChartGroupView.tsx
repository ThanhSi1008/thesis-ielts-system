import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS } from '@/constants';
import { styles } from './styles';
import { ExplanationView } from './ExplanationView';
import { Ionicons } from '@expo/vector-icons';

export function FlowChartGroupView({ group, answers, submitted, onAnswer }: any) {
  const allQs = (group.steps || []).filter((s: any) => s.question).map((s: any) => s.question);

  const renderStepText = (step: any) => {
    if (!step.question) {
      return <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.text, textAlign: 'center' }}>{step.text}</Text>;
    }

    const { question_number, letter_answer, text_answer } = step.question;
    const blankRegex = /\b(\d+)\s*\.{3,}/;
    const match = step.text.match(blankRegex);
    const selected = (answers[question_number] || '').trim();

    const isCorrect = submitted && (
      (letter_answer && selected.toUpperCase() === letter_answer.toUpperCase()) ||
      (!letter_answer && text_answer && selected.toLowerCase() === text_answer.toLowerCase())
    );

    const selectedOption = (group.options || []).find((o: any) => o.letter.toUpperCase() === selected.toUpperCase());

    if (!match) return <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.text, textAlign: 'center' }}>{step.text}</Text>;

    const splitIdx = step.text.indexOf(match[0]);
    const before = step.text.slice(0, splitIdx).trimEnd();
    const after = step.text.slice(splitIdx + match[0].length).trimStart();

    return (
      <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.text, textAlign: 'center', lineHeight: 28 }}>
        {before && <Text>{before} </Text>}
        
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          borderWidth: 1, 
          borderColor: submitted ? (isCorrect ? '#86EFAC' : '#FCA5A5') : COLORS.border, 
          backgroundColor: submitted ? (isCorrect ? '#DCFCE7' : '#FEE2E2') : '#fff',
          borderRadius: RADIUS.sm,
          paddingHorizontal: 4,
          paddingVertical: 2,
          marginHorizontal: 4,
          minWidth: 70
        }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: COLORS.textMuted, marginRight: 4 }}>
            {question_number}
          </Text>
          {submitted ? (
            <Text style={{ fontSize: FONT_SIZES.sm, fontWeight: 'bold', color: isCorrect ? '#16A34A' : '#DC2626', textDecorationLine: isCorrect ? 'none' : 'line-through' }}>
              {selected || "—"}
            </Text>
          ) : (
            <TextInput
              style={{ padding: 0, margin: 0, fontSize: FONT_SIZES.sm, color: COLORS.text, minWidth: 50, textAlign: 'center' }}
              value={selected}
              onChangeText={(v) => onAnswer(question_number, v)}
              editable={!submitted}
              placeholder="..."
            />
          )}
        </View>

        {submitted && selectedOption && (
          <Text style={{ fontSize: 11, color: isCorrect ? '#16A34A' : '#DC2626', textDecorationLine: isCorrect ? 'none' : 'line-through' }}>
             ({selectedOption.text})
          </Text>
        )}

        {submitted && !isCorrect && (
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#16A34A', marginHorizontal: 4 }}>
            → {letter_answer || text_answer} {letter_answer && text_answer ? `(${text_answer})` : ''}
          </Text>
        )}

        {after && <Text> {after}</Text>}
      </Text>
    );
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.groupType}>{group.type.replace(/_/g, ' ')}</Text>
      {group.heading && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>{group.heading}</Text>
        </View>
      )}

      {/* Options Bank */}
      {group.options && group.options.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.textMuted, marginTop: 4 }}>OPTIONS:</Text>
          {group.options.map((opt: any) => (
            <View key={opt.letter} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ fontWeight: 'bold', marginRight: 4 }}>{opt.letter}</Text>
              <Text style={{ color: COLORS.textMuted }}>· {opt.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Flow Steps */}
      <View style={{ alignItems: 'center' }}>
        {(group.steps || []).map((step: any, si: number) => (
          <View key={si} style={{ alignItems: 'center', width: '100%' }}>
            <View style={{ width: '100%', borderWidth: 2, borderColor: step.question ? COLORS.border : '#E5E7EB', backgroundColor: step.question ? '#fff' : '#F9FAFB', borderRadius: RADIUS.md, padding: 12, alignItems: 'center' }}>
               {renderStepText(step)}
            </View>
            
            {si < (group.steps || []).length - 1 && (
              <View style={{ marginVertical: 4, alignItems: 'center' }}>
                <View style={{ width: 2, height: 16, backgroundColor: COLORS.border }} />
                <Ionicons name="caret-down" size={16} color={COLORS.border} style={{ marginTop: -4 }} />
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Explanations */}
      {submitted && allQs.map((q: any) => (
        q.explanation ? (
          <View key={q.question_number} style={{ marginTop: 12 }}>
            <Text style={{ fontSize: FONT_SIZES.sm, fontWeight: 'bold', color: COLORS.textSecondary }}>Q{q.question_number} Explanation:</Text>
            <ExplanationView 
              explanation={q.explanation} 
              isCorrect={
                ((q.letter_answer && (answers[q.question_number] || '').toUpperCase() === q.letter_answer.toUpperCase()) ||
                (!q.letter_answer && q.text_answer && (answers[q.question_number] || '').trim().toLowerCase() === q.text_answer.trim().toLowerCase()))
              } 
            />
          </View>
        ) : null
      ))}
    </View>
  );
}
