# Auth UI Design & Style Guidelines

**Zielgruppe:** Schüler 14-19 Jahre
**Plattform:** Mobile-first (aber auch Desktop)
**Vibe:** Modern, frisch, game-ready. Nicht corporate/Microsoft.

---

## 🎨 Farbpalette

### Primary Colors (Orange/Anthrazit)

```css
/* Orange - Bold, energetic, not aggressive */
--color-primary: #FF6D00;        /* Main action color */
--color-primary-dark: #E55E00;   /* Hover */
--color-primary-light: #FF8F00;  /* Alternate hover/active */

/* Anthrazit - Dark, modern, calming */
--color-bg-dark: #0F1419;        /* Nearly black, not pure black */
--color-surface: #1A2332;        /* Cards, inputs */
--color-surface-light: #242D3A;  /* Elevated surfaces */
--color-border: #3A4A5C;         /* Subtle dividers */

/* Light Mode (Alternative, muss auch funktionieren) */
--color-bg-light: #FAFBFC;
--color-surface-light-mode: #FFFFFF;
--color-text-light: #171717;
--color-border-light: #E5E7EB;
```

### Semantic Colors

```css
--color-success: #10B981;        /* Email verified, form success */
--color-warning: #F59E0B;        /* Password weak, rate limited */
--color-error: #EF4444;          /* Login failed, invalid input */
--color-info: #3B82F6;           /* Info messages */

--color-text-primary: #F1F5F9;   /* Main text on dark */
--color-text-secondary: #94A3B8; /* Secondary text, hints */
--color-text-muted: #64748B;     /* Disabled, subtle */
```

---

## 🔤 Typography

### Font Stack

```css
/* UI Font */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace (for tokens, codes) */
font-family: 'JetBrains Mono', 'Courier New', monospace;
```

### Scale & Weights

| Usage | Size | Weight | Line Height |
|-------|------|--------|-------------|
| **Page Title** | 32px | 700 | 1.2 |
| **Form Label** | 14px | 600 | 1.4 |
| **Input Text** | 16px | 400 | 1.5 |
| **Body Text** | 14px | 400 | 1.6 |
| **Button Text** | 16px | 600 | 1.4 |
| **Error/Help** | 12px | 400 | 1.4 |
| **Link** | 14px | 500 | 1.6 |

**Pro-Tip:** Nutze Tailwind's `text-sm`, `text-base`, `text-lg` — nicht custom sizes.

---

## 📏 Spacing System

Nutze Tailwind's 4px Grid **konsistent**:

```css
/* Tailwind spacing */
2px   = 0.5
4px   = 1
8px   = 2
12px  = 3
16px  = 4
24px  = 6
32px  = 8
48px  = 12
64px  = 16
```

### Component Spacing

| Element | Spacing |
|---------|---------|
| **Page padding** | `px-6` (24px) on mobile, `px-8` on desktop |
| **Form input spacing** | `mb-6` (24px) between inputs |
| **Button to button** | `gap-3` (12px) if inline |
| **Card padding** | `p-6` (24px) |
| **Section to section** | `mb-12` (48px) |

---

## 🎯 Component Patterns

### Input Fields

```typescript
// Pattern: All inputs follow this structure
<div>
  <label className="block text-sm font-semibold text-slate-100 mb-2">
    Email Address
  </label>
  <input
    type="email"
    className="
      w-full
      px-4 py-3
      bg-slate-700 text-slate-50
      border border-slate-600 rounded-lg
      focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
      placeholder:text-slate-500
      text-base
    "
    placeholder="your@email.com"
  />
  <p className="text-xs text-slate-400 mt-2">
    {/* optional help text */}
  </p>
</div>
```

**Key details:**
- `px-4 py-3` = 16px horiz, 12px vert (comfortable thumb touch)
- `rounded-lg` = 8px (modern, not too rounded)
- `focus:ring` = subtle glow, nicht aggressive
- Focus state is CRITICAL for accessibility

### Buttons

```typescript
// Primary Button (call-to-action)
<button className="
  w-full
  px-6 py-3
  bg-orange-600 hover:bg-orange-700 active:bg-orange-800
  text-white font-semibold text-base
  rounded-lg
  transition-colors duration-150
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Register Now
</button>

// Secondary Button (cancel, back)
<button className="
  w-full
  px-6 py-3
  bg-transparent border border-slate-600
  text-slate-100 font-semibold text-base
  rounded-lg
  hover:bg-slate-700/50
  transition-colors duration-150
">
  Cancel
</button>

// Link Button (forgot password, toggle login/register)
<button className="
  text-orange-500 hover:text-orange-400
  font-medium text-sm
  transition-colors duration-150
  underline-offset-2 hover:underline
">
  Forgot password?
</button>
```

**Rules:**
- Button height: Always `py-3` minimum (44px touch target for mobile)
- Width: Full width on mobile (`w-full`), fixed on desktop (maybe `w-96`)
- Transitions: `duration-150` (responsive but not slow)
- Disabled state: `disabled:opacity-50 disabled:cursor-not-allowed`

### Form Card Container

```typescript
<div className="
  max-w-md mx-auto
  bg-slate-800 rounded-xl
  border border-slate-700
  shadow-2xl shadow-black/50
  p-8
">
  {/* Form content */}
</div>
```

**Why this:**
- `max-w-md` = Readable line length (not too wide)
- `border` = Subtle definition, not aggressive
- `shadow-2xl shadow-black/50` = Depth without looking cheap
- `rounded-xl` = 16px (slightly generous rounding for modern look)
- `p-8` = 32px padding (breathing room)

### Error / Success / Loading States

```typescript
// Error State (invalid input)
<div className="
  bg-red-500/10 border border-red-500/50
  text-red-400 text-sm
  px-4 py-3 rounded-lg
  mb-4
">
  ❌ Email is already registered
</div>

// Success State (email verified)
<div className="
  bg-green-500/10 border border-green-500/50
  text-green-400 text-sm
  px-4 py-3 rounded-lg
  mb-4
">
  ✓ Email verified! You can now login.
</div>

// Loading State (button)
<button disabled className="
  flex items-center justify-center gap-2
  ...button styles...
">
  <svg className="animate-spin h-4 w-4" />
  Sending...
</button>
```

---

## 🌙 Dark Mode (Default) + Light Mode

```typescript
// Use Tailwind's class strategy
// Root: <html className="dark">

// Example: Works both modes
<div className="
  bg-slate-900 dark:bg-white
  text-slate-50 dark:text-slate-900
  border-slate-700 dark:border-slate-300
">
  Content
</div>

// Or use CSS variables (cleaner for complex UIs)
:root {
  --bg-primary: #0F1419;        /* dark mode */
  --text-primary: #F1F5F9;
}

@media (prefers-color-scheme: light) {
  :root {
    --bg-primary: #FAFBFC;
    --text-primary: #171717;
  }
}
```

**Dark Mode is default** because:
- Games (audience context)
- Battery life on modern phones
- Feels more immersive/exciting
- Most teens prefer dark mode anyway

---

## ✨ Micro-Interactions & Transitions

### Input Focus

```typescript
// When user focuses input: subtle glow, smooth transition
focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-2
```

### Button Hover/Active

```typescript
// Hover: brighten slightly
hover:bg-orange-700

// Active/Click: darken (feedback)
active:bg-orange-800

// Transition: smooth, not instant
transition-colors duration-150
```

### Loading Spinner

```typescript
// Use Tailwind's animate-spin
<svg className="animate-spin h-5 w-5" />

// Or custom if needed
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Form Validation Feedback

```typescript
// As user types: check password strength real-time
// Show progress bar:
<div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
    style={{ width: `${passwordStrength}%` }}
  />
</div>
```

---

## 📱 Responsive Breakpoints

| Device | Tailwind | Width | Adjustments |
|--------|----------|-------|-------------|
| **Mobile** | `sm:` | < 640px | Full width, `p-4`, button full-width |
| **Tablet** | `md:` | 640px+ | `px-6`, form `max-w-md` |
| **Desktop** | `lg:` | 1024px+ | Centered, maybe 2-column later |

### Mobile-Specific Tweaks

```typescript
// Mobile: Stack everything vertically, full-width
<div className="
  flex flex-col gap-3
  px-4 py-6
  sm:px-6
  md:max-w-md md:mx-auto
">

// Mobile: Larger touch targets
<button className="py-3 px-4 sm:px-6" />

// Mobile: Reduce form card padding
<div className="p-4 sm:p-6 md:p-8" />
```

---

## 🎭 Dark/Light Mode Specific Rules

### Dark Mode (Default)

```css
/* Backgrounds: Nearly black, not pure black */
background: #0F1419;      /* NOT #000000 */
surface: #1A2332;         /* Slight warmth */
border: #3A4A5C;          /* Visible but subtle */

/* Text: Bright but not harsh white */
text-primary: #F1F5F9;    /* NOT #FFFFFF */
text-secondary: #94A3B8;  /* Readable secondary */

/* Orange pops beautifully */
accent: #FF6D00;          /* Bold, energetic */
```

### Light Mode

```css
/* If user switches to light: keep modern feel */
background: #FAFBFC;      /* Slight warmth */
surface: #FFFFFF;
border: #E5E7EB;

text-primary: #171717;    /* Nearly black */
text-secondary: #737373;

accent: #E55E00;          /* Slightly darker orange for contrast */
```

---

## 🚫 Design Anti-Patterns (What NOT to do)

| ❌ NO | ✅ YES |
|-------|--------|
| Pure `#000000` black | `#0F1419` (warmth) |
| Pure `#FFFFFF` white | `#F1F5F9` or `#FAFBFC` |
| Overly aggressive shadows | `shadow-2xl shadow-black/50` |
| Neon colors everywhere | One bold orange accent |
| Massive gaps between forms | `mb-6` (24px) = breathing room |
| Tiny touch targets | `py-3` = 44px+ height |
| Instant transitions | `duration-150` = responsive but smooth |
| Rounded corners: `rounded-3xl` | `rounded-lg` (8px) or `rounded-xl` (12px) |
| Input borders too thick | `border` (1px) not `border-2` |
| Focus states invisible | `focus:ring` with color |

---

## 📐 Implementation Checklist

Before shipping Auth UI pages, verify:

- [ ] **Colors**: Orange, Anthrazit, semantic colors used consistently
- [ ] **Typography**: Scale follows table above (not custom sizes)
- [ ] **Spacing**: Using Tailwind grid (2,4,8,16,24,32...)
- [ ] **Inputs**: 44px min height, clear focus states
- [ ] **Buttons**: Consistent styling, hover/active states smooth
- [ ] **Dark mode**: Default, tested (light mode optional)
- [ ] **Mobile**: Full-width forms, touch targets 44px+
- [ ] **Errors/Success**: Color + icon + clear text
- [ ] **Accessibility**: Focus visible, contrast ≥ 4.5:1
- [ ] **Performance**: Transitions smooth (60fps), no layout shift

---

## 🎬 Concrete Examples

### Login Page Layout (Pseudo-Code)

```jsx
export default function LoginPage() {
  return (
    <div className="
      min-h-screen
      bg-slate-900
      flex items-center justify-center
      px-4 py-8
    ">
      <div className="
        w-full max-w-md
        bg-slate-800 rounded-xl border border-slate-700
        shadow-2xl shadow-black/50
        p-8
      ">
        {/* Logo/Title */}
        <h1 className="text-2xl font-bold text-slate-50 mb-2">
          Welcome Back
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Sign in to your MindForge account
        </p>

        {/* Error Banner (if any) */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-100 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-slate-700 text-slate-50 border border-slate-600 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 placeholder:text-slate-500"
              placeholder="your@email.com"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-100 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-700 text-slate-50 border border-slate-600 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 placeholder:text-slate-500"
              placeholder="••••••••"
            />
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-slate-300">Remember me</span>
            </label>
            <a href="/forgot-password" className="text-orange-500 hover:text-orange-400">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold rounded-lg transition-colors duration-150"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-8">
          Don't have an account?{' '}
          <a href="/register" className="text-orange-500 hover:text-orange-400 font-medium">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
```

---

## 📚 Reference

- **Dark Mode Inspiration:** Discord, Figma, Modern Games
- **Typography:** Inter (from Vercel/Figma)
- **Component Library:** shadcn/ui (Radix + Tailwind)
- **Color Theory:** Bold accent + neutral backdrop
- **Accessibility:** WCAG 2.1 AA minimum

---

*These guidelines are a starting point. Iterate, test with users, adjust as needed.*

*Last updated: February 4, 2026*
