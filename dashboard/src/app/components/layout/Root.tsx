// Root.tsx is kept for backward compatibility but the active layout is ProtectedRoot.tsx
// All routes now use ProtectedRoot which includes auth-guarding + PeriodFilterProvider.
export { ProtectedRoot as Root } from "./ProtectedRoot";