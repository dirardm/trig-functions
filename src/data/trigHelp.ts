export interface TrigHelpEntry {
  id: string;
  name: string;
  nameLatex: string;
  regClass: string;
  definition: string;
  derivative: string;
  domain: string;
  period: string;
  example: string;
  uses: string;
}

export const TRIG_HELP: TrigHelpEntry[] = [
  {
    id: 'sin', name: 'sin θ', nameLatex: '\\sin(\\theta)',
    regClass: 'regulation-card--irl',
    definition: '\\sin(\\theta)=\\frac{\\text{opposite}}{\\text{hypotenuse}},\\quad\\sin(\\theta)=y\\text{ on the unit circle }x^2+y^2=1',
    derivative: '\\frac{d}{d\\theta}\\sin(\\theta)=\\cos(\\theta)',
    domain: '(-\\infty,\\infty)', period: '2\\pi',
    example: '\\text{A Ferris wheel of radius }R=10\\text{ m has a rider\'s height above the centre given by }h(t)=10\\sin(\\omega t).\\text{ At }\\theta=30°\\text{ the rider is }5\\text{ m above the centre since }\\sin(30°)=\\tfrac{1}{2}.',
    uses: '\\text{Simple harmonic motion, sound and light waves, AC voltage }v(t)=V_0\\sin(\\omega t+\\phi),\\text{ circular motion, seasonal temperature models, and Fourier series decomposition.}',
  },
  {
    id: 'cos', name: 'cos θ', nameLatex: '\\cos(\\theta)',
    regClass: 'regulation-card--lcr',
    definition: '\\cos(\\theta)=\\frac{\\text{adjacent}}{\\text{hypotenuse}},\\quad\\cos(\\theta)=x\\text{ on the unit circle }x^2+y^2=1',
    derivative: '\\frac{d}{d\\theta}\\cos(\\theta)=-\\sin(\\theta)',
    domain: '(-\\infty,\\infty)', period: '2\\pi',
    example: '\\text{The horizontal displacement of a pendulum bob follows }x(t)=A\\cos(\\omega t).\\text{ At }t=0\\text{ the bob is at maximum displacement }A\\text{ since }\\cos(0)=1.\\text{ Its velocity }x\'(t)=-A\\omega\\sin(\\omega t)\\text{ is zero at the extremes.}',
    uses: '\\text{Phase-shifted sine: }\\cos(\\theta)=\\sin(\\theta+\\tfrac{\\pi}{2}).\\text{ Dot product }\\mathbf{a}\\cdot\\mathbf{b}=\\|\\mathbf{a}\\|\\|\\mathbf{b}\\|\\cos(\\theta),\\text{ projection, power factor }\\cos(\\phi)\\text{ in AC circuits, and cosine similarity in machine learning.}',
  },
  {
    id: 'tan', name: 'tan θ', nameLatex: '\\tan(\\theta)',
    regClass: 'regulation-card--nsfr',
    definition: '\\tan(\\theta)=\\frac{\\sin(\\theta)}{\\cos(\\theta)}=\\frac{\\text{opposite}}{\\text{adjacent}}',
    derivative: '\\frac{d}{d\\theta}\\tan(\\theta)=\\sec^2(\\theta)=1+\\tan^2(\\theta)',
    domain: '\\mathbb{R}\\setminus\\{\\tfrac{\\pi}{2}+k\\pi\\mid k\\in\\mathbb{Z}\\}', period: '\\pi',
    example: '\\text{A ladder of length }L\\text{ leaning against a wall at angle }\\theta\\text{ has its top at height }h=L\\sin(\\theta)\\text{ and base at distance }d=L\\cos(\\theta).\\text{ The slope is }\\tfrac{h}{d}=\\tan(\\theta).\\text{ At }45°\\text{ the height equals the base.}',
    uses: '\\text{Slopes and gradients }m=\\tan(\\theta),\\text{ angle of elevation in surveying, polar-to-Cartesian conversion }y/x=\\tan(\\theta),\\text{ and the Weierstrass substitution }t=\\tan(\\theta/2)\\text{ for rationalising trigonometric integrals.}',
  },
  {
    id: 'cot', name: 'cot θ', nameLatex: '\\cot(\\theta)',
    regClass: 'regulation-card--peru',
    definition: '\\cot(\\theta)=\\frac{\\cos(\\theta)}{\\sin(\\theta)}=\\frac{1}{\\tan(\\theta)}=\\frac{\\text{adjacent}}{\\text{opposite}}',
    derivative: '\\frac{d}{d\\theta}\\cot(\\theta)=-\\csc^2(\\theta)=-(1+\\cot^2(\\theta))',
    domain: '\\mathbb{R}\\setminus\\{k\\pi\\mid k\\in\\mathbb{Z}\\}', period: '\\pi',
    example: '\\text{A surveyor measuring the height }h\\text{ of a building from a distance }d\\text{ uses the angle of elevation }\\theta\\text{ where }h=d\\tan(\\theta).\\text{ Equivalently, }d=h\\cot(\\theta).\\text{ A small }\\cot(\\theta)\\text{ means the building is far away relative to its height.}',
    uses: '\\text{Reciprocal slope relationships, complementary angle identity }\\cot(\\theta)=\\tan(\\tfrac{\\pi}{2}-\\theta),\\text{ integration of rational functions via partial fractions, and polar coordinate transformations.}',
  },
  {
    id: 'sec', name: 'sec θ', nameLatex: '\\sec(\\theta)',
    regClass: 'regulation-card--panama',
    definition: '\\sec(\\theta)=\\frac{1}{\\cos(\\theta)}=\\frac{\\text{hypotenuse}}{\\text{adjacent}}',
    derivative: '\\frac{d}{d\\theta}\\sec(\\theta)=\\sec(\\theta)\\tan(\\theta)',
    domain: '\\mathbb{R}\\setminus\\{\\tfrac{\\pi}{2}+k\\pi\\mid k\\in\\mathbb{Z}\\}', period: '2\\pi',
    example: '\\text{The slant range }R\\text{ from a radar to a target at altitude }h\\text{ and elevation }\\theta\\text{ is }R=h\\sec(\\theta).\\text{ At }\\theta=60°\\text{ the secant is }2,\\text{ so the slant range is twice the altitude: }R=2h.',
    uses: '\\text{Mercator map projection }y=\\ln|\\sec(\\theta)+\\tan(\\theta)|,\\text{ antenna beam-width factor, secant-tangent substitutions in calculus, and Lambert conformal conic projections in cartography.}',
  },
  {
    id: 'csc', name: 'csc θ', nameLatex: '\\csc(\\theta)',
    regClass: 'regulation-card--almm',
    definition: '\\csc(\\theta)=\\frac{1}{\\sin(\\theta)}=\\frac{\\text{hypotenuse}}{\\text{opposite}}',
    derivative: '\\frac{d}{d\\theta}\\csc(\\theta)=-\\csc(\\theta)\\cot(\\theta)',
    domain: '\\mathbb{R}\\setminus\\{k\\pi\\mid k\\in\\mathbb{Z}\\}', period: '2\\pi',
    example: '\\text{A directional antenna has elevation gain proportional to }\\csc(\\theta)\\text{ for certain beam patterns. At }\\theta=30°\\text{ the cosecant is }2,\\text{ yielding a }6\\text{ dB gain relative to the horizon since }20\\log_{10}(2)\\approx 6.',
    uses: '\\text{Cosecant-squared antenna for air-surveillance radar, }\\csc(\\theta)=\\sec(\\tfrac{\\pi}{2}-\\theta)\\text{ complementary identity, Weierstrass elliptic functions, and certain families of orthogonal polynomials.}',
  },
];
