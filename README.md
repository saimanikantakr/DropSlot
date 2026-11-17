# DropSlot — Smart Delivery Slot & Dispatch Management Portal

> **A Full-Stack Logistics Coordination Application**  
> Built with **Spring Boot 4.1.2 (Java 21)** and **Angular 21** adhering strictly to enterprise standalone architecture, modern built-in control flow, and a vintage archival editorial aesthetic (with zero generic KPI stat card boxes).

---

## 📦 Domain & Problem Solved

In high-density e-commerce logistics (e.g. Flipkart, Ekart, Amazon Logistics), customers frequently receive vague SMS/WhatsApp alerts stating *"Your package is out for delivery today between 8 AM and 9 PM"*. This causes:
1. **Missed Deliveries & High RTO (Return to Origin):** Customers are at work or away during unscheduled delivery attempts.
2. **Delivery Partner Bottlenecks:** Courier partners arrive at locked apartments or during meetings, forcing tedious re-attempts.
3. **Hub Inefficiencies:** Dispatchers lack visibility into customer availability windows and slot capacity per route.

### The DropSlot Solution:
- **Consignee Self-Service:** Customers choose their preferred time window (**Morning 09–12**, **Afternoon 13–16**, **Evening 17–20**, or **Anytime**) and provide gate/doorstep delivery notes (*"Leave with security guard"*, *"Ring intercom buzzer 45"*).
- **Courier Run-Sheet:** Delivery partners get a dedicated, slot-organized run-sheet on their mobile/desktop with 1-click status transitions (`OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED_ATTEMPT`, `RESCHEDULED`).
- **Hub Dispatch Ledger:** Operations controllers manage live consignments, monitor slot booking capacity per partner/zone, and balance dispatch loads.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Highlights |
|---|---|---|
| **Frontend** | Angular 21.2.x | Standalone components, `@if`/`@for`/`@switch` control flow, Reactive Forms, RxJS `takeUntilDestroyed`, route guards (`authGuard`, `unsavedChangesGuard`), `authInterceptor`, `ngx-pagination`. |
| **Styling** | Vintage Editorial CSS | Archival linen/parchment palette (`#f8f6f0`), deep fountain pen ink typography, crisp hairline bookbinder borders, status badges, **strictly zero generic KPI stat cards**. |
| **Backend** | Spring Boot 4.1.2 / Java 21 | Spring Data JPA, Hibernate, Bean Validation (`@NotBlank`, `@Pattern`, `@Positive`), REST API, custom exception handling, CORS configuration. |
| **Database** | MySQL / H2 | `dropslot_db` on port 3306 with auto-seeding for realistic Bangalore/Hyderabad/Delhi routes and packages. |

---

## 🚀 Running the Project

### 1. Backend (`/backend`)

**Prerequisites:** Java 21, MySQL running locally on port 3306 (user `root`, password configured in `application.properties`).

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*Backend runs at:* `http://localhost:8088`

---

### 2. Frontend (`/frontend`)

**Prerequisites:** Node.js 20+

```powershell
cd frontend
npm start
# OR
npx ng serve --port 4200
```
*Frontend runs at:* `http://localhost:4200`

---

## 👥 Interactive Persona Test Accounts

Clicking any persona on the `/login` screen logs you in with 1 click:

| Role | Name | Email / Phone | Capabilities |
|---|---|---|---|
| **Hub Admin** | Central Dispatch Admin | `admin@dropslot.com` | Full dispatch ledger, assign courier partners, add/edit consignments, manage fleet roster and capacity limits. |
| **Courier Partner** | Rajesh Sharma | `rajesh.delivery@dropslot.com` | Today's route run-sheet, slot filter tabs (Morning/Afternoon/Evening), view customer gate instructions, log delivery status. |
| **Consignee / Customer** | Manikanta Reddy | `9876501234` / `manikanta@gmail.com` | View incoming orders, self-select Morning/Afternoon/Evening time windows, live progress stepper timeline. |

---

## 🏛️ Angular 21 Architectural Concepts Implemented

1. **Modern Built-in Control Flow:**
   - Exclusively uses `@if (...)`, `@for (item of items; track item.id)`, and `@switch`.
   - **Zero deprecated directives** (`*ngIf`, `*ngFor`, `*ngSwitch`, `[ngClass]`).
2. **Standalone Components:**
   - 100% standalone components across all routes, modals, and headers without `NgModule`.
3. **Modern RxJS Clean Subscriptions:**
   - Uses `takeUntilDestroyed(this.destroyRef)` to prevent memory leaks.
   - Non-positional observer objects `{ next: ..., error: ... }`.
4. **Reactive Forms & Custom Validation:**
   - Multi-field reactive forms for Order Booking, Partner Registration, and Slot Scheduling with pattern validation (`/^[6-9][0-9]{9}$/`).
5. **Route Guards & Interceptor:**
   - `authGuard`: Role-based permission enforcement (`admin`, `partner`, `customer`).
   - `unsavedChangesGuard`: Prevents accidental navigation during active form editing.
   - `authInterceptor`: Automatically injects `Authorization: Bearer <token>`.
6. **Enterprise Table & Pagination:**
   - `ngx-pagination` integration with customizable items-per-page and pagination controls.
