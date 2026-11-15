import type { RouteObject } from 'react-router'
import { AboutPage } from '@/pages/AboutPage'
import { DestinationPage } from '@/pages/DestinationPage'
import { ExplorePage } from '@/pages/ExplorePage'
import { MachinePage } from '@/pages/MachinePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { StoryPage } from '@/pages/StoryPage'
import { Layout } from './Layout'
import { RouteErrorPage } from './RouteErrorPage'

/** Route table — keep in sync with ARCHITECTURE.md §4 and `paths.ts`. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <ExplorePage /> },
      { path: 'explore/:destinationId', element: <DestinationPage /> },
      { path: 'explore/:destinationId/:machineId', element: <MachinePage /> },
      { path: 'stories/:storyId', element: <StoryPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
