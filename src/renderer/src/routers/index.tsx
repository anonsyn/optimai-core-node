import GlobalLayout from '@/layout/global-layout'
import MainLayout from '@/layout/main-layout'
import ProtectedLayout from '@/layout/protected-layout'
import DataOperatorPage from '@/pages/data-operator'
import DataScrappingPage from '@/pages/data-scrapping'
import HomePage from '@/pages/home'
import LoginPage from '@/pages/login'
import MissionsAndRewardsPage from '@/pages/missions-and-rewards'
import NodeOperatorPage from '@/pages/node-operator'
import NodeUptimePage from '@/pages/node-uptime'
import ProfilePage from '@/pages/profile'
import ReferralsPage from '@/pages/referrals'
import StartUpPage from '@/pages/start-up'
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
