import { useCallback, useState } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  type NodeTypes, Handle, Position,
  type Node, type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { Chain, ChainNode, ChainEdge } from '@bleed/shared'

const nodeColors: Record<string, { bg: string; border: string; text: string }> = {
  INPUT: { bg: '#1E1E1E', border: '#E6DED1', text: '#F5F0E7' },
  PARSER: { bg: '#1E1E1E', border: '#D6A944', text: '#D6A944' },
  MERGE: { bg: '#1E1E1E', border: '#D6A944', text: '#D6A944' },
  PROTOTYPE: { bg: '#2a0f0c', border: '#E45D4B', text: '#E45D4B' },
  OBJECT: { bg: '#1E1E1E', border: '#9082B0', text: '#9082B0' },
  LIBRARY: { bg: '#1E1E1E', border: '#9082B0', text: '#9082B0' },
  GADGET: { bg: '#1a0e0e', border: '#E45D4B', text: '#E45D4B' },
  TARGET: { bg: '#1a0e0e', border: '#E45D4B', text: '#E45D4B' },
  IMPACT: { bg: '#200a0a', border: '#E45D4B', text: '#E45D4B' },
}

function ChainNodeComponent({ data }: { data: ChainNode }) {
  const c = nodeColors[data.type] ?? nodeColors['OBJECT']!
  return (
    <div
      style={{
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: 12,
        padding: '8px 14px',
        minWidth: 130,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: c.border }} />
      <div style={{ fontSize: 9, fontFamily: 'IBM Plex Mono', color: c.border, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
        {data.type}
      </div>
      <div style={{ fontSize: 12, fontFamily: 'IBM Plex Mono', color: c.text, fontWeight: 500 }}>
        {data.label}
      </div>
      {data.property && (
        <div style={{ fontSize: 10, fontFamily: 'IBM Plex Mono', color: '#E45D4B', marginTop: 2 }}>
          .{data.property}
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: c.border }} />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  chainNode: ChainNodeComponent,
}

function chainToFlow(chain: Chain): { nodes: Node[]; edges: Edge[] } {
  const COLS = 3
  const nodes: Node[] = chain.nodes.map((n: ChainNode, i: number) => ({
    id: n.id,
    type: 'chainNode',
    data: n as unknown as Record<string, unknown>,
    position: {
      x: (i % COLS) * 220,
      y: Math.floor(i / COLS) * 120,
    },
  }))

  const edges: Edge[] = chain.edges.map((e: ChainEdge, i: number) => ({
    id: `edge-${i}`,
    source: e.from,
    target: e.to,
    label: e.type,
    style: { stroke: '#2A2A2A' },
    labelStyle: { fill: '#6b6b6b', fontSize: 9, fontFamily: 'IBM Plex Mono' },
    animated: e.type === 'INHERITS',
  }))

  return { nodes, edges }
}

interface PrototypeChainGraphProps {
  chain: Chain
}

export default function PrototypeChainGraph({ chain }: PrototypeChainGraphProps) {
  const { nodes: initNodes, edges: initEdges } = chainToFlow(chain)
  const [nodes, , onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)

  const onConnect = useCallback(
    (params: Parameters<typeof addEdge>[0]) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div style={{ height: 480, background: '#1E1E1E', borderRadius: 16, border: '1px solid #2A2A2A', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        colorMode="dark"
      >
        <Background color="#2A2A2A" gap={24} />
        <Controls style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }} />
        <MiniMap
          style={{ background: '#171717', border: '1px solid #2A2A2A' }}
          nodeColor={(n) => nodeColors[(n.data as unknown as ChainNode).type]?.border ?? '#2A2A2A'}
        />
      </ReactFlow>
    </div>
  )
}
