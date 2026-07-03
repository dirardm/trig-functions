# Trigonometric Functions — Rust + WebAssembly

An interactive showcase of the **six trigonometric functions** with their derivatives, computed in Rust via WebAssembly and rendered with Chart.js in the ObligaI design system.

**[Live demo →](https://oblig.ai/trig-functions)**

## Functions

| Function | Derivative | Period | Domain |
|---|---|---|---|
| **sin θ** | cos θ | 2π | (−∞, ∞) |
| **cos θ** | −sin θ | 2π | (−∞, ∞) |
| **tan θ** | sec² θ | π | ℝ \\ {π/2 + kπ} |
| **cot θ** | −csc² θ | π | ℝ \\ {kπ} |
| **sec θ** | sec θ tan θ | 2π | ℝ \\ {π/2 + kπ} |
| **csc θ** | −csc θ cot θ | 2π | ℝ \\ {kπ} |

## Features

- **Interactive charts** — function and derivative curves plotted from −2π to 2π with adjustable angle
- **Auto-play** — animate the angle through the full range, tracing the skier along each curve
- **Rust/WASM computation** — all 6 trig values and curve data computed in Rust via `wasm-pack`
- **Help reference** — rigorous mathematical definitions with LaTeX formulas, derivatives, domains, and examples
- **Dark/light mode** — full theme support via ObligaI design system
- **Glassmorphic UI** — frosted glass cards, sidebar, topbar, and modal

## Architecture

```
src/                          # Vite + React frontend
├── App.tsx                   # App shell with sidebar, topbar, theme toggle
├── main.tsx                  # Entry point
├── hooks/useTrigWasm.ts      # WASM bridge — init, curve, point, info
├── components/
│   ├── TrigCard.tsx          # Interactive card with chart, slider, play/pause
│   ├── TrigChart.tsx         # Chart.js line chart with skier marker plugin
│   ├── HelpModal.tsx         # Mathematical reference with LaTeX formulas
│   └── ...
├── data/
│   ├── trigTheme.ts          # Per-function colors, CSS classes, SVG shapes
│   └── trigHelp.ts           # Help reference content
├── context/ThemeContext.tsx  # Dark/light mode
├── wasm-pkg/                 # Pre-built WASM bundle
├── obligai.css               # ObligaI design system
└── index.css                 # App-specific additions

wasm/                          # Rust → WASM crate
├── Cargo.toml
└── src/lib.rs                 # trig_values, trig_curve, trig_point, trig_info
```

## Development

```bash
# Build WASM
cd wasm
wasm-pack build --target web
cp -r pkg ../src/wasm-pkg

# Run app
cd ..
npm install
npm run dev
```

## Tech Stack

- **[Rust](https://www.rust-lang.org)** + **[WebAssembly](https://webassembly.org)** — all computation via `wasm-bindgen`
- **React 19** + **TypeScript** — UI framework
- **Vite** — build tool
- **Chart.js** — function and derivative curve rendering
- **KaTeX** — mathematical formula typesetting
- **Framer Motion** — card entrance animations
- ObligaI Design System — theming, components, layout

## How It Works

1. Select a function from the sidebar → card appears with chart
2. Chart shows the function curve (solid) and its derivative (dashed) from −2π to 2π
3. A skier dot rides the curve at the current angle
4. Drag the slider or press play to animate the angle
5. Values update in real-time — all computed in Rust/WASM
6. Click **?** for the mathematical reference with rigorous definitions

## License

MIT
