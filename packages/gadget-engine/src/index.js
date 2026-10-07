import { GADGETS } from './gadgets.js';
import { matchGadgetsToPackages } from './matcher.js';
export { getCategoryLabel, isValidCategory } from './categories.js';
export { matchGadgetsToPackages };
export function getAllGadgets() {
    return GADGETS;
}
export function getGadgetById(id) {
    return GADGETS.find(g => g.id === id);
}
export function findGadgetsForProperty(property) {
    return GADGETS.filter(g => g.property === property);
}
export function findGadgetsForLibrary(library) {
    return GADGETS.filter(g => g.library === library);
}
//# sourceMappingURL=index.js.map