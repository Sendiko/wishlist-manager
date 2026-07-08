# Ulala Wishlist Manager - REST API Documentation

This API enables mobile applications to interact with the Wishlist Manager database, perform authentication, filter categories, and manage wishlist items.

## Table of Contents
- [Authentication Flow](#authentication-flow)
- [Base URL](#base-url)
- [Auth Endpoints](#auth-endpoints)
  - [Register User (`POST /api/auth/register`)](#register-user-post-apiauthregister)
  - [Login User (`POST /api/auth/login`)](#login-user-post-apiauthlogin)
  - [Logout User (`POST /api/auth/logout`)](#logout-user-post-apiauthlogout)
  - [Get Current User (`GET /api/auth/me`)](#get-current-user-get-apiauthme)
- [Categories Endpoints](#categories-endpoints)
  - [List Categories (`GET /api/categories`)](#list-categories-get-apicategories)
  - [Compare Categories (`GET /api/categories/compare`)](#compare-categories-get-apicategoriescompare)
- [Items Endpoints](#items-endpoints)
  - [List Items (`GET /api/items`)](#list-items-get-apiitems)
  - [Create Item (`POST /api/items`)](#create-item-post-apiitems)
  - [Get Item Detail (`GET /api/items/:id`)](#get-item-detail-get-apiitemsid)
  - [Update Item (`PUT /api/items/:id`)](#update-item-put-apiitemsid)
  - [Delete Item (`DELETE /api/items/:id`)](#delete-item-delete-apiitemsid)
  - [Toggle Purchase Status (`PATCH /api/items/:id/toggle-purchase`)](#toggle-purchase-status-patch-apiitemsidtoggle-purchase)
  - [Compare Items (`GET /api/items/compare`)](#compare-items-get-apiitemscompare)

---

## Authentication Flow

Auth strictly uses **JWT Tokens** signed by the server. All protected API endpoints require the token to be included in the headers:
`Authorization: Bearer <your_jwt_token>`

Note: Unlike the web server actions, these API routes do not support cookie-based authentication fallbacks to ensure client-independent security.

---

## Base URL
- Local Development: `http://localhost:3000`
- Production: `https://ulala.sendiko.my.id/`

---

## Auth Endpoints

### Register User
Create a new user account. On success, returns user details and a JWT token.

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "password": "securepassword123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "User registered successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cuid-123",
      "username": "johndoe"
    }
  }
  ```
- **Response (400 Bad Request):**
  ```json
  {
    "message": "Validation failed.",
    "errors": {
      "username": ["Username must be at least 3 characters long."],
      "password": ["Password must be at least 6 characters long."]
    }
  }
  ```

---

### Login User
Authenticate using a username and password. On success, returns user details and a JWT token.

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cuid-123",
      "username": "johndoe"
    }
  }
  ```
- **Response (401 Unauthorized):**
  ```json
  {
    "message": "Invalid username or password."
  }
  ```

---

### Logout User
Invalidate cookie session. Mobile apps should also delete the JWT from their local secure storage.

- **URL:** `/api/auth/logout`
- **Method:** `POST`
- **Response (200 OK):**
  ```json
  {
    "message": "Logout successful."
  }
  ```

---

### Get Current User
Get details of the currently logged-in user.

- **URL:** `/api/auth/me`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "user": {
      "id": "cuid-123",
      "username": "johndoe",
      "createdAt": "2026-02-04T12:00:00.000Z",
      "updatedAt": "2026-02-04T12:00:00.000Z"
    }
  }
  ```

---

## Categories Endpoints

### List Categories
Get a list of all item categories, sorted alphabetically.

- **URL:** `/api/categories`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "categories": [
      { "id": "cat-1", "name": "Automotive" },
      { "id": "cat-2", "name": "Electronics" },
      { "id": "cat-3", "name": "Fashion" }
    ]
  }
  ```

---

## Items Endpoints

All items returned by GET endpoints will include calculated values:
- `totalScore`: Calculated from `wish_rate + neccessary_rate + interest_rate`.
- `price` (String) & `priceNumber` (Number): Serialized cleanly from Prisma's `BigInt` structure.
- `photoUrl`: Handled dynamically, converting relative paths to absolute URLs (e.g. `http://localhost:3000/uploads/file.jpg`) using `NEXT_PUBLIC_BASE_URL`.

---

### List Items
Get all wishlist items for the authenticated user, sorted by `isPurchased` status (unpurchased first) and then by `totalScore` descending.

- **URL:** `/api/items`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `categoryId` (Optional): Filter items by Category ID. E.g., `/api/items?categoryId=cat-1`
- **Response (200 OK):**
  ```json
  {
    "items": [
      {
        "id": "item-123",
        "name": "Mechanical Keyboard",
        "photoUrl": "http://localhost:3000/uploads/keyboard.jpg",
        "link": "https://example.com/buy",
        "price": "1500000",
        "priceNumber": 1500000,
        "reasoning": "Need it for typing comfort.",
        "neccessary_rate": 8,
        "wish_rate": 9,
        "interest_rate": 7,
        "isPurchased": false,
        "createdAt": "2026-02-04T12:00:00.000Z",
        "updatedAt": "2026-02-04T12:00:00.000Z",
        "userId": "cuid-123",
        "categoryId": "cat-2",
        "category": {
          "id": "cat-2",
          "name": "Electronics"
        },
        "totalScore": 24
      }
    ]
  }
  ```

---

### Create Item
Add a new wishlist item. Supports both standard **JSON** payloads and **Multipart Form Data** payloads for image upload.

- **URL:** `/api/items`
- **Method:** `POST`
- **Headers:** 
  - JSON: `Content-Type: application/json`, `Authorization: Bearer <token>`
  - Multipart: `Content-Type: multipart/form-data`, `Authorization: Bearer <token>`
- **Request Body (JSON / Multipart fields):**
  - `name` (String, required): Item name.
  - `photo` (Binary file, optional, *multipart only*): The photo file to upload.
  - `photoUrl` (String, optional, *JSON or multipart fallback*): Direct string URL to the photo.
  - `link` (String, optional): URL link to buy the item. Must be a valid URL format or empty string.
  - `price` (Number/String, optional): Indonesian Rupiah price.
  - `reasoning` (String, optional): Reasons for buying.
  - `neccessary_rate` (Number, 0-10): Rate necessity.
  - `wish_rate` (Number, 0-10): Rate wish level.
  - `interest_rate` (Number, 0-10): Rate interest level.
  - `categoryId` (String, optional): Valid category ID.
- **Response (201 Created):**
  ```json
  {
    "message": "Item created successfully.",
    "item": {
      "id": "item-456",
      "name": "Leather Boots",
      "photoUrl": "http://localhost:3000/uploads/1770204813-boots.jpg",
      "link": "https://example.com/boots",
      "price": "2200000",
      "priceNumber": 2200000,
      "reasoning": "Durable daily wear.",
      "neccessary_rate": 6,
      "wish_rate": 8,
      "interest_rate": 8,
      "isPurchased": false,
      "createdAt": "2026-02-04T12:05:00.000Z",
      "updatedAt": "2026-02-04T12:05:00.000Z",
      "userId": "cuid-123",
      "categoryId": "cat-3",
      "category": {
        "id": "cat-3",
        "name": "Fashion"
      },
      "totalScore": 22
    }
  }
  ```

---

### Get Item Detail
Retrieve details of a specific wishlist item. Returns 404 if the item doesn't exist or belongs to another user.

- **URL:** `/api/items/:id`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "item": {
      "id": "item-123",
      "name": "Mechanical Keyboard",
      ...
    }
  }
  ```

---

### Update Item
Update an existing wishlist item. Verifies ownership first. Supports both **JSON** and **Multipart Form Data** (for updating item photo).

- **URL:** `/api/items/:id`
- **Method:** `PUT` (also supports `PATCH` under the hood)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body (JSON / Multipart):** Same parameters as [Create Item](#create-item-post-apiitems).
- **Response (200 OK):**
  ```json
  {
    "message": "Item updated successfully.",
    "item": {
      "id": "item-123",
      "name": "Mechanical Keyboard (Updated Edition)",
      ...
    }
  }
  ```

---

### Delete Item
Remove a wishlist item.

- **URL:** `/api/items/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "message": "Item deleted successfully."
  }
  ```

---

### Toggle Purchase Status
Toggle the `isPurchased` boolean field (switches `true` $\leftrightarrow$ `false`).

- **URL:** `/api/items/:id/toggle-purchase`
- **Method:** `PATCH` (also supports `POST`)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "message": "Item purchase status toggled successfully.",
    "item": {
      "id": "item-123",
      "name": "Mechanical Keyboard",
      "isPurchased": true,
      ...
    }
  }
  ```

---

### Compare Items
Compare multiple selected items by their IDs. The system evaluates ratings and identifies the recommended option.

- **URL:** `/api/items/compare`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `ids` (Required): Comma-separated list of item IDs. E.g. `/api/items/compare?ids=item-123,item-456`
- **Response (200 OK):**
  ```json
  {
    "items": [
      {
        "id": "item-123",
        "name": "Mechanical Keyboard",
        "photoUrl": "http://localhost:3000/uploads/keyboard.jpg",
        "link": "https://example.com/buy",
        "price": "1500000",
        "priceNumber": 1500000,
        "reasoning": "Need it for typing comfort.",
        "neccessary_rate": 8,
        "wish_rate": 9,
        "interest_rate": 7,
        "isPurchased": false,
        "createdAt": "2026-02-04T12:00:00.000Z",
        "updatedAt": "2026-02-04T12:00:00.000Z",
        "userId": "cuid-123",
        "categoryId": "cat-2",
        "totalScore": 24,
        "isWinner": true
      },
      {
        "id": "item-456",
        "name": "Alternative Keyboard",
        "photoUrl": "",
        "link": "",
        "price": "1200000",
        "priceNumber": 1200000,
        "reasoning": "Slightly cheaper fallback.",
        "neccessary_rate": 6,
        "wish_rate": 7,
        "interest_rate": 7,
        "isPurchased": false,
        "createdAt": "2026-02-04T12:01:00.000Z",
        "updatedAt": "2026-02-04T12:01:00.000Z",
        "userId": "cuid-123",
        "categoryId": "cat-2",
        "totalScore": 20,
        "isWinner": false
      }
    ],
    "winners": [
      {
        "id": "item-123",
        "name": "Mechanical Keyboard",
        "photoUrl": "http://localhost:3000/uploads/keyboard.jpg",
        "link": "https://example.com/buy",
        "price": "1500000",
        "priceNumber": 1500000,
        "reasoning": "Need it for typing comfort.",
        "neccessary_rate": 8,
        "wish_rate": 9,
        "interest_rate": 7,
        "isPurchased": false,
        "createdAt": "2026-02-04T12:00:00.000Z",
        "updatedAt": "2026-02-04T12:00:00.000Z",
        "userId": "cuid-123",
        "categoryId": "cat-2",
        "totalScore": 24,
        "isWinner": true
      }
    ]
  }
  ```
- **Response (400 Bad Request):**
  ```json
  {
    "message": "Select at least 2 items to compare."
  }
  ```

---

### Compare Categories
Compare categories by grouping a selection of items and calculating scores, total pricing, and counts.

- **URL:** `/api/categories/compare`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `ids` (Required): Comma-separated list of item IDs. E.g. `/api/categories/compare?ids=item-123,item-456`
- **Response (200 OK):**
  ```json
  {
    "categories": [
      {
        "id": "cat-2",
        "name": "Electronics",
        "items": [
          {
            "id": "item-123",
            "name": "Mechanical Keyboard",
            "photoUrl": "http://localhost:3000/uploads/keyboard.jpg",
            "link": "https://example.com/buy",
            "price": "1500000",
            "priceNumber": 1500000,
            "reasoning": "Need it for typing comfort.",
            "neccessary_rate": 8,
            "wish_rate": 9,
            "interest_rate": 7,
            "isPurchased": false,
            "createdAt": "2026-02-04T12:00:00.000Z",
            "updatedAt": "2026-02-04T12:00:00.000Z",
            "userId": "cuid-123",
            "categoryId": "cat-2",
            "totalScore": 24
          }
        ],
        "itemCount": 1,
        "totalPrice": "1500000",
        "totalPriceNumber": 1500000,
        "totalScore": 24,
        "avgScore": "24.0",
        "isWinner": true
      }
    ],
    "winners": [
      {
        "id": "cat-2",
        "name": "Electronics",
        "items": [
          {
            "id": "item-123",
            "name": "Mechanical Keyboard",
            "photoUrl": "http://localhost:3000/uploads/keyboard.jpg",
            "link": "https://example.com/buy",
            "price": "1500000",
            "priceNumber": 1500000,
            "reasoning": "Need it for typing comfort.",
            "neccessary_rate": 8,
            "wish_rate": 9,
            "interest_rate": 7,
            "isPurchased": false,
            "createdAt": "2026-02-04T12:00:00.000Z",
            "updatedAt": "2026-02-04T12:00:00.000Z",
            "userId": "cuid-123",
            "categoryId": "cat-2",
            "totalScore": 24
          }
        ],
        "itemCount": 1,
        "totalPrice": "1500000",
        "totalPriceNumber": 1500000,
        "totalScore": 24,
        "avgScore": "24.0",
        "isWinner": true
      }
    ]
  }
  ```
