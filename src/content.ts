/* ------------------------------------------------------------------ */
/*  Site content. Everything here is taken from Gustav's CV.          */
/* ------------------------------------------------------------------ */

export const CONTACT = {
  email: "GustavSafi@hotmail.com",
  github: "https://github.com/GustavSafi",
  linkedin: "https://www.linkedin.com/in/gustav-safi-6b6257248/",
};

export const HIGHLIGHTS = [
  { value: "1st place", label: "Hospition.IT hackathon, Dec 2025" },
  { value: "Team of 5", label: "Led as Cloud Team Lead at Podmanager" },
  { value: "YH diploma", label: ".NET Cloud Developer, IT-Högskolan 2026" },
];

export const CAPABILITIES = [
  {
    title: "AI agents and LLM features",
    text: "Agents that plan, call tools and remember context. RAG over your own data, structured JSON output that gets validated before it reaches a user, and self-hosted models extended with LoRA adapters.",
    tools: ["LangChain", "LangGraph", "OpenAI API", "Claude API", "RAG", "Pinecone", "LoRA"],
  },
  {
    title: "Cloud and DevOps on Azure",
    text: "Infrastructure as code, containers and pipelines that build and deploy the same way every time. I have set up Kubernetes clusters, provisioned with Terraform and run a client's production system on App Service.",
    tools: ["Azure", "AKS", "Docker", "Terraform", "Bicep", "Azure DevOps", "GitHub Actions"],
  },
  {
    title: "Integrations and back-end",
    text: "The layer that holds it together: ASP.NET Core APIs between clients and AI services, payment providers, message queues and the databases underneath.",
    tools: ["C#", ".NET", "ASP.NET Core", "FastAPI", "SQL Server", "RabbitMQ", "REST"],
  },
];

export type Project = {
  year: string;
  kind: string;
  title: string;
  text: string;
  tech: string[];
  href?: string;
};

export const PROJECTS: Project[] = [
  {
    year: "2026",
    kind: "Thesis",
    title: "Self-hosted language model with swappable LoRA adapters",
    text: "A small, self-hosted model that loads a LoRA adapter for each use case at runtime. The Python AI service sits behind an ASP.NET Core Web API, so clients never talk to the model directly and adapters can change without touching them.",
    tech: ["Python", "LoRA", "ASP.NET Core", "LLM"],
  },
  {
    year: "2026",
    kind: "Product",
    title: "Jobbare: Swedish job search with AI analysis",
    text: "Search and filters on Arbetsförmedlingen's JobTech API, salary statistics from SCB and an AI review that matches an ad against your profile and lists strengths and gaps. Model output is validated as JSON and rate limited per visitor to keep costs down.",
    tech: ["Next.js", "TypeScript", "Claude API", "JobTech API"],
  },
  {
    year: "2024–",
    kind: "Client work",
    title: "E-commerce and order system for a US client",
    text: "Sole developer from storefront to back-end. React front-end, Azure App Service with deployment slots and autoscaling, payments through Stripe, PayPal, Zelle and crypto, automated order emails and an admin view for orders and stock.",
    tech: ["React", "Azure App Service", "SQL Server", "Stripe"],
  },
  {
    year: "2026",
    kind: "Personal",
    title: "Order management system with microservices",
    text: "Services for orders, inventory, payments and notifications behind an API gateway, talking over REST where an answer is needed now and over RabbitMQ where it can wait.",
    tech: ["C#", ".NET 9", "RabbitMQ", "API gateway"],
    href: "https://github.com/GustavSafi/OrderManagementSystem",
  },
  {
    year: "2026",
    kind: "Personal",
    title: "Cadesto: property management platform",
    text: "A layered ASP.NET Core API for houses, apartments, listings and tenants, with JWT sign-in, role-based access and an invitation flow. The Next.js front-end handles listings and sign-in through the API.",
    tech: ["ASP.NET Core", "EF Core", "Next.js", "JWT"],
    href: "https://github.com/GustavSafi/Cadesto",
  },
  {
    year: "2026",
    kind: "Personal",
    title: "WySlMtS: AI research agent",
    text: "A command-line agent that searches the web in real time and summarises what it finds with GPT-4, including daily digests. GitHub Actions runs the pytest suite on every push and pull request.",
    tech: ["Python", "OpenAI", "Tavily", "pytest"],
    href: "https://github.com/GustavSafi/WySlMtS",
  },
];

export const EXPERIENCE = [
  {
    period: "Feb – Apr 2026",
    role: "DevOps Intern",
    org: "Sebratec",
    text: "Built CI and CD pipelines in Azure DevOps that build and deploy applications as Docker containers, with CI and CD kept separate so every change ships the same way.",
  },
  {
    period: "Sep – Nov 2025",
    role: "Cloud Team Lead, internship",
    org: "Podmanager",
    text: "Led a team of five in adopting Azure and DevOps practices through coaching and regular check-ins. Set up Kubernetes clusters, provisioned infrastructure with Terraform, built CI/CD pipelines and worked full stack, including SQL.",
  },
  {
    period: "Feb 2025 – now",
    role: "AI Data Annotator",
    org: "Kuikco, remote",
    text: "Annotate images and Swedish conversational data used to train AI models, following detailed quality guidelines. It is first-hand insight into how data quality shapes a model's behaviour.",
  },
  {
    period: "Aug 2024 – now",
    role: "Freelance Developer",
    org: "Self-employed",
    text: "Sole developer of an e-commerce and order system for a US client. Websites, code and a CI/CD pipeline for other clients through Upwork and direct contacts.",
  },
  {
    period: "2021 – 2026",
    role: "Production and assembly",
    org: "Volvo Cars, Jovi",
    text: "Vehicle assembly at Volvo Cars and production and warehouse work through Jovi. Years of troubleshooting machines and replacing electrical components when the line stopped.",
  },
];

export const STACK = [
  {
    group: "AI and agents",
    items: ["LangChain, LangGraph", "AutoGen, CrewAI", "OpenAI, Claude, Gemini APIs", "RAG and embeddings", "Pinecone", "LoRA adapters", "Tool calling", "Prompt engineering"],
  },
  {
    group: "Cloud and DevOps",
    items: ["Azure: AKS, App Service, Functions", "API Management, Entra ID", "Docker, Kubernetes", "Terraform, Bicep", "Azure DevOps pipelines", "GitHub Actions"],
  },
  {
    group: "Languages and frameworks",
    items: ["C#, .NET, ASP.NET Core", "Entity Framework Core", "Python, FastAPI", "TypeScript, Next.js, React", "Blazor"],
  },
  {
    group: "Data and messaging",
    items: ["SQL Server", "Azure Cosmos DB", "MongoDB", "PostgreSQL with Prisma", "RabbitMQ", "Pandas"],
  },
];

export const EDUCATION = [
  { school: "IT-Högskolan", detail: ".NET Cloud Developer, Higher Vocational Education Diploma", year: "2024–2026" },
  { school: "Harvard University via edX", detail: "CS50: Introduction to Computer Science, certificate", year: "2023" },
];

export const EXTRAS = [
  { k: "Languages", v: "Swedish (native), English (fluent), Pashto (fluent)" },
  { k: "Young Enterprise (UF)", v: "CEO and Head of Sales" },
  { k: "Licence", v: "Swedish driving licence, B" },
];
