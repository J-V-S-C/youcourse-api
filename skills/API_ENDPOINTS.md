# YouCourse API - API Endpoints Reference

Base URL: `http://localhost:3333/api/v1`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Public Endpoints

### Create Account (Register)

```http
POST /accounts
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**

```json
{
  "account": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation:**

- `name`: string, max 50 characters
- `email`: valid email format, max 255 characters, unique
- `password`: string, 6-50 characters

---

### Authenticate (Login)

```http
POST /sessions
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

**Errors:**

- 400: Invalid credentials
- 409: Account already exists

---

### Refresh Token

```http
POST /sessions/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

---

### Request Password Reset

```http
POST /accounts/password-reset
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (200 OK):** Empty body on success

**Rate Limited:** 5 requests per 15 minutes

---

### Reset Password

```http
POST /accounts/password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

**Response (200 OK):** Empty body on success

**Rate Limited:** 5 requests per 15 minutes

---

### Fetch Courses (Public Catalog)

```http
GET /courses?page=1&orderBy=recent
```

**Query Parameters:**

- `page`: number (default: 1, min: 1)
- `orderBy`: `recent` | `popular` | `bestSelling` (default: `recent`)

**Response (200 OK):**

```json
{
  "courses": [
    {
      "id": "uuid",
      "name": "Course Name",
      "description": "Course description",
      "price": {
        "amount": 100,
        "currency": "BRL"
      },
      "visible": true,
      "sellable": true,
      "creatorId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Protected Endpoints

### Get Account by ID

```http
GET /accounts/:id
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "account": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Edit Account Details

```http
PATCH /accounts/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Validation:**

- `name`: optional, string, max 50 characters
- `email`: optional, valid email format, max 255 characters

**Response (200 OK):**

```json
{
  "account": {
    "id": "uuid",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Create Course

```http
POST /courses
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "TypeScript Masterclass",
  "description": "Learn TypeScript from scratch",
  "price": {
    "amount": 9990,
    "currency": "BRL"
  },
  "sellable": true,
  "visible": true
}
```

**Validation:**

- `name`: string, max 50 characters
- `description`: string, max 200 characters
- `price`: optional, object with `amount` (max 2 decimals) and `currency`
- `sellable`: optional, boolean (default: true)
- `visible`: optional, boolean (default: true)

**Response (201 Created):**

```json
{
  "course": {
    "id": "uuid",
    "name": "TypeScript Masterclass",
    "description": "Learn TypeScript from scratch",
    "price": {
      "amount": 9990,
      "currency": "BRL"
    },
    "visible": true,
    "sellable": true,
    "creatorId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": null
  }
}
```

---

### Edit Course Details

```http
PUT /courses/:courseId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Course Name",
  "description": "Updated description"
}
```

**Response (204 No Content):** Empty body

**Authorization:** Only the course creator can edit

---

### Delete Course

```http
DELETE /courses/:courseId
Authorization: Bearer <access_token>
```

**Response (204 No Content):** Empty body

**Authorization:** Only the course creator can delete

---

### Publish Course

```http
PATCH /courses/:courseId/publish
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "price": {
    "amount": 9990,
    "currency": "BRL"
  }
}
```

**Effect:** Sets `visible: true` and `sellable: true` with the provided price

**Response (204 No Content):** Empty body

---

### Unpublish Course

```http
PATCH /courses/:courseId/unpublish
Authorization: Bearer <access_token>
```

**Effect:** Sets `visible: false` and `sellable: false`

**Response (204 No Content):** Empty body

---

### Hide Course

```http
PATCH /courses/:courseId/hide
Authorization: Bearer <access_token>
```

**Effect:** Sets `visible: false` (course remains sellable)

**Response (204 No Content):** Empty body

---

### Update Course Price

```http
PATCH /courses/:courseId/price
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "price": {
    "amount": 14990,
    "currency": "BRL"
  }
}
```

**Response (204 No Content):** Empty body

---

### Rate Course

```http
POST /courses/:courseId/rating
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "stars": 4.5,
  "commentary": "Great course, highly recommended!"
}
```

**Validation:**

- `stars`: number, 0.5 to 5, increments of 0.5
- `commentary`: optional, string, max 255 characters

**Response (201 Created):**

```json
{
  "rating": {
    "id": "uuid",
    "creatorId": "uuid",
    "courseId": "uuid",
    "stars": 4.5,
    "commentary": "Great course, highly recommended!",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": null
  }
}
```

---

### Edit Rating

```http
PUT /ratings/:ratingId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "stars": 5,
  "commentary": "Updated review"
}
```

**Validation:**

- `stars`: optional, number, 1 to 5
- `commentary`: optional, string

**Response (204 No Content):** Empty body

**Authorization:** Only the rating creator can edit

---

## Common Error Responses

| Status | Error             | Description                       |
| ------ | ----------------- | --------------------------------- |
| 400    | Bad Request       | Invalid input or validation error |
| 401    | Unauthorized      | Missing or invalid token          |
| 403    | Forbidden         | Not allowed to perform action     |
| 404    | Not Found         | Resource not found                |
| 409    | Conflict          | Resource already exists           |
| 429    | Too Many Requests | Rate limit exceeded               |

---

## HTTP Status Codes

| Code | Description                                |
| ---- | ------------------------------------------ |
| 200  | Success                                    |
| 201  | Created                                    |
| 204  | No Content (Success with no response body) |
| 400  | Bad Request                                |
| 401  | Unauthorized                               |
| 403  | Forbidden                                  |
| 404  | Not Found                                  |
| 409  | Conflict                                   |
| 429  | Too Many Requests                          |
| 500  | Internal Server Error                      |
