import { createBrowserRouter } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Lab from './pages/Lab'
import Sources from './pages/Sources'
import SourceDetail from './pages/SourceDetail'
import Gadgets from './pages/Gadgets'
import GadgetDetail from './pages/GadgetDetail'
import Chains from './pages/Chains'
import ChainDetail from './pages/ChainDetail'
import ChainBuilderPage from './pages/ChainBuilder'
import Visualizer from './pages/Visualizer'
import Runs from './pages/Runs'
import RunDetail from './pages/RunDetail'
import Evidence from './pages/Evidence'
import ObjectInspectorPage from './pages/ObjectInspector'
import Methodology from './pages/Methodology'
import Research from './pages/Research'
import Settings from './pages/Settings'
import Notebook from './pages/Notebook'
import DependencyScanner from './pages/DependencyScanner'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'lab', element: <Lab /> },
      { path: 'sources', element: <Sources /> },
      { path: 'sources/:id', element: <SourceDetail /> },
      { path: 'gadgets', element: <Gadgets /> },
      { path: 'gadgets/:id', element: <GadgetDetail /> },
      { path: 'scanner', element: <DependencyScanner /> },
      { path: 'chains', element: <Chains /> },
      { path: 'chains/new', element: <ChainBuilderPage /> },
      { path: 'chains/:id', element: <ChainDetail /> },
      { path: 'visualizer', element: <Visualizer /> },
      { path: 'runs', element: <Runs /> },
      { path: 'runs/:id', element: <RunDetail /> },
      { path: 'evidence', element: <Evidence /> },
      { path: 'notebook', element: <Notebook /> },
      { path: 'inspector', element: <ObjectInspectorPage /> },
      { path: 'methodology', element: <Methodology /> },
      { path: 'research', element: <Research /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
])
