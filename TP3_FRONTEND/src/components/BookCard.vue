<template>
  <div class="book-card">
    <!-- Image de couverture -->
    <div class="book-cover">
      <img
        v-if="couverture"
        :src="couverture"
        :alt="titre"
        @error="handleImageError"
      />
      <div v-else class="no-cover">
        <i class="bi bi-book"></i>
      </div>
      <!-- Badge stock -->
      <span
        class="stock-badge"
        :class="{ 'out-of-stock': quantite === 0, 'low-stock': quantite > 0 && quantite <= 5 }"
      >
        <template v-if="quantite === 0">Rupture</template>
        <template v-else-if="quantite <= 5">{{ quantite }} restant{{ quantite > 1 ? 's' : '' }}</template>
        <template v-else>En stock</template>
      </span>
    </div>

    <!-- Infos du livre -->
    <div class="book-info">
      <h3 class="book-title" :title="titre">{{ titre }}</h3>
      <p class="book-authors">{{ formatAuthors }}</p>
      <div v-if="formatCategories" class="book-categories">
        <span v-for="cat in categoriesList" :key="cat" class="category-tag">{{ cat }}</span>
      </div>
      <div class="book-footer">
        <span class="book-price">{{ formatPrice }} $</span>

        <!-- Contrôle de quantité (après ajout) -->
        <div v-if="cartQuantity > 0" class="quantity-control">
          <button
            class="qty-btn"
            @click="decreaseQuantity"
            :disabled="isUpdating"
          >
            <i class="bi bi-dash"></i>
          </button>
          <span class="qty-value">{{ cartQuantity }}</span>
          <button
            class="qty-btn"
            @click="increaseQuantity"
            :disabled="isUpdating || cartQuantity >= quantite"
          >
            <i class="bi bi-plus"></i>
          </button>
        </div>

        <!-- Bouton ajouter (si pas encore dans le panier) -->
        <button
          v-else
          class="btn-add-cart"
          :class="{ 'added': isAdded, 'adding': isAdding }"
          :disabled="quantite === 0 || isAdding"
          @click="handleAddToCart"
        >
          <i v-if="isAdded" class="bi bi-check-lg"></i>
          <i v-else-if="isAdding" class="bi bi-arrow-repeat spin"></i>
          <i v-else class="bi bi-cart-plus"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  bookId: {
    type: [Number, String],
    required: true
  },
  titre: {
    type: String,
    required: true
  },
  auteurs: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  couverture: {
    type: String,
    default: ''
  },
  prix: {
    type: Number,
    required: true
  },
  quantite: {
    type: Number,
    default: 0
  },
  cartQuantity: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['add-to-cart', 'update-quantity'])

// Stores
const cartStore = useCartStore()
const authStore = useAuthStore()

// État pour l'animation
const isAdding = ref(false)
const isAdded = ref(false)
const isUpdating = ref(false)

/**
 * Gère le clic sur le bouton panier avec animation
 */
function handleAddToCart() {
  isAdding.value = true

  // Émettre l'événement
  emit('add-to-cart', props.bookId)

  // Animation
  setTimeout(() => {
    isAdding.value = false
    isAdded.value = true

    // Revenir à l'état normal après 1.5s
    setTimeout(() => {
      isAdded.value = false
    }, 1500)
  }, 500)
}

/**
 * Augmente la quantité dans le panier
 */
async function increaseQuantity() {
  if (isUpdating.value) return
  isUpdating.value = true

  const newQty = props.cartQuantity + 1
  emit('update-quantity', { bookId: props.bookId, quantity: newQty })

  setTimeout(() => {
    isUpdating.value = false
  }, 300)
}

/**
 * Diminue la quantité dans le panier
 */
async function decreaseQuantity() {
  if (isUpdating.value) return
  isUpdating.value = true

  const newQty = props.cartQuantity - 1
  emit('update-quantity', { bookId: props.bookId, quantity: newQty })

  setTimeout(() => {
    isUpdating.value = false
  }, 300)
}

// Formate les auteurs (peut être array d'objets avec .nom ou array de strings/IDs)
const formatAuthors = computed(() => {
  if (!props.auteurs || props.auteurs.length === 0) {
    return 'Auteur inconnu'
  }
  return props.auteurs
    .map(a => (typeof a === 'object' && a !== null) ? a.nom : a)
    .filter(Boolean)
    .join(', ') || 'Auteur inconnu'
})

// Formate les catégories
const formatCategories = computed(() => {
  if (!props.categories || props.categories.length === 0) {
    return ''
  }
  return props.categories
    .map(c => (typeof c === 'object' && c !== null) ? c.nom : c)
    .filter(Boolean)
    .join(', ')
})

// Liste des catégories pour les tags
const categoriesList = computed(() => {
  if (!props.categories || props.categories.length === 0) {
    return []
  }
  return props.categories
    .map(c => (typeof c === 'object' && c !== null) ? c.nom : c)
    .filter(Boolean)
})

const formatPrice = computed(() => {
  if (props.prix == null) return '0.00'
  return Number(props.prix).toFixed(2)
})

function handleImageError(e) {
  e.target.style.display = 'none'
  e.target.parentElement.innerHTML = '<div class="no-cover"><i class="bi bi-book"></i></div>'
}
</script>

<style scoped>
.book-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);

}

/* Couverture */
.book-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-card:hover .book-cover img {
  transform: scale(1.05);
}

.no-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
}

.no-cover i {
  font-size: 3.5rem;
  color: #bbb;
}

/* Badge stock */
.stock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #000;
  color: #fff;
}

.stock-badge.low-stock {
  background: #f59e0b;
  color: #000;
}

.stock-badge.out-of-stock {
  background: #dc2626;
  color: #fff;
}

/* Infos */
.book-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.book-title {
  font-size: 1rem;
  font-weight: 600;
  color: #000;
  margin: 0 0 6px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-authors {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: auto;
}

.category-tag {
  font-size: 0.7rem;
  padding: 3px 8px;
  background: #f0f0f0;
  color: #555;
  border-radius: 12px;
  font-weight: 500;
  border: 1px solid #e0e0e0;
}

.book-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.book-price {
  font-size: 1.15rem;
  font-weight: 700;
  color: #000;
}

/* Bouton ajouter au panier */
.btn-add-cart {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #000;
  background: #fff;
  color: #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-add-cart:hover:not(:disabled) {
  background: #000;
  color: #fff;
  transform: scale(1.1);
}

.btn-add-cart:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}

/* Animation ajout */
.btn-add-cart.adding {
  background: #000;
  color: #fff;
  pointer-events: none;
}

.btn-add-cart.added {
  background: #2e7d32;
  border-color: #2e7d32;
  color: #fff;
  animation: pop 0.3s ease;
}

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.spin {
  animation: spin 0.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-add-cart i {
  font-size: 1.1rem;
}

/* Responsive pour 4 cartes par ligne */
@media (max-width: 1200px) {
  .book-title {
    font-size: 0.95rem;
  }
  .book-price {
    font-size: 1.05rem;
  }
}

@media (max-width: 768px) {
  .book-info {
    padding: 12px;
  }
  .book-title {
    font-size: 0.9rem;
  }
  .no-cover i {
    font-size: 2.5rem;
  }
}

/* Contrôle de quantité */
.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f8f8;
  border-radius: 20px;
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #000;
  background: #fff;
  color: #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

.qty-btn:hover:not(:disabled) {
  background: #000;
  color: #fff;
  transform: scale(1.1);
}

.qty-btn:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
  opacity: 0.5;
}

.qty-btn i {
  font-size: 0.9rem;
}

.qty-value {
  font-weight: 600;
  font-size: 0.95rem;
  min-width: 24px;
  text-align: center;
  color: #000;
}
</style>