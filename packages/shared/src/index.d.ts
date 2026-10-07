export type ChainStatus = 'POTENTIAL' | 'REACHABLE' | 'REPRODUCED' | 'BLOCKED' | 'INCONCLUSIVE' | 'ERROR';
export type ConfidenceLevel = 'CONFIRMED' | 'HIGH' | 'MEDIUM' | 'UNKNOWN';
export type LabStatus = 'READY' | 'STARTING' | 'STOPPED' | 'ERROR';
export type ControlledImpact = 'SYNTHETIC_SSRF' | 'SYNTHETIC_HTTP_MANIPULATION' | 'SYNTHETIC_AUTH_BYPASS' | 'SYNTHETIC_CREDENTIAL_FLOW' | 'SYNTHETIC_EXECUTION_MARKER' | 'NONE';
export type GadgetCategory = 'ROUTING' | 'AUTH' | 'HTTP' | 'EXECUTION_SIM' | 'FILE' | 'CALLBACK';
export type GadgetStatus = 'POTENTIAL' | 'REACHABLE' | 'REPRODUCED' | 'BLOCKED' | 'INCONCLUSIVE';
export interface Evidence {
    id: string;
    sourceFile?: string;
    sourceLine?: number;
    property: string;
    origin: string;
    runtimeEvent?: string;
    gadgetId?: string;
    impact?: string;
    timestamp: number;
    fixtureVersion: string;
    description: string;
}
export interface Mitigation {
    strategy: string;
    description: string;
    codeExample?: string;
    fixtureId?: string;
    verified: boolean;
}
export interface Gadget {
    id: string;
    library: string;
    versionRange?: string;
    property: string;
    trigger: string;
    category: GadgetCategory;
    impactClass: ControlledImpact;
    description: string;
    evidence: Evidence[];
    mitigation: Mitigation;
    status: GadgetStatus;
    labTarget?: string;
}
export type SourceStatus = 'CONFIRMED' | 'THEORETICAL' | 'BLOCKED' | 'INCONCLUSIVE';
export interface PollutionSource {
    id: string;
    name: string;
    description: string;
    file: string;
    functionName: string;
    property: string;
    fixtureId: string;
    hardeningVariantId?: string;
    evidence: Evidence[];
    status: SourceStatus;
    category: 'UNSAFE_MERGE' | 'RECURSIVE_MERGE' | 'DEEP_PARSER' | 'PROPERTY_ASSIGN' | 'CONFIG_MERGE' | 'QUERY_NORMALIZE';
    vulnerableCode: string;
    hardenedCode?: string;
}
export interface ObjectProperty {
    key: string;
    value: unknown;
    type: string;
    own: boolean;
    origin?: string;
    introducedBy?: string;
    propagationCount?: number;
    timestamp?: number;
}
export interface ObjectState {
    id: string;
    timestamp: number;
    label: string;
    ownProperties: ObjectProperty[];
    inheritedProperties: ObjectProperty[];
    prototypeChain: string[];
    polluted: boolean;
}
export interface ObjectReference {
    id: string;
    label: string;
    type: string;
}
export interface PropertyPropagation {
    property: string;
    origin: 'Object.prototype';
    introducedBy: string;
    affectedObjects: ObjectReference[];
    evidence: Evidence[];
    timestamp: number;
}
export interface ChainNode {
    id: string;
    type: 'INPUT' | 'PARSER' | 'MERGE' | 'PROTOTYPE' | 'OBJECT' | 'LIBRARY' | 'GADGET' | 'TARGET' | 'IMPACT';
    label: string;
    property?: string;
    evidence?: Evidence[];
}
export interface ChainEdge {
    from: string;
    to: string;
    type: 'WRITES' | 'INHERITS' | 'READS' | 'INVOKES' | 'REACHES';
    property?: string;
}
export interface Chain {
    id: string;
    name: string;
    sourceId: string;
    property: string;
    gadgetIds: string[];
    impact: ControlledImpact;
    status: ChainStatus;
    confidence: ConfidenceLevel;
    evidence: Evidence[];
    mitigation?: Mitigation;
    nodes: ChainNode[];
    edges: ChainEdge[];
    scenarioId?: string;
    createdAt: number;
}
export type RuntimeEventType = 'INPUT_RECEIVED' | 'MERGE_EXECUTED' | 'PROTOTYPE_POLLUTED' | 'PROPERTY_INHERITED' | 'GADGET_TRIGGERED' | 'IMPACT_EXECUTED' | 'HARDENED_BLOCKED' | 'ERROR';
export interface RuntimeEvent {
    id: string;
    type: RuntimeEventType;
    timestamp: number;
    relativeMs: number;
    description: string;
    property?: string;
    value?: unknown;
    sourceId?: string;
    gadgetId?: string;
    objectStateId?: string;
    evidence?: Evidence[];
}
export interface ResearchRun {
    id: string;
    scenarioId: string;
    fixtureId: string;
    fixtureVersion: string;
    packageVersions: Record<string, string>;
    chain: Chain;
    input: unknown;
    objectStates: ObjectState[];
    events: RuntimeEvent[];
    propagation?: PropertyPropagation;
    result: ChainStatus;
    mitigationState: 'VULNERABLE' | 'HARDENED';
    evidence: Evidence[];
    duration: number;
    timestamp: number;
    notes: ResearchNote[];
}
export interface ScenarioExpected {
    propagation: boolean;
    gadgetReachable: boolean;
    impactReproduced: boolean;
    hardenedBlocked: boolean;
}
export interface Scenario {
    id: string;
    name: string;
    description: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    fixtureId: string;
    sourceId: string;
    property: string;
    gadgetId: string;
    impact: ControlledImpact;
    labTarget: string;
    expected: ScenarioExpected;
    tags: string[];
}
export interface ResearchNote {
    id: string;
    content: string;
    linkedId?: string;
    linkedType?: 'source' | 'gadget' | 'chain' | 'run' | 'evidence';
    timestamp: number;
}
export interface DependencyRecord {
    name: string;
    version: string;
    potentialGadgets: string[];
    potentialSources: string[];
    confirmedInFixture: boolean;
    notes?: string;
}
export interface DependencyAnalysis {
    id: string;
    packages: DependencyRecord[];
    totalPackages: number;
    potentialGadgetPackages: number;
    confirmedFixturePaths: number;
    timestamp: number;
}
export type LabServiceStatus = 'READY' | 'STARTING' | 'STOPPED' | 'ERROR' | 'UNKNOWN';
export interface LabService {
    id: string;
    name: string;
    description: string;
    port: number;
    status: LabServiceStatus;
    healthUrl?: string;
}
export interface LabState {
    status: LabStatus;
    services: LabService[];
    startedAt?: number;
    error?: string;
}
export interface BleedMetrics {
    sources: number;
    gadgets: number;
    reachableChains: number;
    reproducedChains: number;
    hardenedBlocked: number;
    totalRuns: number;
    lastRunAt?: number;
}
export interface ResearchReference {
    id: string;
    title: string;
    library?: string;
    property?: string;
    affectedVersions?: string;
    impactClass?: ControlledImpact;
    source: string;
    cve?: string;
    date?: string;
    summary: string;
    relatedGadgetIds: string[];
    relatedScenarioIds: string[];
    reproduced: boolean;
    notes?: string;
}
//# sourceMappingURL=index.d.ts.map