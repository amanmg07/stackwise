// ────────────────────────────────────────────────────────────────────
// StreakStrip — the daily-habit retention surface.
//
// Inline minimalist card (see plan ticket 1.2). Hero count on the left,
// 7-dot grid on the right with day-of-week initials. Today's cell is
// either filled amber (logged) or an outlined ring (the "unclosed
// circle" nudge to log).
//
// Used on Home (ticket 1.1) and at the top of JournalScreen. Pure
// presentational — all date math lives in src/utils/streak.ts.
// ────────────────────────────────────────────────────────────────────

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, spacing, highlights, typography } from "../theme";
import type { StreakInfo } from "../utils/streak";

interface Props {
  info: StreakInfo;
  /** Tap on today's not-yet-logged dot — wire to the quick-log path. */
  onPressTodayDot?: () => void;
  /** Tap anywhere else on the strip — wire to "open Journal." */
  onPressOpen?: () => void;
}

const DAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];
const DOT_SIZE = 14;

/** Local-date YYYY-MM-DD → single-letter day-of-week initial. */
function dayInitial(localDate: string): string {
  const [y, m, d] = localDate.split("-").map(Number);
  // new Date(y, m-1, d) constructs a local-midnight Date, so .getDay()
  // returns the correct local day-of-week regardless of host TZ.
  const local = new Date(y, m - 1, d);
  return DAY_INITIALS[local.getDay()];
}

export function StreakStrip({ info, onPressTodayDot, onPressOpen }: Props) {
  return (
    <View style={styles.card}>
      {/* Left: hero count. Whole left column opens Journal on tap. */}
      <TouchableOpacity
        style={styles.leftCol}
        onPress={onPressOpen}
        activeOpacity={onPressOpen ? 0.7 : 1}
        disabled={!onPressOpen}
        accessibilityRole="button"
        accessibilityLabel={`Day ${info.current} streak. Tap to open Journal.`}
      >
        <Text style={styles.count}>{info.current}</Text>
        <Text style={styles.label}>day{"\n"}streak</Text>
      </TouchableOpacity>

      {/* Right: 7-dot grid, oldest → today. */}
      <View style={styles.dotsRow}>
        {info.last7.map((d) => {
          const isTodayDot = d.isToday;
          const isTapTarget = isTodayDot && !d.logged && !!onPressTodayDot;

          const dotStyle = [
            styles.dot,
            d.logged && styles.dotLogged,
            !d.logged && isTodayDot && styles.dotToday,
            !d.logged && !isTodayDot && styles.dotMissed,
          ];

          // The today-dot becomes a tap target when not yet logged
          // (quick-log path). Other cells / logged today fall through to
          // the wrapping View — the left column handles "open Journal."
          const Cell: React.ComponentType<any> = isTapTarget
            ? TouchableOpacity
            : View;
          const cellProps = isTapTarget
            ? {
                onPress: onPressTodayDot,
                activeOpacity: 0.6,
                accessibilityRole: "button" as const,
                accessibilityLabel: "Log today",
                hitSlop: { top: 8, bottom: 8, left: 4, right: 4 },
              }
            : {};

          return (
            <View key={d.date} style={styles.dotCol}>
              <Cell style={dotStyle} {...cellProps} />
              <Text
                style={[
                  styles.dayLabel,
                  isTodayDot && styles.dayLabelToday,
                ]}
              >
                {isTodayDot ? "·" : dayInitial(d.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
  },
  leftCol: {
    minWidth: 56,
  },
  count: {
    fontSize: 32,
    fontWeight: "700",
    color: highlights.white,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  dotsRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dotCol: {
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  dotLogged: {
    backgroundColor: highlights.yellow,
  },
  dotMissed: {
    backgroundColor: colors.border,
  },
  dotToday: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: highlights.yellow,
  },
  dayLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  dayLabelToday: {
    color: highlights.yellow,
    fontWeight: "700",
  },
});
