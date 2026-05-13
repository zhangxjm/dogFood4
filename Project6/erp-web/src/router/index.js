import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '工作台', icon: 'HomeFilled' }
      },
      {
        path: 'product',
        name: 'Product',
        component: () => import('@/views/product/Product.vue'),
        meta: { title: '商品管理', icon: 'Goods' }
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/product/Category.vue'),
        meta: { title: '分类管理', icon: 'Menu' }
      },
      {
        path: 'purchase',
        name: 'Purchase',
        component: () => import('@/views/purchase/Purchase.vue'),
        meta: { title: '采购管理', icon: 'ShoppingCart' }
      },
      {
        path: 'supplier',
        name: 'Supplier',
        component: () => import('@/views/purchase/Supplier.vue'),
        meta: { title: '供应商管理', icon: 'OfficeBuilding' }
      },
      {
        path: 'sales',
        name: 'Sales',
        component: () => import('@/views/sales/Sales.vue'),
        meta: { title: '销售管理', icon: 'Sell' }
      },
      {
        path: 'customer',
        name: 'Customer',
        component: () => import('@/views/sales/Customer.vue'),
        meta: { title: '客户管理', icon: 'User' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/inventory/Inventory.vue'),
        meta: { title: '库存管理', icon: 'Box' }
      },
      {
        path: 'warehouse',
        name: 'Warehouse',
        component: () => import('@/views/inventory/Warehouse.vue'),
        meta: { title: '仓库管理', icon: 'Warehouse' }
      },
      {
        path: 'alert',
        name: 'InventoryAlert',
        component: () => import('@/views/inventory/Alert.vue'),
        meta: { title: '库存预警', icon: 'Warning' }
      },
      {
        path: 'finance',
        name: 'Finance',
        component: () => import('@/views/finance/Finance.vue'),
        meta: { title: '财务管理', icon: 'Wallet' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router