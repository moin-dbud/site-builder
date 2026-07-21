import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Community from './pages/Community'
import Projects from './pages/Projects'
import Preview from './pages/Preview'
import View from './pages/View'
import MyProjects from './pages/MyProjects'
import Navbar from './components/Navbar'

const App = () => {
  const {pathname} = useLocation()

  const hideNavbar = pathname.startsWith('/projects/') && pathname !== '/projects' 
                      || pathname.startsWith('/view/') 
                      || pathname.startsWith('/preview/')   
  return (
    <div>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/pricing' element={<Pricing/>}/>
        <Route path='/projects/:projectId' element={<Projects/>}/>
        <Route path='/projects' element={<MyProjects/>}/>
        <Route path='/preview/:projectId' element={<Preview/>}/>
        <Route path='/preview/:projectId/:versionId' element={<Preview/>}/>
        <Route path='/community' element={<Community/>}/>
        <Route path='/view/:projectId' element={<View/>}/>
      </Routes>
    </div>
  )
}

export default App