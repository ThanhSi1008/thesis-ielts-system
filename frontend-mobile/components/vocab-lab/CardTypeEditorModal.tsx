import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import { CardType, CardField, CardTemplate } from '@/types';
import * as Haptics from 'expo-haptics';
import ColorPicker, { Panel1, Swatches, HueSlider } from 'reanimated-color-picker';
import { runOnJS } from 'react-native-reanimated';

interface CardTypeEditorModalProps {
  visible: boolean;
  cardType: CardType | null;
  onClose: () => void;
  onSaved: (updated: CardType) => void;
}

export function CardTypeEditorModal({
  visible,
  cardType,
  onClose,
  onSaved,
}: CardTypeEditorModalProps) {
  const [tab, setTab] = useState<'fields' | 'templates' | 'preview'>('fields');
  
  // Local state
  const [fields, setFields] = useState<CardField[]>([]);
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [saving, setSaving] = useState(false);

  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [currentColorKey, setCurrentColorKey] = useState<'backgroundColor' | 'color'>('backgroundColor');
  const [tempColor, setTempColor] = useState('');

  const openColorPicker = (key: 'backgroundColor' | 'color') => {
    setCurrentColorKey(key);
    setTempColor(templates[0]?.cardStyle?.[key] || (key === 'color' ? '#000000' : '#ffffff'));
    setColorPickerVisible(true);
  };

  useEffect(() => {
    if (visible && cardType) {
      // deep clone to avoid mutating props directly
      setFields(JSON.parse(JSON.stringify(cardType.fields || [])));
      
      const defaultTpls = [{ id: Date.now().toString(), name: 'Default', frontFields: [], backFields: [] }];
      setTemplates(cardType.templates?.length ? JSON.parse(JSON.stringify(cardType.templates)) : defaultTpls);
      setTab('fields');
    }
  }, [visible, cardType]);

  if (!cardType) return null;

  // ─── Fields actions ──────────────────────────────────────────────
  const handleAddField = () => {
    const newId = `field_${Date.now()}`;
    setFields([...fields, { id: newId, name: 'New Field', order: fields.length, fieldType: 'text' }]);
  };

  const handleUpdateField = (id: string, key: keyof CardField, value: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    // Also remove from templates
    setTemplates(templates.map(t => ({
      ...t,
      frontFields: t.frontFields.filter(fid => fid !== id),
      backFields: t.backFields.filter(fid => fid !== id),
    })));
  };

  const handleMoveField = (index: number, dir: -1 | 1) => {
    if (index + dir < 0 || index + dir >= fields.length) return;
    const newFields = [...fields];
    const temp = newFields[index];
    newFields[index] = newFields[index + dir];
    newFields[index + dir] = temp;
    // update order
    newFields.forEach((f, i) => f.order = i);
    setFields(newFields);
    Haptics.selectionAsync();
  };

  // ─── Templates actions ───────────────────────────────────────────
  const toggleFieldInTemplate = (fieldId: string, side: 'front' | 'back') => {
    setTemplates(templates.map((t, i) => {
      if (i !== 0) return t; // only edit first template
      const list = side === 'front' ? t.frontFields : t.backFields;
      const newList = list.includes(fieldId) ? list.filter(id => id !== fieldId) : [...list, fieldId];
      return { ...t, [side === 'front' ? 'frontFields' : 'backFields']: newList };
    }));
    Haptics.selectionAsync();
  };

  const toggleFieldStyle = (fieldId: string, styleKey: string, styleValue: string) => {
    setTemplates(templates.map((t, i) => {
      if (i !== 0) return t;
      const fs = t.fieldStyles || {};
      const currentFieldStyles = fs[fieldId] || {};
      const newFieldStyles = { ...currentFieldStyles };
      if (newFieldStyles[styleKey] === styleValue) {
        delete newFieldStyles[styleKey];
      } else {
        newFieldStyles[styleKey] = styleValue;
      }
      return { ...t, fieldStyles: { ...fs, [fieldId]: newFieldStyles } };
    }));
  };

  const setCardStyle = (key: string, value: string) => {
    setTemplates(templates.map((t, i) => {
      if (i !== 0) return t;
      const cs = t.cardStyle || {};
      return { ...t, cardStyle: { ...cs, [key]: value } };
    }));
  };

  const handleFontSizeSelect = (fieldId: string) => {
    Alert.alert('Select Font Size', '', [
      { text: 'Small (14px)', onPress: () => toggleFieldStyle(fieldId, 'fontSize', '14px') },
      { text: 'Medium (18px)', onPress: () => toggleFieldStyle(fieldId, 'fontSize', '18px') },
      { text: 'Large (24px)', onPress: () => toggleFieldStyle(fieldId, 'fontSize', '24px') },
      { text: 'Clear', style: 'destructive', onPress: () => toggleFieldStyle(fieldId, 'fontSize', '') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  // ─── Save ────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Process fields
      const originalFields = cardType.fields || [];
      const currentFields = fields;

      const deletedFields = originalFields.filter(of => !currentFields.find(cf => cf.id === of.id));
      const addedFields = currentFields.filter(cf => cf.id.startsWith('field_'));
      const updatedFields = currentFields.filter(cf => !cf.id.startsWith('field_') && 
        originalFields.find(of => of.id === cf.id && (of.name !== cf.name || of.order !== cf.order || of.fieldType !== cf.fieldType)));

      // Execute deletes
      for (const df of deletedFields) {
        await vocabLabApi.deleteField(cardType.id, df.id);
      }
      
      // Execute adds - we need to map temporary ids to real ids for templates
      const idMapping: Record<string, string> = {};
      for (const af of addedFields) {
        const res = await vocabLabApi.addField(cardType.id, { name: af.name, fieldType: af.fieldType });
        idMapping[af.id] = res.id;
        // Since we can't send order in addField, we might need to update it immediately after if order matters,
        // but backend usually sets the order to fields.length. If we need to set it, we do an update:
        if (af.order !== undefined) {
          await vocabLabApi.updateField(cardType.id, res.id, { order: af.order });
        }
      }

      // Execute updates
      for (const uf of updatedFields) {
        await vocabLabApi.updateField(cardType.id, uf.id, { name: uf.name, order: uf.order, fieldType: uf.fieldType });
      }

      // 2. Process templates
      // Need to replace temporary field ids with real ones in the template
      const tplToSave = templates[0];
      if (tplToSave) {
        const remap = (arr: string[]) => arr.map(id => idMapping[id] || id);
        
        // Remap fieldStyles keys
        const newFieldStyles: Record<string, any> = {};
        if (tplToSave.fieldStyles) {
          Object.keys(tplToSave.fieldStyles).forEach(k => {
            newFieldStyles[idMapping[k] || k] = tplToSave.fieldStyles![k];
          });
        }

        await vocabLabApi.updateTemplate(cardType.id, tplToSave.id, {
          frontFields: remap(tplToSave.frontFields),
          backFields: remap(tplToSave.backFields),
          fieldStyles: newFieldStyles,
          cardStyle: tplToSave.cardStyle,
        });
      }

      onSaved(cardType);
      onClose();
    } catch (e: any) {
      console.error('Save CardType Error:', e?.response?.data || e.message || e);
      Alert.alert('Error', `Failed to save card type: ${e?.response?.data?.message || e.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const tpl = templates[0] || { frontFields: [], backFields: [] };

  const parseStyle = (st: any) => {
    if (!st) return {};
    const res = { ...st };
    if (res.fontSize && typeof res.fontSize === 'string') {
      res.fontSize = parseInt(res.fontSize.replace('px', ''), 10);
      if (isNaN(res.fontSize)) delete res.fontSize;
    }
    return res;
  };

  const COLORS_PRESET = ['#1F2937', '#FFFFFF', '#F9FAFB', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={s.container} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={s.headerTitle} numberOfLines={1}>{cardType.name}</Text>
            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Save</Text>}
            </TouchableOpacity>
          </View>

          {/* Color Picker Overlay */}
          {colorPickerVisible && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }]}>
              <View style={{ width: '85%', backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.lg, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}>
                <View style={{ width: '100%', height: 300, gap: SPACING.md }}>
                  <ColorPicker 
                    style={{ width: '100%', gap: SPACING.md }} 
                    value={tempColor} 
                    onComplete={(colors) => {
                      'worklet';
                      runOnJS(setTempColor)(colors.hex);
                    }}
                  >
                    <Panel1 />
                    <HueSlider />
                    <Swatches />
                  </ColorPicker>
                </View>
                <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl }}>
                  <TouchableOpacity style={[s.saveBtn, { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, flex: 1 }]} onPress={() => setColorPickerVisible(false)}>
                    <Text style={[s.saveBtnText, { color: COLORS.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.saveBtn, { flex: 1 }]} onPress={() => {
                    setCardStyle(currentColorKey, tempColor);
                    setColorPickerVisible(false);
                  }}>
                    <Text style={s.saveBtnText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Tabs */}
          <View style={s.tabs}>
            <TouchableOpacity style={[s.tab, tab === 'fields' && s.tabActive]} onPress={() => setTab('fields')}>
              <Text style={[s.tabText, tab === 'fields' && s.tabTextActive]}>Fields</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.tab, tab === 'templates' && s.tabActive]} onPress={() => setTab('templates')}>
              <Text style={[s.tabText, tab === 'templates' && s.tabTextActive]}>Templates</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.tab, tab === 'preview' && s.tabActive]} onPress={() => setTab('preview')}>
              <Text style={[s.tabText, tab === 'preview' && s.tabTextActive]}>Preview</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={s.content} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}>
            {tab === 'fields' && (
              <View>
                <Text style={s.sectionDesc}>Define the data fields for this card type. Reorder them to change input order.</Text>
                
                {fields.map((f, i) => (
                  <View key={f.id} style={s.fieldRow}>
                    <View style={s.fieldControls}>
                      <TouchableOpacity onPress={() => handleMoveField(i, -1)} disabled={i === 0}>
                        <Ionicons name="chevron-up" size={20} color={i === 0 ? COLORS.border : COLORS.textMuted} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleMoveField(i, 1)} disabled={i === fields.length - 1}>
                        <Ionicons name="chevron-down" size={20} color={i === fields.length - 1 ? COLORS.border : COLORS.textMuted} />
                      </TouchableOpacity>
                    </View>

                    <View style={s.fieldInputs}>
                      <TextInput
                        style={s.input}
                        value={f.name}
                        onChangeText={v => handleUpdateField(f.id, 'name', v)}
                        placeholder="Field Name"
                      />
                      <TextInput
                        style={[s.input, { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary }]}
                        value={f.description || ''}
                        onChangeText={v => handleUpdateField(f.id, 'description', v)}
                        placeholder="Description (optional)"
                      />
                      <TouchableOpacity 
                        style={s.typeToggle}
                        onPress={() => handleUpdateField(f.id, 'fieldType', f.fieldType === 'media' ? 'text' : 'media')}
                      >
                        <Text style={s.typeToggleText}>{f.fieldType === 'media' ? 'Media' : 'Text'}</Text>
                        <Ionicons name={f.fieldType === 'media' ? 'image-outline' : 'text-outline'} size={14} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={s.deleteBtn} onPress={() => handleDeleteField(f.id)}>
                      <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity style={s.addBtn} onPress={handleAddField}>
                  <Ionicons name="add" size={20} color={COLORS.primary} />
                  <Text style={s.addBtnText}>Add Field</Text>
                </TouchableOpacity>
              </View>
            )}

            {tab === 'templates' && (
              <View>
                <Text style={s.sectionDesc}>Select which fields appear on the Front and Back of the card.</Text>

                <View style={s.tplSection}>
                  <Text style={s.tplTitle}>Front Side</Text>
                  {fields.map(f => {
                    const active = tpl.frontFields.includes(f.id);
                    return (
                      <View key={`front_${f.id}`} style={s.tplRowContainer}>
                        <TouchableOpacity style={[s.tplRow, active && s.tplRowActive]} onPress={() => toggleFieldInTemplate(f.id, 'front')}>
                          <Text style={[s.tplRowText, active && s.tplRowTextActive]}>{f.name}</Text>
                          <View style={[s.checkbox, active && s.checkboxActive]}>
                            {active && <Ionicons name="checkmark" size={16} color="#fff" />}
                          </View>
                        </TouchableOpacity>
                        {active && (
                          <View style={s.styleRow}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACING.sm }}>
                              {/* Font Styles */}
                              <TouchableOpacity style={[s.styleBtn, tpl.fieldStyles?.[f.id]?.fontWeight === 'bold' && s.styleBtnActive]} onPress={() => toggleFieldStyle(f.id, 'fontWeight', 'bold')}>
                                <Text style={[s.styleBtnText, { fontWeight: 'bold' }]}>B</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={[s.styleBtn, tpl.fieldStyles?.[f.id]?.fontStyle === 'italic' && s.styleBtnActive]} onPress={() => toggleFieldStyle(f.id, 'fontStyle', 'italic')}>
                                <Text style={[s.styleBtnText, { fontStyle: 'italic' }]}>I</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={[s.styleBtn, tpl.fieldStyles?.[f.id]?.textDecorationLine === 'underline' && s.styleBtnActive]} onPress={() => toggleFieldStyle(f.id, 'textDecorationLine', 'underline')}>
                                <Text style={[s.styleBtnText, { textDecorationLine: 'underline' }]}>U</Text>
                              </TouchableOpacity>
                              <View style={s.styleDivider} />
                              {/* Alignment */}
                              <TouchableOpacity style={[s.styleBtn, tpl.fieldStyles?.[f.id]?.textAlign === 'left' && s.styleBtnActive]} onPress={() => toggleFieldStyle(f.id, 'textAlign', 'left')}>
                                <Ionicons name="menu" size={16} color={tpl.fieldStyles?.[f.id]?.textAlign === 'left' ? '#fff' : COLORS.text} style={{ transform: [{ scaleX: -1 }] }} />
                              </TouchableOpacity>
                              <TouchableOpacity style={[s.styleBtn, tpl.fieldStyles?.[f.id]?.textAlign === 'center' && s.styleBtnActive]} onPress={() => toggleFieldStyle(f.id, 'textAlign', 'center')}>
                                <Ionicons name="menu" size={16} color={tpl.fieldStyles?.[f.id]?.textAlign === 'center' ? '#fff' : COLORS.text} />
                              </TouchableOpacity>
                              <TouchableOpacity style={[s.styleBtn, tpl.fieldStyles?.[f.id]?.textAlign === 'right' && s.styleBtnActive]} onPress={() => toggleFieldStyle(f.id, 'textAlign', 'right')}>
                                <Ionicons name="menu" size={16} color={tpl.fieldStyles?.[f.id]?.textAlign === 'right' ? '#fff' : COLORS.text} />
                              </TouchableOpacity>
                              <View style={s.styleDivider} />
                              {/* Size Dropdown */}
                              <TouchableOpacity style={s.styleBtn} onPress={() => handleFontSizeSelect(f.id)}>
                                <Text style={s.styleBtnText}>
                                  Size: {tpl.fieldStyles?.[f.id]?.fontSize || 'Default'} <Ionicons name="chevron-down" size={12} />
                                </Text>
                              </TouchableOpacity>
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>

                <View style={s.tplSection}>
                  <Text style={s.tplTitle}>Back Side</Text>
                  {fields.map(f => {
                    const active = tpl.backFields.includes(f.id);
                    return (
                      <View key={`back_${f.id}`} style={s.tplRowContainer}>
                        <TouchableOpacity style={[s.tplRow, active && s.tplRowActive]} onPress={() => toggleFieldInTemplate(f.id, 'back')}>
                          <Text style={[s.tplRowText, active && s.tplRowTextActive]}>{f.name}</Text>
                          <View style={[s.checkbox, active && s.checkboxActive]}>
                            {active && <Ionicons name="checkmark" size={16} color="#fff" />}
                          </View>
                        </TouchableOpacity>
                        {active && (
                          <View style={s.styleRow}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACING.sm }}>
                              {/* Font Styles */}
                              <TouchableOpacity style={[s.styleBtn, tpl.fieldStyles?.[f.id]?.fontWeight === 'bold' && s.styleBtnActive]} onPress={() => toggleFieldStyle(f.id, 'fontWeight', 'bold')}>
                                <Text style={[s.styleBtnText, { fontWeight: 'bold' }]}>B</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={[s.styleBtn, tpl.fieldStyles?.[f.id]?.fontStyle === 'italic' && s.styleBtnActive]} onPress={() => toggleFieldStyle(f.id, 'fontStyle', 'italic')}>
                                <Text style={[s.styleBtnText, { fontStyle: 'italic' }]}>I</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={[s.styleBtn, tpl.fieldStyles?.[f.id]?.textDecorationLine === 'underline' && s.styleBtnActive]} onPress={() => toggleFieldStyle(f.id, 'textDecorationLine', 'underline')}>
                                <Text style={[s.styleBtnText, { textDecorationLine: 'underline' }]}>U</Text>
                              </TouchableOpacity>
                              <View style={s.styleDivider} />
                              {/* Alignment */}
                              <TouchableOpacity style={[s.styleBtn, tpl.fieldStyles?.[f.id]?.textAlign === 'left' && s.styleBtnActive]} onPress={() => toggleFieldStyle(f.id, 'textAlign', 'left')}>
                                <Ionicons name="menu" size={16} color={tpl.fieldStyles?.[f.id]?.textAlign === 'left' ? '#fff' : COLORS.text} style={{ transform: [{ scaleX: -1 }] }} />
                              </TouchableOpacity>
                              <TouchableOpacity style={[s.styleBtn, tpl.fieldStyles?.[f.id]?.textAlign === 'center' && s.styleBtnActive]} onPress={() => toggleFieldStyle(f.id, 'textAlign', 'center')}>
                                <Ionicons name="menu" size={16} color={tpl.fieldStyles?.[f.id]?.textAlign === 'center' ? '#fff' : COLORS.text} />
                              </TouchableOpacity>
                              <TouchableOpacity style={[s.styleBtn, tpl.fieldStyles?.[f.id]?.textAlign === 'right' && s.styleBtnActive]} onPress={() => toggleFieldStyle(f.id, 'textAlign', 'right')}>
                                <Ionicons name="menu" size={16} color={tpl.fieldStyles?.[f.id]?.textAlign === 'right' ? '#fff' : COLORS.text} />
                              </TouchableOpacity>
                              <View style={s.styleDivider} />
                              {/* Size Dropdown */}
                              <TouchableOpacity style={s.styleBtn} onPress={() => handleFontSizeSelect(f.id)}>
                                <Text style={s.styleBtnText}>
                                  Size: {tpl.fieldStyles?.[f.id]?.fontSize || 'Default'} <Ionicons name="chevron-down" size={12} />
                                </Text>
                              </TouchableOpacity>
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Global Card Styles */}
                <View style={s.tplSection}>
                  <Text style={s.tplTitle}>Global Card Style</Text>
                  
                  <View style={s.globalStyleRow}>
                    <Text style={s.globalStyleLabel}>Background</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: SPACING.md }}>
                      <TouchableOpacity onPress={() => openColorPicker('backgroundColor')}>
                        <View style={[s.colorSwatch, { backgroundColor: tpl.cardStyle?.backgroundColor || '#ffffff' }]} />
                      </TouchableOpacity>
                      <TextInput
                        style={s.hexInput}
                        value={tpl.cardStyle?.backgroundColor || ''}
                        onChangeText={v => setCardStyle('backgroundColor', v)}
                        placeholder="#FFFFFF"
                        placeholderTextColor={COLORS.textMuted}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>

                  <View style={s.globalStyleRow}>
                    <Text style={s.globalStyleLabel}>Text Color</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: SPACING.md }}>
                      <TouchableOpacity onPress={() => openColorPicker('color')}>
                        <View style={[s.colorSwatch, { backgroundColor: tpl.cardStyle?.color || '#000000' }]} />
                      </TouchableOpacity>
                      <TextInput
                        style={s.hexInput}
                        value={tpl.cardStyle?.color || ''}
                        onChangeText={v => setCardStyle('color', v)}
                        placeholder="#000000"
                        placeholderTextColor={COLORS.textMuted}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {tab === 'preview' && (
              <View style={s.previewContainer}>
                <Text style={s.sectionDesc}>This is how your flashcard will roughly look.</Text>
                
                {/* Front Preview */}
                <Text style={s.previewHeader}>Front Side</Text>
                <View style={[s.previewCard, parseStyle(tpl.cardStyle)]}>
                  {tpl.frontFields.map(fid => {
                    const f = fields.find(x => x.id === fid);
                    if (!f) return null;
                    const style = parseStyle(tpl.fieldStyles?.[fid] || {});
                    return (
                      <Text key={`pv_front_${fid}`} style={[s.previewFieldText, style]}>
                        {f.fieldType === 'media' ? `[Media: ${f.name}]` : `[${f.name}]`}
                      </Text>
                    );
                  })}
                </View>

                {/* Back Preview */}
                <Text style={s.previewHeader}>Back Side</Text>
                <View style={[s.previewCard, parseStyle(tpl.cardStyle)]}>
                  {tpl.backFields.map(fid => {
                    const f = fields.find(x => x.id === fid);
                    if (!f) return null;
                    const style = parseStyle(tpl.fieldStyles?.[fid] || {});
                    return (
                      <Text key={`pv_back_${fid}`} style={[s.previewFieldText, style]}>
                        {f.fieldType === 'media' ? `[Media: ${f.name}]` : `[${f.name}]`}
                      </Text>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, flex: 1, textAlign: 'center' },
  closeBtn: { padding: SPACING.xs },
  saveBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: 8,
    borderRadius: RADIUS.md, minWidth: 64, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  tabs: {
    flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: SPACING.md, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
  tabActive: { borderColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary },
  content: { flex: 1 },
  sectionDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg, lineHeight: 20 },
  
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginBottom: SPACING.md, backgroundColor: '#fff', padding: SPACING.sm,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  fieldControls: { alignItems: 'center', gap: 4 },
  fieldInputs: { flex: 1, gap: SPACING.xs },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm, paddingVertical: 8, fontSize: FONT_SIZES.md, color: COLORS.text,
  },
  typeToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
  },
  typeToggleText: { fontSize: 12, color: COLORS.primary, fontWeight: '600', textTransform: 'uppercase' },
  deleteBtn: { padding: SPACING.xs },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.md, backgroundColor: '#fff', borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed', marginTop: SPACING.sm,
  },
  addBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.md },

  tplSection: { marginBottom: SPACING.xl },
  tplTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  tplRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  tplRowActive: { backgroundColor: COLORS.primary + '0A' },
  tplRowText: { fontSize: FONT_SIZES.md, color: COLORS.text },
  tplRowTextActive: { fontWeight: '600', color: COLORS.primary },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
  },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  
  tplRowContainer: {
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  styleRow: {
    flexDirection: 'row', padding: SPACING.sm, paddingLeft: SPACING.xl, gap: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  styleBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.sm,
    backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center',
  },
  styleBtnActive: { backgroundColor: COLORS.primary },
  styleBtnText: { color: COLORS.text, fontSize: 14 },
  styleDivider: { width: 1, backgroundColor: COLORS.border, height: 20, marginHorizontal: 4, alignSelf: 'center' },

  globalStyleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border, gap: SPACING.sm,
  },
  globalStyleLabel: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '500', width: 100 },
  colorSwatch: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  hexInput: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm, paddingVertical: 8, fontSize: FONT_SIZES.md, color: COLORS.text,
  },

  previewContainer: { paddingVertical: SPACING.md },
  previewHeader: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', marginBottom: SPACING.sm, marginTop: SPACING.lg },
  previewCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.xl,
    minHeight: 150, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, gap: SPACING.sm,
  },
  previewFieldText: {
    fontSize: FONT_SIZES.md, color: COLORS.text, textAlign: 'center',
  },
});
