# roughlify

Make your SVG rough ([❤️ rough.js](https://roughjs.com/)).

![Heroicons sample](assets/heroicons.png)

## Installation

```shell
yarn add roughlify
```

## Usage

You can either provide a SVG or HTML file (local or remote). In cthe HTML case, it will make all the svg rough.

```shell
roughlify --stroke "#3500d3" --fill "#3500d3" examples/truck.svg
```

| Before                           | After                                  |
| -------------------------------- | -------------------------------------- |
| ![truck.svg](examples/truck.svg) | ![truck.svg](examples/truck.rough.svg) |

Currently `roughlify` follows the [`rough.js` options](https://github.com/rough-stuff/rough/wiki#options) through CLI flags.
