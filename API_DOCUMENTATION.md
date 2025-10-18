# Form Collector API Documentation

Complete API reference for the Form Collector service.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

Admin endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Public Endpoints

### Submit Form

Submit data to a form.

**Endpoint:** `POST /submit/:apiKey`

**Parameters:**
- `apiKey` (path parameter): The form's API key

**Request Headers:**
```
Content-Type: application/json
Accept: application/json (optional, for JSON response)
```

**Request Body:**
```json
{
  "field1": "value1",
  "field2": "value2",
  "any_field_name": "any_value"
}
```

**Success Response (JSON):**
```json
{
  "success": true,
  "message": "Thank you for your submission!",
  "submission_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Success Response (HTML Form):**
- If `Accept: application/json` is not set, returns HTML success page
- If form has `redirect_url`, redirects to that URL

**Error Response:**
```json
{
  "error": "Form not found or inactive"
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `404` - Form not found
- `429` - Rate limit exceeded
- `500` - Server error

**Example (JavaScript):**
```javascript
fetch('https://your-domain.com/api/submit/YOUR_API_KEY', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello!'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

**Example (HTML Form):**
```html
<form action="https://your-domain.com/api/submit/YOUR_API_KEY" method="POST">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <textarea name="message" required></textarea>
  <button type="submit">Submit</button>
</form>
```

**Example (cURL):**
```bash
curl -X POST https://your-domain.com/api/submit/YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello!"
  }'
```

---

## Admin Endpoints

### Authentication

#### Login

Authenticate and receive JWT token.

**Endpoint:** `POST /admin/auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**Success Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@example.com"
}
```

**Error Response:**
```json
{
  "error": "Invalid credentials"
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid credentials
- `429` - Too many login attempts

**Example:**
```javascript
fetch('https://your-domain.com/api/admin/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'your-password'
  })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('authToken', data.token);
});
```

---

### Forms Management

#### Get All Forms

Retrieve all forms with submission counts.

**Endpoint:** `GET /admin/forms`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Contact Form",
    "api_key": "abc123...",
    "email": "admin@example.com",
    "redirect_url": "https://example.com/thank-you",
    "success_message": "Thank you for your submission!",
    "created_at": 1703001600000,
    "updated_at": 1703001600000,
    "active": 1,
    "submission_count": 42
  }
]
```

**Example:**
```javascript
fetch('https://your-domain.com/api/admin/forms', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(forms => console.log(forms));
```

#### Create Form

Create a new form.

**Endpoint:** `POST /admin/forms`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Contact Form",
  "email": "admin@example.com",
  "redirect_url": "https://example.com/thank-you",
  "success_message": "Thank you for contacting us!"
}
```

**Success Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Contact Form",
  "api_key": "generated-api-key-here",
  "email": "admin@example.com",
  "redirect_url": "https://example.com/thank-you",
  "success_message": "Thank you for contacting us!",
  "created_at": 1703001600000,
  "updated_at": 1703001600000,
  "active": 1
}
```

**Validation Rules:**
- `name`: Required, 3-100 characters
- `email`: Required, valid email format
- `redirect_url`: Optional, valid URL
- `success_message`: Optional, max 500 characters

**Example:**
```javascript
fetch('https://your-domain.com/api/admin/forms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Newsletter Signup',
    email: 'newsletter@example.com',
    success_message: 'Thanks for subscribing!'
  })
})
.then(res => res.json())
.then(form => console.log('Created:', form));
```

#### Get Form by ID

Retrieve a specific form.

**Endpoint:** `GET /admin/forms/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Contact Form",
  "api_key": "abc123...",
  "email": "admin@example.com",
  "redirect_url": "https://example.com/thank-you",
  "success_message": "Thank you!",
  "created_at": 1703001600000,
  "updated_at": 1703001600000,
  "active": 1
}
```

#### Update Form

Update an existing form.

**Endpoint:** `PUT /admin/forms/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Form Name",
  "email": "newemail@example.com",
  "redirect_url": "https://example.com/new-thank-you",
  "success_message": "Updated message",
  "active": 1
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Success Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Form Name",
  // ... updated fields
}
```

#### Delete Form

Delete a form and all its submissions.

**Endpoint:** `DELETE /admin/forms/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "success": true
}
```

**Warning:** This action is irreversible and will delete all submissions.

#### Regenerate API Key

Generate a new API key for a form.

**Endpoint:** `POST /admin/forms/:id/regenerate-key`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "api_key": "new-generated-api-key"
}
```

**Warning:** This will invalidate the old API key and break existing integrations.

---

### Submissions Management

#### Get Form Submissions

Retrieve submissions for a specific form.

**Endpoint:** `GET /admin/forms/:id/submissions`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of submissions to return (default: 100)
- `offset` (optional): Number of submissions to skip (default: 0)

**Success Response:**
```json
{
  "submissions": [
    {
      "id": "submission-id",
      "form_id": "form-id",
      "data": {
        "name": "John Doe",
        "email": "john@example.com",
        "message": "Hello!"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "referrer": "https://example.com",
      "created_at": 1703001600000
    }
  ],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

**Example with Pagination:**
```javascript
// Get first 50 submissions
fetch('https://your-domain.com/api/admin/forms/FORM_ID/submissions?limit=50&offset=0', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  console.log(`Showing ${data.submissions.length} of ${data.total}`);
});

// Get next 50 submissions
fetch('https://your-domain.com/api/admin/forms/FORM_ID/submissions?limit=50&offset=50', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log(data));
```

#### Delete Submission

Delete a specific submission.

**Endpoint:** `DELETE /admin/submissions/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "success": true
}
```

---

### Dashboard Statistics

#### Get Statistics

Retrieve dashboard statistics.

**Endpoint:** `GET /admin/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "total_forms": 5,
  "active_forms": 4,
  "total_submissions": 342,
  "recent_submissions": 28
}
```

**Fields:**
- `total_forms`: Total number of forms
- `active_forms`: Number of active forms
- `total_submissions`: Total submissions across all forms
- `recent_submissions`: Submissions in the last 7 days

---

## Rate Limiting

### Submission Endpoint
- **Default:** 100 requests per 15 minutes per IP
- **Configurable:** Via `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS`

### Admin Endpoints
- **Default:** 200 requests per 15 minutes per IP

### Authentication Endpoint
- **Default:** 5 requests per 15 minutes per IP

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703001600
```

**Rate Limit Exceeded Response:**
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message here"
}
```

### Validation Errors

```json
{
  "errors": [
    {
      "msg": "Email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (token expired)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## Webhooks (Future Feature)

Coming soon: Webhook notifications for new submissions.

---

## SDK Examples

### JavaScript/Node.js

```javascript
class FormCollectorClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async submit(data) {
    const response = await fetch(`${this.baseUrl}/api/submit/${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// Usage
const client = new FormCollectorClient('https://your-domain.com', 'YOUR_API_KEY');
await client.submit({
  name: 'John Doe',
  email: 'john@example.com'
});
```

### Python

```python
import requests

class FormCollectorClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.api_key = api_key
    
    def submit(self, data):
        url = f"{self.base_url}/api/submit/{self.api_key}"
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        response = requests.post(url, json=data, headers=headers)
        return response.json()

# Usage
client = FormCollectorClient('https://your-domain.com', 'YOUR_API_KEY')
result = client.submit({
    'name': 'John Doe',
    'email': 'john@example.com'
})
print(result)
```

### PHP

```php
<?php
class FormCollectorClient {
    private $baseUrl;
    private $apiKey;
    
    public function __construct($baseUrl, $apiKey) {
        $this->baseUrl = $baseUrl;
        $this->apiKey = $apiKey;
    }
    
    public function submit($data) {
        $url = $this->baseUrl . '/api/submit/' . $this->apiKey;
        
        $options = [
            'http' => [
                'header'  => "Content-Type: application/json\r\n" .
                            "Accept: application/json\r\n",
                'method'  => 'POST',
                'content' => json_encode($data)
            ]
        ];
        
        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        return json_decode($result, true);
    }
}

// Usage
$client = new FormCollectorClient('https://your-domain.com', 'YOUR_API_KEY');
$result = $client->submit([
    'name' => 'John Doe',
    'email' => 'john@example.com'
]);
print_r($result);
?>
```

---

## Testing

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.67
}
```

### Test Submission

Use the test form in `examples/` directory or create a simple test:

```bash
curl -X POST http://localhost:3000/api/submit/YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

---

## Support

For API issues or questions:
1. Check this documentation
2. Review error messages and status codes
3. Check rate limits
4. Verify authentication token
5. Test with cURL or Postman

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Form submission endpoint
- Admin dashboard API
- Authentication
- Rate limiting
- Email notifications

### Planned Features
- Webhooks
- File uploads
- Custom email templates
- Export submissions (CSV/JSON)
- Analytics API