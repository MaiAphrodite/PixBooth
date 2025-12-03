// Shared layouts data
const imgSingle = "https://www.figma.com/api/mcp/asset/70b4ee8b-1882-4c8a-8b58-5138918db6e1";
const imgStripA = "https://www.figma.com/api/mcp/asset/3937167a-fedc-4daa-8888-1ac69cd6b732";
const imgStripB = "https://www.figma.com/api/mcp/asset/e8b83e5e-f9a9-493d-ab26-65441e08650d";
const imgStripC = "https://www.figma.com/api/mcp/asset/9c59972f-61dc-443b-ad78-63fe0e953079";
const imgCollageA = "https://www.figma.com/api/mcp/asset/3fbd7694-37f3-4eb8-8ed7-3c660a99e580";
const imgCollageB = "https://www.figma.com/api/mcp/asset/972c21d3-5f99-41c9-9ac8-d30831337d7f";
const imgCollageC = "https://www.figma.com/api/mcp/asset/72fdf277-6c8f-4e2f-bfd5-ea781aac4a6e";

export const layouts = [
  { id: 'single', name: 'Single Shot', poses: 1, image: imgSingle, category: 'Single' },
  { id: 'strip-a', name: 'Strip Style A', poses: 2, image: imgStripA, category: 'Strip' },
  { id: 'strip-b', name: 'Strip Style B', poses: 3, image: imgStripB, category: 'Strip' },
  { id: 'strip-c', name: 'Strip Style C', poses: 4, image: imgStripC, category: 'Strip' },
  { id: 'collage-a', name: 'Collage A', poses: 4, image: imgCollageA, category: 'Collage' },
  { id: 'collage-b', name: 'Collage B', poses: 6, image: imgCollageB, category: 'Collage' },
  { id: 'collage-c', name: 'Collage C', poses: 8, image: imgCollageC, category: 'Collage' }
];

export function getLayoutById(id) {
  return layouts.find(l => l.id === id) || layouts[0];
}
