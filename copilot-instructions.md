# copilot-instructions.md
# Vibe Coding Guide: I have It App (Too Good To Go Clone)

> Този файл описва подробно как работи платформата Too Good To Go и служи като пълно напътствие за изграждане на нашето приложение I have It.

---

## 1. Какво е това приложение?

Приложението е **дигитален маркетплейс за излишна храна**. То свързва:

- **Бизнеси** (ресторанти, пекарни, супермаркети, хотели, кафета), които имат непродадена храна в края на деня
- **Потребители**, които искат да купят качествена храна на много ниска цена (обикновено 1/3 от реалната стойност)

Основната цел е **намаляване на хранителните отпадъци**. Бизнесите листват "изненадващи торбички" (Surprise Bags / Magic Bags) с непредвидимо съдържание — каквото е останало. Потребителят купува торбичката без да знае точно какво е вътре, взима я лично от магазина в определен времеви прозорец.

---

## 2. Основни участници (Actors)

### 2.1 Потребител (Consumer / User)
- Регистрира се в приложението
- Разглежда налични торбички наблизо (по локация)
- Купува и плаща онлайн през апп-а
- Отива физически до магазина в определеното време
- Потвърждава вземането чрез QR код / swipe в апп-а
- Оценява изживяването след pickup

### 2.2 Бизнес партньор (Business Partner / Store)
- Регистрира бизнеса си в платформата
- Листва "Surprise Bags" — задава: брой торбички, цена, времеви прозорец за вземане
- Управлява наличността в реално време
- Получава плащанията (минус комисионна)
- Може да отмени резервация до 1 час преди pickup-а
- Вижда статистики: продадени торбички, приходи, спасена храна

### 2.3 Администратор на платформата
- Одобрява нови бизнеси
- Управлява потребители и съдържание
- Вижда глобални метрики и репортинг
- Управлява комисионни и плащания

---

## 3. Основен потребителски поток (User Flow)

```
[Регистрация / Вход]
       ↓
[Разрешаване на локация]
       ↓
[Discover / Browse екран]
 - Списък с налични торбички наблизо
 - Карта с пинове
 - Филтри: разстояние, цена, рейтинг, тип храна
       ↓
[Детайли на торбичката]
 - Снимка на магазина
 - Описание ("Bakery surplus", "Vegetarian meals"...)
 - Цена
 - Времеви прозорец за вземане (напр. 18:00 – 19:00)
 - Рейтинг и отзиви
       ↓
[Купуване & Плащане]
 - Онлайн плащане (карта / Apple Pay / Google Pay)
 - Потвърждение по имейл
       ↓
[Активна поръчка]
 - Countdown таймер до началото на pickup прозореца
 - QR код за вземане
 - Бутон "Вземи" се активира само в рамките на pickup прозореца
       ↓
[Pickup — физическо вземане]
 - Потребителят отива до магазина
 - Swipe / сканиране на QR код → потвърждава вземането
       ↓
[Оценка]
 - Rating на изживяването (1-5 звезди)
 - Опционален коментар
       ↓
[История на поръчките]
```

---

## 4. Бизнес поток (Business Flow)

```
[Регистрация на бизнеса]
 - Име, адрес, тип кухня/магазин
 - Снимки, описание
 - Банкова информация за плащания
 - Плащане на годишен абонамент (напр. ~89 USD/год)
       ↓
[Листване на Surprise Bag]
 - Брой налични торбички (напр. 5 бр.)
 - Цена (напр. 4.99 лв.)
 - Pickup прозорец (напр. 20:00 – 21:00)
 - Описание на типа храна (незадължително)
       ↓
[Потребителите резервират]
 - В реално време наличността намалява
 - При изчерпване → статус "Sold Out"
       ↓
[Управление в деня]
 - Бизнесът може да добавя/намалява бройки
 - Може да отмени резервация до 1 час преди pickup
       ↓
[Pickup прозорец]
 - Потребителите идват, показват QR код
 - Бизнесът потвърждава от своята страна
       ↓
[Приходи & Статистики]
 - Dashboard: продадени торбички, спасена храна (кг), приходи
 - Историческа графика
```

---

## 5. Модел на данните (Data Model)

### Users (Потребители)
```
User {
  id: UUID
  email: string
  password_hash: string
  name: string
  avatar_url: string
  location: { lat, lng }
  dietary_preferences: string[] // vegetarian, vegan, gluten-free...
  notifications_enabled: boolean
  created_at: datetime
  orders: Order[]
  favorites: Store[]
}
```

### Stores (Бизнеси)
```
Store {
  id: UUID
  owner_user_id: UUID
  name: string
  description: string
  type: enum // restaurant | bakery | supermarket | cafe | hotel
  address: string
  location: { lat, lng }
  photos: string[]
  rating: float
  review_count: int
  subscription_status: enum // active | trial | expired
  subscription_expires_at: datetime
  bags: SurpriseBag[]
  created_at: datetime
}
```

### SurpriseBags (Торбички)
```
SurpriseBag {
  id: UUID
  store_id: UUID
  title: string // "Bakery Surprise", "Veggie Mix"...
  description: string
  price: decimal
  original_value: decimal // показва се "Стойност: 3x повече"
  quantity_total: int
  quantity_available: int
  pickup_start: time
  pickup_end: time
  pickup_date: date
  status: enum // active | sold_out | cancelled | completed
  tags: string[] // vegetarian, halal, gluten-free...
  created_at: datetime
}
```

### Orders (Поръчки)
```
Order {
  id: UUID
  user_id: UUID
  bag_id: UUID
  store_id: UUID
  quantity: int // обикновено 1
  total_price: decimal
  platform_fee: decimal // комисионната
  store_revenue: decimal
  status: enum // pending | confirmed | picked_up | cancelled | missed
  qr_code: string // уникален код за pickup
  picked_up_at: datetime | null
  cancelled_at: datetime | null
  payment_intent_id: string // Stripe ID
  created_at: datetime
}
```

### Reviews (Оценки)
```
Review {
  id: UUID
  order_id: UUID
  user_id: UUID
  store_id: UUID
  rating: int // 1-5
  comment: string | null
  created_at: datetime
}
```

### Notifications
```
Notification {
  id: UUID
  user_id: UUID
  type: enum // new_bag | order_confirmed | pickup_reminder | order_cancelled
  title: string
  body: string
  read: boolean
  metadata: JSON // { bag_id, store_id, order_id }
  created_at: datetime
}
```

---

## 6. Функции на приложението (Features)

### 6.1 За потребителя

| Функция | Описание |
|--------|----------|
| **Discover Feed** | Персонализиран списък с налични торбички наблизо. Показва: снимка, тип магазин, цена, pickup прозорец, разстояние. |
| **Карта / Map View** | Интерактивна карта с пинове за всеки магазин с активни торбички. |
| **Филтри** | По разстояние, цена, рейтинг, тип храна (пекарна, ресторант...), диетични предпочитания. |
| **Детайлна страница** | Информация за магазина, снимки, описание на торбичката, pickup часове, отзиви. |
| **Купуване** | In-app плащане (Stripe / RevenueCat). Незабавно потвърждение. |
| **QR Код** | Генериран след плащане. Показва се на екрана при вземане. |
| **Countdown таймер** | Показва колко остава до началото на pickup прозореца. |
| **Любими (Favorites)** | "Сърцето" бутон — запазване на любими магазини. Push известие при нова торбичка. |
| **История** | Всички минали поръчки с детайли. |
| **Оценяване** | След pickup — rating и коментар. |
| **Известия** | Push notifications: нова торбичка от любим магазин, напомняне преди pickup, отменена поръчка. |
| **Импакт Трекер** | "Ти си спасил X хранения, еквивалентно на Y кг CO₂." Геймификация. |
| **Отмяна** | Може да отмени до 2 часа преди pickup за пълно възстановяване. |

### 6.2 За бизнеса (Business Dashboard)

| Функция | Описание |
|--------|----------|
| **Регистрация и профил** | Въвеждане на бизнес данни, снимки, адрес, тип. |
| **Създаване на торбичка** | Бързо листване: бройка, цена, часове. |
| **Управление на наличност** | Промяна на бройки в реално време. |
| **Резервации** | Преглед на текущите резервации и кой ще дойде. |
| **Статистики** | Продадени торбички, приходи, спасена храна, нови клиенти. |
| **Отмяна на резервация** | До 1 час преди pickup — потребителят получава известие и възстановяване. |
| **Абонамент** | Управление на платения план. |

---

## 7. Модел на приходите (Revenue Model)

### Комисионна на транзакция (основен приход)
- За всяка продадена торбичка платформата взима **фиксирана комисионна**
- Примерни стойности: ~1.09 EUR / £1.09 / $1.79 на торбичка
- Останалата сума отива към бизнеса

### Годишен абонамент за бизнеси
- Бизнесите плащат годишна такса за достъп до платформата
- Примерна стойност: ~$89/год (US пазар)
- Дава достъп до: листване на торбички, analytics, support

### Допълнителни приходи (бъдещи)
- Premium позициониране в листинга (реклама)
- Разширени analytics пакети
- B2B решения за вериги (inventory tracking software)

---

## 8. Бизнес логика и правила

```
ПРАВИЛА ЗА ПОРЪЧКИ:
- Потребителят може да купи максимум 1 торбичка от един магазин на ден
- Плащането се извършва незабавно при резервацията
- Отмяна от потребител: безплатно до 2 часа преди pickup
- Отмяна след дедлайна → платформата може да задържи сумата
- Ако потребителят не се яви → Bag е "missed", без възстановяване
- Отмяна от магазина: до 1 час преди pickup → автоматично пълно възстановяване
- Магазинът може да отмени по-късно само при извънредни обстоятелства

ПРАВИЛА ЗА ТОРБИЧКИ:
- Торбичките са "изненада" — съдържанието не е гарантирано
- Алергени НЕ са гарантирано декларирани (потребителят носи риска)
- Всяка торбичка има конкретен pickup прозорец (обикновено 30-60 минути)
- При изчерпване: статус "Sold Out", не може да се купи

ПРАВИЛА ЗА PICKUP:
- QR кодът е валиден само в рамките на pickup прозореца
- Потребителят трябва да е онлайн при swipe (real-time потвърждение)
- Магазинът потвърждава от своята страна
```

---

## 9. Технически стек (препоръчителен)

### Frontend (Mobile)
```
- React Native (Expo) — за iOS и Android от един код
- или: Flutter
- Карта: react-native-maps / Google Maps SDK
- Навигация: React Navigation
- State: Zustand или Redux Toolkit
- Push notifications: Expo Notifications / Firebase Cloud Messaging
```

### Backend
```
- Node.js + Express / Fastify
- или: Python + FastAPI
- или: Supabase (за бърз старт — auth + db + realtime вградени)
- REST API или GraphQL
```

### База данни
```
- subabase (PostgreSQL + realtime)
```

### Плащания
```
- Stripe (препоръчително)
  - PaymentIntent API за in-app плащане
  - Stripe Connect за разпределяне на приходи към бизнеси
  - Webhooks за потвърждения
```

### Notifications
```
- Firebase Cloud Messaging (FCM) — push notifications
- SendGrid / Resend — имейл известия
```

### Съхранение на файлове
```
- AWS S3 / Cloudflare R2 — снимки на магазини и торбички
- Cloudinary — за оптимизация на изображения
```

### Геолокация
```
- Google Maps API (карта + geolocation)
- Haversine формула или PostGIS за "намери магазини до X км"
```

---

## 10. API Endpoints (основни)

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
```

### Stores
```
GET  /api/stores?lat=&lng=&radius=&type=&page=   → списък наблизо
GET  /api/stores/:id                              → детайли
POST /api/stores                                  → създай бизнес (Business role)
PUT  /api/stores/:id                              → редактирай
```

### Bags
```
GET  /api/bags?store_id=                          → торбички на магазин
GET  /api/bags/:id                                → детайли
POST /api/bags                                    → създай торбичка (Business)
PUT  /api/bags/:id                                → обнови наличност/часове
DELETE /api/bags/:id                              → отмени/изтрий
```

### Orders
```
POST /api/orders                                  → купи торбичка
GET  /api/orders                                  → история на потребителя
GET  /api/orders/:id                              → детайли
POST /api/orders/:id/pickup                       → потвърди pickup (swipe)
POST /api/orders/:id/cancel                       → отмени поръчка
```

### Reviews
```
POST /api/reviews                                 → напиши отзив
GET  /api/stores/:id/reviews                      → отзиви за магазин
```

### Favorites
```
POST /api/favorites/:store_id                     → добави любим
DELETE /api/favorites/:store_id                   → премахни
GET  /api/favorites                               → всички любими
```

### Notifications
```
GET  /api/notifications                           → всички известия
PUT  /api/notifications/:id/read                  → маркирай като прочетено
POST /api/notifications/preferences               → настройки
```

### Business Dashboard
```
GET  /api/business/stats                          → статистики
GET  /api/business/orders                         → текущи резервации
GET  /api/business/revenue                        → приходи по период
```

---

## 11. Екрани на приложението (Screens)

### Потребителски екрани
```
1. Onboarding / Welcome
2. Register / Login
3. Home / Discover Feed
4. Map View
5. Store Detail
6. Bag Detail + Purchase
7. Active Order (с QR код и countdown)
8. Pickup Screen (swipe to confirm)
9. Rate & Review
10. Favorites
11. Order History
12. Profile & Settings
13. Notifications Settings
14. My Impact (спасена храна, CO₂)
```

### Бизнес екрани
```
1. Business Onboarding
2. Business Dashboard (home)
3. Create / Edit Bag
4. Today's Reservations
5. Analytics & Stats
6. Store Profile Editor
7. Subscription Management
8. Support
```

---

## 12. Геймификация и Sustainability елементи

- **Импакт съобщение след всяка поръчка:** "Ти спаси 1 хранение! Еквивалентно на 1.3 кг CO₂ спестени."
- **Личен импакт трекер:** Общо спасени хранения, CO₂, вода
- **Badges / Achievement система:** "Първа торбичка", "10 спасени хранения", "Ветеран на устойчивостта"
- **Социално споделяне:** Сподели своя импакт в социалните мрежи

---

## 13. Edge Cases и важни детайли за имплементация

```
1. REAL-TIME наличност: Когато 2 потребители едновременно опитат да купят 
   последната торбичка → използвай optimistic locking или Redis atomic operations.

2. QR КОД: Генерирай уникален, криптографски подписан токен. 
   Валиден само в pickup прозореца. Еднократна употреба.

3. TIMEZONE: Pickup прозорците са в local timezone на магазина. 
   Съхранявай в UTC, конвертирай за показване.

4. ОТМЯНА и REFUND: Интегрирай Stripe Refunds API. 
   Автоматично задействане при отмяна от магазина.

5. АЛЕРГЕНИ: Показвай ясно disclaimer: 
   "Съдържанието е изненада. Не можем да гарантираме алергени."

6. OFFLINE: При липса на интернет при pickup → не позволявай swipe. 
   QR кодът изисква онлайн потвърждение.

7. NOTIFICATIONS: При нова торбичка от любим магазин → изпрати push ВЕДНАГА.
   Много торбички се разпродават за минути.

8. МАГАЗИН ОТМЕНЯ ПОРЪЧКА: Автоматично: 
   - Refund към потребителя
   - Push notification: "За съжаление [Магазин] отмени твоята поръчка."

9. PICKUP MISSED: Ако потребителят не се яви → след края на прозореца 
   → статус "missed", без refund.

10. FRAUD: Ограничи до 1 торбичка на потребител на магазин на ден.
    Следи за подозрително поведение.
```

---

## 14. Примерни цени за тестова среда

| Артикул | Стойност |
|---------|----------|
| Цена на торбичка (пекарна) | 3.99 – 5.99 лв. |
| Цена на торбичка (ресторант) | 5.99 – 9.99 лв. |
| Реална стойност на съдържанието | 2-3x цената |
| Комисионна на платформата | ~1.09 лв. / торбичка |
| Годишен абонамент за бизнес | 99 – 149 лв./год |

---

## 15. MVP Scope (Minimum Viable Product)

За първа версия фокусирай се върху:

```
✅ Регистрация/вход (потребител + бизнес)
✅ Листване на торбички от бизнеса
✅ Browse + карта за потребителя
✅ Купуване с Stripe
✅ QR код за pickup
✅ Push notifications за нови торбички
✅ Отмяна с refund
✅ Базови статистики за бизнеса

❌ (За v2) Parcels / Food Manufacturer партньорства
❌ (За v2) Premium analytics
❌ (За v2) Badges / Gamification
❌ (За v2) Социално споделяне
```

---

*Файлът е генериран за vibe coding сесия. Използвай го като основа за изграждане на marketplace за спасяване на храна.* Отговаряй ми винаги на български език!
