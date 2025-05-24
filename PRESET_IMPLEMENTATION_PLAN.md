# Preset Implementation Plan

## Overview
Implement a comprehensive presets system that allows users to discover, apply, and manage curated macOS configuration presets while maintaining full transparency and control over individual settings.

## Data Structure

### Preset Format
```typescript
interface Preset {
  id: string;
  title: string;
  description: string;
  url?: string;        // GitHub/repository URL
  rawURL: string;      // Direct URL to raw ~/.macos file
  content: string;     // Raw ~/.macos shell script content
  settings?: {[settingId: string]: any}; // Parsed settings (computed)
  settingsCount?: number; // Number of settings (computed)
  author?: string;
  tags?: string[];
  lastUpdated?: string;
}
```

### Storage
- **Location**: `/public/presets.json`
- **Applied Presets**: `localStorage: appliedPresets: string[]`
- **Setting Origins**: `localStorage: settingOrigins: {[settingId]: {presetId, value}[]}`

## Implementation Phases

### Phase 0: App.vue Cleanup and Foundation (NEW)

#### 0.1 Extract Composables (`/src/composables/`)
Create reusable composition functions to separate concerns:

**`useSettings.js`** - Settings management
```javascript
export function useSettings() {
  const settings = ref([]);
  const selectedSettings = ref({});
  const isLoading = ref(false);
  const error = ref(null);
  
  const loadSettings = async () => { /* ... */ };
  const updateSetting = (key, value) => { /* ... */ };
  const resetSetting = (key) => { /* ... */ };
  
  return {
    settings, selectedSettings, isLoading, error,
    loadSettings, updateSetting, resetSetting
  };
}
```

**`useLocalStorage.js`** - Persistent storage with error handling
```javascript
export function useLocalStorage(key, defaultValue) {
  const storedValue = ref(defaultValue);
  
  const save = (value) => { /* with try/catch */ };
  const load = () => { /* with error handling */ };
  const clear = () => { /* ... */ };
  
  return { storedValue, save, load, clear };
}
```

**`useCategories.js`** - Category filtering and navigation
```javascript
export function useCategories(settings) {
  const selectedCategory = ref('Home');
  const searchTerm = ref('');
  
  const filteredSettings = computed(() => { /* optimized filtering */ });
  const categories = computed(() => { /* category extraction */ });
  
  return {
    selectedCategory, searchTerm,
    filteredSettings, categories,
    selectCategory
  };
}
```

**`useScriptGeneration.js`** - Extract complex script generation logic
```javascript
export function useScriptGeneration() {
  const isGenerating = ref(false);
  const generatedScript = ref('');
  const restartActions = ref([]);
  
  const generateScript = async (settings) => { /* extracted logic */ };
  
  return {
    isGenerating, generatedScript, restartActions,
    generateScript
  };
}
```

#### 0.2 Create Layout Components

**`AppLayout.vue`** - Main application layout
- Responsive sidebar handling
- Main content area
- Header/toolbar integration
- Mobile-friendly drawer

**`LoadingState.vue`** - Consistent loading indicators
- Skeleton loading for different content types
- Spinner variations
- Loading text customization

**`ErrorState.vue`** - Error handling UI
- Error message display
- Retry functionality
- Different error types (network, parsing, etc.)

**`EmptyState.vue`** - No results/content states
- Search no results
- Category empty
- First-time user experience

#### 0.3 Performance Optimizations

**Computed Properties Optimization:**
- Use `shallowRef` for large datasets
- Implement debouncing for search/filter
- Memoize expensive calculations
- Lazy loading for categories

**Bundle Optimization:**
- Code splitting by features
- Lazy load preset functionality
- Optimize asset loading
- Tree shake unused code

#### 0.4 UI/UX Polish

**Responsive Design:**
- Mobile-first sidebar (drawer on mobile)
- Adaptive layouts for different screen sizes
- Touch-friendly interactions
- Proper spacing on all devices

**Visual Consistency:**
- Standardize spacing using CSS custom properties
- Consistent button states and animations
- Proper typography hierarchy
- Unified color system

**Accessibility Improvements:**
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader optimization

**Animation and Feedback:**
- Smooth transitions between states
- Loading animations
- Success/error feedback
- Micro-interactions for user actions

#### 0.5 Refactored App.vue Structure
```vue
<template>
  <AppLayout>
    <template #sidebar>
      <Sidebar 
        :categories="categories"
        :selected-category="selectedCategory"
        :search-term="searchTerm"
        @select-category="selectCategory"
        @update:search-term="updateSearchTerm"
      />
    </template>
    
    <template #main>
      <LoadingState v-if="isLoading" />
      <ErrorState v-else-if="error" :error="error" @retry="loadSettings" />
      <HomeScreen v-else-if="selectedCategory === 'Home'" />
      <PresetsView v-else-if="selectedCategory === 'Presets'" />
      <SettingsCategory v-else />
    </template>
  </AppLayout>
</template>

<script setup>
// Clean, focused composition API usage
import { useSettings } from './composables/useSettings';
import { useCategories } from './composables/useCategories';
import { usePresets } from './composables/usePresets';

const { settings, selectedSettings, isLoading, error, loadSettings } = useSettings();
const { selectedCategory, searchTerm, categories, selectCategory } = useCategories(settings);
const { presets, applyPreset } = usePresets();

// Minimal, focused logic only
onMounted(loadSettings);
</script>
```

### Phase 1: Core Infrastructure

#### 1.1 Preset Parser (`/src/utils/presetParser.js`)
```javascript
// Functions to implement:
- parseDefaultsScript(content: string): {[settingId: string]: any}
- extractDefaultsCommands(content: string): DefaultsCommand[]
- parseDefaultsCommand(command: string): {domain, key, value, type}
- convertValueByType(value: string, type: string): any
```

**Parser Requirements:**
- Handle `defaults write domain key value` patterns
- Support `-bool`, `-int`, `-float`, `-string`, `-array`, `-dict` flags
- Parse quoted strings and escaped characters
- Skip comments and non-defaults commands
- Convert values to appropriate JavaScript types

#### 1.2 Preset Data (`/public/presets.json`)
Create initial preset collection with sample configurations:
- Developer-focused preset
- Privacy-focused preset
- Performance-focused preset
- UI customization preset

#### 1.3 ConfirmModal Component (`/src/components/ConfirmModal.vue`)
Reusable confirmation dialog for:
- Applying presets
- Resetting settings
- Destructive actions

**Props:**
- `show: boolean`
- `title: string`
- `message: string`
- `confirmText: string = "Confirm"`
- `cancelText: string = "Cancel"`
- `variant: "danger" | "primary" = "primary"`

### Phase 2: Basic UI Components

#### 2.1 PresetCard Component (`/src/components/PresetCard.vue`)
Individual preset display card:

**Features:**
- Title and description
- Settings count badge
- Author and tags
- Apply and View buttons
- Visual indicator for applied presets
- Responsive grid layout

**Props:**
- `preset: Preset`
- `isApplied: boolean`

**Events:**
- `apply-preset`
- `view-preset`
- `visit-url`

#### 2.2 PresetsView Component (`/src/components/PresetsView.vue`)
Main presets page layout:

**Features:**
- Responsive card grid
- Search and filter functionality
- Category/tag filtering
- Sort options (name, date, settings count)
- Loading states

#### 2.3 Sidebar Updates (`/src/components/Sidebar.vue`)
Add presets section:
- Separator after "Home"
- "Presets" navigation item
- Badge showing applied presets count

### Phase 3: Detailed Views and Application Logic

#### 3.1 PresetDetail Component (`/src/components/PresetDetail.vue`)
Detailed preset view modal:

**Features:**
- Full preset information
- Raw `.macos` content viewer with syntax highlighting
- Settings breakdown and preview
- Apply/Visit buttons
- Conflict warnings (settings that would be overwritten)

#### 3.2 Preset Application Logic (App.vue updates)
```javascript
// New state properties:
const presets = ref([]);
const appliedPresets = ref(new Set());
const settingOrigins = ref(new Map());

// New functions:
async function loadPresets()
async function parsePresetSettings(preset)
async function applyPreset(presetId, confirm = true)
function getSettingOrigins(settingId)
function getPresetValueFrequency(settingId)
```

**Application Flow:**
1. User clicks "Apply Preset"
2. Show confirmation with affected settings
3. Parse preset and extract settings
4. Update `selectedSettings`
5. Track in `appliedPresets` and `settingOrigins`
6. Persist to localStorage
7. Update UI to reflect changes

#### 3.3 Applied Presets Tracking
- Track which presets have been applied
- Store setting origins (which preset set each value)
- Handle partial applications
- Provide undo/revert functionality

### Phase 4: SettingItem Integration

#### 4.0 Integration with Cleaned App.vue
Ensure preset functionality integrates seamlessly with the refactored codebase:

**Composable Integration:**
- Extend `useSettings()` to include preset origin tracking
- Update `useCategories()` to handle preset filtering
- Ensure `usePresets()` works with optimized state management

**Component Consistency:**
- Follow established component patterns from cleanup
- Use shared loading/error states
- Maintain responsive design patterns
- Follow accessibility guidelines established in Phase 0

### Phase 4.1: SettingItem Integration

#### 4.1 SettingsPresetDetail Component (`/src/components/SettingsPresetDetail.vue`)
Expandable section within SettingItem:

**Features:**
- Current preset indicator
- Alternative preset values
- Value frequency statistics
- Quick apply buttons for preset values
- Compact, expandable design

#### 4.2 SettingItem Updates (`/src/components/SettingItem.vue`)
Enhanced setting display:

**New Features:**
- Preset indicator badge
- "Set by [Preset Name]" label
- Expandable preset details section
- Quick preset value switcher

**Visual Indicators:**
- Colored badge for preset-set values
- Tooltip showing preset name
- Different styling for preset vs. manual values

## Technical Requirements

### State Management
```javascript
// App.vue additions
const presets = ref([]);
const appliedPresets = ref(new Set());
const settingOrigins = ref(new Map());
const showPresetDetail = ref(false);
const selectedPreset = ref(null);
```

### API Functions
```javascript
// Preset management
async function fetchPresetContent(rawURL)
async function refreshPreset(presetId)
function getConflictingSettings(presetSettings)
function revertPreset(presetId)

// Setting origins
function trackSettingOrigin(settingId, presetId, value)
function getSettingPresets(settingId)
function getPresetApplications()
```

### Local Storage Schema
```javascript
{
  appliedPresets: ["preset-1", "preset-2"],
  settingOrigins: {
    "com.apple.dock.autohide": [
      {presetId: "preset-1", value: true, appliedAt: "2024-01-01T00:00:00Z"},
      {presetId: "preset-2", value: false, appliedAt: "2024-01-02T00:00:00Z"}
    ]
  }
}
```

## UI/UX Considerations

### Design System Integration
- Follow existing component patterns
- Use consistent spacing and typography
- Maintain macOS-like visual design
- Responsive design for all screen sizes

### User Experience
- **Discovery**: Easy browsing of available presets
- **Transparency**: Clear indication of preset effects
- **Control**: Granular control over individual settings
- **Reversibility**: Easy to undo preset applications
- **Feedback**: Clear success/error states

### Performance
- Lazy load preset content
- Cache parsed settings
- Debounce search and filter operations
- Virtual scrolling for large preset lists

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.vue             # New (Phase 0)
│   │   ├── LoadingState.vue          # New (Phase 0)
│   │   ├── ErrorState.vue            # New (Phase 0)
│   │   └── EmptyState.vue            # New (Phase 0)
│   ├── presets/
│   │   ├── ConfirmModal.vue          # New
│   │   ├── PresetCard.vue            # New
│   │   ├── PresetsView.vue           # New
│   │   ├── PresetDetail.vue          # New
│   │   └── SettingsPresetDetail.vue  # New
│   ├── SettingItem.vue               # Modified
│   ├── Sidebar.vue                   # Modified
│   └── HomeScreen.vue                # Modified (Phase 0)
├── composables/
│   ├── useSettings.js                # New (Phase 0)
│   ├── useCategories.js              # New (Phase 0)
│   ├── useLocalStorage.js            # New (Phase 0)
│   ├── useScriptGeneration.js        # New (Phase 0)
│   └── usePresets.js                 # New
├── utils/
│   ├── presetParser.js               # New
│   └── scriptGenerator.js            # New (Phase 0 - extracted)
├── App.vue                           # Major refactor (Phase 0)
└── main.js                           # Modified (if needed)

public/
└── presets.json                      # New
```

## Testing Strategy

### Unit Tests
- Preset parser functions
- Setting origin tracking
- Value type conversions
- Component props and events

### Integration Tests
- Preset application flow
- Setting conflict resolution
- UI state synchronization
- Local storage persistence

### User Testing
- Preset discovery workflow
- Application and revert flows
- Setting modification with presets
- Mobile responsiveness

## Future Enhancements

### Phase 5: Advanced Features
- Custom preset creation from current settings
- Preset sharing and export
- Community preset repository
- Preset version management
- Conditional presets (macOS version specific)
- Preset templates and inheritance

### Phase 6: Ecosystem Integration
- GitHub integration for preset discovery
- Automatic preset updates
- Preset validation and safety checks
- Backup and restore functionality
- Multi-device synchronization

## Success Metrics

### Functional Goals
- ✅ Users can browse and discover presets
- ✅ Users can apply presets with confirmation
- ✅ Users can see which preset set each value
- ✅ Users can mix settings from multiple presets
- ✅ Users can revert preset applications

### Quality Goals (Enhanced)
- ✅ No breaking changes to existing functionality
- ✅ Consistent visual design with existing components
- ✅ Fast performance even with many presets
- ✅ Clear error handling and user feedback
- ✅ Comprehensive test coverage

### Code Quality Goals (Phase 0)
- ✅ Maintainable, modular code architecture
- ✅ Separation of concerns through composables
- ✅ Consistent component patterns and reusability
- ✅ Optimized performance and bundle size
- ✅ Improved accessibility and responsive design
- ✅ Comprehensive error handling and loading states
- ✅ Clean, readable, and well-documented code

### User Experience Goals (Phase 0)
- ✅ Smooth, responsive interactions across all devices
- ✅ Consistent visual feedback and animations
- ✅ Intuitive navigation and information architecture
- ✅ Accessible to users with disabilities
- ✅ Fast loading times and perceived performance
- ✅ Clear error messages and recovery paths

This implementation plan provides a solid foundation for building a robust, user-friendly preset system that enhances the existing macOS defaults configuration experience.