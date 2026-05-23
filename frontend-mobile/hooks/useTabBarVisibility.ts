import { useRef } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent, DeviceEventEmitter } from 'react-native';

export function useTabBarVisibility() {
  const lastOffset = useRef(0);
  const scrollAccumulator = useRef(0);
  const currentVisibility = useRef(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const diff = currentOffset - lastOffset.current;
    
    lastOffset.current = currentOffset;

    // Force visible when near the top of the scrollable view
    if (currentOffset <= 20) {
      scrollAccumulator.current = 0;
      if (!currentVisibility.current) {
        currentVisibility.current = true;
        DeviceEventEmitter.emit('SET_TAB_BAR_VISIBILITY', { visible: true });
      }
      return;
    }

    // Continuous scroll tracking
    if (diff > 0) {
      // Scrolling down
      if (scrollAccumulator.current < 0) {
        scrollAccumulator.current = 0;
      }
      scrollAccumulator.current += diff;
      
      if (scrollAccumulator.current > 100 && currentVisibility.current) {
        currentVisibility.current = false;
        DeviceEventEmitter.emit('SET_TAB_BAR_VISIBILITY', { visible: false });
        scrollAccumulator.current = 0;
      }
    } else if (diff < 0) {
      // Scrolling up
      if (scrollAccumulator.current > 0) {
        scrollAccumulator.current = 0;
      }
      scrollAccumulator.current += diff; // diff is negative
      
      if (scrollAccumulator.current < -50 && !currentVisibility.current) {
        currentVisibility.current = true;
        DeviceEventEmitter.emit('SET_TAB_BAR_VISIBILITY', { visible: true });
        scrollAccumulator.current = 0;
      }
    }
  };

  return { handleScroll };
}
