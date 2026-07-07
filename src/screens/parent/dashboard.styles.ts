import { StyleSheet } from 'react-native';

import { radii, spacing, typography, type Palette } from '../../theme';
import { TAB_BAR_CLEARANCE } from './layout';

// Shared stylesheet for ParentDashboard and its section components
// (DashboardSections.tsx). Kept in one place so the screen and its pieces use
// the exact same keys without duplication.
export const makeStyles = (C: Palette) =>
  StyleSheet.create({
    content: {
      paddingBottom: TAB_BAR_CLEARANCE,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingTop: spacing.s8,
      marginBottom: spacing.s16,
    },
    headerText: {
      flex: 1,
    },
    dateLabel: {
      ...typography.caption,
      color: C.textMid,
      letterSpacing: 1,
      marginBottom: 2,
    },
    greeting: {
      ...typography.headline,
      fontSize: 28,
      color: C.textDark,
    },
    greetingName: {
      color: C.pinkText,
    },
    subGreeting: {
      ...typography.caption,
      color: C.textMid,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s8,
    },
    bell: {
      width: 40,
      height: 40,
      borderRadius: radii.rFull,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bellDot: {
      position: 'absolute',
      top: 9,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: radii.rFull,
      backgroundColor: C.pink,
      borderWidth: 2,
      borderColor: C.bg,
    },
    // Hero
    heroCard: {
      marginBottom: spacing.s8,
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    heroLabel: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.85)',
      letterSpacing: 1,
    },
    heroBody: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s16,
      marginTop: spacing.s12,
    },
    heroCount: {
      ...typography.heroNum,
      fontSize: 52,
      color: '#FFFFFF',
    },
    heroMeta: {
      flex: 1,
    },
    heroChore: {
      ...typography.title,
      fontSize: 17,
      color: '#FFFFFF',
    },
    heroMore: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 2,
    },
    // Sections
    sectionTitle: {
      ...typography.title,
      color: C.textDark,
      marginTop: spacing.s24,
      marginBottom: spacing.s12,
    },
    // Snapshot
    snapshotRow: {
      flexDirection: 'row',
      gap: spacing.s12,
    },
    snapTile: {
      flex: 1,
      borderRadius: radii.r16,
      paddingVertical: spacing.s16,
      paddingHorizontal: spacing.s12,
      alignItems: 'flex-start',
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.border,
    },
    snapValue: {
      ...typography.heroNum,
      fontSize: 36,
    },
    snapLabel: {
      ...typography.label,
      color: C.textMid,
      marginTop: spacing.s4,
    },
    // Quick actions
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.s12,
    },
    actionItem: {
      width: '47.5%',
      flexGrow: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s12,
      backgroundColor: C.glass,
      borderRadius: radii.r18,
      borderWidth: 1,
      borderColor: C.border,
      padding: spacing.s12,
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.r12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      ...typography.button,
      color: C.textDark,
      flexShrink: 1,
    },
    // Empty kids
    emptyKids: {
      backgroundColor: C.glass,
      borderRadius: radii.r18,
      borderWidth: 1,
      borderColor: C.border,
      padding: spacing.s20,
    },
    emptyKidsText: {
      ...typography.body,
      color: C.textMid,
      textAlign: 'center',
    },
    // Kid progress
    kidList: {
      gap: spacing.s12,
    },
    kidCard: {
      backgroundColor: C.glass,
      borderRadius: radii.r18,
      borderWidth: 1,
      borderColor: C.border,
      padding: spacing.s16,
    },
    kidTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s12,
      marginBottom: spacing.s12,
    },
    kidMeta: {
      flex: 1,
    },
    kidName: {
      ...typography.title,
      fontSize: 16,
      color: C.textDark,
    },
    kidAge: {
      ...typography.caption,
      color: C.textMid,
    },
    kidSubRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s8,
      marginTop: 2,
    },
    kidSub: {
      ...typography.caption,
      color: C.textMid,
    },
    kidPoints: {
      alignItems: 'flex-end',
    },
    kidPointsValue: {
      ...typography.title,
      fontSize: 20,
      color: C.textDark,
    },
    kidPointsLabel: {
      ...typography.caption,
      fontSize: 10,
      color: C.textMid,
      letterSpacing: 0.6,
    },
    barTrack: {
      height: 8,
      borderRadius: radii.rFull,
      backgroundColor: C.mutedAlpha20,
      overflow: 'hidden',
    },
    barFill: {
      height: 8,
      borderRadius: radii.rFull,
    },
    barFillGradient: {
      flex: 1,
    },
    // Goals
    goalCard: {
      backgroundColor: C.glass,
      borderRadius: radii.r18,
      borderWidth: 1,
      borderColor: C.border,
      padding: spacing.s16,
    },
    goalTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s12,
      marginBottom: spacing.s12,
    },
    goalIcon: {
      width: 36,
      height: 36,
      borderRadius: radii.rFull,
      backgroundColor: C.pinkAlpha10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    goalMeta: {
      flex: 1,
    },
    goalTitle: {
      ...typography.title,
      fontSize: 16,
      color: C.textDark,
    },
    goalSub: {
      ...typography.caption,
      color: C.textMid,
      marginTop: 2,
    },
  });
