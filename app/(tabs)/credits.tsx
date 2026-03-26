import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from 'expo-vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { usePaymentSheet } from '@stripe/stripe-react-native';
import { useStore, CREDIT_PACKS } from '../../store';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '../../constants/theme';
import SpinWheel from '../../components/SpinWheel';
import FanCard from '../../components/FanCard';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const { width } = Dimensions.get('window');

function TransactionItem({ tx }: { tx: ReturnType<typeof useStore>['transactions'][0] }) {
  const isPositive = tx.amount > 0;
  const icons: Record<string, string> = {
    purchase: 'cart',
    spend: 'flash',
    earn: 'trending-up',
    bonus: 'gift',
  };

  return (
    <View style={txStyles.row}>
      <View style={[txStyles.icon, { backgroundColor: isPositive ? Colors.lime + '15' : Colors.dark2 }]}>
        <Ionicons name={icons[tx.type] as any} size={16} color={isPositive ? Colors.lime : Colors.gray} />
      </View>
      <View style={txStyles.info}>
        <Text style={txStyles.desc}>{tx.description}</Text>
        <Text style={txStyles.date}>
          {new Date(tx.timestamp).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <Text style={[txStyles.amount, { color: isPositive ? Colors.lime : Colors.gray }]}>
        {isPositive ? '+' : ''}{tx.amount}
      </Text>
    </View>
  );
}

const txStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  desc: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  date: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  amount: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.base,
    fontWeight: 'bold',
  },
});

export default function CreditsScreen() {
  const credits = useStore((s) => s.creditsBalance);
  const transactions = useStore((s) => s.transactions);
  const fanCards = useStore((s) => s.fanCards);
  const addCredits = useStore((s) => s.addCredits);

  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [mysteryRevealed, setMysteryRevealed] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  const eurValue = (credits * 0.1).toFixed(2);

  const handlePurchase = async (pack: typeof CREDIT_PACKS[0]) => {
    setPaymentLoading(true);
    try {
      // 1. Ask backend to create a PaymentIntent
      const resp = await fetch(`${API_URL}/api/v1/credits/payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id }),
      });
      if (!resp.ok) throw new Error('Failed to create payment intent');
      const { paymentIntent, ephemeralKey, customerId } = await resp.json();

      // 2. Init the PaymentSheet (supports Apple Pay + Google Pay automatically)
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'FLIC',
        customerId,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        applePay: {
          merchantCountryCode: 'IT',
          cartItems: [
            {
              label: `${pack.name} — ${pack.credits + pack.bonus} credits`,
              amount: pack.priceEur.toString(),
              paymentType: 'Immediate',
            },
          ],
        },
        googlePay: {
          merchantCountryCode: 'IT',
          testEnv: true,
          currencyCode: 'EUR',
          label: `${pack.name} — ${pack.credits + pack.bonus} credits`,
          amount: pack.priceEur.toString(),
        },
        style: 'alwaysDark',
        primaryButtonLabel: `Pay €${pack.priceEur}`,
      });
      if (initError) throw new Error(initError.message);

      // 3. Present the sheet
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert('Payment failed', presentError.message);
        }
        return;
      }

      // 4. Payment succeeded — credits added server-side via Stripe webhook
      addCredits(pack.credits + pack.bonus); // optimistic update
      Alert.alert('', `+${pack.credits + pack.bonus} credits added to your wallet!`);
    } catch (e: any) {
      // Fallback for dev without backend
      Alert.alert(
        `Buy ${pack.credits + pack.bonus} credits`,
        `€${pack.priceEur} — backend not configured, adding credits directly.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add (dev)', onPress: () => addCredits(pack.credits + pack.bonus) },
        ]
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSpinWin = (prize: string) => {
    // Add credits based on prize
    addCredits(10);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Credits</Text>
          <TouchableOpacity style={styles.historyButton}>
            <Ionicons name="time-outline" size={18} color={Colors.gray} />
            <Text style={styles.historyText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Balance card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.balanceCard}
        >
          <LinearGradient
            colors={['rgba(0,200,120,0.12)', 'rgba(0,200,120,0.03)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.balanceHeader}>
            <Ionicons name="flash" size={20} color={Colors.lime} />
            <Text style={styles.balanceLabel}>Your balance</Text>
          </View>
          <Text style={styles.balanceAmount}>{credits}</Text>
          <Text style={styles.balanceValue}>= €{eurValue} value</Text>
          <View style={styles.balanceFooter}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatValue}>3</Text>
              <Text style={styles.balanceStatLabel}>Free FLICs today</Text>
            </View>
            <View style={styles.balanceStatDivider} />
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatValue}>47</Text>
              <Text style={styles.balanceStatLabel}>Used this month</Text>
            </View>
            <View style={styles.balanceStatDivider} />
            <View style={styles.balanceStat}>
              <Text style={[styles.balanceStatValue, { color: Colors.gold }]}>8</Text>
              <Text style={styles.balanceStatLabel}>Earned this week</Text>
            </View>
          </View>
        </MotiView>

        {/* Credit packs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buy credits</Text>
          <View style={styles.packsGrid}>
            {CREDIT_PACKS.map((pack, i) => (
              <MotiView
                key={pack.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400, delay: i * 80 }}
                style={styles.packCardWrapper}
              >
                <TouchableOpacity
                  style={[
                    styles.packCard,
                    pack.badge && styles.packCardFeatured,
                  ]}
                  onPress={() => handlePurchase(pack)}
                  activeOpacity={0.85}
                  disabled={paymentLoading}
                >
                  {pack.badge && (
                    <View style={styles.packBadge}>
                      <Text style={styles.packBadgeText}>{pack.badge}</Text>
                    </View>
                  )}
                  <Text style={styles.packPrice}>€{pack.priceEur}</Text>
                  <View style={styles.packCredits}>
                    <Ionicons name="flash" size={16} color={Colors.lime} />
                    <Text style={styles.packCreditsNum}>{pack.credits}</Text>
                  </View>
                  {pack.bonus > 0 && (
                    <Text style={styles.packBonus}>+{pack.bonus} bonus</Text>
                  )}
                  <Text style={styles.packTotal}>
                    {pack.credits + pack.bonus} total
                  </Text>
                  <View style={styles.packPayBadge}>
                    <Ionicons
                      name={Platform.OS === 'ios' ? 'logo-apple' : 'logo-google'}
                      size={10}
                      color={Colors.gray}
                    />
                    <Text style={styles.packPayText}>
                      {Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        </View>

        {/* Transaction history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>
          <View style={styles.txContainer}>
            {transactions.slice(0, 6).map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </View>
        </View>

        {/* SpinWheel section */}
        <View style={styles.section}>
          <View style={styles.spinHeader}>
            <View>
              <Text style={styles.sectionTitle}>🎰 Daily SpinWheel</Text>
              <Text style={styles.spinSubtext}>Free spin every 24h · Win credits & fan cards</Text>
            </View>
            <TouchableOpacity
              style={styles.spinToggle}
              onPress={() => setShowSpinWheel(!showSpinWheel)}
            >
              <Text style={styles.spinToggleText}>{showSpinWheel ? 'Hide' : 'Show'}</Text>
              <Ionicons name={showSpinWheel ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.lime} />
            </TouchableOpacity>
          </View>
          {showSpinWheel && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 300 }}
              style={styles.spinWheelContainer}
            >
              <SpinWheel onWin={handleSpinWin} />
            </MotiView>
          )}
        </View>

        {/* Mystery Drop */}
        <View style={[styles.section]}>
          <Text style={styles.sectionTitle}>🔮 Mystery Drop</Text>
          <TouchableOpacity
            style={styles.mysteryCard}
            onPress={() => setMysteryRevealed(!mysteryRevealed)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.violet + '30', '#1A0533']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.mysteryContent}>
              <MotiView
                animate={{ scale: mysteryRevealed ? 1 : [1, 1.1, 1] }}
                transition={{ type: 'timing', duration: 1500, loop: !mysteryRevealed }}
              >
                <Text style={styles.mysteryEmoji}>
                  {mysteryRevealed ? '🎴' : '❓'}
                </Text>
              </MotiView>
              <View>
                <Text style={styles.mysteryTitle}>
                  {mysteryRevealed ? 'Jake Williams — Legendary Card!' : 'Mystery Drop active'}
                </Text>
                <Text style={styles.mysterySubtext}>
                  {mysteryRevealed ? 'Edition #7/50 · Worth 120 credits' : '50 credits to reveal • Limited edition fan card inside'}
                </Text>
              </View>
              {!mysteryRevealed && (
                <View style={styles.mysteryRevealBtn}>
                  <Text style={styles.mysteryRevealText}>Reveal · 50</Text>
                  <Ionicons name="flash" size={12} color={Colors.violet} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Fan Cards */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎴 Your Fan Cards</Text>
            <Text style={styles.cardCount}>{fanCards.length} cards</Text>
          </View>
          <View style={styles.cardsGrid}>
            {fanCards.map((card) => (
              <FanCard key={card.id} card={card} onSell={() => {}} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  title: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize['2xl'],
    color: Colors.white,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  balanceCard: {
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.lime + '40',
    padding: Spacing.lg,
    overflow: 'hidden',
    gap: 4,
    ...Shadow.lime,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceLabel: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.lime,
  },
  balanceAmount: {
    fontFamily: FontFamily.syneBold,
    fontSize: 64,
    color: Colors.white,
    lineHeight: 72,
  },
  balanceValue: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.base,
    color: Colors.gray,
    marginBottom: 12,
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  balanceStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  balanceStatValue: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.lg,
    color: Colors.white,
    fontWeight: 'bold',
  },
  balanceStatLabel: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: 10,
    color: Colors.gray,
    textAlign: 'center',
  },
  balanceStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.white,
    marginBottom: 12,
  },
  packsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  packCardWrapper: {
    width: (width - Spacing.base * 2 - 10) / 2,
  },
  packCard: {
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  packCardFeatured: {
    borderColor: Colors.lime + '60',
    backgroundColor: Colors.lime + '08',
  },
  packBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.lime,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  packBadgeText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: 9,
    color: Colors.black,
  },
  packPrice: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.xl,
    color: Colors.white,
    marginTop: 12,
  },
  packCredits: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  packCreditsNum: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.xl,
    color: Colors.lime,
    fontWeight: 'bold',
  },
  packBonus: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.xs,
    color: Colors.gold,
  },
  packTotal: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  packPayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
    backgroundColor: Colors.dark2,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  packPayText: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: 9,
    color: Colors.gray,
  },
  txContainer: {
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  // SpinWheel
  spinHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  spinSubtext: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: 2,
  },
  spinToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spinToggleText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.lime,
  },
  spinWheelContainer: {
    overflow: 'hidden',
  },
  // Mystery
  mysteryCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.violet + '60',
    padding: 16,
    overflow: 'hidden',
    ...Shadow.violet,
  },
  mysteryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  mysteryEmoji: {
    fontSize: 40,
  },
  mysteryTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.base,
    color: Colors.white,
    flex: 1,
  },
  mysterySubtext: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: 2,
    flex: 1,
  },
  mysteryRevealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.violet + '20',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.violet + '60',
  },
  mysteryRevealText: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.xs,
    color: Colors.violet,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardCount: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
});
