import { cn } from "@/lib/utils";

interface MaterialIconProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  filled?: boolean;
}

const sizeClasses = {
  sm: "text-base", // 16px
  md: "text-xl",   // 20px
  lg: "text-2xl",  // 24px
  xl: "text-3xl",  // 30px
};

/**
 * Material Symbols icon component - Rounded and Filled by default
 * 
 * @example
 * <MaterialIcon name="trophy" />
 * <MaterialIcon name="star" size="lg" />
 * <MaterialIcon name="home" filled={false} /> // outline version
 */
const MaterialIcon = ({ 
  name, 
  className, 
  size = "lg",
  filled = true 
}: MaterialIconProps) => {
  return (
    <span 
      className={cn(
        "material-symbols-rounded select-none",
        sizeClasses[size],
        className
      )}
      style={!filled ? { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
