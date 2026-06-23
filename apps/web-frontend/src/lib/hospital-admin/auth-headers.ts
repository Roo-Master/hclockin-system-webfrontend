export function getAuthHeaders(): HeadersInit {
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }
  
  return {
    'Content-Type': 'application/json',
  }
}

export function handleAuthError(error: any): Error {
  if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    // Clear token and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return new Error('Session expired. Please login again.')
  }
  
  if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
    return new Error('You don\'t have permission to access this resource.')
  }
  
  return error
}