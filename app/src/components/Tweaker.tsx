import cls from "classnames";
import { Ref, forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { Options } from "roughjs/bin/core";
import { Checkbox } from "./ui/checkbox";
import { AlphaColorPicker } from "./ui/color";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Slider } from "./ui/slider";

export interface TweakerProps {
  initialValue?: Options;
  onChange?: (options: Options) => void;
}

const defaultOptions = {
  roughness: 1,
  bowing: 1,
  seed: 43,
  stroke: undefined,
  strokeWidth: 1,
  fill: undefined,
  fillStyle: "solid",
  fillWeight: undefined,
  hachureAngle: -41,
  simplification: 0,
} as Options;

export const Tweaker = forwardRef((props: TweakerProps, ref: Ref<any>) => {
  const [options, setOptions] = useState<Options>(
    props.initialValue ? { ...props.initialValue } : { ...defaultOptions }
  );
  const [prevOptions, setPrevOptions] = useState<Options>(
    props.initialValue ? { ...props.initialValue } : { ...defaultOptions }
  );

  const inputRef = useRef<HTMLDivElement>(null);
  const [editStroke, setEditStroke] = useState(true);
  const [editFill, setEditFill] = useState(true);

  useImperativeHandle(ref, () => {
    return {
      reset() {
        setOptions({ ...defaultOptions });
        return { ...defaultOptions };
      },
    };
  }, [setOptions]);

  const updateOptions = (newOptions: Options, commit: boolean = false) => {
    setOptions((opts) => {
      // const merged = { ...opts, ...newOptions };

      // remove undefined values
      const merged = Object.entries({ ...opts, ...newOptions })
        .filter(([_, value]) => value !== undefined)
        .reduce((obj: any, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});

      // for (let key in merged) {
      //   if (merged[key] === undefined) {
      //     delete merged[key];
      //   }
      // }
      console.log("MERGED:", merged);
      // hook
      if (commit && props.onChange) {
        props.onChange(merged);
      }
      return { ...merged };
    });
  };

  return (
    <div ref={inputRef} className="flex flex-col gap-5">
      <div className="flex flex-col items-stretch gap-3">
        <div className="flex flex-row gap-2 text-sm">
          <div>Roughness</div>
          <div className="text-muted-foreground">{options.roughness}</div>
        </div>
        <Slider
          min={0}
          max={2}
          step={0.1}
          value={[options.roughness || 1.0]}
          onValueChange={(value) => {
            updateOptions({ roughness: value[0] });
          }}
          onValueCommit={(value) => {
            updateOptions({ roughness: value[0] }, true);
          }}
        />
      </div>

      <div className="flex flex-col items-stretch gap-3">
        <div className="flex flex-row gap-2 text-sm">
          <div>Bowing</div>
          <div className="text-muted-foreground">{options.bowing}</div>
        </div>
        <Slider
          min={0}
          max={10}
          step={0.1}
          value={[options.bowing || 1.0]}
          onValueChange={(value) => {
            updateOptions({ bowing: value[0] });
          }}
          onValueCommit={(value) => {
            updateOptions({ bowing: value[0] }, true);
          }}
        />
      </div>

      <Separator />

      <div className="flex flex-col items-stretch gap-3 text-sm">
        <div className="flex flex-row gap-2">
          <Checkbox
            checked={editStroke}
            onCheckedChange={(value) => {
              setEditStroke(value as boolean);

              if (value) {
                updateOptions({ stroke: prevOptions.stroke }, true);
              } else {
                setPrevOptions({ ...options });
                updateOptions({ stroke: undefined }, true);
              }
            }}
          ></Checkbox>
          <Label>Edit stroke</Label>
        </div>
        <div className="flex flex-row gap-2">
          <div className={cls("", { "text-muted-foreground": !editStroke })}>
            Stroke
          </div>
          <div className="text-muted-foreground">{options.stroke}</div>
        </div>
        <div className="w-full flex flex-row gap-5">
          <AlphaColorPicker
            disabled={!editStroke}
            color={options.stroke || "#000000ff"}
            onChange={(c) => {
              updateOptions({ stroke: c }, true);
            }}
          />
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-3">
        <div className="flex flex-row gap-2 text-sm">
          <div className={cls("", { "text-muted-foreground": !editStroke })}>
            Stroke width
          </div>
          <div className="text-muted-foreground">{options.strokeWidth}</div>
        </div>
        <Slider
          disabled={!editStroke}
          min={0.0}
          max={5.0}
          step={0.1}
          value={[
            options.strokeWidth === undefined ? 1.0 : options.strokeWidth,
          ]}
          onValueChange={(value) => {
            updateOptions({ strokeWidth: value[0] });
          }}
          onValueCommit={(value) => {
            updateOptions({ strokeWidth: value[0] }, true);
          }}
        />
      </div>

      <Separator />

      <div className="flex flex-row items-center gap-3">
        <div className="text-nowrap text-sm">Fill style</div>
        <Select
          onValueChange={(value) => {
            // if (value === "none") {
            // updateOptions({ fill: undefined, fillStyle: undefined }, true);
            // } else {
            if (value === "none") {
              updateOptions({ fillStyle: undefined, fill: undefined }, true);
            } else {
              updateOptions({ fillStyle: value }, true);
            }
            // }
          }}
          value={options.fillStyle || "none"}
        >
          <SelectTrigger>
            <SelectValue></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">solid</SelectItem>
            <SelectItem value="hachure">hachure</SelectItem>
            <SelectItem value="zigzag">zig-zag</SelectItem>
            <SelectItem value="cross-hatch">cross-hatch</SelectItem>
            <SelectItem value="dots">dots</SelectItem>
            <SelectItem value="dashed">dashed</SelectItem>
            <SelectItem value="zigzag-line">zigzag-line</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-row gap-2">
        <Checkbox
          checked={editFill}
          onCheckedChange={(value) => {
            setEditFill(value as boolean);

            if (value) {
              updateOptions({ fill: prevOptions.fill }, true);
            } else {
              setPrevOptions((prev) => ({ ...prev, fill: options.fill }));
              updateOptions({ fill: undefined }, true);
            }
          }}
        ></Checkbox>
        <Label>Edit fill</Label>
      </div>

      <div className="flex flex-col items-stretch gap-3">
        <div className="flex flex-row gap-2 text-sm">
          <div className={cls("", { "text-muted-foreground": !editFill })}>
            Fill
          </div>
          <div className="text-muted-foreground">{options.fill}</div>
        </div>
        <AlphaColorPicker
          disabled={!editFill}
          color={options.fill || "#000000ff"}
          onChange={(c) => {
            updateOptions({ fill: c }, true);
          }}
        />
      </div>

      <div className="flex flex-col items-stretch gap-3">
        <div className="flex flex-row gap-2 text-sm">
          <div>Fill weight</div>
          <div className="text-muted-foreground">
            {options.fillWeight === undefined
              ? (options.strokeWidth || 1.0) / 2.0
              : options.fillWeight}
          </div>
        </div>
        <Slider
          min={0}
          max={5.0}
          step={0.1}
          value={[
            options.fillWeight === undefined
              ? (options.strokeWidth || 1.0) / 2.0
              : options.fillWeight,
          ]}
          onValueChange={(value) => {
            updateOptions({ fillWeight: value[0] });
          }}
          onValueCommit={(value) => {
            updateOptions({ fillWeight: value[0] }, true);
          }}
        />
      </div>

      <div className="flex flex-col items-stretch gap-3">
        <div className="flex flex-row gap-2 text-sm">
          <div>Gap</div>
          <div className="text-muted-foreground">
            {options.hachureGap || (options.strokeWidth || 1.0) * 4.0}
          </div>
        </div>
        <Slider
          min={0}
          max={20.0}
          step={0.1}
          value={[options.hachureGap || (options.strokeWidth || 1.0) * 4.0]}
          onValueChange={(value) => {
            updateOptions({ hachureGap: value[0] });
          }}
          onValueCommit={(value) => {
            updateOptions({ hachureGap: value[0] }, true);
          }}
        />
      </div>

      <div className="flex flex-col items-stretch gap-3">
        <div className="flex flex-row gap-2 text-sm">
          <div>Angle</div>
          <div className="text-muted-foreground">{options.hachureAngle}</div>
        </div>
        <Slider
          min={-180}
          max={180}
          step={1}
          value={[options.hachureAngle || -41]}
          onValueChange={(value) => {
            updateOptions({ hachureAngle: value[0] });
          }}
          onValueCommit={(value) => {
            updateOptions({ hachureAngle: value[0] }, true);
          }}
        />
      </div>
    </div>
  );
});
