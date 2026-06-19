# 🍽️ SmartCanteen — Order Smart. Skip the Queue.

SmartCanteen is a modern, responsive digital ordering and queue management web application designed for college canteens. It bridges the gap between students, counter cashiers, kitchen staff, and canteen administrators by replacing paper billing with real-time digital ticket queues, integrated payments, and instant notifications.

---

## 🚀 Portals & Roles

### 1. 🎓 Student Portal (`/student/login`)
* **Features**: View canteen menu, filter categories (Beverages, Snacks, Fast Food), manage order cart, check out using online card/UPI or physical counter cash, track real-time preparation states, receive in-app alerts, and toggle WhatsApp alerts preference.

### 2. 👨‍💼 Canteen Administrator Portal (`/admin/login`)
* **Features**: Access analytic cards tracking daily revenue, pending payments, kitchen traffic, and unread alerts. Manage food catalog CRUD operations, register new staff accounts, reset user credentials securely, and analyze peak rush hours via the live Hourly Sales trend chart.

### 3. 💰 Counter Cashier Portal (`/cashier/login`)
* **Features**: Search students by Roll Number or Phone, create counter POS orders instantly, mark cash-on-counter orders as `PAID`, and view cashier transactions ledger.

### 4. 👨‍🍳 Kitchen Dashboard Portal (`/worker/login`)
* **Features**: View chronological preparing queue (`PAID` status) and ready pickup queue (`READY` status). One-click actions update order states to dispatch instant socket-based student alerts.

---

## 🔑 Test Credentials (Database Seed Accounts)

All seed accounts share the same default password:
* **Password**: `password123`

### 👤 1. Administrator Accounts
* **Username**: `admin1`
* **Name**: Canteen Admin 1

### 👤 2. Cashier POS Accounts
* **Username**: `cashier1`
* **Name**: Canteen Cashier 1

### 👤 3. Kitchen Worker Accounts
* **Username**: `kitchen1`
* **Name**: Canteen Kitchen 1

### 👤 4. Student Accounts
* **Roll Number / Username**: `22bd1a0501` (Sai Charan Ega)
* **Roll Number / Username**: `22bd1a0502` (Priya Sharma)

---

## 🛠️ Technology Stack

* **Frontend**: React.js, Vite, Tailwind CSS, Lucide icons, Socket.IO Client.
* **Backend**: Node.js, Express.js, Socket.IO Server, Mongoose.
* **Database**: MongoDB (Local or Atlas Cloud).
* **Integrations**: Razorpay Web SDK (Payment Gateway), Meta WhatsApp Cloud API (Outbound SMS alerts).

---

## 💻 Local Installation & Setup

### 1. Configure Environment Variables
Inside the `server` directory, create a `.env` file based on `server/.env.example`:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/smartcanteen
JWT_SECRET=your_super_secret_jwt_key_here
RAZORPAY_KEY_ID=rzp_test_SvEakfjU8iW6tS
RAZORPAY_KEY_SECRET=xqsC2iIuhP6AnwRVaAYQqmGY
WHATSAPP_API_KEY=your_whatsapp_cloud_api_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id_here
```

### 2. Populate/Seed the Database
Ensure MongoDB is running, navigate to the `server` directory, and run the seeding script:
```bash
cd server
npm install
npm run seed
```

### 3. Run the Backend Server
Start the Express server with nodemon:
```bash
npm run dev
```

### 4. Run the Frontend Client
In a separate terminal tab, run the Vite development server in the root directory:
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to access the application.

---

## 🌐 Production Deployment

### 1. Backend (Render)
1. Deploy as a **Web Service** connecting to your GitHub repository.
2. Set the **Root Directory** to `server`.
3. Set the **Build Command** to `npm install` and **Start Command** to `node server.js`.
4. Add all environment variables (including your cloud MongoDB Atlas URI as `MONGO_URI`) under Render's Advanced Settings.

### 2. Frontend (Vercel)
1. Deploy your repository on Vercel (auto-detects the Vite preset).
2. Add the environment variable:
   * **Key**: `VITE_API_URL`
   * **Value**: *(Your Render backend deployment URL, e.g., `https://smartcanteen-backend.onrender.com`)*
3. Deploy!
