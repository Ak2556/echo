# TypeScript Fixes Guide
## Remaining 61 Type Errors - Quick Fix Reference

---

## Summary
After fixing Button and Input components, 61 TypeScript errors remain. This guide provides quick fixes for each category.

**Run to check progress**:
```bash
cd frontend
npx tsc --noEmit
```

---

## 1. Import Errors (2 files) - PRIORITY 1

### Files to Fix:
- `src/components/EnhancedFooter.tsx:5`
- `src/components/EnhancedSettingsPage.tsx:5`

### Current Code:
```typescript
import Card from '@/components/ui/EnhancedCard';
```

### Fixed Code:
```typescript
import { Card } from '@/components/ui/EnhancedCard';
```

### Shell Command (Quick Fix):
```bash
cd frontend/src
# Fix EnhancedFooter.tsx
sed -i "s/import Card from '@\/components\/ui\/EnhancedCard'/import { Card } from '@\/components\/ui\/EnhancedCard'/" components/EnhancedFooter.tsx

# Fix EnhancedSettingsPage.tsx
sed -i "s/import Card from '@\/components\/ui\/EnhancedCard'/import { Card } from '@\/components\/ui\/EnhancedCard'/" components/EnhancedSettingsPage.tsx
```

---

## 2. Lucide Icon Errors (2 files) - PRIORITY 1

### Files to Fix:
- `src/components/language/EnhancedLanguageSelector.tsx:5`
- `src/components/language/LanguageDetector.tsx:5`

### Issue:
`TranslateIcon` doesn't exist in lucide-react. Use `Languages` instead.

### Current Code:
```typescript
import { TranslateIcon } from 'lucide-react';
// ... later in component:
<TranslateIcon />
```

### Fixed Code:
```typescript
import { Languages } from 'lucide-react';
// ... later in component:
<Languages />
```

### Manual Fix Required:
1. Open `src/components/language/EnhancedLanguageSelector.tsx`
2. Replace `TranslateIcon` with `Languages` (both import and usage)
3. Repeat for `src/components/language/LanguageDetector.tsx`

---

## 3. Toast API Errors (2 files) - PRIORITY 2

### Files to Fix:
- `src/components/footer/FooterColumn.tsx:17`
- `src/components/footer/ImprovedFooter.tsx:234`

### Issue:
`react-hot-toast` doesn't have a `toast.info()` method.

### Current Code:
```typescript
toast.info('Cookie preferences coming soon!');
toast.info(`${link.label} - Coming soon!`);
```

### Option 1 (Simple):
```typescript
toast('Cookie preferences coming soon!', { icon: 'ℹ️' });
toast(`${link.label} - Coming soon!`, { icon: 'ℹ️' });
```

### Option 2 (Custom Style):
```typescript
toast('Cookie preferences coming soon!', {
  icon: 'ℹ️',
  style: {
    background: '#3b82f6',
    color: '#fff',
  },
});
```

### Option 3 (Use toast.success):
```typescript
toast.success('Cookie preferences coming soon!');
toast.success(`${link.label} - Coming soon!`);
```

---

## 4. NotificationsSettings Missing State (1 file) - PRIORITY 1

### File to Fix:
`src/components/settings/NotificationsSettings.tsx`

### Issue:
Component uses state variables that aren't declared.

### Add to Component (at the top, after props):
```typescript
import { useState } from 'react';

export function NotificationsSettings() {
  // Add these state declarations
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mentions, setMentions] = useState(true);
  const [comments, setComments] = useState(true);

  // ... rest of component
}
```

### Alternative (If using form state):
If these are part of a larger notifications settings object:
```typescript
const [notificationSettings, setNotificationSettings] = useState({
  emailEnabled: false,
  soundEnabled: false,
  mentions: true,
  comments: true,
});

// Then use:
const emailEnabled = notificationSettings.emailEnabled;
const setEmailEnabled = (value: boolean) =>
  setNotificationSettings(prev => ({ ...prev, emailEnabled: value }));
// Repeat for other fields
```

---

## 5. setState Type Error (1 file) - PRIORITY 2

### File to Fix:
`src/components/EnhancedSettingsPage.tsx:325`

### Current Code (Line 325):
```typescript
setAccessibility(prev => ({ ...prev, [settingId]: value }));
```

### Issue:
Type mismatch between function and expected type.

### Option 1 - Add Explicit Type:
```typescript
setAccessibility((prev: AccessibilitySettings) => ({
  ...prev,
  [settingId]: value
}));
```

### Option 2 - Use Callback Correctly:
Check the AccessibilitySettings type definition and ensure the update function matches:
```typescript
// If AccessibilitySettings is defined as:
interface AccessibilitySettings {
  [key: string]: boolean | number | string;
}

// Then the callback should be:
setAccessibility(prev => ({
  ...prev,
  [settingId as keyof AccessibilitySettings]: value
}));
```

---

## Quick Fix Script

Create a file `fix-typescript.sh`:

```bash
#!/bin/bash
cd "$(dirname "$0")/frontend/src"

echo "Fixing import statements..."
# Fix Card imports
find . -name "*.tsx" -exec sed -i "s/import Card from '@\/components\/ui\/EnhancedCard'/import { Card } from '@\/components\/ui\/EnhancedCard'/" {} \;

echo "Fixing lucide-react imports..."
# Fix TranslateIcon -> Languages
find . -name "*.tsx" -exec sed -i "s/TranslateIcon/Languages/g" {} \;

echo "Fixing toast.info() calls..."
# Fix toast.info -> toast
find . -name "*.tsx" -exec sed -i "s/toast\.info(/toast(/g" {} \;

echo "Done! Run 'npx tsc --noEmit' to verify."
```

Make executable and run:
```bash
chmod +x fix-typescript.sh
./fix-typescript.sh
```

---

## Verification After Fixes

### 1. Check TypeScript Errors:
```bash
cd frontend
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```
**Expected**: Significantly reduced (aim for 0)

### 2. Run Linter:
```bash
npm run lint
```
**Expected**: Should pass

### 3. Run Tests:
```bash
npm run test:ci
```
**Expected**: All tests still pass

### 4. Build:
```bash
npm run build
```
**Expected**: Build succeeds

---

## Detailed Fix Steps

### Step 1: Fix Imports (5 minutes)
```bash
cd frontend/src/components
# Fix EnhancedFooter.tsx
code EnhancedFooter.tsx
# Change line 5: import Card from '@/components/ui/EnhancedCard';
# To: import { Card } from '@/components/ui/EnhancedCard';

# Fix EnhancedSettingsPage.tsx
code EnhancedSettingsPage.tsx
# Change line 5 same way
```

### Step 2: Fix Lucide Icons (5 minutes)
```bash
cd frontend/src/components/language
# Fix EnhancedLanguageSelector.tsx
code EnhancedLanguageSelector.tsx
# Find: TranslateIcon
# Replace All: Languages

# Fix LanguageDetector.tsx
code LanguageDetector.tsx
# Find: TranslateIcon
# Replace All: Languages
```

### Step 3: Fix Toast Calls (5 minutes)
```bash
cd frontend/src/components/footer
# Fix FooterColumn.tsx
code FooterColumn.tsx
# Line 17: Change toast.info(...) to toast(..., { icon: 'ℹ️' })

# Fix ImprovedFooter.tsx
code ImprovedFooter.tsx
# Line 234: Same change
```

### Step 4: Fix NotificationsSettings (10 minutes)
```bash
cd frontend/src/components/settings
code NotificationsSettings.tsx
# Add useState declarations at top of component
# Add all four state variables as shown in section 4
```

### Step 5: Fix setState Type Issue (10 minutes)
```bash
cd frontend/src/components
code EnhancedSettingsPage.tsx
# Line 325: Add explicit type to callback parameter
# Or fix the type definition of AccessibilitySettings
```

---

## After All Fixes

### Final Verification:
```bash
cd frontend

# 1. Check TypeScript
npx tsc --noEmit
# Expected: 0 errors

# 2. Run linter
npm run lint
# Expected: ✔ No ESLint errors

# 3. Run tests
npm run test:ci
# Expected: 415 tests passed

# 4. Build
npm run build
# Expected: Build succeeded
```

---

## Troubleshooting

### If TypeScript errors persist:
1. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run build
   ```

2. Restart TypeScript server (VS Code):
   - CMD+Shift+P (Mac) or Ctrl+Shift+P (Windows)
   - Type: "TypeScript: Restart TS Server"

3. Check for multiple tsconfig files:
   ```bash
   find . -name "tsconfig*.json"
   ```

### If tests fail after fixes:
1. Check if you accidentally changed test files
2. Restore from git if needed:
   ```bash
   git diff src/
   git checkout -- <file-if-needed>
   ```

---

## Time Estimate
- Import fixes: 5 min
- Lucide icon fixes: 5 min
- Toast API fixes: 5 min
- NotificationsSettings: 10 min
- setState type fix: 10 min
- Verification: 10 min

**Total: 45 minutes**

---

## Automated Fix Script (Advanced)

```typescript
// scripts/fix-typescript-errors.ts
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const fixes = [
  {
    pattern: /import Card from ['"]@\/components\/ui\/EnhancedCard['"]/g,
    replacement: 'import { Card } from "@/components/ui/EnhancedCard"',
  },
  {
    pattern: /TranslateIcon/g,
    replacement: 'Languages',
  },
  {
    pattern: /toast\.info\(/g,
    replacement: 'toast(',
  },
];

async function applyFixes() {
  const files = await glob('src/**/*.{ts,tsx}');

  for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    let modified = false;

    for (const fix of fixes) {
      if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
        modified = true;
      }
    }

    if (modified) {
      writeFileSync(file, content);
      console.log(`✓ Fixed ${file}`);
    }
  }
}

applyFixes();
```

Run with:
```bash
npx ts-node scripts/fix-typescript-errors.ts
```

---

**End of Guide**
