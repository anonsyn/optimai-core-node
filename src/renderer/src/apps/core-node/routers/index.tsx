import DashboardLayout from '@core-node/layouts/dashboard-layout'
import GlobalLayout from '@core-node/layouts/global-layout'
import DataMiningPage from '@core-node/pages/data-mining'
import StartUpPage from '@core-node/pages/start-up'
import { Route, HashRouter as Router, Routes } from 'react-router'

const AppRouters = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GlobalLayout />}>
          <Route index element={<StartUpPage />} />

          <Route element={<DashboardLayout />}>
            <Route path="data-mining" element={<DataMiningPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default AppRouters
