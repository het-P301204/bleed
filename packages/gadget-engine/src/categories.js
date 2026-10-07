export const CATEGORY_LABELS = {
    ROUTING: 'Network Routing',
    AUTH: 'Authentication / Authorization',
    HTTP: 'HTTP Manipulation',
    EXECUTION_SIM: 'Execution Simulation',
    FILE: 'File System',
    CALLBACK: 'Callback Injection',
};
export function getCategoryLabel(category) {
    return CATEGORY_LABELS[category];
}
export function isValidCategory(value) {
    return value in CATEGORY_LABELS;
}
//# sourceMappingURL=categories.js.map