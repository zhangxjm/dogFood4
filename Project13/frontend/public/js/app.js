new Vue({
  el: "#app",
  data: {
    activeMenu: "product",
    productList: [],
    categories: [],
    searchForm: {
      name: "",
      categoryId: "",
    },
    productDialogVisible: false,
    productForm: {
      id: null,
      name: "",
      code: "",
      price: 0,
      stock: 0,
      unit: "",
      description: "",
      categoryId: null,
    },
    stockDialogVisible: false,
    currentProduct: null,
    stockQuantity: 0,
    categoryDialogVisible: false,
    categoryForm: {
      id: null,
      name: "",
      description: "",
    },
  },
  created() {
    this.loadCategories();
    this.loadProducts();
  },
  methods: {
    handleMenuSelect(index) {
      this.activeMenu = index;
    },
    loadProducts() {
      productApi
        .list(this.searchForm)
        .then((res) => {
          if (res.code === 200) {
            this.productList = res.data;
          } else {
            this.$message.error(res.message);
          }
        })
        .catch((err) => {
          this.$message.error("加载商品失败: " + err.message);
        });
    },
    searchProducts() {
      this.loadProducts();
    },
    loadCategories() {
      categoryApi
        .list()
        .then((res) => {
          if (res.code === 200) {
            this.categories = res.data;
          } else {
            this.$message.error(res.message);
          }
        })
        .catch((err) => {
          this.$message.error("加载分类失败: " + err.message);
        });
    },
    openProductDialog(product) {
      if (product) {
        this.productForm = {
          id: product.id,
          name: product.name,
          code: product.code || "",
          price: product.price || 0,
          stock: product.stock || 0,
          unit: product.unit || "",
          description: product.description || "",
          categoryId: product.category ? product.category.id : null,
        };
      } else {
        this.productForm = {
          id: null,
          name: "",
          code: "",
          price: 0,
          stock: 0,
          unit: "",
          description: "",
          categoryId: null,
        };
      }
      this.productDialogVisible = true;
    },
    saveProduct() {
      if (!this.productForm.name) {
        this.$message.error("请输入商品名称");
        return;
      }
      const promise = this.productForm.id
        ? productApi.update(this.productForm.id, this.productForm)
        : productApi.save(this.productForm);

      promise
        .then((res) => {
          if (res.code === 200) {
            this.$message.success("保存成功");
            this.productDialogVisible = false;
            this.loadProducts();
          } else {
            this.$message.error(res.message);
          }
        })
        .catch((err) => {
          this.$message.error("保存失败: " + err.message);
        });
    },
    deleteProduct(product) {
      this.$confirm("确定要删除商品【" + product.name + "】吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          productApi
            .delete(product.id)
            .then((res) => {
              if (res.code === 200) {
                this.$message.success("删除成功");
                this.loadProducts();
              } else {
                this.$message.error(res.message);
              }
            })
            .catch((err) => {
              this.$message.error("删除失败: " + err.message);
            });
        })
        .catch(() => {});
    },
    openStockDialog(product) {
      this.currentProduct = product;
      this.stockQuantity = 0;
      this.stockDialogVisible = true;
    },
    saveStock() {
      if (this.stockQuantity === 0) {
        this.$message.error("请输入调整数量");
        return;
      }
      productApi
        .updateStock({
          productId: this.currentProduct.id,
          quantity: this.stockQuantity,
        })
        .then((res) => {
          if (res.code === 200) {
            this.$message.success("库存调整成功");
            this.stockDialogVisible = false;
            this.loadProducts();
          } else {
            this.$message.error(res.message);
          }
        })
        .catch((err) => {
          this.$message.error("库存调整失败: " + err.message);
        });
    },
    openCategoryDialog(category) {
      if (category) {
        this.categoryForm = {
          id: category.id,
          name: category.name,
          description: category.description || "",
        };
      } else {
        this.categoryForm = {
          id: null,
          name: "",
          description: "",
        };
      }
      this.categoryDialogVisible = true;
    },
    saveCategory() {
      if (!this.categoryForm.name) {
        this.$message.error("请输入分类名称");
        return;
      }
      const promise = this.categoryForm.id
        ? categoryApi.update(this.categoryForm.id, this.categoryForm)
        : categoryApi.save(this.categoryForm);

      promise
        .then((res) => {
          if (res.code === 200) {
            this.$message.success("保存成功");
            this.categoryDialogVisible = false;
            this.loadCategories();
          } else {
            this.$message.error(res.message);
          }
        })
        .catch((err) => {
          this.$message.error("保存失败: " + err.message);
        });
    },
    deleteCategory(category) {
      this.$confirm("确定要删除分类【" + category.name + "】吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          categoryApi
            .delete(category.id)
            .then((res) => {
              if (res.code === 200) {
                this.$message.success("删除成功");
                this.loadCategories();
              } else {
                this.$message.error(res.message);
              }
            })
            .catch((err) => {
              this.$message.error("删除失败: " + err.message);
            });
        })
        .catch(() => {});
    },
  },
});
