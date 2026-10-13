/**
 * Aligned image — the source's WordPress img.alignright / alignleft / aligncenter. One cell with
 * the image (optionally linked); variant = alignment. The authored picture (or its link) MOVES
 * out of the row/cell scaffolding into the block root, which floats like the source image.
 * @param {Element} block The aligned-image block element
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;
  const media = cell.querySelector('a') || cell.querySelector('picture') || cell.querySelector('img');
  if (!media) return;
  const holder = media.closest('p');
  block.replaceChildren(holder && holder.children.length === 1 ? holder : media);
}
