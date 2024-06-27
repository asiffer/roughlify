import chalk from "chalk";
import { Command, Option } from "commander";
import { JSDOM } from "jsdom";
import { readFile, writeFile } from "node:fs/promises";
import * as prettier from "prettier";
import { Options } from "roughjs/bin/core";
import { RoughGenerator } from "roughjs/bin/generator";
import { roughlify } from "./roughlify";

const error = (msg: string) => console.log(chalk.bold.red(msg));
const warning = (msg: string) => console.log(chalk.yellow(msg));
const success = (msg: string) => console.log(chalk.greenBright(msg));
const info = (msg: string) => console.log(chalk.blue(msg));
const panic = (msg: string) => {
  error(msg);
  process.exit();
};

export const buildDocument = (raw: string) => {
  return new JSDOM(raw).window.document;
};

const roughlifyAll = (
  doc: Document,
  options: Options,
  bodyOnly: boolean = false
) => {
  doc.querySelectorAll("svg").forEach((svg) => {
    const svgOutput = new JSDOM().window.document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svg.parentElement?.replaceChild(
      roughlify({ svgInput: svg, svgOutput: svgOutput, options: options }),
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

const toKebab = (s: string) =>
  s.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? "-" : "") + $.toLowerCase()
  );

const parseListOfNumbers = (value: string, _?: any) => {
  return value
    .replace(/[ ]+/g, "")
    .split(",")
    .map((p: string) => +p);
};

const program = new Command();
program
  .name("roughlify")
  .description(`Make your SVG rough (❤️  rough.js)`)
  .argument("<filename>", "SVG or HTML file to roughlify (could be an URL)")
  .action(async (filename: string, options: Options) => {
    let raw = "";
    let outfile = "";
    let bodyOnly = false;

    try {
      const url = new URL(filename);
      info(`Fetching ${url}`);
      raw = await fetch(url).then((value) => value.text());
      const fn = url.pathname.split("/").pop();
      if (fn) {
        filename = fn;
      } else {
        filename = "index.html";
      }
    } catch {
      info(`📖 Opening ${filename}`);
      raw = await readFile(filename)
        .catch((reason) => {
          panic(`😭 ${reason}`);
          return "";
        })
        .then((value) => value.toString());
    } finally {
      if (!raw) {
        error(`Content of ${filename} is empty`);
        return;
      }

      const index = filename.lastIndexOf(".");
      if (index >= 0) {
        const extension = filename.slice(index);
        outfile = filename.slice(0, index) + ".rough" + extension;
        // in case of svg file, we keep only the body
        if (extension === ".svg") {
          bodyOnly = true;
        }
      } else {
        warning(
          `🤷 No extension found for '${filename}', falling back to HTML.`
        );
        outfile = filename + ".rough.html";
      }

      info("⚙️  Parsing input");
      const doc = buildDocument(raw);
      info("✍️  Scribbling");
      const out = await roughlifyAll(doc, options, bodyOnly);
      //   write result
      await writeFile(outfile, out)
        .catch((reason) => {
          error(reason);
        })
        .then(() => {
          info(`📕 Writing output to ${outfile}`);
        });
    }
  });

// Generate some options automatically
Object.entries(new RoughGenerator().defaultOptions).forEach(([key, value]) => {
  // keep stroke manual to avoid default options to override inline svg props
  if (key === "stroke") {
    return;
  }
  switch (typeof value) {
    case "boolean":
      program.option(`--${toKebab(key)}`);
      break;
    case "number":
      program.addOption(
        new Option(`--${toKebab(key)} <${key}>`)
          .default(value)
          .argParser(parseFloat)
      );
      break;
    case "string":
      program.option(`--${toKebab(key)} <${key}>`, "", value);
      break;
  }
});

// remaining options
program.option(`-s, --stroke <stroke>`);
program.option(`-f, --fill <fill>`);
program.option(
  `--${toKebab("fillLineDash")} <fillLineDash>`,
  " (example: '5,5')",
  parseListOfNumbers
);
program.option(
  `--${toKebab("fillLineOffset")} <fillLineOffset>`,
  "",
  parseFloat
);
program.option(
  `--${toKebab("strokeLineDash")} <strokeLineDash>`,
  " (example: '5,5')",
  parseListOfNumbers
);
program.option(
  `--${toKebab("strokeLineOffset")} <strokeLineOffset>`,
  "",
  parseFloat
);

program.addOption(
  new Option(`--${toKebab("simplification")} <${"simplification"}>`)
    .default(0)
    .argParser(parseFloat)
);

program.options
  .filter((opt) => opt.name() === "fill-style")
  .find(() => true)
  ?.choices([
    "solid",
    "hachure",
    "zigzag",
    "cross-hatch",
    "dots",
    "dashed",
    "zigzag-line",
  ]);

program.parseAsync();
