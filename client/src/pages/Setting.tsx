import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const Setting = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const targetSection = (location.state as any)?.section || queryParams.get('section') || 'profile'
    const scrollTo = (location.state as any)?.scrollTo || queryParams.get('scrollTo') || undefined

    // Redirect to home or previous page and trigger global Settings modal
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/', { replace: true })
    }

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-settings', {
        detail: { section: targetSection, scrollTo }
      }))
    }, 50)
  }, [navigate, location.search, location.state])

  return null
}

export default Setting