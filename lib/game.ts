export type Terrain = "grass" | "forest" | "desert" | "water" | "rock" | "lava";
export type Hex = { q: number; r: number; terrain: Terrain; visible: "unknown" | "seen" | "visible" };

export const terrainNames: Record<Terrain, string> = {
  grass: "Трава", forest: "Ліс", desert: "Пустеля", water: "Вода", rock: "Скелі", lava: "Лава",
};
export const passable = (terrain: Terrain) => !["water", "rock", "lava"].includes(terrain);
export const directions = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]] as const;
export const keyOf = (q: number, r: number) => `${q},${r}`;
export const distance = (a:{q:number;r:number}, b:{q:number;r:number}) =>
  (Math.abs(a.q-b.q)+Math.abs(a.q+a.r-b.q-b.r)+Math.abs(a.r-b.r))/2;

function noise(q:number,r:number,seed:number) {
  const x = Math.sin(q*12.9898+r*78.233+seed*0.013)*43758.5453;
  return x-Math.floor(x);
}

export function generateMap(radius:number, seed=Date.now()%100000): Hex[] {
  const tiles: Hex[]=[];
  for(let q=-radius;q<=radius;q++) for(let r=-radius;r<=radius;r++) {
    if(Math.abs(q+r)>radius) continue;
    const broad=(noise(Math.floor((q+radius)/3),Math.floor((r+radius)/3),seed)+noise(q,r,seed))/2;
    const wet=noise(Math.floor(q/2),Math.floor(r/2),seed+91);
    let terrain:Terrain="grass";
    if(wet<.16) terrain="water";
    else if(broad<.3) terrain="forest";
    else if(broad>.81) terrain="desert";
    else if(wet>.87) terrain="rock";
    if(noise(q,r,seed+777)>.975) terrain="lava";
    tiles.push({q,r,terrain,visible:"unknown"});
  }
  return tiles;
}

export function reveal(map:Hex[], pos:{q:number;r:number}, radius:number, discovered:Set<string>) {
  return map.map(t=>{
    const k=keyOf(t.q,t.r); const now=distance(t,pos)<=radius;
    if(now) discovered.add(k);
    return {...t, visible:now?"visible":discovered.has(k)?"seen":"unknown"};
  });
}
