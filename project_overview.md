# Project Overview: TALK

**TALK** is a full-stack, real-time messaging and social networking application. It combines instant messaging capabilities with social features like friend requests and group chats. The application is built using the **MERN** stack (MongoDB, Express, React, Node.js) and leverages **Socket.io** for real-time communication.

## 🛠 Tech Stack

### Frontend
*   **Core**: React 19 (via Vite)
*   **Styling**: TailwindCSS + DaisyUI
*   **State Management**: Zustand (Stores: `useAuthStore`, `useChatStore`, `useConnectionStore`)
*   **Routing**: React Router DOM v7
*   **HTTP Client**: Axios
*   **Icons**: Lucide React & React Icons
*   **Notifications**: React Hot Toast

### Backend
*   **Runtime**: Node.js & Express.js
*   **Database**: MongoDB (Mongoose)
*   **Real-time Engine**: Socket.io
*   **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies
*   **File Storage**: Cloudinary
*   **Security**: bcryptjs, cors, dotenv

## ✨ Key Features

### 1. Authentication & Security
*   Secure Sign Up / Login with JWT.
*   Protected Routes ensuring only authenticated access.
*   Profile Management (Update info, Avatar upload).

### 2. Social Connection System
*   **User Search**: Find users globally.
*   **Friend Requests**: Send, accept, reject, or cancel requests.
*   **Friends List**: Manage active connections.
*   **Unfriend / Archive**: Manage interaction levels.

### 3. Real-Time Chat
*   **Instant Messaging**: Powered by Socket.io.
*   **Persistent History**: stored in MongoDB.
*   **Media Sharing**: Image uploads via Cloudinary.
*   **Online Status**: Real-time user presence indicators.

### 4. Group Chat
*   **Create Groups**: Named group conversations.
*   **Group Messaging**: Real-time multi-user chat.

## 📂 Project Structure

*   **/backend**: Express server, Mongoose models, API routes, Socket.io logic.
*   **/frontend**: React SPA, Zustand stores, Tailwind configuration.
