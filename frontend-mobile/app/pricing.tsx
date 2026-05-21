import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { subscriptionsApi } from '@/services';
import type { PricingPlan } from '@/services/features.api'; // keep import type from features.api or import it differently if needed, wait PricingPlan is in features.api
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/index';
import { COLORS, FONTS, ROUTES } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.82;
const CARD_MARGIN = 6;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;


const TIER_LEVEL: Record<string, number> = { FREE: 0, PREMIUM: 1, PRO: 2 };

// Free plan is always hardcoded on frontend (same as web)
const FREE_PLAN: PricingPlan = {
  id: 'free-plan-id',
  tier: 'FREE',
  name: 'Basic',
  description: 'Essential tools to get started',
  priceAmount: 0,
  currency: 'USD',
  interval: 'month',
  intervalCount: 1,
  features: [
    'Limited Vocabulary & Grammar books',
    '5 Pronunciation checks/day',
    'Basic IELTS lessons & exercises',
    '5 Shadowing & Dictation lessons',
    '3 Vocab Lab decks (max 50 cards)',
    'Community access (can post)',
    'Save up to 3 past exams',
  ],
  isActive: true,
  order: 0,
  createdAt: '',
  updatedAt: '',
};

// Feature comparison table — static content (same as web side)
const COMPARE = [
  { label: 'Vocabulary Books', free: '2 books', prem: 'Unlimited', pro: 'Unlimited' },
  { label: 'Grammar Levels', free: 'Elementary', prem: 'All levels', pro: 'All levels' },
  { label: 'Pronunciation Checks', free: '5/day', prem: 'Unlimited', pro: 'Unlimited' },
  { label: 'IELTS Advanced', free: false, prem: true, pro: true },
  { label: 'AI Writing Grading', free: false, prem: '10/mo', pro: 'Unlimited' },
  { label: 'AI Speaking Grading', free: false, prem: '10/mo', pro: 'Unlimited' },
  { label: 'Shadowing Lessons', free: '5 only', prem: 'Unlimited', pro: 'Unlimited' },
  { label: 'Vocab Lab Decks', free: '3 decks', prem: 'Unlimited', pro: 'Unlimited' },
  { label: 'AI Card Generation', free: false, prem: '50/mo', pro: 'Unlimited' },
  { label: 'YouTube Import', free: false, prem: true, pro: true },
  { label: 'Community Marketplace', free: false, prem: true, pro: true },
];

const CVal = ({ v }: { v: string | boolean }) => {
  if (v === true)
    return <Text style={{ color: '#22c55e', fontSize: 14, fontWeight: '800' }}>✓</Text>;
  if (v === false) return <Text style={{ color: '#d1d5db', fontSize: 14 }}>✗</Text>;
  return <Text style={{ color: '#6b7280', fontSize: 10.5, fontWeight: '600' }}>{v}</Text>;
};

export default function PricingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [billing, setBilling] = useState<'month' | 'year'>('month');
  const [activeIdx, setActiveIdx] = useState(1);
  const [showCompare, setShowCompare] = useState(false);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('FREE');
  const [trialUsed, setTrialUsed] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const fetchData = useCallback(async () => {
    try {
      const [plansData, subData] = await Promise.allSettled([
        subscriptionsApi.getPlans(),
        subscriptionsApi.getMySubscription(),
      ]);

      if (plansData.status === 'fulfilled') {
        setPlans([FREE_PLAN, ...plansData.value]);
      } else {
        // Fallback if API fails
        setPlans([FREE_PLAN]);
      }

      if (subData.status === 'fulfilled') {
        setCurrentTier(subData.value?.tier ?? 'FREE');
        setTrialUsed(subData.value?.trialUsed ?? false);
      }
    } catch {
      setPlans([FREE_PLAN]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter plans by billing interval (same logic as web)
  const visiblePlans = plans.filter((p) => p.priceAmount === 0 || p.interval === billing);

  useEffect(() => {
    // Scroll to PREMIUM plan (index 1) after plans load
    if (!loading && visiblePlans.length > 1) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: SNAP_INTERVAL, animated: false });
      }, 100);
    }
  }, [loading]);

  const formatPrice = (plan: PricingPlan) => {
    if (plan.priceAmount === 0) return 'Free';
    return `$${(plan.priceAmount / 100).toFixed(2)}`;
  };

  const formatInterval = (plan: PricingPlan) => {
    if (plan.priceAmount === 0) return '';
    return plan.interval === 'year' ? '/year' : '/month';
  };

  const getCtaLabel = (plan: PricingPlan) => {
    if (plan.tier === currentTier) return 'Current Plan';
    if (plan.priceAmount === 0) return 'Downgrade to Free';
    if (!user) return 'Get Started';
    if (plan.tier === 'PREMIUM' && !trialUsed && currentTier === 'FREE') return 'Start Free Trial';
    if (TIER_LEVEL[plan.tier] > TIER_LEVEL[currentTier]) return 'Upgrade Now';
    return 'Switch Plan';
  };

  const handleSelect = async (plan: PricingPlan) => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }
    if (plan.tier === currentTier) return;
    setLoadingPlanId(plan.id);
    try {
      if (plan.tier === 'PREMIUM' && !trialUsed && currentTier === 'FREE') {
        await subscriptionsApi.startTrial();
        await fetchData(); // refresh subscription state
        router.back();
        return;
      }
      if (plan.priceAmount > 0) {
        const result = await subscriptionsApi.checkout(plan.id);
        if (result.redirectUrl) {
          const returnUrl = Linking.createURL('payment/vnpay-return');
          const authResult = await WebBrowser.openAuthSessionAsync(
            result.redirectUrl,
            returnUrl
          );
          
          if (authResult.type === 'success' && authResult.url) {
            // Parse URL and navigate to vnpay-return with search params
            const queryString = authResult.url.split('?')[1] || '';
            const queryParams: Record<string, string> = {};
            if (queryString) {
              const pairs = queryString.split('&');
              for (const pair of pairs) {
                const [key, val] = pair.split('=');
                if (key) {
                  queryParams[decodeURIComponent(key)] = decodeURIComponent(val || '');
                }
              }
            }
            
            router.replace({
              pathname: '/payment/vnpay-return',
              params: queryParams,
            });
            return;
          }
          
          await fetchData();
          return;
        }
        await fetchData();
        router.back();
        return;
      }
      await fetchData();
      router.back();
    } catch (err: any) {
      const msg = err?.message ?? 'Something went wrong. Please try again.';
      toast.error('Subscription Error', msg);
    } finally {
      setLoadingPlanId(null);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SNAP_INTERVAL);
    if (idx !== activeIdx && idx >= 0 && idx < visiblePlans.length) {
      setActiveIdx(idx);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pricing</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.badgeSparkle}>
            <Ionicons name="sparkles" size={13} color="#b45309" />
            <Text style={styles.badgeSparkleText}>Unlock Your Full Potential</Text>
          </View>
          <Text style={styles.heroTitle}>Simple, Transparent Pricing</Text>
          <Text style={styles.heroDesc}>
            Choose the plan that fits your learning goals.{'\n'}Upgrade or cancel at any time.
          </Text>
        </View>

        {/* Billing Toggle */}
        <View style={styles.billingRow}>
          <View style={styles.billWrap}>
            <TouchableOpacity
              style={[styles.billBtn, billing === 'month' && styles.billBtnActive]}
              onPress={() => setBilling('month')}
            >
              <Text style={[styles.billBtnText, billing === 'month' && styles.billBtnTextActive]}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.billBtn, billing === 'year' && styles.billBtnActive]}
              onPress={() => setBilling('year')}
            >
              <Text style={[styles.billBtnText, billing === 'year' && styles.billBtnTextActive]}>
                Annual
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save 33%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading skeleton or cards */}
        {loading ? (
          <View style={styles.skeletonRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.skeleton} />
            ))}
          </View>
        ) : (
          <>
            {/* Cards */}
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.cardsScroll}
            >
              {visiblePlans.map((plan) => {
                const price = formatPrice(plan);
                const period = formatInterval(plan);
                const isCurrentPlan = plan.tier === currentTier;
                const isPopular = plan.tier === 'PREMIUM';
                const ctaLabel = getCtaLabel(plan);
                const isLoadingThis = loadingPlanId === plan.id;

                return (
                  <View
                    key={plan.id}
                    style={[styles.priceCard, isPopular && styles.priceCardPopular]}
                  >
                    {isPopular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>⭐ Most Popular</Text>
                      </View>
                    )}

                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDesc}>{plan.description}</Text>

                    <View style={styles.priceRow}>
                      <Text style={styles.priceVal}>{price}</Text>
                      {period ? <Text style={styles.pricePeriod}>{period}</Text> : null}
                      {billing === 'year' && plan.priceAmount > 0 && (
                        <View style={styles.priceSaveBadge}>
                          <Text style={styles.priceSaveBadgeText}>Save 33%</Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      disabled={isCurrentPlan || isLoadingThis || loadingPlanId !== null}
                      style={[
                        styles.ctaBtn,
                        isCurrentPlan
                          ? styles.ctaBtnCurrent
                          : isPopular
                            ? styles.ctaBtnPopular
                            : styles.ctaBtnNormal,
                      ]}
                      onPress={() => handleSelect(plan)}
                    >
                      {isLoadingThis ? (
                        <ActivityIndicator size="small" color={isPopular ? '#212529' : '#fff'} />
                      ) : (
                        <Text
                          style={[
                            styles.ctaBtnText,
                            isCurrentPlan
                              ? styles.ctaBtnTextCurrent
                              : isPopular
                                ? styles.ctaBtnTextPopular
                                : styles.ctaBtnTextNormal,
                          ]}
                        >
                          {ctaLabel}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.featuresList}>
                      {plan.features.map((feat, i) => (
                        <View key={i} style={styles.featRow}>
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#22c55e"
                            style={{ marginTop: 2 }}
                          />
                          <Text style={styles.featText}>{feat}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.dots}>
              {visiblePlans.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeIdx && styles.dotActive]} />
              ))}
            </View>
          </>
        )}

        {/* Trial Note — only shown if not yet used trial and is FREE (same logic as web) */}
        {!trialUsed && currentTier === 'FREE' && user && (
          <View style={styles.trialNote}>
            <Ionicons name="gift" size={15} color="#FFC600" style={{ marginTop: 1 }} />
            <Text style={styles.trialNoteText}>
              Start with a <Text style={{ fontWeight: 'bold' }}>7-day free PREMIUM trial</Text> — no
              credit card required.
            </Text>
          </View>
        )}

        {/* Compare Features Toggle */}
        <View style={styles.compareWrap}>
          <TouchableOpacity style={styles.compareBtn} onPress={() => setShowCompare(!showCompare)}>
            <Text style={styles.compareBtnText}>Compare all features</Text>
            <Ionicons
              name={showCompare ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#9ca3af"
            />
          </TouchableOpacity>
        </View>

        {/* Compare Table */}
        {showCompare && (
          <View style={styles.cmpTable}>
            <View style={styles.cmpHead}>
              <Text style={styles.cmpHeadLeft}>Feature</Text>
              <Text style={[styles.cvalText, { color: '#6b7280' }]}>Free</Text>
              <Text style={[styles.cvalText, { color: '#d97706' }]}>Prem.</Text>
              <Text style={[styles.cvalText, { color: '#6b7280' }]}>Pro</Text>
            </View>
            {COMPARE.map((row, i) => (
              <View
                key={i}
                style={[
                  styles.cmpRow,
                  i % 2 === 0 ? { backgroundColor: '#fff' } : { backgroundColor: '#fafafa' },
                ]}
              >
                <Text style={styles.cmpRowLabel}>{row.label}</Text>
                <View style={styles.cval}>
                  <CVal v={row.free} />
                </View>
                <View style={styles.cval}>
                  <CVal v={row.prem} />
                </View>
                <View style={styles.cval}>
                  <CVal v={row.pro} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer Note */}
        <Text style={styles.footerNote}>
          All prices in USD · Cancel anytime ·{' '}
          <Text style={{ color: '#FFC600', fontWeight: 'bold' }}>Contact us</Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerSafe: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 16, color: '#111', letterSpacing: -0.1 },

  content: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 6, alignItems: 'center' },
  badgeSparkle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,198,0,0.12)',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeSparkleText: { color: '#b45309', fontSize: 12, fontWeight: '700' },
  heroTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#111',
    letterSpacing: -0.25,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 26,
  },
  heroDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },

  billingRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, alignItems: 'center' },
  billWrap: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  billBtn: {
    paddingVertical: 9,
    paddingHorizontal: 22,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  billBtnActive: {
    backgroundColor: '#FFC600',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  billBtnText: { fontFamily: FONTS.bold, fontSize: 13, color: '#6b7280' },
  billBtnTextActive: { color: '#212529' },
  saveBadge: {
    backgroundColor: '#22c55e',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 999,
  },
  saveBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  skeletonRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, padding: 20 },
  skeleton: { width: CARD_WIDTH, height: 380, borderRadius: 20, backgroundColor: '#f3f4f6' },

  cardsScroll: { paddingHorizontal: SCREEN_WIDTH * 0.09, paddingVertical: 20, paddingBottom: 28 },
  priceCard: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingTop: 26,
    paddingHorizontal: 20,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priceCardPopular: {
    borderColor: 'rgba(255,198,0,0.35)',
    shadowColor: '#FFC600',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 8,
  },
  popularBadge: {
    position: 'absolute',
    top: -13,
    alignSelf: 'center',
    backgroundColor: '#FFC600',
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 999,
    shadowColor: '#FFC600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  popularBadgeText: { color: '#212529', fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },

  planName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#111',
    letterSpacing: -0.25,
    marginBottom: 4,
  },
  planDesc: { fontSize: 12.5, color: '#64748b', lineHeight: 18, marginBottom: 14 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  priceVal: { fontSize: 42, fontWeight: '800', color: '#111', letterSpacing: -0.25 },
  pricePeriod: { fontSize: 13, color: '#9ca3af', marginLeft: 4 },
  priceSaveBadge: {
    backgroundColor: '#dcfce7',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
    marginLeft: 6,
  },
  priceSaveBadgeText: { color: '#16a34a', fontSize: 10, fontWeight: 'bold' },

  ctaBtn: {
    width: '100%',
    height: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaBtnCurrent: { backgroundColor: '#f3f4f6' },
  ctaBtnPopular: {
    backgroundColor: '#FFC600',
    shadowColor: '#FFC600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.39,
    shadowRadius: 14,
    elevation: 6,
  },
  ctaBtnNormal: { backgroundColor: '#1f2937' },
  ctaBtnText: { fontFamily: FONTS.bold, fontSize: 14 },
  ctaBtnTextCurrent: { color: '#9ca3af' },
  ctaBtnTextPopular: { color: '#212529' },
  ctaBtnTextNormal: { color: '#fff' },

  featuresList: {},
  featRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  featText: { fontSize: 12.5, color: '#374151', flex: 1, lineHeight: 18 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 16 },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: '#d1d5db' },
  dotActive: { width: 20, backgroundColor: '#FFC600' },

  trialNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: 'rgba(255,198,0,0.35)',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  trialNoteText: {
    flex: 1,
    fontSize: 12.5,
    color: '#92400e',
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },

  compareWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  compareBtnText: { fontFamily: FONTS.bold, fontSize: 14, color: '#111' },

  cmpTable: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  cmpHead: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cmpHeadLeft: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: '#9ca3af',
  },
  cvalText: {
    width: 52,
    textAlign: 'center',
    fontFamily: FONTS.bold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cmpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cmpRowLabel: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#374151',
    paddingRight: 8,
  },
  cval: { width: 52, alignItems: 'center' },

  footerNote: {
    textAlign: 'center',
    paddingVertical: 8,
    paddingBottom: 28,
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: '#9ca3af',
  },
});
