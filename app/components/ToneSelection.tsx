import { Button } from "./ui/Button";

export interface ToneSelectionProps {
  severity: "mild" | "medium" | "nuclear";
  style: "formal" | "sarcastic" | "shakespearean" | "rapBattle";
  onChange: (
    severity: ToneSelectionProps["severity"],
    style: ToneSelectionProps["style"]
  ) => void;
}

export function ToneSelection({
  severity,
  style,
  onChange,
}: ToneSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Severity</h3>
        <div className="grid grid-cols-3 gap-4">
          {["mild", "medium", "nuclear"].map((option) => (
            <Button
              key={option}
              variant={severity === option ? "primary" : "secondary"}
              onClick={() =>
                onChange(option as ToneSelectionProps["severity"], style)
              }
              className="w-full"
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Style</h3>
        <div className="grid grid-cols-2 gap-4">
          {["formal", "sarcastic", "shakespearean", "rapBattle"].map(
            (option) => (
              <Button
                key={option}
                variant={style === option ? "primary" : "secondary"}
                onClick={() =>
                  onChange(severity, option as ToneSelectionProps["style"])
                }
                className="w-full"
              >
                {option === "rapBattle"
                  ? "Rap Battle"
                  : option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
