import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

import 'vant/lib/index.css'
import { Button, Cell, CellGroup, Field, Form, Popup, Picker, 
         Tab, Tabs, Tabbar, TabbarItem, List, PullRefresh, 
         Search, Dialog, Toast, Card, Tag, Grid, GridItem,
         Stepper, RadioGroup, Radio, Calendar, Area } from 'vant'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(Field)
app.use(Form)
app.use(Popup)
app.use(Picker)
app.use(Tab)
app.use(Tabs)
app.use(Tabbar)
app.use(TabbarItem)
app.use(List)
app.use(PullRefresh)
app.use(Search)
app.use(Dialog)
app.use(Toast)
app.use(Card)
app.use(Tag)
app.use(Grid)
app.use(GridItem)
app.use(Stepper)
app.use(RadioGroup)
app.use(Radio)
app.use(Calendar)
app.use(Area)

app.mount('#app')
