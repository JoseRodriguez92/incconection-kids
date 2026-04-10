# Incconection Kids

**Incconection Kids** is a comprehensive educational management platform designed to streamline communication, academic processes, and administrative tasks within educational institutions. Built with **Next.js**, **TypeScript**, and **Supabase**, it provides a modular and scalable architecture for different user roles such as **Super Admin**, **Profesor**, **Padre de Familia**, and **Estudiante**.

---

## 🚀 Features

### 👩‍💼 Super Admin

- Manage users, classrooms, courses, and academic periods.
- Oversee communication, reports, and psychological management.
- Control routes, schedules, and store management.
- Access dashboards and analytics for institutional insights.

### 👨‍🏫 Profesor

- Manage courses, grades, and student groups.
- Communicate with students and parents.
- Access personal profile and notifications.
- Schedule and manage classroom activities.

### 👨‍👩‍👧 Padre de Familia

- View student grades, homework, and notifications.
- Manage payments and documents.
- Track academic processes and schedules.

### 🧑‍🎓 Estudiante

- Access academic information and schedules.
- View grades, assignments, and institutional communications.

---

## 🧩 Tech Stack

| Category                 | Technology                                                                    |
| ------------------------ | ----------------------------------------------------------------------------- |
| **Framework**            | [Next.js 14](https://nextjs.org/)                                             |
| **Language**             | [TypeScript](https://www.typescriptlang.org/)                                 |
| **Database**             | [Supabase](https://supabase.com/)                                             |
| **UI Components**        | [Shadcn/UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/) |
| **State Management**     | Zustand                                                                       |
| **HTTP Client**          | Custom RequestHTTP service                                                    |
| **Authentication**       | Supabase Auth                                                                 |
| **Calendar Integration** | Google Calendar API                                                           |

---

## 📁 Project Structure

```
incconection-kids/
├── app/                     # Next.js app routes
│   ├── usuario/             # User-specific pages (profesor, estudiante, etc.)
│   ├── autorizacion/        # Authentication and authorization logic
│   └── api/                 # API routes (e.g., Google Calendar)
├── components/              # Reusable UI and functional components
│   ├── principal/           # Main role-based dashboards
│   ├── seconders/           # Secondary UI components (modals, tables, etc.)
│   └── Services/            # HTTP and storage management
├── lib/                     # Utility functions and Supabase clients
├── Stores/                  # Zustand stores for global state
├── public/                  # Static assets (images, videos, logos)
└── package.json             # Project dependencies and scripts
```

---

## ⚙️ Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project configured

### Steps

```bash
# Clone the repository
git clone https://github.com/your-username/incconection-kids.git

# Navigate to the project directory
cd incconection-kids

# Install dependencies
npm install

# Create a .env.local file and configure environment variables
cp .env.example .env.local

# Run the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Create a `.env.local` file with the following keys:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

---

## 🧠 Key Concepts

- **Role-based Access Control (RBAC):** Each user type has a dedicated dashboard and permissions.
- **Modular Architecture:** Each role’s functionality is isolated for scalability.
- **Reusable Components:** Built with Shadcn/UI for consistent design.
- **API Integration:** Google Calendar and Supabase APIs for real-time data.

---

## 🧪 Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint checks        |

---

## 🧑‍💻 Contributors

- **Project Lead:** Incconection Kids Team
- **Developers:** Internal development team
- **Design:** UI/UX team

---

## 📄 License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for details.

---

## 🌐 Contact

For support or inquiries, contact:  
📧 **support@incconectionkids.com**  
🌍 [www.incconectionkids.com](https://www.incconectionkids.com)
