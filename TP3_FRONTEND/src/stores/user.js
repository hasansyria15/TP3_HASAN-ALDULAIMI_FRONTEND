import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
    // État
    const profile = ref(null)
    const isLoading = ref(false)
    const error = ref(null)

    const API = import.meta.env.VITE_API_URL

    /**
     * Récupère le token depuis localStorage
     */
    function getToken() {
        return localStorage.getItem('token')
    }

    /**
     * GET - Récupérer le profil de l'utilisateur connecté
     */
    async function fetchProfile() {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/users/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erreur lors de la récupération du profil')
            }

            const data = await response.json()
            profile.value = data
            return data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * PUT - Modifier le profil de l'utilisateur connecté
     */
    async function updateProfile(userData) {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erreur lors de la modification du profil')
            }

            const data = await response.json()
            profile.value = data
            return data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * DELETE - Supprimer le compte de l'utilisateur connecté
     */
    async function deleteProfile() {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/users/profile`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erreur lors de la suppression du compte')
            }

            profile.value = null
            return true
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    return {
        profile,
        isLoading,
        error,
        fetchProfile,
        updateProfile,
        deleteProfile
    }
})