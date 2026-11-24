// Niveles del Sokoban de Lolete, de menor a mayor dificultad.
// # pared · . destino · $ caja · @ Colgadín · + Colgadín sobre un destino · * caja sobre destino
// L Lolete (atrapado, cuenta como pared)
// El segundo (el de los calcetines) es la posición más alejada de la solución que admite su habitación (99 pasos
// como mínimo), hallada explorando hacia atrás desde el nivel resuelto: tiene solución garantizada. Aun así resultó
// más sencillo que el de los juguetes, que va el último.
export const LEVELS = [
  {
    hint: '¡Guau! ¡Las cajas a las marcas!',
    rows: [
      '#########',
      '#   #  L#',
      '# $   $ #',
      '#.  @  .#',
      '##  $  ##',
      ' #  .  # ',
      ' ####### ',
    ],
  },
  {
    hint: 'Ahora las de los calcetines. ¡Ojo con el orden!',
    rows: [
      '##########',
      '#+.$ #   #',
      '#.   #$$ #',
      '#.     # #',
      '# ##  $  #',
      '#       L#',
      '##########',
    ],
  },
  {
    hint: 'Las últimas, las de los juguetes. Piensa antes de empujar.',
    rows: [
      '  #####  ',
      '###   ###',
      '#  $ $  #',
      '# #.#.# #',
      '#  $@$  #',
      '# #.#.# #',
      '#   L   #',
      '#########',
    ],
  },
];
