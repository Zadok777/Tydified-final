import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import * as StoreReview from 'expo-store-review';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { TydifiedIcon } from '../../components/brand/TydifiedIcon';
import { Header } from '../../components/layout/Header';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ProfileEditModal } from '../../components/modals/ProfileEditModal';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { signOut as authSignOut } from '../../services/auth';
import { renameFamily } from '../../services/families';
import { deleteUserAccount } from '../../services/rpc';
import { updateMySettings } from '../../services/settings';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { useSettingsStore } from '../../store/settingsStore';
import {
  radii,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type {
  MainTabParamList,
  RootStackParamList,
} from '../../types/app.types';
import { TAB_BAR_CLEARANCE } from './layout';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'More'>,
  StackNavigationProp<RootStackParamList>
>;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export function MoreScreen() {
  const nav = useNavigation<Nav>();
  const toast = useToast();
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const profile = useAuthStore((s) => s.profile);
  const session = useAuthStore((s) => s.session);
  const family = useFamilyStore((s) => s.family);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [editAvatar, setEditAvatar] = useState(false);

  const displayName = profile?.display_name ?? session?.user?.email ?? 'there';
  const email = session?.user?.email ?? '';

  const onToggleNotifications = async (v: boolean) => {
    useSettingsStore.getState().setNotificationsEnabled(v);
    const res = await updateMySettings({ notifications_enabled: v });
    if (!res.success) toast.show({ message: res.error, tone: 'error' });
  };

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (trimmed === '' || family === null) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    const res = await renameFamily(family.id, trimmed);
    setSavingName(false);
    if (!res.success) {
      toast.show({ message: res.error, tone: 'error', duration: 5000 });
      return;
    }
    useFamilyStore.getState().setFamily(res.data);
    setEditingName(false);
    toast.show({ message: 'Family renamed.', tone: 'success' });
  };

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          const res = await authSignOut();
          if (!res.success) toast.show({ message: res.error, tone: 'error' });
        },
      },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your family, kids, chores, rewards, and history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteUserAccount();
            if (!res.success) {
              toast.show({ message: res.error, tone: 'error', duration: 5000 });
              return;
            }
            await authSignOut();
          },
        },
      ]
    );
  };

  const soon = (label: string) =>
    toast.show({ message: `${label} arrives in a later update.`, tone: 'info' });

  const onRate = async () => {
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
        return;
      }
      const url = await StoreReview.storeUrl();
      if (url) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      // fall through to the friendly note below
    }
    toast.show({
      message: 'Ratings open once Tydified is published to the store.',
      tone: 'info',
    });
  };

  return (
    <>
    <ScreenContainer scroll contentStyle={styles.content}>
      <Header title="Settings" />

      <GlassCard style={styles.profileCard}>
        <View style={styles.profileRow}>
          <Pressable
            onPress={() => setEditAvatar(true)}
            accessibilityRole="button"
            accessibilityLabel="Edit your avatar"
          >
            <Avatar
              name={displayName}
              gradientIndex={profile?.avatar_gradient ?? undefined}
              icon={profile?.avatar_icon}
              size="lg"
            />
          </Pressable>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName} maxFontSizeMultiplier={1.3} numberOfLines={1}>
              {displayName}
            </Text>
            {email !== '' ? (
              <Text style={styles.profileSub} maxFontSizeMultiplier={1.3} numberOfLines={1}>
                {email}
              </Text>
            ) : null}
            <View style={styles.planBadge}>
              <Ionicons name="star" size={11} color={C.pink} />
              <Text style={styles.planText} maxFontSizeMultiplier={1.1}>
                Tydified Free
              </Text>
            </View>
          </View>
        </View>
      </GlassCard>

      <SectionLabel text="Preferences" />
      <GlassCard padding={0}>
        <Row
          icon="notifications-outline"
          tone="orange"
          label="Notifications"
          sub="Approvals, redemptions, daily"
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={onToggleNotifications}
              trackColor={{ false: C.mutedAlpha20, true: C.pink }}
              thumbColor={C.textWhite}
            />
          }
        />
        <Divider />
        <Row
          icon="musical-notes-outline"
          tone="purple"
          label="Sound effects"
          sub="Chimes, pops & celebrations"
          right={
            <Switch
              value={soundEnabled}
              onValueChange={(v) => useSettingsStore.getState().setSoundEnabled(v)}
              trackColor={{ false: C.mutedAlpha20, true: C.pink }}
              thumbColor={C.textWhite}
            />
          }
        />
        <Divider />
        <Row
          icon="shield-checkmark-outline"
          tone="green"
          label="Privacy & COPPA"
          sub="Child data protections"
          onPress={() =>
            toast.show({
              message: 'Kids give only a name and birthday — never email or phone.',
              tone: 'info',
              duration: 5000,
            })
          }
        />
      </GlassCard>

      <SectionLabel text="Family" />
      <GlassCard padding={0}>
        {editingName ? (
          <View style={styles.renameWrap}>
            <Input
              label="Family name"
              value={nameDraft}
              onChangeText={setNameDraft}
              autoCapitalize="words"
              maxLength={40}
            />
            <View style={styles.renameActions}>
              <Button label="Save" onPress={saveName} loading={savingName} size="sm" />
              <Button
                label="Cancel"
                variant="ghost"
                size="sm"
                onPress={() => setEditingName(false)}
              />
            </View>
          </View>
        ) : (
          <Row
            icon="home-outline"
          tone="pink"
            label="Family name"
            value={family?.name ?? '—'}
            onPress={() => {
              setNameDraft(family?.name ?? '');
              setEditingName(true);
            }}
          />
        )}
        <Divider />
        <Row
          icon="people-outline"
          tone="purple"
          label="Manage kids"
          value={`${useFamilyStore.getState().children.length}`}
          onPress={() => nav.navigate('Family')}
        />
        <Divider />
        <Row
          icon="gift-outline"
          tone="rose"
          label="Reward catalog"
          onPress={() => nav.navigate('Rewards')}
        />
      </GlassCard>

      <SectionLabel text="Subscription" />
      <GlassCard padding={0}>
        <Row
          icon="star-outline"
          tone="orange"
          label="Tydified Plus"
          sub="Unlimited kids & chores"
          onPress={() => nav.navigate('Paywall')}
        />
        <Divider />
        <Row
          icon="card-outline"
          tone="pink"
          label="Billing & invoices"
          onPress={() => soon('Billing')}
        />
      </GlassCard>

      <SectionLabel text="Support" />
      <GlassCard padding={0}>
        <Row
          icon="book-outline"
          tone="pink"
          label="How Tydified works"
          sub="A 5-step quick start"
          onPress={() => nav.navigate('HowTo')}
        />
        <Divider />
        <Row
          icon="help-circle-outline"
          tone="green"
          label="Help center"
          onPress={() => nav.navigate('Help')}
        />
        <Divider />
        <Row icon="heart-outline"
          tone="rose" label="Rate Tydified" onPress={onRate} />
      </GlassCard>

      <View style={styles.dangerActions}>
        <Button label="Sign out" variant="danger" onPress={handleSignOut} fullWidth />
        <Button label="Delete account" variant="ghost" onPress={confirmDelete} fullWidth />
      </View>

      <View style={styles.footer}>
        <TydifiedIcon size={40} animated />
        <Text style={styles.footerText} maxFontSizeMultiplier={1.2}>
          Tydified v1.0 · made with care
        </Text>
      </View>
    </ScreenContainer>
    <ProfileEditModal
      visible={editAvatar}
      onClose={() => setEditAvatar(false)}
      target={{ kind: 'parent' }}
      onSaved={() => {}}
    />
    </>
  );
}

// ---------------------------------------------------------------------------

function SectionLabel({ text }: { text: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Text style={styles.sectionLabel} maxFontSizeMultiplier={1.3}>
      {text.toUpperCase()}
    </Text>
  );
}

function Divider() {
  const styles = useThemedStyles(makeStyles);
  return <View style={styles.divider} />;
}

type RowTone = 'pink' | 'orange' | 'green' | 'purple' | 'rose';

function Row({
  icon,
  label,
  sub,
  value,
  right,
  onPress,
  tone = 'pink',
}: {
  icon: IoniconName;
  label: string;
  sub?: string;
  value?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  tone?: RowTone;
}) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const interactive = onPress !== undefined;
  // Me+ settings pattern: every row gets a lockup-hue icon bubble so the
  // list carries the brand rainbow instead of a wall of gray glyphs.
  const tint: Record<RowTone, { bg: string; fg: string }> = {
    pink: { bg: C.pinkAlpha15, fg: C.pink },
    orange: { bg: C.orangeAlpha15, fg: C.orange },
    green: { bg: C.greenAlpha15, fg: C.greenText },
    purple: { bg: C.purpleAlpha15, fg: C.purple },
    rose: { bg: C.roseAlpha15, fg: C.rose },
  };
  return (
    <Pressable
      onPress={onPress}
      disabled={!interactive}
      accessibilityRole={interactive ? 'button' : undefined}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, pressed && interactive && styles.rowPressed]}
    >
      <View style={[styles.rowIcon, { backgroundColor: tint[tone].bg }]}>
        <Ionicons name={icon} size={19} color={tint[tone].fg} />
      </View>
      <View style={styles.rowMeta}>
        <Text style={styles.rowLabel} maxFontSizeMultiplier={1.3}>
          {label}
        </Text>
        {sub !== undefined ? (
          <Text style={styles.rowSub} maxFontSizeMultiplier={1.3}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right !== undefined ? (
        right
      ) : value !== undefined ? (
        <Text style={styles.rowValue} maxFontSizeMultiplier={1.3} numberOfLines={1}>
          {value}
        </Text>
      ) : interactive ? (
        <Ionicons name="chevron-forward" size={16} color={C.textLight} />
      ) : null}
    </Pressable>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    content: {
      paddingBottom: TAB_BAR_CLEARANCE,
    },
    profileCard: {
      marginTop: spacing.s8,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s16,
    },
    profileMeta: {
      flex: 1,
    },
    profileName: {
      ...typography.title,
      color: C.textDark,
    },
    profileSub: {
      ...typography.caption,
      color: C.textMid,
      marginTop: 2,
    },
    planBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s4,
      alignSelf: 'flex-start',
      backgroundColor: C.pinkAlpha10,
      paddingHorizontal: spacing.s8,
      paddingVertical: 3,
      borderRadius: radii.rFull,
      marginTop: spacing.s8,
    },
    planText: {
      ...typography.caption,
      fontSize: 11,
      color: C.pink,
      fontFamily: 'DMSans_700Bold',
    },
    sectionLabel: {
      ...typography.caption,
      color: C.textMid,
      letterSpacing: 0.8,
      marginTop: spacing.s24,
      marginBottom: spacing.s8,
      marginLeft: spacing.s4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s12,
      paddingHorizontal: spacing.s16,
      paddingVertical: spacing.s12,
      minHeight: 64,
    },
    rowIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.rFull,
      backgroundColor: C.glassLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: C.border,
    },
    rowPressed: {
      opacity: 0.6,
    },
    rowMeta: {
      flex: 1,
    },
    rowLabel: {
      ...typography.body,
      color: C.textDark,
      fontFamily: 'DMSans_600SemiBold',
    },
    rowSub: {
      ...typography.caption,
      color: C.textMid,
      marginTop: 2,
    },
    rowValue: {
      ...typography.body,
      color: C.textMid,
    },
    divider: {
      height: 1,
      backgroundColor: C.border,
      marginLeft: spacing.s16 + 20 + spacing.s12,
    },
    renameWrap: {
      padding: spacing.s16,
      gap: spacing.s12,
    },
    renameActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s8,
    },
    dangerActions: {
      gap: spacing.s12,
      marginTop: spacing.s24,
    },
    footer: {
      alignItems: 'center',
      gap: spacing.s8,
      marginTop: spacing.s32,
    },
    footerText: {
      ...typography.caption,
      color: C.textLight,
    },
  });
