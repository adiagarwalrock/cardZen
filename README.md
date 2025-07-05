<a href="https://studio.firebase.google.com/import?url=https%3A%2F%2Fgithub.com%2Fadiagarwalrock%2FcardZen">
  <img
    height="32"
    alt="Continue in Firebase Studio"
    src="https://cdn.firebasestudio.dev/btn/continue_blue_32.svg">
</a>

# CardZen

CardZen is a comprehensive credit card management application designed to help you effortlessly manage your credit cards, stay on top of due dates, and maximize your rewards and benefits.

## Core Features

- **Add Credit Card:** Easily add new credit cards with detailed information including provider, network, custom card name, benefits, due date, statement date, and limits.
- **Update Credit Card:** Keep your credit card information current by easily updating existing entries.
- **Delete Credit Card:** Remove credit card entries when no longer needed.
- **Card Overview:** Get a clear view of all your added cards. The intuitive interface allows you to filter and sort your cards based on various parameters for quick access to the information you need.
- **Due Date Alerts:** Never miss a payment again. Set custom, configurable alerts for upcoming due dates for each individual card.
- **Smart Card Recommendation:** Utilize our AI-powered tool that analyzes your credit card details and spending habits to recommend the best card to use for your next purchase, helping you maximize cashback, points, and other benefits.

## Style Guidelines

CardZen employs a clean, modern, and user-friendly design with a focus on clarity and financial stability.

- **Primary Color:** HSL 210, 70%, 50% (RGB 38, 127, 221) - Used for core elements, conveying trust and a calming sense of financial stability.
- **Background Color:** HSL 210, 20%, 98% (RGB 250, 251, 253) - Provides a clean and spacious backdrop for a modern look.
- **Accent Color:** HSL 180, 60%, 40% (RGB 41, 179, 179) - Highlights key actions and important information related to savings and benefits.
- **Fonts:** 'Inter' sans-serif is used for both body text and headlines, ensuring excellent readability and a clean aesthetic across the platform.
- **Icons:** Minimalistic and professional icons are used to represent credit card providers, networks, and benefit types, contributing to a clean and intuitive interface.
- **Layout:** A clean and intuitive card-based layout is utilized for easy navigation and a clear overview of your credit card information.
- **Animations:** Subtle animations and transitions are incorporated when adding, updating, or deleting credit cards for a smooth and engaging user experience.

## Getting Started

To get started with CardZen, please refer to the documentation in `/docs/blueprint.md`.

## Deployment

CardZen can be easily deployed using Docker. Follow these steps to deploy the application:

### Prerequisites

- Docker and Docker Compose installed on your server
- Git (optional, for cloning the repository)

### Deployment Steps

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/yourusername/cardZen.git
   cd cardZen
   ```

2. **Deploy with the deployment script**:
   ```bash
   ./deploy.sh
   ```

   This script will:
   - Stop any existing containers
   - Build and start the new containers
   - Verify the deployment was successful

3. **Access the application**:
   Once deployed, the application will be available at `http://your-server-ip:3000`

### Manual Deployment

If you prefer to deploy manually:

1. **Build and start the containers**:
   ```bash
   docker-compose up -d --build
   ```

2. **Check the logs if needed**:
   ```bash
   docker-compose logs -f
   ```

### Data Persistence

Your data is stored in a Docker volume named `cardzen_data` which persists across container restarts and updates. To back up your data, you can use Docker volume backup tools.
