# Trigonometric Functions — Rust + WebAssembly

An interactive showcase of the **six trigonometric functions** with their derivatives, computed in Rust via WebAssembly and rendered with Chart.js in the ObligaI design system.

**[Live demo →](https://oblig.ai/trig-functions)**

## Functions

| Function | Derivative | Period | Domain |
|---|---|---|---|
| **sin θ** | cos θ | 2π | (−∞, ∞) |
| **cos θ** | −sin θ | 2π | (−∞, ∞) |
| **tan θ** | sec² θ | π | ℝ \ {π/2 + kπ} |
| **cot θ** | −csc² θ | π | ℝ \ {kπ} |
| **sec θ** | sec θ tan θ | 2π | ℝ \ {π/2 + kπ} |
| **csc θ** | −csc θ cot θ | 2π | ℝ \ {kπ} |

## Features

- **Interactive unit circle** — drag the skier around the circle to change the angle, with a fading glow trail, breathing arc pulse, and marching projection dashes
- **Draggable chart** — click and drag horizontally on the chart to move the skier along the curves, with animated marker line and ping ripple
- **Auto-play** — animate the angle through the full range with morphing play/pause icon and ripple burst on click
- **Rust/WASM computation** — all 6 trig values and curve data computed in Rust via `wasm-pack`
- **State-of-the-art animations** — 3D card tilt on mouse hover, mouse-following glass highlight, rotating shimmer border, staggered blur-to-sharp entrance, spring-animated value counters, and sun/moon icon morph
- **Zero-centred x-axis** — axis line drawn through y=0 with π-scaled tick labels directly underneath
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
│   ├── TrigCard.tsx          # Interactive card with chart, unit circle, slider, play/pause
│   ├── TrigChart.tsx         # Chart.js line chart with skier marker, zero-line, and drag plugins
│   ├── UnitCircle.tsx        # Canvas unit circle with drag, trail, ping, and marching dashes
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
- **Framer Motion** — animations, gestures, and transitions
- ObligaI Design System — theming, components, layout

## How It Works

1. Select a function from the sidebar → card animates in with staggered blur-to-sharp reveal
2. Chart shows the function curve (solid) and its derivative (dashed) from −2π to 2π
3. A skier dot rides each curve at the current angle with a glowing trail
4. **Drag on the unit circle** to spin the skier around, or **drag on the chart** to slide it along the curves
5. Use the slider or press play to animate the angle — values spring-animate on every change
6. Hover over the card for 3D tilt and glass highlight effects
7. Click **?** for the mathematical reference with rigorous definitions

## License

MIT
