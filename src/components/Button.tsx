"use client";
type buttonProps = {
  label: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
  className?: string; // Optional for extra custom styling
};

export default function Button({ label, Icon, onClick, className = "" }: buttonProps) {
  return (
    <button
      className={`
        flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold
        bg-blue-600 text-white shadow-sm
        hover:bg-blue-700 hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-blue-300
        active:bg-blue-800 transition cursor-pointer
        ${className}
      `}
      onClick={onClick}
      type="button"
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label}
    </button>
  );
}
