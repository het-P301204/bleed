import { matchGadgetsToPackages } from './matcher.js';
export type { GadgetCategory } from '@bleed/shared';
export { getCategoryLabel, isValidCategory } from './categories.js';
export { matchGadgetsToPackages };
export declare function getAllGadgets(): import("@bleed/shared").Gadget[];
export declare function getGadgetById(id: string): import("@bleed/shared").Gadget | undefined;
export declare function findGadgetsForProperty(property: string): import("@bleed/shared").Gadget[];
export declare function findGadgetsForLibrary(library: string): import("@bleed/shared").Gadget[];
//# sourceMappingURL=index.d.ts.map