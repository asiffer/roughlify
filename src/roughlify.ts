import { JSDOM } from "jsdom";
import * as prettier from "prettier";
import rough from "roughjs";
import { Options } from "roughjs/bin/core";
import { Point } from "roughjs/bin/geometry";

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

export const roughlify = (svgElement: SVGSVGElement, options: Options = {}) => {
  // init a fake document
  const outputDocument = new JSDOM().window.document;
  // create a new svg in outputDOM
  const svg = outputDocument.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  // copy attributes
  Object.entries(extract(svgElement)).forEach(([key, value]) => {
    svg.setAttribute(key, value);
  });

  // bind roughjs to this element
  const rc = rough.svg(svg);

  // now roughlify every object
  // path
  svgElement.querySelectorAll("path")?.forEach((p) => {
    const { d, ...attrs } = extract(p, true);
    if (d) {
      const node = rc.path(d, { ...attrs, ...options });
      svg.appendChild(node);
    }
  });
  // line
  svgElement.querySelectorAll("line")?.forEach((l) => {
    const { x1, y1, x2, y2, ...attrs } = extract(l, true);
    if (x1 && y1 && x2 && y2) {
      const node = rc.line(+x1, +y1, +x2, +y2, { ...attrs, ...options });
      svg.appendChild(node);
    }
  });
  // circle
  svgElement.querySelectorAll("circle")?.forEach((c) => {
    const { cx, cy, r, ...attrs } = extract(c, true);
    if (cx && cy && r) {
      const node = rc.circle(+cx, +cy, +r * 2, { ...attrs, ...options });
      svg.appendChild(node);
    }
  });
  // rectangle
  svgElement.querySelectorAll("rect")?.forEach((r) => {
    const { x, y, width, height, ...attrs } = extract(r, true);
    if (x && y && width && height) {
      const node = rc.rectangle(+x, +y, +width, +height, {
        ...attrs,
        ...options,
      });
      svg.appendChild(node);
    }
  });
  // ellipse
  svgElement.querySelectorAll("ellipse")?.forEach((e) => {
    const { cx, cy, rx, ry, ...attrs } = extract(e, true);
    if (cx && cy && rx && ry) {
      const node = rc.ellipse(+cx, +cy, 2 * +rx, 2 * +ry, {
        ...attrs,
        ...options,
      });
      svg.appendChild(node);
    }
  });
  // polygon
  svgElement.querySelectorAll("polygon")?.forEach((e) => {
    const { points, ...attrs } = extract(e, true);
    if (points) {
      const pts: Point[] = parseListOfPoints(points);
      const node = rc.polygon(pts, { ...attrs, ...options });
      svg.appendChild(node);
    }
  });
  // polyline
  svgElement.querySelectorAll("polyline")?.forEach((e) => {
    const { points, ...attrs } = extract(e, true);
    if (points) {
      const pts: Point[] = parseListOfPoints(points);
      const node = rc.linearPath(pts, { ...attrs, ...options });
      svg.appendChild(node);
    }
  });

  return svg;
};

export const roughlifyAll = (
  doc: Document,
  options: Options,
  bodyOnly: boolean = false
) => {
  doc.querySelectorAll("svg").forEach((svg) => {
    svg.parentElement?.replaceChild(roughlify(svg, options), svg);
  });
  return prettier.format(
    bodyOnly ? doc.body.innerHTML : doc.documentElement.outerHTML,
    {
      parser: "html",
      bracketSameLine: true,
    }
  );
};
