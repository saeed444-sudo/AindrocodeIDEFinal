import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LimitationBadgeProps {
  text: string;
  tooltip: string;
}

export function LimitationBadge({ text, tooltip }: LimitationBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="secondary" className="gap-1 text-xs" data-testid="badge-limitation">
          <InformationCircleIcon className="h-3 w-3" />
          <span>{text}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-sm">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
