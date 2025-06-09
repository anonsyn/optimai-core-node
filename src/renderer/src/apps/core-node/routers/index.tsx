import DashboardLayout from '@core-node/layouts/dashboard-layout'
import GlobalLayout from '@core-node/layouts/global-layout'
import BrowserPage from '@core-node/pages/browser'
import SettingsPage from '@core-node/pages/settings'
import StartUpPage from '@core-node/pages/start-up'
import { Route, HashRouter as Router, Routes } from 'react-router'

const AppRouters = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GlobalLayout />}>
          <Route index element={<StartUpPage />} />

          <Route element={<DashboardLayout />}>
            <Route path="browser" element={<BrowserPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default AppRouters
