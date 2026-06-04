import { useEffect, useState, useRef } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from 'expo-router';

export function useExitConfirm(
  hasUnsavedChanges: boolean,
  onSave?: () => Promise<void> | void,
  onDiscard?: () => Promise<void> | void
) {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const isConfirmedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges || isConfirmedRef.current) {
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
      if (hasUnsavedChanges && !isConfirmedRef.current) {
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

  const handleConfirmSave = () => {
    if (isConfirmedRef.current) return;
    isConfirmedRef.current = true;
    setIsVisible(false);
    if (onSave) {
      Promise.resolve(onSave()).catch((err) => {
        console.error('Failed to save on exit confirm:', err);
      });
    }
    if (pendingAction) {
      navigation.dispatch(pendingAction);
    } else {
      navigation.goBack();
    }
  };

  const handleConfirmDiscard = () => {
    if (isConfirmedRef.current) return;
    isConfirmedRef.current = true;
    setIsVisible(false);
    if (onDiscard) {
      Promise.resolve(onDiscard()).catch((err) => {
        console.error('Failed to discard on exit confirm:', err);
      });
    }
    if (pendingAction) {
      navigation.dispatch(pendingAction);
    } else {
      navigation.goBack();
    }
  };

  const handleCancel = () => {
    setIsVisible(false);
    setPendingAction(null);
    isConfirmedRef.current = false;
  };

  return {
    isVisible,
    showDialog: () => setIsVisible(true),
    hideDialog: handleCancel,
    confirmSave: handleConfirmSave,
    confirmDiscard: handleConfirmDiscard,
  };
}

