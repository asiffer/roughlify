import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface GradientSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  color?: string;
}

const GradientSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  GradientSliderProps
>(({ className, color, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className="relative h-2 w-full grow overflow-hidden rounded-full bg-gradient-to-l from-black"
      style={{
        //@ts-ignore
        "--tw-gradient-from": color + " var(--tw-gradient-from-position)",
      }}
    >
      <SliderPrimitive.Range className="absolute h-full bg-transparent" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
GradientSlider.displayName = SliderPrimitive.Root.displayName;

export { GradientSlider };

// import * as SliderPrimitive from "@radix-ui/react-slider";
// import * as React from "react";

// import { cn } from "@/lib/utils";

// const Slider = React.forwardRef<
//   React.ElementRef<typeof SliderPrimitive.Root>,
//   React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
// >(({ className, ...props }, ref) => (
//   <SliderPrimitive.Root
//     ref={ref}
//     className={cn(
//       "relative flex w-full touch-none select-none items-center",
//       className
//     )}
//     {...props}
//   >
//     <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gradient-to-l from-black">
//       <SliderPrimitive.Range className="absolute h-full bg-transparent" />
//     </SliderPrimitive.Track>
//     <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
//   </SliderPrimitive.Root>
// ));
// Slider.displayName = SliderPrimitive.Root.displayName;

// export interface AlphaSliderProps {
//   color: string;
//   className?: string;
//   alpha: number;
//   onValueChange?: (hue: number) => void;
//   onValueCommit?: (hue: number) => void;
// }

// export const AlphaSlider = ({
//   color,
//   className,
//   alpha,
//   ...props
// }: AlphaSliderProps) => {
//   // console.log;
//   // const [alpha, setAlpha] = React.useState(value || 0.0);

//   return (
//     <SliderPrimitive.Root
//       className={cn(
//         "relative flex w-full touch-none select-none items-center",
//         className
//       )}
//       min={0}
//       max={255}
//       step={1}
//       value={[alpha]}
//       // defaultValue={[alpha]}
//       onValueCommit={(value) => {
//         if (props.onValueCommit) {
//           props.onValueCommit(value[0]);
//         }
//       }}
//       onValueChange={(value) => {
//         // setAlpha(value[0]);
//         if (props.onValueChange) {
//           props.onValueChange(value[0]);
//         }
//       }}
//     >
//       <SliderPrimitive.Track
//         className="relative h-2 w-full grow overflow-hidden rounded-full bg-gradient-to-l from-black"
//         style={{
//           //@ts-ignore
//           "--tw-gradient-from": color + " var(--tw-gradient-from-position)",
//         }}
//       >
//         <SliderPrimitive.Range className="absolute h-full bg-transparent" />
//       </SliderPrimitive.Track>
//       <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
//     </SliderPrimitive.Root>
//   );
// };
