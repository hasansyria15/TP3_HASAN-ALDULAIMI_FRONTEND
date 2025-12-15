import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiGet, apiPost, apiPut, apiDelete, getAuthHeaders, handleHttpError } from '@/utils/api'

export const useCartStore = defineStore('cart', () => {
    // État
    const items = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    const API = import.meta.env.VITE_API_URL

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
     * Status attendu: 200 OK
     * Nécessite: Authorization Bearer <token>
     */
    async function fetchCart() {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/panier`, {
                method: 'GET',
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw await handleHttpError(response)
            }

            // 200 OK
            const data = await response.json()
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
     * Status attendu: 201 Created
     * Nécessite: Authorization Bearer <token>
     */
    async function addToCart(livreId, quantite = 1) {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/panier`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ livreId, quantite })
            })

            if (!response.ok) {
                throw await handleHttpError(response)
            }

            // 201 Created
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
     * POST - Mettre à jour la quantité d'un article
     * Status attendu: 200 OK ou 201 Created
     * Nécessite: Authorization Bearer <token>
     */
    async function updateQuantity(livreId, quantite) {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/panier`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ livreId, quantite })
            })

            if (!response.ok) {
                throw await handleHttpError(response)
            }

            // 200 OK ou 201 Created
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
     * Status attendu: 204 No Content ou 200 OK
     * Nécessite: Authorization Bearer <token>
     */
    async function removeItem(livreId) {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/panier/items/${livreId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw await handleHttpError(response)
            }

            // 204 No Content ou 200 OK
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
     * Status attendu: 204 No Content ou 200 OK
     * Nécessite: Authorization Bearer <token>
     */
    async function clearCart() {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/panier`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw await handleHttpError(response)
            }

            // 204 No Content ou 200 OK
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
