import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className="relative h-2 w-full grow overflow-hidden rounded-full"
      style={{
        background:
          "linear-gradient(to right, red 0%, #ff0 17%, lime 33%, cyan 50%, blue 66%, #f0f 83%, red 100%)",
      }}
    >
      <SliderPrimitive.Range className="absolute h-full bg-transparent" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export interface HueSliderProps {
  onValueChange?: (hue: number) => void;
  onValueCommit?: (hue: number) => void;
}

export const HueSlider = (props: HueSliderProps) => {
  const [hue, setHue] = React.useState(0);

  return (
    <Slider
      min={0}
      max={360}
      defaultValue={[hue]}
      onValueCommit={(value) => {
        if (props.onValueCommit) {
          props.onValueCommit(value[0]);
        }
      }}
      onValueChange={(value) => {
        setHue(value[0]);
        if (props.onValueChange) {
          props.onValueChange(value[0]);
        }
      }}
    />
  );
};
