import { useRef } from "react";

export interface FileInputWithIconProps {
  label: string;
  className: string;
  disabled: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function FileInputWithIcon({
  label,
  className,
  disabled,
  handleFileUpload,
  icon: Icon,
}: FileInputWithIconProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className="btn join-item w-full flex-nowrap px-2"
      >
        <span className="grow normal-case">{label}</span>
        <span className={`rounded-lg  p-1 text-base-100 ${className}`}>
          <Icon className="h-6 w-6" />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        disabled={disabled}
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}
