# Handyman App - UI Components Showcase

## 🎨 Core Component Library

### 📊 **StatsCard Component**

A versatile statistics display component used throughout the admin dashboard.

```tsx
interface StatsCardProps {
  title: string;           // "Total Revenue"
  value: string | number;  // "$18,750" or 156
  subtitle?: string;       // "Monthly period"
  trend?: {
    value: number;         // 12.5 (percentage)
    isPositive: boolean;   // true for ↗, false for ↘
  };
  icon?: string;          // "💰"
  color?: string;         // "#4caf50"
  onPress?: () => void;
}
```

**Visual Features:**
- Responsive card layout with elevation
- Icon and title header
- Large formatted value display
- Trend indicators with arrows
- Color-coded by data type
- Automatic number formatting (K, M)

**Usage Examples:**
- Revenue: `$18.7K` with `↗ 12.5%` trend
- Active Jobs: `8` with green accent
- Customer Rating: `4.8★` with yellow theme

---

### 🃏 **JobCard Component**

Comprehensive job display component for all user roles.

```tsx
interface JobCardProps {
  job: Job;
  onPress?: () => void;
  onStatusChange?: (status: JobStatus) => void;
  showActions?: boolean;   // Admin/worker controls
  compact?: boolean;       // Condensed view
}
```

**Display Information:**
- **Header**: Job title + status chip + priority badge
- **Description**: Truncated job details
- **Details Grid**:
  - Address (with overflow handling)
  - Scheduled date/time
  - Pricing (hourly/fixed)
  - Total cost (when available)
- **Actions**: Start/Complete buttons (role-based)

**Status Colors:**
- Pending: `#ff9800` (Orange)
- Active: `#4caf50` (Green)
- Upcoming: `#2196f3` (Blue)
- Completed: `#9e9e9e` (Gray)
- Cancelled: `#f44336` (Red)

---

### 🎯 **Quick Action Grid**

Grid-based action selection pattern used in home screens.

**Client Actions:**
1. **Request Job** - `hammer-wrench` icon, blue theme
2. **Request Estimate** - `calculator` icon, green theme
3. **Chat Support** - `chat` icon, orange theme
4. **Job List** - `format-list-bulleted` icon, purple theme

**Admin Actions:**
1. **Create Job** - `plus` icon
2. **Add Client** - `account-plus` icon
3. **Add Worker** - `hammer-wrench` icon
4. **Send Alert** - `bell` icon

**Layout Features:**
- Responsive grid (2x2 on mobile, 4x1 on tablet)
- Touch-friendly sizing (minimum 44px)
- Icon + title + description structure
- Consistent spacing and elevation

---

### 🏷️ **Status Chips**

Material Design chip components for status indication.

**Job Status Chips:**
```tsx
<Chip 
  mode="outlined" 
  style={{ borderColor: statusColors[status] }}
  textStyle={{ color: statusColors[status] }}
>
  {status}
</Chip>
```

**Priority Badges:**
```tsx
<Chip 
  mode="flat" 
  style={{ backgroundColor: priority === 'urgent' ? '#ffebee' : '#f3e5f5' }}
  textStyle={{ color: priority === 'urgent' ? '#d32f2f' : '#7b1fa2' }}
>
  {priority}
</Chip>
```

---

### 🎛️ **Segmented Controls**

Time frame selection for analytics and filtering.

```tsx
const timeFrameOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

<SegmentedButtons
  value={timeFrame}
  onValueChange={setTimeFrame}
  buttons={timeFrameOptions}
/>
```

---

### 📱 **Navigation Patterns**

#### Role-Based Stack Navigation

```tsx
export default function RootNavigator(){
  const { user, claims, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <AuthStack />;
  if (claims.role === 'admin') return <AdminStack />;
  if (claims.role === 'worker') return <WorkerStack />;
  return <ClientStack />;
}
```

#### Navigation Stacks:
- **AuthStack**: Login → Registration → Password Recovery
- **AdminStack**: Dashboard → Management → Analytics
- **WorkerStack**: Jobs → Time Tracking → Earnings
- **ClientStack**: Home → Services → Job Status

---

### 🎨 **Form Components**

#### Material Design Inputs

```tsx
// Text Input with Validation
<TextInput
  mode="outlined"
  label="Job Title"
  value={title}
  onChangeText={setTitle}
  error={errors.title}
  style={styles.input}
/>

// Dropdown Selection
<Menu
  visible={visible}
  onDismiss={closeMenu}
  anchor={<Button onPress={openMenu}>Select Worker</Button>}
>
  {workers.map(worker => (
    <Menu.Item key={worker.id} onPress={() => selectWorker(worker)} title={worker.name} />
  ))}
</Menu>

// Date/Time Picker
<DatePickerModal
  locale="en"
  mode="single"
  visible={open}
  onConfirm={onConfirm}
  onDismiss={onDismissDate}
  date={date}
/>
```

---

### 📊 **Data Visualization**

#### Dashboard Stats Layout

```tsx
<View style={styles.statsGrid}>
  <StatsCard
    title="Total Revenue"
    value={formatCurrency(totals.total)}
    subtitle={`${timeFrame} period`}
    icon="💰"
    color="#4caf50"
    trend={{ value: 12.5, isPositive: true }}
  />
  <StatsCard
    title="Active Jobs"
    value={stats.activeJobs}
    subtitle="Currently running"
    icon="🔧"
    color="#2196f3"
    trend={{ value: 8.3, isPositive: true }}
  />
</View>
```

---

### 🔍 **Search and Filter**

#### Search Bar Component

```tsx
<Searchbar
  placeholder="Search jobs, clients, workers..."
  onChangeText={setSearchQuery}
  value={searchQuery}
  style={styles.searchbar}
  icon="magnify"
  clearIcon="close"
/>
```

#### Filter Chips

```tsx
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {filterOptions.map(filter => (
    <Chip
      key={filter.value}
      selected={activeFilters.includes(filter.value)}
      onPress={() => toggleFilter(filter.value)}
      style={styles.filterChip}
    >
      {filter.label}
    </Chip>
  ))}
</ScrollView>
```

---

### 🔐 **Authentication UI**

#### Login Form Design

```tsx
<Surface style={styles.loginContainer} elevation={2}>
  <Text variant="headlineMedium" style={styles.title}>
    Welcome Back
  </Text>
  
  <TextInput
    mode="outlined"
    label="Username"
    value={username}
    onChangeText={setUsername}
    style={styles.input}
  />
  
  <TextInput
    mode="outlined"
    label="Password"
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!showPassword}
    right={<TextInput.Icon icon="eye" onPress={() => setShowPassword(!showPassword)} />}
    style={styles.input}
  />
  
  <Checkbox.Item
    label="Remember this device"
    status={rememberDevice ? 'checked' : 'unchecked'}
    onPress={() => setRememberDevice(!rememberDevice)}
  />
  
  <Button mode="contained" onPress={handleLogin} style={styles.loginButton}>
    Sign In
  </Button>
</Surface>
```

---

### 🎯 **Responsive Design System**

#### Breakpoints and Layouts

```tsx
const styles = StyleSheet.create({
  // Mobile-first grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  // Tablet adaptation
  '@media (min-width: 768px)': {
    statsGrid: {
      gap: 16,
    },
    managementGrid: {
      grid-template-columns: 'repeat(3, 1fr)',
    },
  },
  
  // Desktop adaptation
  '@media (min-width: 1024px)': {
    container: {
      maxWidth: 1200,
      margin: '0 auto',
    },
  },
});
```

---

### 🎨 **Theme System**

#### Color Tokens

```tsx
export const theme = {
  colors: {
    primary: '#2196f3',
    secondary: '#4caf50',
    accent: '#ff9800',
    error: '#f44336',
    warning: '#ffc107',
    info: '#2196f3',
    success: '#4caf50',
    surface: '#ffffff',
    background: '#f5f5f5',
    onSurface: '#1a1a1a',
    onBackground: '#1a1a1a',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};
```

---

## 📱 **Platform-Specific Features**

### iOS Optimizations
- Safe area inset support
- Native navigation feel
- Touch feedback patterns
- Swipe gesture support

### Android Material Design
- Elevation shadows
- FAB (Floating Action Button)
- Material color system
- Ripple touch effects

### Web Responsiveness
- CSS Grid layouts
- Hover state interactions
- Keyboard navigation
- Print-friendly styling

---

This component library provides a consistent, professional, and user-friendly foundation for the entire Handyman app ecosystem.