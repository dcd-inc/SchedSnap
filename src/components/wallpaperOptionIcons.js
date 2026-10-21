import { Rows3, List, Columns3, PanelsTopLeft, GitCommitVertical, Table2, Layers, Square, Palette, SquareDashed, Blend, Ban } from 'lucide-react';

export const layoutIcons = {
  stacked: Rows3,
  'grouped-list': List,
  'day-columns': Columns3,
  'day-cards': PanelsTopLeft,
  timeline: GitCommitVertical,
  weekly: Table2,
};

export const stylePickerOptions = [
  ['glass', 'Frosted glass', Layers],
  ['solid', 'Solid', Square],
  ['colored', 'Solid color', Palette],
  ['colored-glass', 'Colored glass', Blend],
  ['outline', 'Outline', SquareDashed],
  ['none', 'No container', Ban],
];
