import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../styles/theme';

const strings = [0, 1, 2, 3, 4, 5];
const frets = [0, 1, 2, 3, 4, 5];

const notes = [
  { x: 92, y: 50, label: '3', fill: colors.accent },
  { x: 148, y: 74, label: '7', fill: colors.blue },
  { x: 204, y: 98, label: '3', fill: colors.accent },
  { x: 260, y: 122, label: '7', fill: colors.blue },
];

export function FretboardSVG() {
  return (
    <Svg width="100%" height="190" viewBox="0 0 340 190">
      <Rect x="16" y="16" width="308" height="158" rx="22" fill="#FBF5EA" />

      {strings.map((stringIndex) => (
        <Line
          key={`string-${stringIndex}`}
          x1="44"
          y1={38 + stringIndex * 23}
          x2="296"
          y2={38 + stringIndex * 23}
          stroke="#8B7D70"
          strokeWidth={stringIndex === 5 ? 2.6 : 1.5}
          strokeLinecap="round"
        />
      ))}

      {frets.map((fretIndex) => (
        <Line
          key={`fret-${fretIndex}`}
          x1={44 + fretIndex * 56}
          y1="36"
          x2={44 + fretIndex * 56}
          y2="154"
          stroke={fretIndex === 0 ? colors.ink : '#D4C5B5'}
          strokeWidth={fretIndex === 0 ? 4 : 1.5}
          strokeLinecap="round"
        />
      ))}

      {notes.map((note) => (
        <Circle key={`${note.x}-${note.y}`} cx={note.x} cy={note.y} r="14" fill={note.fill} />
      ))}

      {notes.map((note) => (
        <SvgText
          key={`${note.x}-${note.y}-label`}
          x={note.x}
          y={note.y + 5}
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          fill="#FFFDF7"
        >
          {note.label}
        </SvgText>
      ))}

      <SvgText x="44" y="170" fontSize="11" fill={colors.muted}>Gm7 → C7 → Fmaj7 guide-tone motion</SvgText>
    </Svg>
  );
}
