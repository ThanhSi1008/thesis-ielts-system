export { AudioPlayer } from './AudioPlayer';
export { FeatureLock } from './FeatureLock';
export { SharedDrawer } from './SharedDrawer';
export { Toaster, toast } from './Toaster';
export { UpgradeModal } from './UpgradeModal';
export { UsageIndicator } from './UsageIndicator';

// Re-export new atoms under deprecated names for seamless backwards compatibility
export { default as Button } from '../atoms/Button';
export { default as Badge } from '../atoms/Badge';
export { default as Divider } from '../atoms/Divider';
export { default as Chip } from '../atoms/Chip';
export { default as ScoreBadge } from '../atoms/ScoreBadge';

// Legacy UI components (DEPRECATED)
export {
  /** @deprecated Use SectionHeader from '@/components/atoms' instead */
  SectionHeader,
  /** @deprecated Use EmptyState from '@/components/atoms' instead */
  EmptyState,
} from '../ui';
