import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
    // État
    const items = ref([])
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
     * Headers avec authentification
     */
    function getHeaders() {
        return {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        }
    }

    /**
     * Total général du panier
     */
    const total = computed(() => {
        return items.value.reduce((sum, item) => {
            return sum + (item.prix * item.quantite)
        }, 0)
    })

    /**
     * Nombre d'articles dans le panier
     */
    const itemCount = computed(() => {
        return items.value.reduce((sum, item) => sum + item.quantite, 0)
    })

    /**
     * GET - Récupérer le panier
     */
    async function fetchCart() {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/panier`, {
                method: 'GET',
                headers: getHeaders()
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erreur lors de la récupération du panier')
            }

            const data = await response.json()
            // Adapter selon la structure de la réponse API
            items.value = data.items || data || []
            return data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * POST - Ajouter un article au panier
     */
    async function addToCart(livreId, quantite = 1) {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/panier`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ livreId, quantite })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erreur lors de l\'ajout au panier')
            }

            const data = await response.json()
            // Recharger le panier après ajout
            await fetchCart()
            return data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * POST - Mettre à jour la quantité d'un article
     */
    async function updateQuantity(livreId, quantite) {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/panier`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ livreId, quantite })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Stock insuffisant')
            }

            const data = await response.json()
            await fetchCart()
            return data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * DELETE - Retirer un article du panier
     */
    async function removeItem(livreId) {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/panier/items/${livreId}`, {
                method: 'DELETE',
                headers: getHeaders()
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erreur lors de la suppression')
            }

            await fetchCart()
            return true
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * DELETE - Vider le panier entièrement
     */
    async function clearCart() {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/panier`, {
                method: 'DELETE',
                headers: getHeaders()
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erreur lors du vidage du panier')
            }

            items.value = []
            return true
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Effacer l'erreur
     */
    function clearError() {
        error.value = null
    }

    return {
        items,
        isLoading,
        error,
        total,
        itemCount,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        clearError
    }
})
