
# Animation Documentation - Smoke Less App

This document describes all animations used in the Smoke Less app so you can recreate them in other applications.

## Library Used
**React Native Reanimated** (version ~4.1.0)
- Import: `import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, FadeIn, FadeInDown } from 'react-native-reanimated';`

---

## 1. ONBOARDING SCREEN ANIMATIONS

### 1.1 Pulsating Orbs (Background Decoration)

**Animation Name:** Pulsating Scale & Opacity Animation

**Description:** Two circular gradient orbs that continuously scale up/down and fade in/out to create a breathing/pulsating effect in the background.

**Settings:**
- **Animation Type:** Infinite loop with sequence
- **Properties Animated:** `scale` and `opacity`
- **Easing:** `Easing.inOut(Easing.ease)` - smooth acceleration and deceleration

**Orb 1 Configuration:**
```javascript
// Scale Animation
withRepeat(
  withSequence(
    withTiming(1.2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
    withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
  ),
  -1,  // Infinite repetitions
  false // Don't reverse
)

// Opacity Animation
withRepeat(
  withSequence(
    withTiming(0.6, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
    withTiming(0.3, { duration: 3000, easing: Easing.inOut(Easing.ease) })
  ),
  -1,
  false
)
```

**Orb 2 Configuration:**
```javascript
// Scale Animation
withRepeat(
  withSequence(
    withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
    withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
  ),
  -1,
  false
)

// Opacity Animation
withRepeat(
  withSequence(
    withTiming(0.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
    withTiming(0.3, { duration: 4000, easing: Easing.inOut(Easing.ease) })
  ),
  -1,
  false
)
```

**Visual Details:**
- Orb 1: 300x300px circle, positioned top-right (-100, -100 offset)
- Orb 2: 400x400px circle, positioned bottom-left (-150, -150 offset)
- Both use white color with transparency: `rgba(255, 255, 255, 0.3)`
- Scale range: 1.0 → 1.2 (Orb 1), 1.0 → 1.3 (Orb 2)
- Opacity range: 0.3 → 0.6 (Orb 1), 0.3 → 0.5 (Orb 2)
- Duration: 3 seconds per cycle (Orb 1), 4 seconds per cycle (Orb 2)

**Implementation:**
```javascript
const orb1Scale = useSharedValue(1);
const orb1Opacity = useSharedValue(0.3);
const orb2Scale = useSharedValue(1);
const orb2Opacity = useSharedValue(0.3);

useEffect(() => {
  // Start animations on mount
  orb1Scale.value = withRepeat(...);
  orb1Opacity.value = withRepeat(...);
  orb2Scale.value = withRepeat(...);
  orb2Opacity.value = withRepeat(...);
}, []);

const orb1Style = useAnimatedStyle(() => ({
  transform: [{ scale: orb1Scale.value }],
  opacity: orb1Opacity.value,
}));

const orb2Style = useAnimatedStyle(() => ({
  transform: [{ scale: orb2Scale.value }],
  opacity: orb2Opacity.value,
}));
```

---

## 2. HOME SCREEN ANIMATIONS

### 2.1 Rotating Background Orb

**Animation Name:** Continuous Rotation Animation

**Description:** A large gradient orb that rotates continuously in the background, creating a subtle dynamic effect.

**Settings:**
- **Animation Type:** Infinite linear rotation
- **Property Animated:** `rotate` (0° to 360°)
- **Duration:** 120,000ms (120 seconds = 2 minutes per full rotation)
- **Easing:** `Easing.linear` - constant speed rotation

**Configuration:**
```javascript
withRepeat(
  withTiming(360, { 
    duration: 120000, 
    easing: Easing.linear 
  }),
  -1,  // Infinite repetitions
  false // Don't reverse
)
```

**Visual Details:**
- Size: 500x500px circle
- Position: Top-right corner (-200, -200 offset)
- Opacity: 0.15 (very subtle)
- Uses gradient colors from theme (primary → secondary → accent)
- Border radius: 250px (perfect circle)

**Implementation:**
```javascript
const orbRotate = useSharedValue(0);

useEffect(() => {
  orbRotate.value = withRepeat(
    withTiming(360, { duration: 120000, easing: Easing.linear }),
    -1,
    false
  );
}, []);

const orbStyle = useAnimatedStyle(() => ({
  transform: [{ rotate: `${orbRotate.value}deg` }],
}));
```

---

### 2.2 Entrance Animations (FadeIn)

**Animation Name:** Fade In Animation

**Description:** Elements fade in when the screen loads, creating a smooth entrance effect.

**Settings:**
- **Animation Type:** One-time entrance animation
- **Property Animated:** `opacity` (0 → 1)
- **Duration:** 600ms
- **Delay:** None

**Configuration:**
```javascript
<Animated.View entering={FadeIn.duration(600)}>
  {/* Calendar content */}
</Animated.View>
```

**Used For:**
- Calendar container (mini calendar at top)

---

### 2.3 Entrance Animations (FadeInDown)

**Animation Name:** Fade In Down Animation

**Description:** Elements fade in while sliding down from above, creating a cascading entrance effect.

**Settings:**
- **Animation Type:** One-time entrance animation
- **Properties Animated:** `opacity` (0 → 1) and `translateY` (negative → 0)
- **Duration:** 600ms
- **Delays:** Staggered (200ms, 400ms)

**Configuration:**
```javascript
// Counter Card (appears second)
<Animated.View entering={FadeInDown.delay(200).duration(600)}>
  {/* Counter content */}
</Animated.View>

// Setup Card / Reminder List (appears third)
<Animated.View entering={FadeInDown.delay(400).duration(600)}>
  {/* Setup/Reminder content */}
</Animated.View>
```

**Used For:**
- Counter card (shows X/Y cigarettes)
- Setup card (day configuration form)
- Reminder list (list of scheduled reminders)

**Visual Effect:**
- Elements appear to slide down from above while fading in
- Creates a cascading effect: calendar → counter → setup/reminders
- Delays create a staggered appearance (200ms between each element)

---

## 3. TAB BAR ANIMATIONS

### 3.1 Tab Indicator Slide Animation

**Animation Name:** Spring-based Slide Animation

**Description:** A background indicator that slides smoothly behind the active tab when switching between tabs.

**Settings:**
- **Animation Type:** Spring animation
- **Property Animated:** `translateX` (horizontal position)
- **Spring Configuration:**
  - `damping: 20` - controls oscillation (higher = less bounce)
  - `stiffness: 120` - controls speed (higher = faster)
  - `mass: 1` - controls inertia

**Configuration:**
```javascript
animatedValue.value = withSpring(activeTabIndex, {
  damping: 20,
  stiffness: 120,
  mass: 1,
});
```

**Visual Details:**
- Indicator is a rounded rectangle that matches tab height
- Background color: 
  - Dark mode: `rgba(255, 255, 255, 0.08)` (subtle white)
  - Light mode: `rgba(0, 0, 0, 0.04)` (subtle black)
- Border radius: 27px
- Width: Dynamically calculated based on number of tabs
- Position: Slides horizontally to align with active tab

**Implementation:**
```javascript
const animatedValue = useSharedValue(0);

// Update when active tab changes
React.useEffect(() => {
  if (activeTabIndex >= 0) {
    animatedValue.value = withSpring(activeTabIndex, {
      damping: 20,
      stiffness: 120,
      mass: 1,
    });
  }
}, [activeTabIndex]);

// Calculate position based on tab width
const indicatorStyle = useAnimatedStyle(() => {
  const tabWidth = (containerWidth - 8) / tabs.length;
  return {
    transform: [{
      translateX: interpolate(
        animatedValue.value,
        [0, tabs.length - 1],
        [0, tabWidth * (tabs.length - 1)]
      ),
    }],
  };
});
```

---

## SUMMARY OF ANIMATION TECHNIQUES

### Animation Types Used:
1. **withRepeat** - For infinite looping animations (orbs, rotation)
2. **withSequence** - For multi-step animations (scale up then down)
3. **withTiming** - For duration-based animations with easing
4. **withSpring** - For physics-based animations (tab indicator)
5. **FadeIn** - Pre-built entrance animation (opacity)
6. **FadeInDown** - Pre-built entrance animation (opacity + translateY)

### Easing Functions Used:
1. **Easing.inOut(Easing.ease)** - Smooth acceleration and deceleration (orbs)
2. **Easing.linear** - Constant speed (rotation)
3. **Spring physics** - Natural bouncy motion (tab indicator)

### Common Patterns:
- **Infinite loops:** Use `withRepeat(..., -1, false)`
- **Staggered entrances:** Use `.delay()` with increasing values
- **Smooth transitions:** Use spring animations for interactive elements
- **Background effects:** Use slow, subtle animations (120s rotation, 0.15 opacity)

---

## RECREATION TIPS

1. **For pulsating orbs:**
   - Use two separate animations (scale + opacity)
   - Different durations create organic feel (3s vs 4s)
   - Use `withSequence` to go from start → peak → start

2. **For rotating backgrounds:**
   - Use very long duration (120s) for subtle effect
   - Keep opacity low (0.15) so it doesn't distract
   - Use `Easing.linear` for constant rotation speed

3. **For entrance animations:**
   - Stagger delays by 200ms for cascading effect
   - Use 600ms duration for smooth but not slow
   - `FadeInDown` is more dynamic than plain `FadeIn`

4. **For tab indicators:**
   - Spring animations feel more natural than timing
   - Use `interpolate` to calculate position based on tab count
   - Damping of 20 prevents excessive bouncing

---

## DEPENDENCIES REQUIRED

```json
{
  "react-native-reanimated": "~4.1.0",
  "expo-linear-gradient": "^15.0.6",
  "expo-blur": "^15.0.6"
}
```

**Note:** React Native Reanimated requires additional setup in `babel.config.js`:
```javascript
plugins: ['react-native-reanimated/plugin']
```
