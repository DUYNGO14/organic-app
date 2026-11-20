import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export const startupTitle = "Organic Việt Nam";
const words = Array.from(startupTitle.matchAll(/\S+/g));
const letterDelay = 52;
const letterDuration = 220;
const titleDuration = (startupTitle.length - 1) * letterDelay + letterDuration;

function StartupLetter({
  letter,
  index,
  color,
  elapsed,
}: {
  letter: string;
  index: number;
  color: string;
  elapsed: SharedValue<number>;
}) {
  const start = index * letterDelay;
  const style = useAnimatedStyle(() => {
    const progress = interpolate(
      elapsed.get(),
      [start, start + letterDuration],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity: progress,
      transform: [{ translateY: (1 - progress) * 8 }],
    };
  });

  return (
    <Animated.View style={style}>
      <Text className="font-vietnam text-headline-lg" style={{ color }}>
        {letter}
      </Text>
    </Animated.View>
  );
}

export function StartupTitle({
  colors,
  onComplete,
}: {
  colors: [string, string];
  onComplete: () => void;
}) {
  const elapsed = useSharedValue(0);

  useEffect(() => {
    elapsed.set(
      withTiming(
        titleDuration,
        {
          duration: titleDuration,
          easing: Easing.linear,
          reduceMotion: ReduceMotion.System,
        },
        (finished) => {
          if (finished) scheduleOnRN(onComplete);
        },
      ),
    );
    return () => cancelAnimation(elapsed);
  }, [elapsed, onComplete]);

  return (
    <View className="flex-row flex-wrap justify-center gap-x-1.5">
      {words.map(({ 0: word, index: offset = 0 }) => (
        <View key={offset} className="flex-row">
          {Array.from(word, (letter, position) => {
            const index = offset + position;
            const color = interpolateColor(
              index,
              [0, startupTitle.length - 1],
              colors,
            );
            return (
              <StartupLetter
                key={index}
                letter={letter}
                index={index}
                color={color}
                elapsed={elapsed}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}
