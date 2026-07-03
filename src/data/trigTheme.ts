export interface TrigTheme {
  color: string;
  tClass: string;
  regClass: string;
  badgeClass: string;
  shape: string;
}

export const TRIG_THEMES: TrigTheme[] = [
  { color: '#C0622F', tClass: 't-irl', regClass: 'regulation-card--irl', badgeClass: 'badge--irl',
    shape: 'M0 8 Q2 1 4 8 Q6 15 8 8 Q10 1 12 8 Q14 15 16 8' },
  { color: '#0D3B66', tClass: 't-lcr', regClass: 'regulation-card--lcr', badgeClass: 'badge--lcr',
    shape: 'M0 4 Q2 11 4 4 Q6 -3 8 4 Q10 11 12 4 Q14 -3 16 4' },
  { color: '#62A87C', tClass: 't-nsfr', regClass: 'regulation-card--nsfr', badgeClass: 'badge--nsfr',
    shape: 'M0 16 L3 16 L5.5 2 L8 16 L10.5 2 L13 16 L16 16' },
  { color: '#C2273E', tClass: 't-peru', regClass: 'regulation-card--peru', badgeClass: 'badge--peru',
    shape: 'M0 0 L3 0 L5.5 14 L8 0 L10.5 14 L13 0 L16 0' },
  { color: '#003087', tClass: 't-panama', regClass: 'regulation-card--panama', badgeClass: 'badge--panama',
    shape: 'M0 16 L3 16 L5 8 Q8 -2 11 8 L13 16 L16 16' },
  { color: '#7B5EA7', tClass: 't-almm', regClass: 'regulation-card--almm', badgeClass: 'badge--almm',
    shape: 'M0 0 L3 0 L5 8 Q8 -2 11 8 L13 0 L16 0' },
];
