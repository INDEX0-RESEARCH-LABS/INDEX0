import AllHandsLogo from "#/assets/branding/all-hands-logo.svg?react";
import { TooltipButton } from "./tooltip-button";

interface AllHandsLogoButtonProps {
  onClick: () => void;
}

export function AllHandsLogoButton({ onClick }: AllHandsLogoButtonProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <TooltipButton
        tooltip="INDEX0 AI Agent Canvas [v1.0.0]"
        ariaLabel="INDEX0 AI Logo"
        onClick={onClick}
      >
        <AllHandsLogo width={34} height={23} />
      </TooltipButton>
      <span className="text-[9px] font-mono tracking-tighter text-[#f54e00] font-bold select-none leading-none">
        [v1.0.0]
      </span>
    </div>
  );
}
