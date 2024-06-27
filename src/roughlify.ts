import { JSDOM } from "jsdom";
import * as prettier from "prettier";
import rough from "roughjs";
import { Options } from "roughjs/bin/core";
import { Point } from "roughjs/bin/geometry";
import { RoughSVG } from "roughjs/bin/svg";

const parseListOfPoints = (value: string, _?: any) => {
  return value
    .replaceAll(/[ ]+/g, " ")
    .split(" ")
    .map((p: string) => {
      const [x, y, _] = p.split(",");
      return [+x, +y] as Point;
    });
};

const toCamel = (s: string) => s.replace(/-./g, (x) => x[1].toUpperCase());

const extract = (el: Element, camelize: boolean = false) => {
  let out: { [key: string]: any } = {};
  const n = el.attributes.length;
  for (let i = 0; i < n; i++) {
    const attr = el.attributes[i];
    out[camelize ? toCamel(attr.nodeName) : attr.nodeName] = attr.nodeValue;
  }
  return out;
};

export const buildDocument = (raw: string) => {
  return new JSDOM(raw).window.document;
};

const walk = (node: Node, func: (element: Node) => void) => {
  func(node);
  let nextNode = node.firstChild;
  while (nextNode) {
    walk(nextNode, func);
    nextNode = nextNode.nextSibling;
  }
};

const roughlifyPath = (
  element: SVGPathElement,
  rc: RoughSVG,
  svg: SVGElement,
  options: Options
) => {
  const { d, ...attrs } = extract(element, true);
  if (d) {
    const node = rc.path(d, { ...attrs, ...options });
    svg.appendChild(node);
  }
};

const roughlifyLine = (
  element: SVGLineElement,
  rc: RoughSVG,
  svg: SVGElement,
  options: Options
) => {
  const { x1, y1, x2, y2, ...attrs } = extract(element, true);
  if (x1 && y1 && x2 && y2) {
    const node = rc.line(+x1, +y1, +x2, +y2, { ...attrs, ...options });
    svg.appendChild(node);
  }
};

const roughlifyCircle = (
  element: SVGCircleElement,
  rc: RoughSVG,
  svg: SVGElement,
  options: Options
) => {
  const { cx, cy, r, ...attrs } = extract(element, true);
  if (cx && cy && r) {
    const node = rc.circle(+cx, +cy, +r * 2, { ...attrs, ...options });
    svg.appendChild(node);
  }
};

const rectToPath = (
  x: any,
  y: any,
  width: any,
  height: any,
  rx: any,
  ry: any
) => {
  x = +x;
  y = +y;
  height = +height;
  width = +width;

  // If a properly specified value is provided for rx
  // but not for ry (or the opposite), then the browser
  // will consider the missing value equal to the defined one.
  if (rx && ry === undefined) {
    ry = rx;
  }
  if (ry && rx === undefined) {
    rx = ry;
  }

  if (typeof rx === "string" && rx.endsWith("%")) {
    rx = (+rx.replaceAll("%", "") * width) / 100.0;
  } else {
    rx = +rx;
  }

  if (typeof ry === "string" && ry.endsWith("%")) {
    ry = (+ry.replaceAll("%", "") * height) / 100.0;
  } else {
    ry = +ry;
  }

  let d = `M ${x + rx} ${y} `;
  d += `L ${x + width - rx} ${y} A ${rx} ${ry} 0 0 1 ${x + width} ${y + ry} `;
  d += `L ${x + width} ${y + height - ry} A ${rx} ${ry} 0 0 1 ${x + width - rx} ${y + height} `;
  d += `L ${x + rx} ${y + height} A ${rx} ${ry} 0 0 1 ${x} ${y + height - ry} `;
  d += `L ${x} ${y + ry} A ${rx} ${ry} 0 0 1 ${x + rx} ${y}`;
  return d;
};

const roughlifyRect = (
  element: SVGRectElement,
  rc: RoughSVG,
  svg: SVGElement,
  options: Options
) => {
  let {
    x = "0",
    y = "0",
    width,
    height,
    rx,
    ry,
    ...attrs
  } = extract(element, true);
  if (x && y && width && height) {
    if (rx || ry) {
      // rounded corner, turn it into a path
      const d = rectToPath(x, y, width, height, rx, ry);
      const node = rc.path(d, { ...attrs, ...options });
      svg.appendChild(node);
    } else {
      const node = rc.rectangle(+x, +y, +width, +height, {
        ...attrs,
        ...options,
      });
      svg.appendChild(node);
    }
  }
};

const roughlifyEllipse = (
  element: SVGEllipseElement,
  rc: RoughSVG,
  svg: SVGElement,
  options: Options
) => {
  const { cx, cy, rx, ry, ...attrs } = extract(element, true);
  if (cx && cy && rx && ry) {
    const node = rc.ellipse(+cx, +cy, 2 * +rx, 2 * +ry, {
      ...attrs,
      ...options,
    });
    svg.appendChild(node);
  }
};

const roughlifyPolygon = (
  element: SVGPolygonElement,
  rc: RoughSVG,
  svg: SVGElement,
  options: Options
) => {
  const { points, ...attrs } = extract(element, true);
  if (points) {
    const pts: Point[] = parseListOfPoints(points);
    const node = rc.polygon(pts, { ...attrs, ...options });
    svg.appendChild(node);
  }
};

const roughlifyPolyline = (
  element: SVGPolylineElement,
  rc: RoughSVG,
  svg: SVGElement,
  options: Options
) => {
  const { points, ...attrs } = extract(element, true);
  if (points) {
    const pts: Point[] = parseListOfPoints(points);
    const node = rc.linearPath(pts, { ...attrs, ...options });
    svg.appendChild(node);
  }
};

type Roughlifier = (
  element: any,
  rc: RoughSVG,
  svg: SVGElement,
  options: Options
) => void;

const nodeMapper: Readonly<{ [key: string]: Roughlifier }> = {
  path: roughlifyPath,
  line: roughlifyLine,
  circle: roughlifyCircle,
  rect: roughlifyRect,
  ellipse: roughlifyEllipse,
  polygon: roughlifyPolygon,
  polyline: roughlifyPolyline,
};

export interface RoughlifyArgs {
  svgInput: SVGSVGElement;
  svgOutput?: SVGSVGElement;
  options?: Options;
}

export const roughlify = ({
  svgInput,
  svgOutput = undefined,
  options = {},
}: RoughlifyArgs) => {
  // init a fake document if output is not provided
  const svg = svgOutput
    ? svgOutput
    : new JSDOM().window.document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );

  // copy attributes
  Object.entries(extract(svgInput)).forEach(([key, value]) => {
    svg.setAttribute(key, value);
  });

  // bind roughjs to this element
  const rc = rough.svg(svg);

  // callback function
  const fun = (node: Node) => {
    const tag = node.nodeName.toLowerCase();
    if (tag in nodeMapper) {
      const mapper = nodeMapper[tag];
      mapper(node, rc, svg, options);
    }
  };

  // roughlify all objects
  walk(svgInput, fun);
  return svg;
};

export const roughlifyAll = (
  doc: Document,
  options: Options,
  bodyOnly: boolean = false
) => {
  doc.querySelectorAll("svg").forEach((svg) => {
    svg.parentElement?.replaceChild(
      roughlify({ svgInput: svg, options: options }),
      svg
    );
  });
  return prettier.format(
    bodyOnly ? doc.body.innerHTML : doc.documentElement.outerHTML,
    {
      parser: "html",
      bracketSameLine: true,
    }
  );
};
