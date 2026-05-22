import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from 'expo-router';

export function useExitConfirm(hasUnsavedChanges: boolean, onSave?: () => Promise<void>) {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();
      setPendingAction(e.data.action);
      setIsVisible(true);
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  // Handle hardware back on Android too
  useEffect(() => {
    const handleHardwareBack = () => {
      if (hasUnsavedChanges) {
        setIsVisible(true);
        return true; // prevent default behavior (exit app or screen)
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => {
      subscription.remove();
    };
  }, [hasUnsavedChanges]);

  const handleConfirmSave = async () => {
    setIsVisible(false);
    if (onSave) {
      try {
        await onSave();
      } catch (err) {
        console.error('Failed to save on exit confirm:', err);
      }
    }
    if (pendingAction) {
      navigation.dispatch(pendingAction);
    } else {
      navigation.goBack();
    }
  };

  const handleConfirmDiscard = () => {
    setIsVisible(false);
    if (pendingAction) {
      navigation.dispatch(pendingAction);
    } else {
      navigation.goBack();
    }
  };

  const handleCancel = () => {
    setIsVisible(false);
    setPendingAction(null);
  };

  return {
    isVisible,
    showDialog: () => setIsVisible(true),
    hideDialog: handleCancel,
    confirmSave: handleConfirmSave,
    confirmDiscard: handleConfirmDiscard,
  };
}
