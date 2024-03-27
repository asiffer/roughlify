import { useEffect, useState } from "react";
import { GradientSlider } from "./alpha";

export interface FullColor {
  color: string;
  alpha: number;
}

interface PartialFullColor {
  color?: string;
  alpha?: number;
}

const extractColorAlpha = (raw: string): FullColor => {
  if (!raw.startsWith("#")) {
    raw = "#" + raw;
  }
  if (raw.length === 9) {
    return {
      color: raw.slice(0, 7),
      alpha: parseInt(raw.slice(7), 16),
    };
  }
  return { color: raw, alpha: 255 };
};

const concatColorAlpha = (fc: FullColor): string => {
  return fc.color + fc.alpha.toString(16).padStart(2, "0");
};

export interface AlphaColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const AlphaColorPicker = ({
  color,
  onChange,
}: AlphaColorPickerProps) => {
  const [fullColor, setFullColor] = useState<FullColor>(
    extractColorAlpha(color)
  );

  useEffect(() => {
    setFullColor(extractColorAlpha(color));
    console.log(fullColor);
  }, [color]);

  const updateFullColor = (fc: PartialFullColor, commit: boolean = false) => {
    setFullColor((old) => {
      const merged: FullColor = { ...old, ...fc };
      // hook
      if (commit) {
        onChange(concatColorAlpha(merged));
      }
      return { ...merged };
    });
  };

  return (
    <div className="w-full flex flex-row gap-5 items-center justify-start">
      <input
        className="rounded h-6 border-none outline-none shadow-none"
        type="color"
        value={fullColor.color}
        onChange={(el) => {
          const col = el.target.value;
          // commit
          updateFullColor({ color: col }, true);
        }}
      />
      <GradientSlider
        color={fullColor.color}
        min={0}
        max={255}
        step={1}
        value={[fullColor.alpha || extractColorAlpha(color).alpha || 0]}
        onValueChange={(value) => {
          updateFullColor({ alpha: value[0] }, false);
        }}
        onValueCommit={(value) => {
          updateFullColor({ alpha: value[0] }, true);
        }}
      />
    </div>
  );
};
