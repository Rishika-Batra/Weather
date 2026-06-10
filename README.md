# ✨ Skye — Premium Weather Dashboard

Skye is a modern, responsive, and feature-rich weather forecasting application that delivers clean, real-time atmospheric intelligence at a glance. Engineered with a modular design system, Skye seamlessly transitions between stunning light and dark themes while dynamically adapting its interface elements to match local atmospheric data.

![UI-Premium](https://img.shields.io/badge/UI-Premium_Dark_&_Light-blue?style=flat-square)
![Platform-Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=flat-square&logo=vercel)
![Tech-Vanilla_JS](https://img.shields.io/badge/Tech-HTML5_/_CSS3_/_JS_ES6+-orange?style=flat-square)

---

## 🚀 Live Demo

Experience the live deployment on Vercel:
👉 **[Skye Weather Live App](https://weather-eta-bice.vercel.app/)**

---

## 📱 Application Interface

### Dark Mode & Ambient Sidebars
The application implements a custom theme engine capable of rendering precise, high-contrast states optimized for low-light or daytime usage.

| Premium Dark Theme | Clean Light Theme |
|---|---|
| ![Dark Mode Dashboard](https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=400&q=80) | ![Light Mode Dashboard](https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&w=400&q=80) |

---

## 🌟 Core Features

* **Dual-Theme Design System:** Complete support for a premium default Dark Mode and a crisp, light blue sky palette, instantly switchable via the header control button.
* **Ambient Sidebar Gradients:** Evaluates the target location's local time string against its actual astronomical data (`sunrise` and `sunset`). The sidebar automatically adjusts to showcase bright, daylight sky gradients or deep, starry nighttime backdrops.
* **Today's Micro-Metrics:** Detailed, clean dashboard tracking widgets including:
  * 💨 **Wind Status:** Absolute wind velocities measured in km/h.
  * 💧 **Humidity Levels:** Clear percentages accompanied by a dynamic progress metric indicator fill bar.
  * ☀️ **UV Index:** Quantitative radiation scale.
  * ⏲️ **Barometric Pressure:** Atmospheric reading calibrated to millibars/hectopascals (hPa).
  * 👁️ **Visibility Range:** Regional clarity tracking quantified in kilometers (km).
  * ☁️ **Cloud Cover:** Macro cloud density percentages.
* **24-Hour Timeline Swiper:** A smooth horizontal scrolling element displaying upcoming hourly temperature shifts, condition icons, and precise rain probability percentage indices (`% chance of rain`).
* **7-Day Extended Outlook:** Tabbed view panel displaying formatted calendar dates, condition illustrations, and maximum vs. minimum temperature spreads.
* **Graceful Exception Management:** Built-in error validation intercepts networking exceptions (such as bad request paths, empty search fields, or faulty server returns) to display elegant user-facing warnings without interrupting running scripts.

---

## 🛠️ Tech Stack & Architecture

* **Layout & Semantics:** HTML5
* **Style Sheet Engineering:** CSS3 Custom Properties (Variables), Flexbox Layout Modules, and responsive CSS Grid systems.
* **Logic Framework:** Vanilla JavaScript (ES6+ Native Modules, Async/Await APIs).
* **Data Layer Feed:** Secure REST endpoints mapping structured JSON fields from **WeatherAPI**.

---

