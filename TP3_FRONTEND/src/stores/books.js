import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBooksStore = defineStore('books', () => {
    // État
    const books = ref([])
    const allBooks = ref([])
    const categories = ref([])
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalBooks = ref(0)
    const limit = ref(4)

    const API = import.meta.env.VITE_API_URL

    /**
     * Charge tous les livres (pour filtrage par catégorie)
     */
    async function fetchAllBooks() {
        try {
            const response = await fetch(`${API}/api/livres?limit=100`)
            if (!response.ok) throw new Error('Erreur lors de la récupération')

            const data = await response.json()
            const livres = data.data || data || []

            allBooks.value = livres
            categories.value = extractCategories(livres)

            return livres
        } catch (error) {
            console.error('Erreur fetchAllBooks:', error)
            throw error
        }
    }

    /**
     * Charge les livres avec pagination
     */
    async function fetchBooks(page = 1, search = '') {
        try {
            let url = `${API}/api/livres?page=${page}&limit=${limit.value}`

            // Si recherche, charger plus de livres
            if (search && search.trim()) {
                url = `${API}/api/livres?limit=100`
            }

            const response = await fetch(url)
            if (!response.ok) throw new Error('Erreur lors de la récupération des livres')

            const data = await response.json()
            let livres = data.data || data || []

            // Filtrer si recherche
            if (search && search.trim()) {
                const searchLower = search.toLowerCase()
                livres = livres.filter(book => {
                    const titre = book.titre?.toLowerCase() || ''
                    const auteurs = Array.isArray(book.auteurs)
                        ? book.auteurs.map(a => typeof a === 'object' ? a.nom : a).join(' ').toLowerCase()
                        : ''
                    return titre.includes(searchLower) || auteurs.includes(searchLower)
                })
                totalPages.value = 1
                totalBooks.value = livres.length
                currentPage.value = 1
            } else {
                // Pagination normale
                if (data.pagination) {
                    totalPages.value = data.pagination.totalPages || Math.ceil(data.pagination.total / limit.value)
                    totalBooks.value = data.pagination.total || 0
                }
                currentPage.value = page
            }

            books.value = livres
        } catch (error) {
            console.error('Erreur fetchBooks:', error)
            throw error
        }
    }

    /**
     * Filtre les livres par catégorie
     */
    function filterByCategory(categoryId) {
        if (!categoryId) {
            books.value = allBooks.value.slice(0, limit.value)
            totalPages.value = Math.ceil(allBooks.value.length / limit.value)
            currentPage.value = 1
        } else {
            const filtered = allBooks.value.filter(book =>
                book.categories?.some(cat => cat._id === categoryId)
            )
            books.value = filtered
            totalPages.value = 1
            currentPage.value = 1
        }
    }

    /**
     * Extrait les catégories uniques des livres
     */
    function extractCategories(livres) {
        const catsMap = new Map()
        livres.forEach(book => {
            book.categories?.forEach(cat => {
                if (cat._id && cat.nom && !catsMap.has(cat._id)) {
                    catsMap.set(cat._id, cat)
                }
            })
        })
        return Array.from(catsMap.values())
    }

    /**
     * Crée un nouveau livre (admin uniquement)
     */
    async function createBook(bookData) {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API}/api/livres`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw errorData
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Erreur createBook:', error)
            throw error
        }
    }

    return {
        books,
        allBooks,
        categories,
        currentPage,
        totalPages,
        totalBooks,
        limit,
        fetchBooks,
        fetchAllBooks,
        filterByCategory,
        createBook
    }
})