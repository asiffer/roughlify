import rough from "roughjs";
import { Options } from "roughjs/bin/core";
import { Point } from "roughjs/bin/geometry";

const removeAttributes = (element: Element) => {
  while (element.attributes.length > 0) {
    element.removeAttribute(element.attributes[0].name);
  }
};

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

export const roughlify = (
  input: SVGSVGElement,
  output: SVGSVGElement,
  options: Options = {}
) => {
  // reset output
  removeAttributes(output);
  // copy attributes
  Object.entries(extract(input)).forEach(([key, value]) => {
    output.setAttribute(key, value);
  });

  // bind roughjs to this element
  const rc = rough.svg(output);

  // now roughlify every object
  // path
  input.querySelectorAll("path")?.forEach((p) => {
    const { d, ...attrs } = extract(p, true);
    if (d) {
      const node = rc.path(d, { ...attrs, ...options });
      output.appendChild(node);
    }
  });
  // line
  input.querySelectorAll("line")?.forEach((l) => {
    const { x1, y1, x2, y2, ...attrs } = extract(l, true);
    if (x1 && y1 && x2 && y2) {
      const node = rc.line(+x1, +y1, +x2, +y2, { ...attrs, ...options });
      output.appendChild(node);
    }
  });
  // circle
  input.querySelectorAll("circle")?.forEach((c) => {
    const { cx, cy, r, ...attrs } = extract(c, true);
    if (cx && cy && r) {
      const node = rc.circle(+cx, +cy, +r * 2, { ...attrs, ...options });
      output.appendChild(node);
    }
  });
  // rectangle
  input.querySelectorAll("rect")?.forEach((r) => {
    const { x, y, width, height, ...attrs } = extract(r, true);
    if (x && y && width && height) {
      const node = rc.rectangle(+x, +y, +width, +height, {
        ...attrs,
        ...options,
      });
      output.appendChild(node);
    }
  });
  // ellipse
  input.querySelectorAll("ellipse")?.forEach((e) => {
    const { cx, cy, rx, ry, ...attrs } = extract(e, true);
    if (cx && cy && rx && ry) {
      const node = rc.ellipse(+cx, +cy, 2 * +rx, 2 * +ry, {
        ...attrs,
        ...options,
      });
      output.appendChild(node);
    }
  });
  // polygon
  input.querySelectorAll("polygon")?.forEach((e) => {
    const { points, ...attrs } = extract(e, true);
    if (points) {
      const pts: Point[] = parseListOfPoints(points);
      const node = rc.polygon(pts, { ...attrs, ...options });
      output.appendChild(node);
    }
  });
  // polyline
  input.querySelectorAll("polyline")?.forEach((e) => {
    const { points, ...attrs } = extract(e, true);
    if (points) {
      const pts: Point[] = parseListOfPoints(points);
      const node = rc.linearPath(pts, { ...attrs, ...options });
      output.appendChild(node);
    }
  });

  return output;
};
