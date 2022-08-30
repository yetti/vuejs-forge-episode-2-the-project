import { defineStore, acceptHMRUpdate } from "pinia";
import { watchDebounced } from "@vueuse/core";
export const useCartStore = defineStore("CartStore", () => {
  const deskree = useDeskree();
  const firstLoad = ref(false);
  const loading = ref(false);

  const products = ref([]);
  const taxRate = 0.1;

  const itemCount = computed(() => products.value.length);
  const isEmpty = computed(() => itemCount.value === 0);
  const subtotal = computed(() => {
    return products.value.reduce((p, product) => {
      return product?.fields?.price
        ? product.fields.price * product.count + p
        : p;
    }, 0);
  });
  const taxes = computed(() => taxRate * subtotal.value);
  const total = computed(() => subtotal.value + taxes.value);

  function addProduct(product, count) {
    const existingProduct = products.value.find(
      (p) => p.sys.id === product.sys.id
    );
    if (existingProduct) {
      existingProduct.count += count;
    } else {
      products.value.push({ ...product, count });
    }
  }
  function removeProducts(productIds) {
    const ids = Array.isArray(productIds) ? productIds : [productIds];
    products.value = products.value.filter((p) => !ids.includes(p.sys.id));
  }

  deskree.auth.onAuthStateChange(async (user) => {
    firstLoad.value = true;
    loading.value = true;

    const res = await deskree.user.getCart();
    res.products.forEach((product) => addProduct(product, product.count));

    loading.value = false;
    setTimeout(() => (firstLoad.value = false), 1000);
  });

  watchDebounced(
    products,
    async () => {
      if (firstLoad.value) return;
      if (!deskree.user.get()) return;

      await deskree.user.updateCart(products.value);
    },
    {
      debounce: 500,
      deep: true,
    }
  );

  return {
    products,
    taxRate,
    itemCount,
    isEmpty,
    subtotal,
    taxes,
    total,
    addProduct,
    removeProducts,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
