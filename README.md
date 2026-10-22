# 🤖 AI Website Builder

An AI-powered website creation agent that transforms natural language prompts into website code. Describe your website idea, and the AI generates code to help you bring your vision to life.

Built with **Next.js, TypeScript, Tailwind CSS, and Google Gemini AI**, this project explores how generative AI can simplify and accelerate modern web development.

## ✨ Features

- **AI-Powered Code Generation** — Generate website code from natural language prompts.
- **Natural Language Input** — Describe your website requirements in plain English.
- **Responsive Design** — Create layouts designed for desktop, tablet, and mobile screens.
- **Modern User Interface** — Clean, interactive UI built with Next.js and Tailwind CSS.
- **Gemini AI Integration** — Leverage Google's Gemini models for AI-powered code generation.
- **Real-Time Feedback** — Display loading states and generation progress while the AI processes requests.
- **Developer-Friendly Workflow** — Copy generated code and use it as a starting point for further development.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | React framework and application structure |
| React | UI components and interactive interfaces |
| TypeScript | Type-safe development |
| Tailwind CSS | Responsive styling and UI design |
| Google Gemini AI | AI-powered website code generation |
| Node.js | JavaScript runtime |

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure you have the following installed:

- Node.js (LTS recommended)
- npm
- Git
- A Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

Navigate to the project directory:

```bash
cd YOUR_REPOSITORY
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Get your API key from [Google AI Studio](https://aistudio.google.com/).

**Security note:** Keep your API key private. Do not commit `.env.local` to GitHub. Access the key only from server-side code, never expose it in client-side components.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

A typical Next.js App Router structure for this project may look like:

```text
ai-website-builder/
├── app/
│   ├── api/              # API routes for AI requests
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main application page
├── components/           # Reusable UI components
├── public/               # Static assets
├── .env.local            # Local environment variables
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts    # If configured in this project
├── tsconfig.json
└── README.md
```

*Note: The folder structure above is illustrative. Adjust it to match the actual files in your repository.*

## 💡 How It Works

1. Enter a description of the website you want to create.
2. Submit your prompt to the AI website builder.
3. The application sends the request to the server-side AI integration.
4. Gemini AI generates website code based on your requirements.
5. Review the generated output and use it as a starting point for your website.
6. Refine your prompt to generate an improved result.

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | API key used to authenticate requests to Google Gemini AI |

Never share API keys, passwords, or other sensitive credentials in public repositories.

## 🧪 Available Scripts

The following are standard Next.js scripts; confirm they match your `package.json`.

```bash
npm run dev      # Start the development server
npm run build    # Build the production application
npm run start    # Run the production server
npm run lint     # Run linting, if configured
```

## 🚢 Deployment

This application can be deployed to a hosting platform that supports Next.js, such as [Vercel](https://vercel.com/).

General deployment steps:

1. Push your project to GitHub.
2. Import the repository into your hosting platform.
3. Configure `GEMINI_API_KEY` in the platform's environment variables.
4. Deploy the application.
5. Test AI generation and other features in the production environment.

Ensure that the selected hosting platform supports the server-side features used by your application.

## 🔮 Future Improvements

- Live website preview.
- Multi-page website generation.
- Additional AI model support.
- Download generated projects as ZIP files.
- More framework and styling options.
- Iterative editing through conversational prompts.
- Improved error handling and generation history.

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a pull request.

## 📄 License

No license has been specified yet. Add a license file if you intend to permit others to reuse, modify, or distribute this project.

---

**Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and Gemini AI.**
