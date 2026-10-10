/** CSS viewport pixels -> video pixels (fit-with-letterbox). */
export function fitRect(rect, viewport, output) {
  for (const [name, dims] of [['viewport', viewport], ['output', output]]) {
    if (!(dims?.width > 0 && dims?.height > 0)) throw new TypeError(`${name} must have positive width/height`);
  }
  if (!(rect?.width >= 0 && rect?.height >= 0) || !Number.isFinite(rect.x) || !Number.isFinite(rect.y)) {
    throw new TypeError('rect must use CSS-pixel x/y/width/height');
  }
  const scale = Math.min(output.width / viewport.width, output.height / viewport.height);
  const padX = (output.width - viewport.width * scale) / 2;
  const padY = (output.height - viewport.height * scale) / 2;
  return {
    x: padX + rect.x * scale, y: padY + rect.y * scale,
    width: rect.width * scale, height: rect.height * scale,
    scale, padX, padY
  };
}

/** Translate origin center to requested focus point, without manually guessed coordinates. */
export function translationToFocus(rect, focusX, focusY) {
  return { dx: focusX - (rect.x + rect.width / 2), dy: focusY - (rect.y + rect.height / 2) };
}
