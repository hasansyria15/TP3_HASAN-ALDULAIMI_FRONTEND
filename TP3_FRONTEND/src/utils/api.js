/**
 * Utilitaires pour les appels API
 */

const API = import.meta.env.VITE_API_URL

/**
 * Récupère le token depuis localStorage
 */
export function getToken() {
    return localStorage.getItem('token')
}

/**
 * Crée les headers pour les requêtes authentifiées
 */
export function getAuthHeaders() {
    const token = getToken()
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

/**
 * Crée les headers pour les requêtes non authentifiées
 */
export function getHeaders() {
    return {
        'Content-Type': 'application/json'
    }
}

/**
 * Gère les erreurs HTTP et retourne un objet d'erreur formaté
 * @param {Response} response - La réponse fetch
 * @returns {Promise<Error>} - Erreur formatée
 */
export async function handleHttpError(response) {
    let errorMessage = 'Une erreur est survenue'
    let errorDetails = null

    try {
        const errorData = await response.json()

        // Gestion selon le code de statut
        switch (response.status) {
            case 400:
                errorMessage = errorData.message || 'Requête invalide'
                errorDetails = errorData.errors || errorData.details
                break
            case 401:
                errorMessage = 'Non autorisé. Veuillez vous connecter.'
                // Rediriger vers login si nécessaire
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token')
                }
                break
            case 404:
                errorMessage = errorData.message || 'Ressource introuvable'
                break
            case 409:
                errorMessage = errorData.message || 'Conflit avec une ressource existante'
                errorDetails = errorData.errors || errorData.details
                break
            case 422:
                errorMessage = errorData.message || 'Erreur de validation'
                errorDetails = errorData.errors || errorData.details
                break
            case 500:
                errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.'
                break
            default:
                errorMessage = errorData.message || `Erreur ${response.status}`
        }

        const error = new Error(errorMessage)
        error.status = response.status
        error.details = errorDetails
        error.errors = errorData.errors
        return error
    } catch (parseError) {
        // Si on ne peut pas parser la réponse JSON
        const error = new Error(errorMessage)
        error.status = response.status
        return error
    }
}

/**
 * Effectue une requête GET
 * @param {string} endpoint - L'endpoint de l'API
 * @param {boolean} requiresAuth - Si la requête nécessite l'authentification
 */
export async function apiGet(endpoint, requiresAuth = false) {
    try {
        const headers = requiresAuth ? getAuthHeaders() : getHeaders()
        const response = await fetch(`${API}${endpoint}`, {
            method: 'GET',
            headers
        })

        if (!response.ok) {
            throw await handleHttpError(response)
        }

        // Retourner null pour les réponses 204 No Content
        if (response.status === 204) {
            return null
        }

        return await response.json()
    } catch (error) {
        console.error(`API GET ${endpoint}:`, error)
        throw error
    }
}

/**
 * Effectue une requête POST
 * @param {string} endpoint - L'endpoint de l'API
 * @param {object} data - Les données à envoyer
 * @param {boolean} requiresAuth - Si la requête nécessite l'authentification
 */
export async function apiPost(endpoint, data, requiresAuth = false) {
    try {
        const headers = requiresAuth ? getAuthHeaders() : getHeaders()
        const response = await fetch(`${API}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            throw await handleHttpError(response)
        }

        // Retourner null pour les réponses 204 No Content
        if (response.status === 204) {
            return null
        }

        return await response.json()
    } catch (error) {
        console.error(`API POST ${endpoint}:`, error)
        throw error
    }
}

/**
 * Effectue une requête PUT
 * @param {string} endpoint - L'endpoint de l'API
 * @param {object} data - Les données à envoyer
 * @param {boolean} requiresAuth - Si la requête nécessite l'authentification
 */
export async function apiPut(endpoint, data, requiresAuth = false) {
    try {
        const headers = requiresAuth ? getAuthHeaders() : getHeaders()
        const response = await fetch(`${API}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            throw await handleHttpError(response)
        }

        // Retourner null pour les réponses 204 No Content
        if (response.status === 204) {
            return null
        }

        return await response.json()
    } catch (error) {
        console.error(`API PUT ${endpoint}:`, error)
        throw error
    }
}

/**
 * Effectue une requête DELETE
 * @param {string} endpoint - L'endpoint de l'API
 * @param {boolean} requiresAuth - Si la requête nécessite l'authentification
 */
export async function apiDelete(endpoint, requiresAuth = false) {
    try {
        const headers = requiresAuth ? getAuthHeaders() : getHeaders()
        const response = await fetch(`${API}${endpoint}`, {
            method: 'DELETE',
            headers
        })

        if (!response.ok) {
            throw await handleHttpError(response)
        }

        // Retourner null pour les réponses 204 No Content
        if (response.status === 204) {
            return null
        }

        return await response.json()
    } catch (error) {
        console.error(`API DELETE ${endpoint}:`, error)
        throw error
    }
}
