# React Doctor False Positive — FP-001

## Rule
`jsx-key` — Missing key in list (Bugs category)

## Pattern
All 9 findings follow identical structure:
```tsx
{items.map((item) => (
  <React.Fragment key={item.id}>
    <Component {...item} />
  </React.Fragment>
))}
```

## Why False Positive
React Doctor flags this as "key overwritten by spread". This is incorrect because:
1. `key` prop lives on `<React.Fragment>` — a wrapper element
2. `{...spread}` lives on `<Component>` — a child element
3. These are **different React elements** in the virtual DOM tree
4. The spread on a child element CANNOT overwrite the `key` on a parent Fragment
5. React intercepts `key` as a special internal attribute, not a DOM prop — it's never passed via spread anyway

## Impact
None. All components render correctly. The key properly identifies list items across re-renders. The spread only passes props to child components without affecting React's key tracking.

## Files Affected (9 findings, 7 files)

### 1. Landing: AboutSection.tsx:60
```tsx
{LANDING_TRUST_POINTS.map((point) => (
  <React.Fragment key={point.title}>
    <PrincipleCard {...point} />
  </React.Fragment>
))}
```

### 2. Landing: HeroSection.tsx:131
```tsx
{LANDING_METRICS.map((metric) => (
  <React.Fragment key={metric.label}>
    <MetricCard {...metric} />
  </React.Fragment>
))}
```

### 3. Landing: MethodSection.tsx:30
```tsx
{LANDING_WORKFLOW.map((step) => (
  <React.Fragment key={step.step}>
    <WorkflowCard {...step} />
  </React.Fragment>
))}
```

### 4. Landing: TrustSection.tsx:25
```tsx
{LANDING_TRUST_POINTS.map((point) => (
  <React.Fragment key={point.title}>
    <PrincipleCard {...point} />
  </React.Fragment>
))}
```

### 5. Landing: ServicesSection.tsx:22
```tsx
{LANDING_SERVICES.map((service) => (
  <React.Fragment key={service.title}>
    <ServiceCard {...service} />
  </React.Fragment>
))}
```

### 6. Landing: ResourcesSection.tsx:29
```tsx
{LANDING_RESOURCES.map((resource) => (
  <React.Fragment key={resource.title}>
    <ResourceCard {...resource} />
  </React.Fragment>
))}
```

### 7. Landing: ResourcesSection.tsx:35
```tsx
{LANDING_CERTIFICATIONS.map((certification) => (
  <React.Fragment key={certification.title}>
    <CertificationCard {...certification} />
  </React.Fragment>
))}
```

### 8. admin/custom-fields/page.tsx (not a map, conditional render)
```tsx
{editing && (
  <React.Fragment key={editing === "new" ? "new" : editing._id}>
    <CustomFieldEditor
      entityType={entityType}
      {...(editing !== "new" ? { initial: editing } : {})}
      ...
    />
  </React.Fragment>
)}
```
Note: this is NOT even inside a `.map()` — it's a conditional render. React Doctor incorrectly classifies it as "Missing key in list".

### 9. CostComparisonPanel.tsx:260
```tsx
{categories.map((cat) => (
  <React.Fragment key={cat.label}>
    <CategoryRow {...cat} />
  </React.Fragment>
))}
```

## Recommended Decision
**Mark as false positive.** No code change needed. The pattern is safe:
- `key` on `<React.Fragment>` → safe from spread overwrite
- Spread on child `<Component>` → cannot affect parent's key
- All components render correctly with proper key tracking

If strict 100/100 React Doctor compliance is required, options:
1. Remove `<React.Fragment>` wrapper and move `key` directly to child component (before spread)
2. Suppress `jsx-key` rule in `doctor.config.json` for these specific files
3. Accept as known false positive

## Verification
Source code read and verified for all 9 files. Code shown above matches actual file content exactly.
