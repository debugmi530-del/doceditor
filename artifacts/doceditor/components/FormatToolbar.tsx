import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useColors } from '@/hooks/useColors';

interface ToolbarAction {
  icon?: React.ComponentProps<typeof Feather>['name'];
  label?: string;
  onPress: () => void;
  active?: boolean;
  divider?: boolean;
}

interface Props {
  actions: ToolbarAction[];
}

export function FormatToolbar({ actions }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="always"
      >
        {actions.map((action, i) => {
          if (action.divider) {
            return (
              <View
                key={`divider-${i}`}
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
            );
          }
          return (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.btn,
                {
                  backgroundColor: action.active
                    ? colors.primary + '22'
                    : pressed
                    ? colors.muted
                    : 'transparent',
                },
              ]}
              onPress={action.onPress}
              hitSlop={4}
            >
              {action.icon ? (
                <Feather
                  name={action.icon}
                  size={18}
                  color={action.active ? colors.primary : colors.foreground}
                />
              ) : (
                <Text
                  style={[
                    styles.labelBtn,
                    {
                      color: action.active ? colors.primary : colors.foreground,
                    },
                  ]}
                >
                  {action.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingVertical: Platform.OS === 'web' ? 6 : 4,
  },
  scroll: {
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  btn: {
    width: 38,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  labelBtn: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  divider: {
    width: 1,
    height: 22,
    marginHorizontal: 4,
  },
});
