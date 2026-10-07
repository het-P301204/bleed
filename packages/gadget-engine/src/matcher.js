import { GADGETS } from './gadgets.js';
export function matchGadgetsToPackages(packages) {
    return Object.entries(packages).map(([name, version]) => {
        const matchingGadgets = GADGETS.filter(g => g.library === name);
        return {
            name,
            version,
            potentialGadgets: matchingGadgets.map(g => g.id),
            potentialSources: [],
            confirmedInFixture: matchingGadgets.some(g => g.status === 'REPRODUCED'),
        };
    });
}
//# sourceMappingURL=matcher.js.map