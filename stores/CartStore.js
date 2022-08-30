import { defineStore, acceptHMRUpdate } from "pinia";
export const useCartStore = defineStore("CartStore", () => {
  const products = ref([]);
  const taxRate = 0.1;

  const itemCount = computed(() => products.value.length);
  const subtotal = computed(() => {
    return products.value.reduce((p, product) => {
      return product?.fields?.price
        ? product.fields.price * product.count + p
        : p;
    }, 0);
  });
  const taxes = computed(() => {
    taxRate * subtotal.value;
  });
  const total = computed(() => {
    subtotal.value + taxes.value;
  });

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

  return {
    products,
    taxRate,
    itemCount,
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
