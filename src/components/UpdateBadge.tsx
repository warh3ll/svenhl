import { cn } from '@/lib/utils';

// A small goal-blue dot marking something new since the visitor last looked. The label is read by screen readers.
const UpdateBadge = ({ label, className }: { label: string; className?: string }) => (
  <span className={cn('inline-flex shrink-0', className)}>
    <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[hsl(var(--goal))]" />
    <span className="sr-only">{label}</span>
  </span>
);

export default UpdateBadge;
