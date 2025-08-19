## WebD-Selection-25-26-Task-1

- Name: Udaynoor Singh
- Enrollment Number: IIT2024006

### Live Link - https://web-d-task1.vercel.app/


### Overview
Full MERN app with:
- MongoDB Atlas + Mongoose models (`User`, `Question`, `Category`, `UserProgress`)
- Auth (register/login) with bcrypt + JWT
- Seeder from `https://test-data-gules.vercel.app/data.json`
- Content API with search, difficulty filter, pagination, and sorting
- Vanilla React frontend (no Tailwind), responsive, accordion UI, color-coded difficulty tags
- Dark/Light mode (saved in localStorage)
- Debounced search, basic voice commands (Web Speech API)
- User dashboard with bookmarks and progress

### Prerequisites
- Node.js LTS and npm
- MongoDB Atlas connection string

### Environment
Create a `.env` .
```
MONGODB_URI=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=
PORT=
NODE_ENV=
```

### Install
```
npm install
```

### Seed Database
Make sure `.env` is configured, then:
```
npm run seed
```

### Run (Dev)
Runs server :
```
npm run dev
```
Runs frontend :
```
npm start
```
- Server: `http://localhost:5000`
- Client: `http://localhost:3000`

### API
- Auth
  - POST `/api/v1/auth/register` { name, email, password }
  - POST `/api/v1/auth/login` { email, password }
- Content
  - GET `/api/v1/content` ?search=&difficulty=Easy|Medium|Hard&page=1&limit=10&sortBy=title_asc|title_desc|difficulty_asc|difficulty_desc
  - GET `/api/v1/content/categories`
  - GET `/api/v1/content/questions` same query params as above
- User (JWT required)
  - POST `/api/v1/user/progress` { questionId, action: 'complete'|'uncomplete' }
  - GET `/api/v1/user/bookmarks`
  - POST `/api/v1/user/bookmarks` { questionId, action: 'add'|'remove' }
  - GET `/api/v1/user/dashboard`

### Frontend Notes
- Vanilla CSS in `client/src/index.css`
- Dark/Light toggle persists via `localStorage('theme')`
- Web Speech API commands: "Open <term>", "Next", "Previous"
