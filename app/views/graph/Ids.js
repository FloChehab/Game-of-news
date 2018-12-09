export function buildEdgeId(source1, source2) {
  let s1 = source1, s2 = source2;
  if (source1 > source2) {
    s1 = source2, s2 = source1;
  }
  return `edge:%${s1}%${s2}`;
}

