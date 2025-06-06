import GlobalLayout from '@lite-node/layout/global-layout'
import MainLayout from '@lite-node/layout/main-layout'
import ProtectedLayout from '@lite-node/layout/protected-layout'
import DataOperatorPage from '@lite-node/pages/data-operator'
import DataScrappingPage from '@lite-node/pages/data-scrapping'
import HomePage from '@lite-node/pages/home'
import LoginPage from '@lite-node/pages/login'
import MissionsAndRewardsPage from '@lite-node/pages/missions-and-rewards'
import NodeOperatorPage from '@lite-node/pages/node-operator'
import NodeUptimePage from '@lite-node/pages/node-uptime'
import ProfilePage from '@lite-node/pages/profile'
import ReferralsPage from '@lite-node/pages/referrals'
import StartUpPage from '@lite-node/pages/start-up'
import { Route, HashRouter as Router, Routes } from 'react-router'

const AppRouters = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GlobalLayout />}>
          <Route index element={<StartUpPage />} />

          <Route path="login" element={<LoginPage />} />

          <Route element={<ProtectedLayout />}>
            <Route element={<MainLayout />}>
              <Route path="home" element={<HomePage />} />
              <Route path="missions-rewards" element={<MissionsAndRewardsPage />} />
              <Route path="node-operator" element={<NodeOperatorPage />} />
              <Route path="node-uptime" element={<NodeUptimePage />} />
              <Route path="data-operator" element={<DataOperatorPage />} />
              <Route path="data-scrapping" element={<DataScrappingPage />} />
              <Route path="ref" element={<ReferralsPage />} />
            </Route>
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default AppRouters
