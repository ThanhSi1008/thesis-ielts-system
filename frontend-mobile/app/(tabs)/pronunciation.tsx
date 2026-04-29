/**
 * Pronunciation Tab entry point — delegates to /pronunciation (standalone stack)
 * This allows the pronunciation section to have its own navigation stack
 * (index + [symbol] detail screen) while still appearing in the tab bar.
 */
import { Redirect } from 'expo-router';

export default function PronunciationTabEntry() {
  return <Redirect href="/pronunciation" />;
}
