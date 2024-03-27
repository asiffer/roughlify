import { html } from "@codemirror/lang-html";
import { whiteLight } from "@uiw/codemirror-theme-white";
import CodeMirror from "@uiw/react-codemirror";
import DOMPurify from "dompurify";
import { useEffect, useRef, useState } from "react";
import { type Options } from "roughjs/bin/core";
import { roughlify } from "../lib/roughlify";
import { Tweaker } from "./Tweaker";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const extensions = [html()];

// demo using 'heart' from heroicons
const demo = {
  svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
</svg>`,
  options: {
    roughness: 0.3,
    bowing: 1,
    stroke: "#000000ff",
    strokeWidth: 0.6,
    fillStyle: "cross-hatch",
    fill: "#ef4444ff",
    fillWeight: 0.3,
    gap: 2.4,
  } as Options,
};

export const Viewer = () => {
  const inputSvgContainerRef = useRef<HTMLDivElement>(null);
  const outputSvgRef = useRef<SVGSVGElement>(null);

  const tweakerRef = useRef(null);

  const urlInputRef = useRef<HTMLInputElement>(null);

  const [inputSVG, setInputSVG] = useState(demo.svg);
  const [options, setOptions] = useState<Options>(demo.options);

  const [outputSVG, setOutputSVG] = useState("");

  useEffect(() => {
    console.log("use effect");
    update(inputSVG);
  }, [inputSvgContainerRef, outputSvgRef]);

  const updateOutput = (opts?: Options) => {
    // @ts-ignore
    const node = inputSvgContainerRef.current.querySelector("svg");
    console.log(node);
    if (node && outputSvgRef.current) {
      outputSvgRef.current.innerHTML = "";
      roughlify(node, outputSvgRef.current, opts || options);
      setOutputSVG(outputSvgRef.current.outerHTML);
    }
  };

  const update = (raw: string) => {
    DOMPurify.sanitize(raw, {
      ADD_TAGS: ["#comment"],
      USE_PROFILES: { html: true, svg: true, svgFilters: true },
    });
    // if something has been removed
    if (DOMPurify.removed.length > 0) {
      console.log("REMOVED:", DOMPurify.removed);
      // the svg is not valid but we keep it in the editor
      setInputSVG(raw);
      return;
    }

    // otherwise we can update everything
    setInputSVG(raw);

    if (inputSvgContainerRef.current) {
      inputSvgContainerRef.current.innerHTML = raw;
      updateOutput();
    }
  };

  const onChange = (raw: string) => {
    update(raw);
  };

  const codemirrorBaseProps = {
    className:
      "codemirror min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground has-[.cm-focused]:outline-none has-[.cm-focused]:ring-2 has-[.cm-focused]:ring-ring has-[.cm-focused]:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    theme: whiteLight,
    basicSetup: { lineNumbers: false, foldGutter: false },
    height: "100%",
    extensions: extensions,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputSVG);
  };

  const download = () => {
    const blob = new Blob([outputSVG], { type: "image/svg+xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = "roughlified.svg";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetOptions = () => {
    if (tweakerRef.current) {
      // @ts-ignore
      const opts: Options = tweakerRef.current.reset();
      setOptions({ ...opts });
      updateOutput(opts);
    }
  };

  const loadFromUrl = () => {
    if (urlInputRef.current && urlInputRef.current.validity.valid) {
      const url = urlInputRef.current.value;
      console.log("URL:", url);
      if (url.endsWith(".svg")) {
        fetch(url, {
          mode: "cors",
          credentials: "include",
          headers: { Accept: "image/svg+xml, text/html" },
        })
          .then((res) => res.text())
          .then((raw) => {
            update(raw);
          });
      }
    }
  };

  return (
    <>
      <div className="w-full h-full flex flex-row items-center justify-center max-xl:justify-start p-5">
        <div className="w-2/5 max-xl:w-3/5 h-full grid grid-cols-2 grid-flow-row auto-rows-auto gap-y-2 gap-x-4">
          <div className="text-muted-foreground text-sm">Input</div>
          <div className="text-muted-foreground text-sm">
            <span className="float-right">Output</span>
          </div>
          <CodeMirror
            {...codemirrorBaseProps}
            value={inputSVG}
            onChange={onChange}
          />
          <CodeMirror
            {...codemirrorBaseProps}
            value={outputSVG}
            editable={false}
          />
          <div>
            <div className="flex flex-row gap-2 w-full items-center">
              <Input
                className="grow"
                ref={urlInputRef}
                type="url"
                placeholder="URL"
              />
              <Button variant={"outline"} onClick={loadFromUrl}>
                Load
              </Button>
            </div>
          </div>
          <div className="flex flex-row justify-end gap-2">
            <Button onClick={copyToClipboard}>Copy</Button>
            <Button variant="secondary" onClick={download}>
              Download
            </Button>
          </div>
          <div className="max-w-full" ref={inputSvgContainerRef}></div>
          <div className="max-w-full">
            <svg xmlns="http://www.w3.org/2000/svg" ref={outputSvgRef}></svg>
          </div>
        </div>
      </div>
      <div className="absolute right-0 top-0 w-[400px] h-full shadow-lg p-5">
        <div className="w-full flex flex-row">
          <h2 className="w-full text-2xl font-extrabold mb-5">Options</h2>
          <Button onClick={resetOptions} variant={"outline"}>
            Reset
          </Button>
        </div>
        <Tweaker
          ref={tweakerRef}
          initialValue={options}
          onChange={(opts) => {
            console.log(opts);
            setOptions({ ...opts });
            updateOutput({ ...opts });
          }}
        />
      </div>
    </>
  );
};
