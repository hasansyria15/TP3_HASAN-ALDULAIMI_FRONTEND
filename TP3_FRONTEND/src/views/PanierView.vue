<template>
  <div class="panier-page">
    <div class="container">
      <!-- Header -->
      <div class="panier-header">
        <h1><i class="bi bi-cart3 me-3"></i>Mon Panier</h1>
        <p v-if="cartStore.itemCount > 0">{{ cartStore.itemCount }} article(s)</p>
        <p v-else>Votre panier est vide</p>
      </div>

      <!-- Message d'erreur -->
      <div v-if="errorMessage" class="error-alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ errorMessage }}
        <button @click="errorMessage = ''" class="close-error">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement du panier...</p>
      </div>

      <!-- Panier vide -->
      <div v-else-if="cartStore.items.length === 0" class="empty-cart">
        <i class="bi bi-cart-x"></i>
        <h3>Votre panier est vide</h3>
        <p>Découvrez notre catalogue et ajoutez des livres à votre panier.</p>
        <RouterLink to="/" class="btn-shop">
          <i class="bi bi-book me-2"></i>Parcourir les livres
        </RouterLink>
      </div>

      <!-- Contenu du panier -->
      <div v-else class="panier-content">
        <!-- Liste des articles -->
        <div class="cart-items">
          <CartItemRow
            v-for="item in cartStore.items"
            :key="item.livre?._id || item.livreId"
            :item="item"
            @update-quantity="handleUpdateQuantity"
            @remove="handleRemoveItem"
          />
        </div>

        <!-- Résumé et actions -->
        <div class="cart-summary">
          <div class="summary-card">
            <h3>Résumé de la commande</h3>

            <div class="summary-row">
              <span>Sous-total ({{ cartStore.itemCount }} articles)</span>
              <span>{{ formatPrice(cartStore.total) }}</span>
            </div>

            <div class="summary-row">
              <span>Livraison</span>
              <span class="text-success">Gratuite</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row total">
              <span>Total</span>
              <span>{{ formatPrice(cartStore.total) }}</span>
            </div>

            <button class="btn-checkout" disabled>
              <i class="bi bi-credit-card me-2"></i>Passer la commande
            </button>

            <button
              class="btn-clear"
              @click="showClearModal = true"
              :disabled="isLoading"
            >
              <i class="bi bi-trash me-2"></i>Vider le panier
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation pour vider le panier -->
    <div v-if="showClearModal" class="modal-overlay" @click.self="showClearModal = false">
      <div class="modal-content">
        <div class="modal-icon">
          <i class="bi bi-cart-x"></i>
        </div>
        <h3>Vider le panier ?</h3>
        <p>Tous les articles seront retirés et les stocks seront restitués.</p>
        <div class="modal-actions">
          <button @click="showClearModal = false" class="btn-cancel">Annuler</button>
          <button @click="handleClearCart" class="btn-confirm" :disabled="isClearing">
            <span v-if="isClearing">Vidage...</span>
            <span v-else>Vider</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import CartItemRow from '@/components/CartItemRow.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')
const showClearModal = ref(false)
const isClearing = ref(false)

/**
 * Charger le panier
 */
async function loadCart() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await cartStore.fetchCart()
  } catch (err) {
    errorMessage.value = err.message || 'Impossible de charger le panier'
  } finally {
    isLoading.value = false
  }
}

/**
 * Mettre à jour la quantité
 */
async function handleUpdateQuantity(livreId, newQuantity) {
  errorMessage.value = ''
  try {
    await cartStore.updateQuantity(livreId, newQuantity)
  } catch (err) {
    errorMessage.value = err.message || 'Erreur lors de la mise à jour'
  }
}

/**
 * Retirer un article
 */
async function handleRemoveItem(livreId) {
  errorMessage.value = ''
  try {
    await cartStore.removeItem(livreId)
  } catch (err) {
    errorMessage.value = err.message || 'Erreur lors de la suppression'
  }
}

/**
 * Vider le panier
 */
async function handleClearCart() {
  isClearing.value = true
  errorMessage.value = ''
  try {
    await cartStore.clearCart()
    showClearModal.value = false
  } catch (err) {
    errorMessage.value = err.message || 'Erreur lors du vidage'
  } finally {
    isClearing.value = false
  }
}

/**
 * Formater le prix
 */
function formatPrice(price) {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(price || 0)
}

onMounted(() => {
  // Vérifier si l'utilisateur est connecté
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  loadCart()
})
</script>

<style scoped>
.panier-page {
  min-height: calc(100vh - 80px);
  background: #fafafa;
  padding: 40px 20px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

/* Header */
.panier-header {
  text-align: center;
  margin-bottom: 30px;
}

.panier-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 8px;
}

.panier-header p {
  color: #666;
}

/* Error Alert */
.error-alert {
  background: #ffebee;
  color: #c62828;
  padding: 12px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.close-error {
  margin-left: auto;
  background: none;
  border: none;
  color: #c62828;
  cursor: pointer;
  font-size: 1.2rem;
}

/* Loading */
.loading-container {
  text-align: center;
  padding: 60px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty Cart */
.empty-cart {
  background: #fff;
  border-radius: 16px;
  padding: 60px 30px;
  text-align: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.empty-cart > i {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 20px;
}

.empty-cart h3 {
  font-size: 1.4rem;
  color: #111;
  margin-bottom: 12px;
}

.empty-cart p {
  color: #666;
  margin-bottom: 24px;
}

.btn-shop {
  display: inline-block;
  padding: 12px 28px;
  background: #111;
  color: #fff;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-shop:hover {
  background: #333;
  color: #fff;
}

/* Panier Content */
.panier-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
  align-items: start;
}

/* Cart Items */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Summary */
.summary-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 100px;
}

.summary-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.95rem;
  color: #555;
}

.summary-row.total {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 20px;
}

.text-success {
  color: #2e7d32;
}

.summary-divider {
  height: 1px;
  background: #eee;
  margin: 16px 0;
}

.btn-checkout {
  width: 100%;
  padding: 14px;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.btn-checkout:hover:not(:disabled) {
  background: #333;
}

.btn-checkout:disabled {
  background: #888;
  cursor: not-allowed;
}

.btn-clear {
  width: 100%;
  padding: 12px;
  background: #fff;
  color: #c62828;
  border: 2px solid #ffcdd2;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover:not(:disabled) {
  background: #ffebee;
  border-color: #c62828;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.modal-icon {
  width: 60px;
  height: 60px;
  background: #ffebee;
  color: #c62828;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 20px;
}

.modal-content h3 {
  font-size: 1.3rem;
  color: #111;
  margin-bottom: 12px;
}

.modal-content p {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  flex: 1;
  padding: 12px 20px;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-confirm {
  flex: 1;
  padding: 12px 20px;
  background: #c62828;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background: #b71c1c;
}

/* Responsive */
@media (max-width: 900px) {
  .panier-content {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 576px) {
  .panier-header h1 {
    font-size: 1.5rem;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>

