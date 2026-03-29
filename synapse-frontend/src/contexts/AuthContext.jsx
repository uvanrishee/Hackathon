import { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const AuthContext = createContext(null)

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [userProfile, setUserProfile]   = useState(null) // {id, name, email, role, xp, streak}
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  const fetchProfile = async (fbUser) => {
    try {
      const token = await fbUser.getIdToken()
      const res = await fetch(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUserProfile(data)
        return data
      } else {
        setUserProfile(null)
      }
    } catch {
      setUserProfile(null)
    }
    return null
  }

  /* ── Listen to Firebase auth state ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
         await fetchProfile(fbUser)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  /* ── Helpers ── */
  const getToken = () => firebaseUser?.getIdToken(true)
  const refreshProfile = () => firebaseUser ? fetchProfile(firebaseUser) : null

  async function register(email, password, name, role) {
    setError(null)
    const cred  = await createUserWithEmailAndPassword(auth, email, password)
    const token = await cred.user.getIdToken()
    await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, email, role, firebase_uid: cred.user.uid }),
    })
    
    // Now backend has the user, explicitly fetch the profile
    const profile = await fetchProfile(cred.user)
    return profile
  }

  async function login(email, password) {
    setError(null)
    await signInWithEmailAndPassword(auth, email, password)
    // profile fetched by onAuthStateChanged
  }

  async function loginWithGoogle(role) {
    setError(null)
    const cred  = await signInWithPopup(auth, googleProvider)
    const token = await cred.user.getIdToken()
    await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: cred.user.displayName || 'User',
        email: cred.user.email,
        role,
        firebase_uid: cred.user.uid,
      }),
    })
    
    const profile = await fetchProfile(cred.user)
    return profile
  }

  async function logout() {
    await signOut(auth)
    setUserProfile(null)
  }

  return (
    <AuthContext.Provider value={{
      firebaseUser, userProfile, loading, error,
      register, login, loginWithGoogle, logout, getToken, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
