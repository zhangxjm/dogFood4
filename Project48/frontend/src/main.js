import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import 'vant/lib/index.css'
import { 
  Button, Card, Tab, Tabs, Stepper, Popup, RadioGroup, Radio, 
  Cell, CellGroup, Field, Dialog, Empty, Tag, SubmitBar,
  Toast, Loading, Notify, List
} from 'vant'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Button)
app.use(Card)
app.use(Tab)
app.use(Tabs)
app.use(Stepper)
app.use(Popup)
app.use(RadioGroup)
app.use(Radio)
app.use(Cell)
app.use(CellGroup)
app.use(Field)
app.use(Dialog)
app.use(Empty)
app.use(Tag)
app.use(SubmitBar)
app.use(Toast)
app.use(Loading)
app.use(Notify)
app.use(List)

app.mount('#app')
