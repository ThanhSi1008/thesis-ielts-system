import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING } from '@/constants';
import { shadowingApi } from '@/services/features.api';
import { toast } from '../ui/Toaster';

interface FolderPickerProps {
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
}

export default function FolderPicker({ selectedFolder, onSelectFolder }: FolderPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const res = await shadowingApi.getFolders();
      // Ensure we always have General as a default option if list is empty
      const list = res && res.length > 0 ? res : ['General'];
      setFolders(list);
    } catch (e) {
      console.error('Failed to fetch folders', e);
      setFolders(['General']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalVisible) {
      fetchFolders();
      setShowCreateInput(false);
      setNewFolderName('');
      setSearch('');
    }
  }, [modalVisible]);

  const handleSelect = (folder: string) => {
    onSelectFolder(folder);
    setModalVisible(false);
  };

  const handleCreateFolder = async () => {
    const trimmedName = newFolderName.trim();
    if (!trimmedName) {
      toast.error('Error', 'Folder name cannot be empty');
      return;
    }
    if (folders.some((f) => f.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error('Error', 'Folder already exists');
      return;
    }

    setCreating(true);
    try {
      await shadowingApi.createFolder(trimmedName);
      toast.success('Success', `Folder "${trimmedName}" created`);
      onSelectFolder(trimmedName);
      setModalVisible(false);
    } catch (e: any) {
      console.error('Failed to create folder', e);
      // Fallback local support just in case the API endpoint has restrictions
      setFolders((prev) => [...prev, trimmedName]);
      onSelectFolder(trimmedName);
      setModalVisible(false);
    } finally {
      setCreating(false);
    }
  };

  const filteredFolders = folders.filter((f) => f.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Folder</Text>
      <TouchableOpacity
        style={styles.pickerTrigger}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.pickerLeft}>
          <Ionicons name="folder" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.pickerValue, !selectedFolder && styles.placeholder]}>
            {selectedFolder || 'Select a folder'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={COLORS.gray[400]} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContent}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Choose Folder</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color={COLORS.gray[500]} />
                  </TouchableOpacity>
                </View>

                {/* Modal Body */}
                <View style={styles.modalBody}>
                  {/* Search Input */}
                  <View style={styles.searchBar}>
                    <Ionicons
                      name="search"
                      size={16}
                      color={COLORS.gray[400]}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search folders..."
                      placeholderTextColor={COLORS.gray[400]}
                      value={search}
                      onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                      <TouchableOpacity onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={16} color={COLORS.gray[400]} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Create New Folder Input Section */}
                  {showCreateInput ? (
                    <View style={styles.createInputContainer}>
                      <TextInput
                        style={styles.createInput}
                        placeholder="Enter folder name..."
                        placeholderTextColor={COLORS.gray[400]}
                        value={newFolderName}
                        onChangeText={setNewFolderName}
                        autoFocus
                      />
                      <View style={styles.createActions}>
                        <TouchableOpacity
                          style={[styles.createBtn, styles.cancelBtn]}
                          onPress={() => setShowCreateInput(false)}
                        >
                          <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.createBtn, styles.confirmBtn]}
                          onPress={handleCreateFolder}
                          disabled={creating}
                        >
                          {creating ? (
                            <ActivityIndicator size="small" color={COLORS.text} />
                          ) : (
                            <Text style={styles.confirmBtnText}>Create</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addFolderBtn}
                      onPress={() => setShowCreateInput(true)}
                    >
                      <Ionicons
                        name="add-circle"
                        size={18}
                        color={COLORS.primary}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.addFolderBtnText}>Create New Folder</Text>
                    </TouchableOpacity>
                  )}

                  {/* List of Folders */}
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    </View>
                  ) : (
                    <FlatList
                      data={filteredFolders}
                      keyExtractor={(item) => item}
                      contentContainerStyle={styles.listContent}
                      ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                          <Text style={styles.emptyText}>No folders found</Text>
                        </View>
                      }
                      renderItem={({ item }) => {
                        const isSelected = selectedFolder === item;
                        return (
                          <TouchableOpacity
                            style={[styles.folderItem, isSelected && styles.folderItemSelected]}
                            onPress={() => handleSelect(item)}
                          >
                            <View style={styles.folderItemLeft}>
                              <Ionicons
                                name={isSelected ? 'folder-open' : 'folder'}
                                size={18}
                                color={isSelected ? COLORS.primary : COLORS.gray[400]}
                                style={{ marginRight: 10 }}
                              />
                              <Text
                                style={[styles.folderName, isSelected && styles.folderNameSelected]}
                              >
                                {item}
                              </Text>
                            </View>
                            {isSelected && (
                              <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                            )}
                          </TouchableOpacity>
                        );
                      }}
                    />
                  )}
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    height: 48,
  },
  pickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerValue: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.text,
  },
  placeholder: {
    color: COLORS.gray[400],
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl * 2,
    borderTopRightRadius: RADIUS.xl * 2,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 40,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.text,
  },
  addFolderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  addFolderBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.text,
  },
  createInputContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  createInput: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  createBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
  },
  cancelBtnText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
  },
  confirmBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.text,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  folderItemSelected: {
    borderBottomColor: 'rgba(255, 198, 0, 0.1)',
  },
  folderItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderName: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  folderNameSelected: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[400],
  },
});
